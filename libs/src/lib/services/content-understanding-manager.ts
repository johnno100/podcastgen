import { ContentPackage } from '../models/content-package.model';
import { KnowledgeGraph, ContentUnderstandingService } from '../models/knowledge-graph.model';
import { ContentUnderstandingServiceFactory } from './content-understanding-factory';
import { EnvironmentService } from './environment.service';

/**
 * Service for managing content understanding operations
 */
export class ContentUnderstandingManager {
  private contentUnderstandingService: ContentUnderstandingService;
  private environmentService: EnvironmentService;

  constructor() {
    this.environmentService = new EnvironmentService();
    const apiKey = this.environmentService.getGeminiApiKey();
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Content understanding features will not work.');
    }
    
    try {
      this.contentUnderstandingService = ContentUnderstandingServiceFactory.createService(apiKey);
    } catch (error) {
      console.error('Failed to create content understanding service:', error);
      throw new Error('Failed to initialize content understanding service');
    }
  }

  /**
   * Analyze content to create a knowledge graph
   * @param content The content package to analyze
   * @returns A knowledge graph containing topics, entities, and relationships
   */
  async analyzeContent(content: ContentPackage): Promise<KnowledgeGraph> {
    try {
      return await this.contentUnderstandingService.analyzeContent(content);
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  /**
   * Generate a summary of the content
   * @param content The content package to summarize
   * @param maxLength The maximum length of the summary in characters
   * @returns A summary of the content
   */
  async generateSummary(content: ContentPackage, maxLength = 1000): Promise<string> {
    try {
      return await this.contentUnderstandingService.generateSummary(content, maxLength);
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Extract topics from the content
   * @param content The content package to extract topics from
   * @returns An array of topics
   */
  async extractTopics(content: ContentPackage) {
    try {
      return await this.contentUnderstandingService.extractTopics(content);
    } catch (error) {
      console.error('Error extracting topics:', error);
      throw new Error(`Failed to extract topics: ${error.message}`);
    }
  }

  /**
   * Identify entities in the content
   * @param content The content package to identify entities in
   * @returns An array of entities
   */
  async identifyEntities(content: ContentPackage) {
    try {
      return await this.contentUnderstandingService.identifyEntities(content);
    } catch (error) {
      console.error('Error identifying entities:', error);
      throw new Error(`Failed to identify entities: ${error.message}`);
    }
  }
}
