import { KnowledgeGraph } from '../models/knowledge-graph.model';
import { DialogueGenerationService, PodcastScript, Speaker, DialogueTurn, DialogueGenerationOptions } from '../models/dialogue.model';
import { DialogueGenerationServiceFactory } from './dialogue-generation-factory';
import { EnvironmentService } from './environment.service';

/**
 * Service for managing dialogue generation operations
 */
export class DialogueGenerationManager {
  private dialogueGenerationService: DialogueGenerationService;
  private environmentService: EnvironmentService;

  constructor() {
    this.environmentService = new EnvironmentService();
    const apiKey = this.environmentService.getClaudeApiKey();
    
    if (!apiKey) {
      console.warn('Claude API key not found. Dialogue generation features will not work.');
    }
    
    try {
      this.dialogueGenerationService = DialogueGenerationServiceFactory.createService(apiKey);
    } catch (error) {
      console.error('Failed to create dialogue generation service:', error);
      throw new Error('Failed to initialize dialogue generation service');
    }
  }

  /**
   * Generate a complete podcast script from a knowledge graph
   * @param knowledgeGraph The knowledge graph to generate a podcast script from
   * @param options Options for dialogue generation
   * @returns A complete podcast script
   */
  async generatePodcastScript(
    knowledgeGraph: KnowledgeGraph,
    options: DialogueGenerationOptions = {}
  ): Promise<PodcastScript> {
    try {
      return await this.dialogueGenerationService.generatePodcastScript(knowledgeGraph, options);
    } catch (error) {
      console.error('Error generating podcast script:', error);
      throw new Error(`Failed to generate podcast script: ${error.message}`);
    }
  }

  /**
   * Generate speakers for the podcast
   * @param knowledgeGraph The knowledge graph to generate speakers from
   * @param count The number of speakers to generate
   * @returns An array of speakers
   */
  async generateSpeakers(knowledgeGraph: KnowledgeGraph, count = 2): Promise<Speaker[]> {
    try {
      return await this.dialogueGenerationService.generateSpeakers(knowledgeGraph, count);
    } catch (error) {
      console.error('Error generating speakers:', error);
      throw new Error(`Failed to generate speakers: ${error.message}`);
    }
  }

  /**
   * Generate an introduction for the podcast
   * @param knowledgeGraph The knowledge graph to generate an introduction from
   * @param speakers The speakers participating in the podcast
   * @returns An introduction text
   */
  async generateIntroduction(knowledgeGraph: KnowledgeGraph, speakers: Speaker[]): Promise<string> {
    try {
      return await this.dialogueGenerationService.generateIntroduction(knowledgeGraph, speakers);
    } catch (error) {
      console.error('Error generating introduction:', error);
      throw new Error(`Failed to generate introduction: ${error.message}`);
    }
  }

  /**
   * Generate dialogue for the podcast
   * @param knowledgeGraph The knowledge graph to generate dialogue from
   * @param speakers The speakers participating in the podcast
   * @param turnCount The number of dialogue turns to generate
   * @returns An array of dialogue turns
   */
  async generateDialogue(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], turnCount = 15): Promise<DialogueTurn[]> {
    try {
      return await this.dialogueGenerationService.generateDialogue(knowledgeGraph, speakers, turnCount);
    } catch (error) {
      console.error('Error generating dialogue:', error);
      throw new Error(`Failed to generate dialogue: ${error.message}`);
    }
  }

  /**
   * Generate a conclusion for the podcast
   * @param knowledgeGraph The knowledge graph to generate a conclusion from
   * @param speakers The speakers participating in the podcast
   * @param dialogue The dialogue turns in the podcast
   * @returns A conclusion text
   */
  async generateConclusion(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], dialogue: DialogueTurn[]): Promise<string> {
    try {
      return await this.dialogueGenerationService.generateConclusion(knowledgeGraph, speakers, dialogue);
    } catch (error) {
      console.error('Error generating conclusion:', error);
      throw new Error(`Failed to generate conclusion: ${error.message}`);
    }
  }
}
