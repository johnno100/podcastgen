import { DeliveryService, PodcastDeliveryFormat, PodcastDeliveryOptions, PodcastPackage } from '../models/delivery.model';
import { PodcastAudio } from '../models/voice-synthesis.model';
import { DeliveryServiceFactory } from './delivery-factory';

/**
 * Service for managing delivery operations
 */
export class DeliveryManager {
  private deliveryService: DeliveryService;
  private outputDirectory: string;

  constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
    
    try {
      this.deliveryService = DeliveryServiceFactory.createService(outputDirectory);
    } catch (error) {
      console.error('Failed to create delivery service:', error);
      throw new Error('Failed to initialize delivery service');
    }
  }

  /**
   * Get available podcast delivery formats
   * @returns Array of available formats
   */
  getAvailableFormats(): PodcastDeliveryFormat[] {
    return this.deliveryService.getAvailableFormats();
  }

  /**
   * Package a podcast for delivery
   * @param audio The podcast audio to package
   * @param options Delivery options
   * @returns A packaged podcast
   */
  async packagePodcast(audio: PodcastAudio, options: PodcastDeliveryOptions): Promise<PodcastPackage> {
    try {
      return await this.deliveryService.packagePodcast(audio, options);
    } catch (error) {
      console.error('Error packaging podcast:', error);
      throw new Error(`Failed to package podcast: ${error.message}`);
    }
  }

  /**
   * Save a packaged podcast
   * @param packagedPodcast The packaged podcast to save
   * @returns The path to the saved podcast
   */
  async savePodcast(packagedPodcast: PodcastPackage): Promise<string> {
    try {
      return await this.deliveryService.savePodcast(packagedPodcast);
    } catch (error) {
      console.error('Error saving podcast:', error);
      throw new Error(`Failed to save podcast: ${error.message}`);
    }
  }

  /**
   * Generate a shareable link for a packaged podcast
   * @param packagedPodcast The packaged podcast to generate a link for
   * @returns A shareable link
   */
  async generateShareableLink(packagedPodcast: PodcastPackage): Promise<string> {
    try {
      return await this.deliveryService.generateShareableLink(packagedPodcast);
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }
  }

  /**
   * Generate an RSS feed for a collection of podcasts
   * @param podcasts The podcasts to include in the feed
   * @returns An RSS feed XML string
   */
  async generateRssFeed(podcasts: PodcastPackage[]): Promise<string> {
    try {
      return await this.deliveryService.generateRssFeed(podcasts);
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      throw new Error(`Failed to generate RSS feed: ${error.message}`);
    }
  }

  /**
   * Generate a transcript from podcast audio
   * @param audio The podcast audio to generate a transcript from
   * @returns A transcript string
   */
  async generateTranscript(audio: PodcastAudio): Promise<string> {
    try {
      return await this.deliveryService.generateTranscript(audio);
    } catch (error) {
      console.error('Error generating transcript:', error);
      throw new Error(`Failed to generate transcript: ${error.message}`);
    }
  }

  /**
   * Get the output directory
   * @returns The output directory
   */
  getOutputDirectory(): string {
    return this.outputDirectory;
  }
}
