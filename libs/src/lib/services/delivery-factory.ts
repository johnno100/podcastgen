import { DeliveryService, PodcastDeliveryFormat, PodcastDeliveryOptions, PodcastPackage } from '../models/delivery.model';
import { LocalDeliveryService } from './local-delivery.service';

/**
 * Factory for creating DeliveryService instances
 */
export class DeliveryServiceFactory {
  /**
   * Create a DeliveryService instance
   * @param outputDirectory The directory to output podcast files to
   * @returns A DeliveryService instance
   */
  static createService(outputDirectory: string): DeliveryService {
    // Check if output directory is provided
    if (!outputDirectory) {
      throw new Error('Output directory is required for delivery service');
    }
    
    // Create and return the service
    return new LocalDeliveryService(outputDirectory);
  }
}
