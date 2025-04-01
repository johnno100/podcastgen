import { PodcastAudio } from '../models/voice-synthesis.model';
import { DeliveryService, PodcastDeliveryFormat, PodcastDeliveryOptions, PodcastPackage } from '../models/delivery.model';

/**
 * Mock implementation of the delivery service for testing
 */
export class MockDeliveryService implements DeliveryService {
  /**
   * Get mock available formats
   * @returns Array of mock formats
   */
  getAvailableFormats(): PodcastDeliveryFormat[] {
    return [
      {
        id: 'mp3',
        name: 'MP3',
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        description: 'Standard audio format with good compression and wide compatibility'
      },
      {
        id: 'wav',
        name: 'WAV',
        extension: 'wav',
        mimeType: 'audio/wav',
        description: 'Uncompressed audio format with high quality'
      }
    ];
  }

  /**
   * Package a mock podcast
   * @param audio The podcast audio to package
   * @param options Delivery options
   * @returns A mock packaged podcast
   */
  async packagePodcast(audio: PodcastAudio, options: PodcastDeliveryOptions): Promise<PodcastPackage> {
    return {
      id: `mock-package-${Date.now()}`,
      title: audio.metadata.title || 'Mock Podcast',
      description: audio.metadata.description || 'A mock podcast for testing',
      audioUrl: `/mock/podcasts/${audio.id}.${options.format.extension}`,
      transcriptUrl: options.includeTranscript ? `/mock/transcripts/${audio.id}.txt` : undefined,
      duration: audio.totalDuration,
      format: options.format.id,
      size: 1024 * 1024 * 5, // Mock 5MB file
      createdAt: new Date().toISOString(),
      metadata: {
        ...audio.metadata,
        format: options.format.id,
        includedTranscript: options.includeTranscript,
        includedSpeakerLabels: options.includeSpeakerLabels,
        includedChapters: options.includeChapters,
        packagedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Save a mock packaged podcast
   * @param packagedPodcast The packaged podcast to save
   * @returns A mock file path
   */
  async savePodcast(packagedPodcast: PodcastPackage): Promise<string> {
    return packagedPodcast.audioUrl;
  }

  /**
   * Generate a mock shareable link
   * @param packagedPodcast The packaged podcast to generate a link for
   * @returns A mock shareable link
   */
  async generateShareableLink(packagedPodcast: PodcastPackage): Promise<string> {
    return `https://example.com/share/${packagedPodcast.id}`;
  }

  /**
   * Generate a mock RSS feed
   * @returns A mock RSS feed path
   */
  async generateRssFeed(podcasts: PodcastPackage[]): Promise<string> {
    return '/mock/feeds/podcast-feed.xml';
  }

  /**
   * Generate a mock transcript
   * @param audio The podcast audio to generate a transcript from
   * @returns A mock transcript
   */
  async generateTranscript(audio: PodcastAudio): Promise<string> {
    let transcript = `# ${audio.metadata.title || 'Untitled Podcast'}\n\n`;
    
    // Add each segment to the transcript
    for (const segment of audio.segments) {
      // Format timestamp as MM:SS
      const minutes = Math.floor(segment.startTime / 60);
      const seconds = Math.floor(segment.startTime % 60);
      const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Add speaker name if available
      if (segment.speakerId === 'narrator') {
        transcript += `[${timestamp}] Narrator: ${segment.text}\n\n`;
      } else {
        transcript += `[${timestamp}] ${segment.speakerId}: ${segment.text}\n\n`;
      }
    }
    
    return transcript;
  }
}
