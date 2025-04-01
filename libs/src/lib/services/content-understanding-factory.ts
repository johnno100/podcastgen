import { ContentUnderstandingService } from '../models/knowledge-graph.model';
import { GeminiContentUnderstandingService } from './gemini-content-understanding.service';

/**
 * Factory for creating ContentUnderstandingService instances
 */
export class ContentUnderstandingServiceFactory {
  /**
   * Create a ContentUnderstandingService instance
   * @param apiKey The API key for the service
   * @returns A ContentUnderstandingService instance
   */
  static createService(apiKey: string): ContentUnderstandingService {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('API key is required for content understanding service');
    }
    
    // Create and return the service
    return new GeminiContentUnderstandingService(apiKey);
  }
}
