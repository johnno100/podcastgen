import { DialogueGenerationService, DialogueGenerationOptions } from '../models/dialogue.model';
import { ClaudeDialogueGenerationService } from './claude-dialogue-generation.service';

/**
 * Factory for creating DialogueGenerationService instances
 */
export class DialogueGenerationServiceFactory {
  /**
   * Create a DialogueGenerationService instance
   * @param apiKey The API key for the service
   * @returns A DialogueGenerationService instance
   */
  static createService(apiKey: string): DialogueGenerationService {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('API key is required for dialogue generation service');
    }
    
    // Create and return the service
    return new ClaudeDialogueGenerationService(apiKey);
  }
}
