import { PodcastScript, DialogueTurn } from '../models/dialogue.model';
import { Voice, VoiceOptions, AudioSegment, PodcastAudio, SpeakerVoiceMapping } from '../models/voice-synthesis.model';

/**
 * Mock implementation of the voice synthesis service for testing
 */
export class MockVoiceSynthesisService {
  /**
   * Get mock available voices
   * @returns Array of mock voices
   */
  async getAvailableVoices(): Promise<Voice[]> {
    return [
      {
        id: 'voice-1',
        name: 'Adam',
        category: 'premium',
        description: 'A deep, authoritative male voice',
        previewUrl: 'https://example.com/voices/adam.mp3',
        defaultVoiceOptions: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
          speakerBoost: 0
        }
      },
      {
        id: 'voice-2',
        name: 'Bella',
        category: 'premium',
        description: 'A warm, engaging female voice',
        previewUrl: 'https://example.com/voices/bella.mp3',
        defaultVoiceOptions: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
          speakerBoost: 0
        }
      },
      {
        id: 'voice-3',
        name: 'Carlos',
        category: 'premium',
        description: 'A lively, energetic male voice',
        previewUrl: 'https://example.com/voices/carlos.mp3',
        defaultVoiceOptions: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
          speakerBoost: 0
        }
      }
    ];
  }

  /**
   * Synthesize mock speech from text
   * @returns Mock audio data
   */
  async synthesizeSpeech(): Promise<ArrayBuffer> {
    // Create a mock audio buffer (1 second of silence)
    return new ArrayBuffer(44100);
  }

  /**
   * Synthesize a mock podcast from a script
   * @param script Podcast script to synthesize
   * @param speakerVoiceMappings Mappings of speakers to voices
   * @returns Mock podcast audio
   */
  async synthesizePodcast(script: PodcastScript, speakerVoiceMappings: SpeakerVoiceMapping[]): Promise<PodcastAudio> {
    // Create mock audio segments
    const segments: AudioSegment[] = [];
    let currentTime = 0;
    
    // Add introduction if present
    if (script.introduction) {
      const introDuration = script.introduction.length / 3;
      segments.push({
        id: `intro-mock`,
        speakerId: 'narrator',
        voiceId: speakerVoiceMappings[0]?.voiceId || 'voice-1',
        text: script.introduction,
        audioData: new ArrayBuffer(44100 * Math.ceil(introDuration)),
        duration: introDuration,
        startTime: currentTime,
        endTime: currentTime + introDuration
      });
      currentTime += introDuration;
    }
    
    // Add dialogue turns
    for (const turn of script.dialogue) {
      const duration = turn.text.length / 3;
      const mapping = speakerVoiceMappings.find(m => m.speakerId === turn.speakerId);
      
      segments.push({
        id: `turn-mock-${turn.speakerId}`,
        speakerId: turn.speakerId,
        voiceId: mapping?.voiceId || 'voice-1',
        text: turn.text,
        audioData: new ArrayBuffer(44100 * Math.ceil(duration)),
        duration,
        startTime: currentTime,
        endTime: currentTime + duration
      });
      
      currentTime += duration;
    }
    
    // Add conclusion if present
    if (script.conclusion) {
      const conclusionDuration = script.conclusion.length / 3;
      segments.push({
        id: `conclusion-mock`,
        speakerId: 'narrator',
        voiceId: speakerVoiceMappings[0]?.voiceId || 'voice-1',
        text: script.conclusion,
        audioData: new ArrayBuffer(44100 * Math.ceil(conclusionDuration)),
        duration: conclusionDuration,
        startTime: currentTime,
        endTime: currentTime + conclusionDuration
      });
      currentTime += conclusionDuration;
    }
    
    return {
      id: `podcast-audio-mock`,
      scriptId: script.id,
      segments,
      fullAudio: new ArrayBuffer(44100 * Math.ceil(currentTime)),
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
  }

  /**
   * Synthesize a mock dialogue turn
   * @param turn Dialogue turn to synthesize
   * @returns Mock audio segment
   */
  async synthesizeDialogueTurn(turn: DialogueTurn, voiceId: string): Promise<AudioSegment> {
    const duration = turn.text.length / 3;
    
    return {
      id: `turn-mock-${turn.speakerId}`,
      speakerId: turn.speakerId,
      voiceId,
      text: turn.text,
      audioData: new ArrayBuffer(44100 * Math.ceil(duration)),
      duration,
      startTime: 0,
      endTime: duration
    };
  }

  /**
   * Combine mock audio segments
   * @returns Mock combined audio data
   */
  async combineAudioSegments(segments: AudioSegment[]): Promise<ArrayBuffer> {
    // Calculate total duration
    const totalDuration = segments.reduce((total, segment) => total + segment.duration, 0);
    
    // Create a mock combined audio buffer
    return new ArrayBuffer(44100 * Math.ceil(totalDuration));
  }
}
