import { DeliveryService, PodcastDeliveryFormat, PodcastDeliveryOptions, PodcastPackage } from '../models/delivery.model';
import { PodcastAudio } from '../models/voice-synthesis.model';
import * as fs from 'fs';
import * as path from 'path';

export class LocalDeliveryService implements DeliveryService {
  private outputDirectory: string;
  
  constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  /**
   * Get available podcast delivery formats
   * @returns Array of available formats
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
      },
      {
        id: 'ogg',
        name: 'OGG Vorbis',
        extension: 'ogg',
        mimeType: 'audio/ogg',
        description: 'Open source audio format with good compression'
      }
    ];
  }

  /**
   * Package a podcast for delivery
   * @param audio The podcast audio to package
   * @param options Delivery options
   * @returns A packaged podcast
   */
  async packagePodcast(audio: PodcastAudio, options: PodcastDeliveryOptions): Promise<PodcastPackage> {
    try {
      // Generate a unique ID for the package
      const packageId = `podcast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create a sanitized title for filenames
      const sanitizedTitle = audio.metadata.title
        ? this.sanitizeFilename(audio.metadata.title)
        : packageId;
      
      // Save the audio file
      const audioFilename = `${sanitizedTitle}.${options.format.extension}`;
      const audioPath = path.join(this.outputDirectory, audioFilename);
      
      // Write the audio data to file
      await fs.promises.writeFile(audioPath, Buffer.from(audio.fullAudio || new ArrayBuffer(0)));
      
      // Calculate file size
      const stats = await fs.promises.stat(audioPath);
      const fileSize = stats.size;
      
      // Generate transcript if requested
      let transcriptUrl: string | undefined;
      if (options.includeTranscript) {
        const transcript = await this.generateTranscript(audio);
        const transcriptFilename = `${sanitizedTitle}.txt`;
        const transcriptPath = path.join(this.outputDirectory, transcriptFilename);
        
        await fs.promises.writeFile(transcriptPath, transcript);
        transcriptUrl = transcriptPath;
      }
      
      // Prepare metadata
      const metadata: Record<string, any> = {
        ...audio.metadata,
        format: options.format.id,
        includedTranscript: options.includeTranscript,
        includedSpeakerLabels: options.includeSpeakerLabels,
        includedChapters: options.includeChapters,
        packagedAt: new Date().toISOString()
      };
      
      // If not including metadata, remove it from the package
      if (!options.includeMetadata) {
        delete metadata.format;
        delete metadata.includedTranscript;
        delete metadata.includedSpeakerLabels;
        delete metadata.includedChapters;
        delete metadata.packagedAt;
      }
      
      // Create the podcast package
      return {
        id: packageId,
        title: audio.metadata.title || 'Untitled Podcast',
        description: audio.metadata.description || '',
        audioUrl: audioPath,
        transcriptUrl,
        duration: audio.totalDuration,
        format: options.format.id,
        size: fileSize,
        createdAt: new Date().toISOString(),
        metadata
      };
    } catch (error) {
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
      // Create a metadata file
      const metadataFilename = `${this.sanitizeFilename(packagedPodcast.title)}-metadata.json`;
      const metadataPath = path.join(this.outputDirectory, metadataFilename);
      
      // Write the metadata to file
      await fs.promises.writeFile(
        metadataPath,
        JSON.stringify(packagedPodcast, null, 2)
      );
      
      return packagedPodcast.audioUrl;
    } catch (error) {
      throw new Error(`Failed to save podcast: ${error.message}`);
    }
  }

  /**
   * Generate a shareable link for a packaged podcast
   * @param packagedPodcast The packaged podcast to generate a link for
   * @returns A shareable link
   */
  async generateShareableLink(packagedPodcast: PodcastPackage): Promise<string> {
    // In a real implementation, this would upload the podcast to a CDN or file hosting service
    // For the MVP, we'll return a local file URL
    return `file://${packagedPodcast.audioUrl}`;
  }

  /**
   * Generate an RSS feed for a collection of podcasts
   * @param podcasts The podcasts to include in the feed
   * @returns An RSS feed XML string
   */
  async generateRssFeed(podcasts: PodcastPackage[]): Promise<string> {
    try {
      // Create a basic RSS feed
      const feedTitle = 'Generated Podcasts';
      const feedDescription = 'Automatically generated podcasts from content';
      const feedLink = 'https://example.com/podcast';
      
      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${feedTitle}</title>
    <description>${feedDescription}</description>
    <link>${feedLink}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;
      
      // Add each podcast as an item
      for (const podcast of podcasts) {
        const pubDate = new Date(podcast.createdAt).toUTCString();
        const enclosureUrl = await this.generateShareableLink(podcast);
        
        rss += `    <item>
      <title>${podcast.title}</title>
      <description>${podcast.description}</description>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${enclosureUrl}" length="${podcast.size}" type="audio/${podcast.format}"/>
      <guid isPermaLink="false">${podcast.id}</guid>
      <itunes:duration>${Math.floor(podcast.duration)}</itunes:duration>
    </item>
`;
      }
      
      // Close the RSS feed
      rss += `  </channel>
</rss>`;
      
      // Save the RSS feed to a file
      const rssPath = path.join(this.outputDirectory, 'podcast-feed.xml');
      await fs.promises.writeFile(rssPath, rss);
      
      return rssPath;
    } catch (error) {
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
      // For the MVP, we'll use the existing text from the audio segments
      // In a production implementation, this could use speech-to-text for more accuracy
      
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
    } catch (error) {
      throw new Error(`Failed to generate transcript: ${error.message}`);
    }
  }

  /**
   * Sanitize a filename to remove invalid characters
   * @param filename The filename to sanitize
   * @returns A sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
