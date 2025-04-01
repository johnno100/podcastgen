import { VoiceSynthesisService, Voice, VoiceOptions, AudioSegment, PodcastAudio, SpeakerVoiceMapping } from '../models/voice-synthesis.model';
import { PodcastScript, DialogueTurn } from '../models/dialogue.model';
import { VoiceSynthesisServiceFactory } from './voice-synthesis-factory';
import { EnvironmentService } from './environment.service';

/**
 * Service for managing voice synthesis operations
 */
export class VoiceSynthesisManager {
  private voiceSynthesisService: VoiceSynthesisService;
  private environmentService: EnvironmentService;

  constructor() {
    this.environmentService = new EnvironmentService();
    const apiKey = this.environmentService.getElevenLabsApiKey();
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not found. Voice synthesis features will not work.');
    }
    
    try {
      this.voiceSynthesisService = VoiceSynthesisServiceFactory.createService(apiKey);
    } catch (error) {
      console.error('Failed to create voice synthesis service:', error);
      throw new Error('Failed to initialize voice synthesis service');
    }
  }

  /**
   * Get available voices from the service
   * @returns Array of available voices
   */
  async getAvailableVoices(): Promise<Voice[]> {
    try {
      return await this.voiceSynthesisService.getAvailableVoices();
    } catch (error) {
      console.error('Error getting available voices:', error);
      throw new Error(`Failed to get available voices: ${error.message}`);
    }
  }

  /**
   * Synthesize speech from text
   * @param text Text to synthesize
   * @param voiceId Voice ID to use
   * @param options Voice options
   * @returns Audio data as ArrayBuffer
   */
  async synthesizeSpeech(text: string, voiceId: string, options?: VoiceOptions): Promise<ArrayBuffer> {
    try {
      return await this.voiceSynthesisService.synthesizeSpeech(text, voiceId, options);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
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
      return await this.voiceSynthesisService.synthesizePodcast(script, speakerVoiceMappings);
    } catch (error) {
      console.error('Error synthesizing podcast:', error);
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
      return await this.voiceSynthesisService.synthesizeDialogueTurn(turn, voiceId, options);
    } catch (error) {
      console.error('Error synthesizing dialogue turn:', error);
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
      return await this.voiceSynthesisService.combineAudioSegments(segments);
    } catch (error) {
      console.error('Error combining audio segments:', error);
      throw new Error(`Failed to combine audio segments: ${error.message}`);
    }
  }

  /**
   * Automatically assign voices to speakers based on available voices
   * @param script Podcast script with speakers
   * @returns Mappings of speakers to voices
   */
  async autoAssignVoices(script: PodcastScript): Promise<SpeakerVoiceMapping[]> {
    try {
      // Get available voices
      const voices = await this.getAvailableVoices();
      
      if (voices.length === 0) {
        throw new Error('No voices available for assignment');
      }
      
      // Create mappings for each speaker
      const mappings: SpeakerVoiceMapping[] = [];
      
      for (let i = 0; i < script.speakers.length; i++) {
        const speaker = script.speakers[i];
        // Assign a voice (cycling through available voices if needed)
        const voice = voices[i % voices.length];
        
        mappings.push({
          speakerId: speaker.id,
          voiceId: voice.id,
          voiceOptions: voice.defaultVoiceOptions
        });
      }
      
      return mappings;
    } catch (error) {
      console.error('Error auto-assigning voices:', error);
      throw new Error(`Failed to auto-assign voices: ${error.message}`);
    }
  }
}
