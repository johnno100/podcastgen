import { VoiceSynthesisService, Voice, VoiceOptions, AudioSegment, PodcastAudio, SpeakerVoiceMapping } from '../models/voice-synthesis.model';
import { PodcastScript, DialogueTurn } from '../models/dialogue.model';
import { ElevenLabs } from 'elevenlabs-node';

export class ElevenLabsVoiceSynthesisService implements VoiceSynthesisService {
  private elevenLabs: ElevenLabs;
  private maxRetries = 3;
  private initialBackoffMs = 1000;

  constructor(apiKey: string) {
    this.elevenLabs = new ElevenLabs({
      apiKey: apiKey,
    });
  }

  /**
   * Get available voices from ElevenLabs
   * @returns Array of available voices
   */
  async getAvailableVoices(): Promise<Voice[]> {
    try {
      const response = await this.executeWithRetry(() => 
        this.elevenLabs.getVoices()
      );

      return response.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'premium',
        description: voice.description,
        previewUrl: voice.preview_url,
        defaultVoiceOptions: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
          speakerBoost: 0
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get available voices: ${error.message}`);
    }
  }

  /**
   * Synthesize speech from text using ElevenLabs
   * @param text Text to synthesize
   * @param voiceId Voice ID to use
   * @param options Voice options
   * @returns Audio data as ArrayBuffer
   */
  async synthesizeSpeech(text: string, voiceId: string, options?: VoiceOptions): Promise<ArrayBuffer> {
    try {
      const voiceSettings = options ? {
        stability: options.stability,
        similarity_boost: options.similarityBoost,
        style: options.style,
        speaker_boost: options.speakerBoost
      } : undefined;

      const response = await this.executeWithRetry(() => 
        this.elevenLabs.textToSpeech({
          voice_id: voiceId,
          text: text,
          voice_settings: voiceSettings,
          output_format: 'mp3'
        })
      );

      return response;
    } catch (error) {
      throw new Error(`Failed to synthesize speech: ${error.message}`);
    }
  }

  /**
   * Synthesize a complete podcast from a script
   * @param script Podcast script to synthesize
   * @param speakerVoiceMappings Mappings of speakers to voices
   * @returns Complete podcast audio
   */
  async synthesizePodcast(script: PodcastScript, speakerVoiceMappings: SpeakerVoiceMapping[]): Promise<PodcastAudio> {
    try {
      // Create a map of speaker IDs to voice IDs and options
      const voiceMap = new Map<string, { voiceId: string, options?: VoiceOptions }>();
      for (const mapping of speakerVoiceMappings) {
        voiceMap.set(mapping.speakerId, {
          voiceId: mapping.voiceId,
          options: mapping.voiceOptions
        });
      }

      // Find a default voice for the narrator (introduction and conclusion)
      const defaultVoice = speakerVoiceMappings[0]?.voiceId || '';
      
      // Synthesize introduction if present
      const segments: AudioSegment[] = [];
      let currentTime = 0;
      
      if (script.introduction) {
        const introAudio = await this.synthesizeSpeech(script.introduction, defaultVoice);
        // Estimate duration (rough approximation: 3 characters per second)
        const introDuration = script.introduction.length / 3;
        
        segments.push({
          id: `intro-${Date.now()}`,
          speakerId: 'narrator',
          voiceId: defaultVoice,
          text: script.introduction,
          audioData: introAudio,
          duration: introDuration,
          startTime: currentTime,
          endTime: currentTime + introDuration
        });
        
        currentTime += introDuration;
      }
      
      // Synthesize each dialogue turn
      for (const turn of script.dialogue) {
        const voiceInfo = voiceMap.get(turn.speakerId);
        
        if (!voiceInfo) {
          console.warn(`No voice mapping found for speaker ${turn.speakerId}, using default voice`);
        }
        
        const voiceId = voiceInfo?.voiceId || defaultVoice;
        const options = voiceInfo?.options;
        
        const segment = await this.synthesizeDialogueTurn(turn, voiceId, options);
        
        // Update timing
        segment.startTime = currentTime;
        segment.endTime = currentTime + segment.duration;
        currentTime += segment.duration;
        
        segments.push(segment);
      }
      
      // Synthesize conclusion if present
      if (script.conclusion) {
        const conclusionAudio = await this.synthesizeSpeech(script.conclusion, defaultVoice);
        // Estimate duration (rough approximation: 3 characters per second)
        const conclusionDuration = script.conclusion.length / 3;
        
        segments.push({
          id: `conclusion-${Date.now()}`,
          speakerId: 'narrator',
          voiceId: defaultVoice,
          text: script.conclusion,
          audioData: conclusionAudio,
          duration: conclusionDuration,
          startTime: currentTime,
          endTime: currentTime + conclusionDuration
        });
        
        currentTime += conclusionDuration;
      }
      
      // Combine all audio segments
      const fullAudio = await this.combineAudioSegments(segments);
      
      return {
        id: `podcast-audio-${Date.now()}`,
        scriptId: script.id,
        segments,
        fullAudio,
        totalDuration: currentTime,
        format: 'mp3',
        metadata: {
          title: script.title,
          description: script.description,
          speakerCount: script.speakers.length,
          turnCount: script.dialogue.length,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to synthesize podcast: ${error.message}`);
    }
  }

  /**
   * Synthesize a single dialogue turn
   * @param turn Dialogue turn to synthesize
   * @param voiceId Voice ID to use
   * @param options Voice options
   * @returns Audio segment
   */
  async synthesizeDialogueTurn(turn: DialogueTurn, voiceId: string, options?: VoiceOptions): Promise<AudioSegment> {
    try {
      // Add emotion to the text if present
      let textToSynthesize = turn.text;
      if (turn.emotion) {
        textToSynthesize = `[${turn.emotion}] ${textToSynthesize}`;
      }
      
      const audioData = await this.synthesizeSpeech(textToSynthesize, voiceId, options);
      
      // Estimate duration (rough approximation: 3 characters per second)
      const duration = turn.text.length / 3;
      
      return {
        id: `turn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        speakerId: turn.speakerId,
        voiceId,
        text: turn.text,
        audioData,
        duration,
        startTime: 0, // Will be set when combining segments
        endTime: duration // Will be updated when combining segments
      };
    } catch (error) {
      throw new Error(`Failed to synthesize dialogue turn: ${error.message}`);
    }
  }

  /**
   * Combine multiple audio segments into a single audio file
   * @param segments Audio segments to combine
   * @returns Combined audio data
   */
  async combineAudioSegments(segments: AudioSegment[]): Promise<ArrayBuffer> {
    try {
      // Note: In a real implementation, we would use a library like ffmpeg to combine audio files
      // For the MVP, we'll return a placeholder implementation that concatenates ArrayBuffers
      
      // Calculate total size
      const totalSize = segments.reduce((size, segment) => {
        return size + segment.audioData.byteLength;
      }, 0);
      
      // Create a new buffer to hold all audio data
      const combinedBuffer = new ArrayBuffer(totalSize);
      const combinedView = new Uint8Array(combinedBuffer);
      
      // Copy each segment's data into the combined buffer
      let offset = 0;
      for (const segment of segments) {
        const segmentView = new Uint8Array(segment.audioData);
        combinedView.set(segmentView, offset);
        offset += segment.audioData.byteLength;
      }
      
      return combinedBuffer;
    } catch (error) {
      throw new Error(`Failed to combine audio segments: ${error.message}`);
    }
  }

  /**
   * Execute a function with exponential backoff retry logic
   * @param fn The function to execute
   * @returns The result of the function
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    let backoffMs = this.initialBackoffMs;
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          throw error;
        }
        
        console.warn(`API call failed, retrying in ${backoffMs}ms...`, error);
        
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        
        // Exponential backoff with jitter
        backoffMs = backoffMs * 2 * (0.5 + Math.random() / 2);
      }
    }
  }
}
