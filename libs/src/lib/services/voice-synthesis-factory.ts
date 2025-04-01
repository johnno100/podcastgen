import { VoiceSynthesisService, Voice, VoiceOptions, AudioSegment, PodcastAudio, SpeakerVoiceMapping } from '../models/voice-synthesis.model';
import { ElevenLabsVoiceSynthesisService } from './elevenlabs-voice-synthesis.service';

/**
 * Factory for creating VoiceSynthesisService instances
 */
export class VoiceSynthesisServiceFactory {
  /**
   * Create a VoiceSynthesisService instance
   * @param apiKey The API key for the service
   * @returns A VoiceSynthesisService instance
   */
  static createService(apiKey: string): VoiceSynthesisService {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('API key is required for voice synthesis service');
    }
    
    // Create and return the service
    return new ElevenLabsVoiceSynthesisService(apiKey);
  }
}
