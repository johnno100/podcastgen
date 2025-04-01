import { ContentIngestionManager } from './services/content-ingestion.service';
import { ContentUnderstandingManager } from './services/content-understanding-manager';
import { DialogueGenerationManager } from './services/dialogue-generation-manager';
import { VoiceSynthesisManager } from './services/voice-synthesis-manager';
import { DeliveryManager } from './services/delivery-manager';
import { ContentPackage } from './models/content-package.model';
import { KnowledgeGraph } from './models/knowledge-graph.model';
import { PodcastScript, DialogueGenerationOptions } from './models/dialogue.model';
import { PodcastAudio, SpeakerVoiceMapping } from './models/voice-synthesis.model';
import { PodcastPackage, PodcastDeliveryOptions } from './models/delivery.model';
import { EnvironmentService } from './services/environment.service';

/**
 * Main orchestrator for the podcast generation pipeline
 */
export class PodcastGenerationPipeline {
  private contentIngestionManager: ContentIngestionManager;
  private contentUnderstandingManager: ContentUnderstandingManager;
  private dialogueGenerationManager: DialogueGenerationManager;
  private voiceSynthesisManager: VoiceSynthesisManager;
  private deliveryManager: DeliveryManager;
  private environmentService: EnvironmentService;
  private outputDirectory: string;

  constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
    this.environmentService = new EnvironmentService();
    
    // Initialize all managers
    this.contentIngestionManager = new ContentIngestionManager();
    this.contentUnderstandingManager = new ContentUnderstandingManager();
    this.dialogueGenerationManager = new DialogueGenerationManager();
    this.voiceSynthesisManager = new VoiceSynthesisManager();
    this.deliveryManager = new DeliveryManager(outputDirectory);
    
    // Validate environment
    this.validateEnvironment();
  }

  /**
   * Validate the environment configuration
   */
  private validateEnvironment(): void {
    if (!this.environmentService.validateConfig()) {
      console.warn('Some API keys are missing. The pipeline may not function correctly.');
    }
  }

  /**
   * Process a URL through the entire pipeline
   * @param url URL to process
   * @param dialogueOptions Options for dialogue generation
   * @param deliveryOptions Options for podcast delivery
   * @returns The packaged podcast
   */
  async processUrl(
    url: string,
    dialogueOptions?: DialogueGenerationOptions,
    deliveryOptions?: PodcastDeliveryOptions
  ): Promise<PodcastPackage> {
    try {
      // Step 1: Content Ingestion
      console.log('Step 1: Ingesting content from URL...');
      const contentPackage = await this.contentIngestionManager.processUrl(url);
      
      // Step 2: Content Understanding
      console.log('Step 2: Analyzing content...');
      const knowledgeGraph = await this.contentUnderstandingManager.analyzeContent(contentPackage);
      
      // Step 3: Dialogue Generation
      console.log('Step 3: Generating podcast script...');
      const podcastScript = await this.dialogueGenerationManager.generatePodcastScript(knowledgeGraph, dialogueOptions);
      
      // Step 4: Voice Synthesis
      console.log('Step 4: Synthesizing speech...');
      const speakerVoiceMappings = await this.voiceSynthesisManager.autoAssignVoices(podcastScript);
      const podcastAudio = await this.voiceSynthesisManager.synthesizePodcast(podcastScript, speakerVoiceMappings);
      
      // Step 5: Delivery
      console.log('Step 5: Packaging podcast...');
      const defaultDeliveryOptions: PodcastDeliveryOptions = {
        format: this.deliveryManager.getAvailableFormats()[0], // Default to first available format (MP3)
        includeTranscript: true,
        includeSpeakerLabels: true,
        includeChapters: true,
        includeMetadata: true
      };
      
      const mergedDeliveryOptions = { ...defaultDeliveryOptions, ...deliveryOptions };
      const packagedPodcast = await this.deliveryManager.packagePodcast(podcastAudio, mergedDeliveryOptions);
      
      // Save the podcast
      console.log('Step 6: Saving podcast...');
      const savedPath = await this.deliveryManager.savePodcast(packagedPodcast);
      console.log(`Podcast saved to: ${savedPath}`);
      
      return packagedPodcast;
    } catch (error) {
      console.error('Error in podcast generation pipeline:', error);
      throw new Error(`Failed to process URL: ${error.message}`);
    }
  }

  /**
   * Process a PDF file through the entire pipeline
   * @param file PDF file to process
   * @param dialogueOptions Options for dialogue generation
   * @param deliveryOptions Options for podcast delivery
   * @returns The packaged podcast
   */
  async processPdf(
    file: File,
    dialogueOptions?: DialogueGenerationOptions,
    deliveryOptions?: PodcastDeliveryOptions
  ): Promise<PodcastPackage> {
    try {
      // Step 1: Content Ingestion
      console.log('Step 1: Ingesting content from PDF...');
      const contentPackage = await this.contentIngestionManager.processPdf(file);
      
      // Continue with the rest of the pipeline
      return this.processContentPackage(contentPackage, dialogueOptions, deliveryOptions);
    } catch (error) {
      console.error('Error in podcast generation pipeline:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  /**
   * Process a video URL through the entire pipeline
   * @param url Video URL to process
   * @param dialogueOptions Options for dialogue generation
   * @param deliveryOptions Options for podcast delivery
   * @returns The packaged podcast
   */
  async processVideo(
    url: string,
    dialogueOptions?: DialogueGenerationOptions,
    deliveryOptions?: PodcastDeliveryOptions
  ): Promise<PodcastPackage> {
    try {
      // Step 1: Content Ingestion
      console.log('Step 1: Ingesting content from video...');
      const contentPackage = await this.contentIngestionManager.processVideo(url);
      
      // Continue with the rest of the pipeline
      return this.processContentPackage(contentPackage, dialogueOptions, deliveryOptions);
    } catch (error) {
      console.error('Error in podcast generation pipeline:', error);
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }

  /**
   * Process text through the entire pipeline
   * @param text Text to process
   * @param dialogueOptions Options for dialogue generation
   * @param deliveryOptions Options for podcast delivery
   * @returns The packaged podcast
   */
  async processText(
    text: string,
    dialogueOptions?: DialogueGenerationOptions,
    deliveryOptions?: PodcastDeliveryOptions
  ): Promise<PodcastPackage> {
    try {
      // Step 1: Content Ingestion
      console.log('Step 1: Ingesting text content...');
      const contentPackage = await this.contentIngestionManager.processText(text);
      
      // Continue with the rest of the pipeline
      return this.processContentPackage(contentPackage, dialogueOptions, deliveryOptions);
    } catch (error) {
      console.error('Error in podcast generation pipeline:', error);
      throw new Error(`Failed to process text: ${error.message}`);
    }
  }

  /**
   * Process a content package through the rest of the pipeline
   * @param contentPackage Content package to process
   * @param dialogueOptions Options for dialogue generation
   * @param deliveryOptions Options for podcast delivery
   * @returns The packaged podcast
   */
  private async processContentPackage(
    contentPackage: ContentPackage,
    dialogueOptions?: DialogueGenerationOptions,
    deliveryOptions?: PodcastDeliveryOptions
  ): Promise<PodcastPackage> {
    // Step 2: Content Understanding
    console.log('Step 2: Analyzing content...');
    const knowledgeGraph = await this.contentUnderstandingManager.analyzeContent(contentPackage);
    
    // Step 3: Dialogue Generation
    console.log('Step 3: Generating podcast script...');
    const podcastScript = await this.dialogueGenerationManager.generatePodcastScript(knowledgeGraph, dialogueOptions);
    
    // Step 4: Voice Synthesis
    console.log('Step 4: Synthesizing speech...');
    const speakerVoiceMappings = await this.voiceSynthesisManager.autoAssignVoices(podcastScript);
    const podcastAudio = await this.voiceSynthesisManager.synthesizePodcast(podcastScript, speakerVoiceMappings);
    
    // Step 5: Delivery
    console.log('Step 5: Packaging podcast...');
    const defaultDeliveryOptions: PodcastDeliveryOptions = {
      format: this.deliveryManager.getAvailableFormats()[0], // Default to first available format (MP3)
      includeTranscript: true,
      includeSpeakerLabels: true,
      includeChapters: true,
      includeMetadata: true
    };
    
    const mergedDeliveryOptions = { ...defaultDeliveryOptions, ...deliveryOptions };
    const packagedPodcast = await this.deliveryManager.packagePodcast(podcastAudio, mergedDeliveryOptions);
    
    // Save the podcast
    console.log('Step 6: Saving podcast...');
    const savedPath = await this.deliveryManager.savePodcast(packagedPodcast);
    console.log(`Podcast saved to: ${savedPath}`);
    
    return packagedPodcast;
  }

  /**
   * Get the output directory
   * @returns The output directory
   */
  getOutputDirectory(): string {
    return this.outputDirectory;
  }
}
