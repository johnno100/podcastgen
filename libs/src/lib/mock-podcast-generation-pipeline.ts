import { PodcastGenerationPipeline } from './podcast-generation-pipeline';
import { MockContentIngestionService } from './services/mock-content-ingestion.service';
import { MockContentUnderstandingService } from './services/mock-content-understanding.service';
import { MockDialogueGenerationService } from './services/mock-dialogue-generation.service';
import { MockVoiceSynthesisService } from './services/mock-voice-synthesis.service';
import { MockDeliveryService } from './services/mock-delivery.service';

/**
 * Mock implementation of the podcast generation pipeline for testing
 * This class uses mock services for all components to allow testing without API keys
 */
export class MockPodcastGenerationPipeline extends PodcastGenerationPipeline {
  constructor(outputDirectory: string) {
    super(outputDirectory);
    
    // Override the managers with mock implementations
    // Note: In a real implementation, we would use dependency injection
    // For the MVP, we're using this approach for simplicity
    this['contentIngestionManager'] = {
      processUrl: async (url: string) => {
        console.log(`Mock processing URL: ${url}`);
        const mockService = new MockContentIngestionService();
        return mockService.processUrl(url);
      },
      processPdf: async (file: File) => {
        console.log(`Mock processing PDF`);
        const mockService = new MockContentIngestionService();
        return mockService.processPdf(file);
      },
      processVideo: async (url: string) => {
        console.log(`Mock processing video: ${url}`);
        const mockService = new MockContentIngestionService();
        return mockService.processVideo(url);
      },
      processText: async (text: string) => {
        console.log(`Mock processing text`);
        const mockService = new MockContentIngestionService();
        return mockService.processText(text);
      }
    };
    
    this['contentUnderstandingManager'] = {
      analyzeContent: async (contentPackage: any) => {
        console.log(`Mock analyzing content`);
        const mockService = new MockContentUnderstandingService();
        return mockService.analyzeContent(contentPackage);
      },
      generateSummary: async (contentPackage: any, maxLength?: number) => {
        console.log(`Mock generating summary`);
        const mockService = new MockContentUnderstandingService();
        return mockService.generateSummary(contentPackage, maxLength);
      }
    };
    
    this['dialogueGenerationManager'] = {
      generatePodcastScript: async (knowledgeGraph: any, options?: any) => {
        console.log(`Mock generating podcast script`);
        const mockService = new MockDialogueGenerationService();
        return mockService.generatePodcastScript();
      }
    };
    
    this['voiceSynthesisManager'] = {
      autoAssignVoices: async (script: any) => {
        console.log(`Mock auto-assigning voices`);
        return script.speakers.map((speaker: any) => ({
          speakerId: speaker.id,
          voiceId: `mock-voice-${speaker.id}`
        }));
      },
      synthesizePodcast: async (script: any, speakerVoiceMappings: any) => {
        console.log(`Mock synthesizing podcast`);
        const mockService = new MockVoiceSynthesisService();
        return mockService.synthesizePodcast(script, speakerVoiceMappings);
      }
    };
    
    this['deliveryManager'] = {
      getAvailableFormats: () => {
        console.log(`Mock getting available formats`);
        const mockService = new MockDeliveryService();
        return mockService.getAvailableFormats();
      },
      packagePodcast: async (audio: any, options: any) => {
        console.log(`Mock packaging podcast`);
        const mockService = new MockDeliveryService();
        return mockService.packagePodcast(audio, options);
      },
      savePodcast: async (packagedPodcast: any) => {
        console.log(`Mock saving podcast`);
        const mockService = new MockDeliveryService();
        return mockService.savePodcast(packagedPodcast);
      },
      getOutputDirectory: () => outputDirectory
    };
  }
}
