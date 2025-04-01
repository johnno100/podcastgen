import { ContentPackage } from '../models/content-package.model';
import ytdl from 'ytdl-core';

export class VideoAdapter {
  /**
   * Process a video URL to extract content
   * @param url The video URL to process
   * @returns A ContentPackage containing the extracted content
   */
  async processVideo(url: string): Promise<ContentPackage> {
    try {
      // Validate URL
      if (!ytdl.validateURL(url)) {
        throw new Error(`Invalid YouTube URL: ${url}`);
      }
      
      // Get video info
      const videoInfo = await ytdl.getInfo(url);
      
      // Extract content from captions/subtitles if available
      const content = await this.extractContent(videoInfo);
      
      // Extract metadata
      const metadata = this.extractMetadata(videoInfo);
      
      // Create content package
      return {
        id: this.generateId(url),
        content,
        metadata,
        sourceType: 'video',
        sourceUrl: url,
        citations: [url]
      };
    } catch (error) {
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }
  
  /**
   * Extract content from video info
   * @param videoInfo The video info from ytdl-core
   * @returns An array of content strings
   */
  private async extractContent(videoInfo: ytdl.videoInfo): Promise<string[]> {
    const content: string[] = [];
    
    // Add video title and description
    content.push(`Title: ${videoInfo.videoDetails.title}`);
    
    if (videoInfo.videoDetails.description) {
      // Split description into paragraphs
      const descriptionParagraphs = videoInfo.videoDetails.description
        .split(/\n\s*\n/)
        .map(p => p.replace(/\n/g, ' ').trim())
        .filter(p => p.length > 0);
      
      content.push(...descriptionParagraphs);
    }
    
    // Try to extract captions if available
    const captionTracks = videoInfo.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (captionTracks && captionTracks.length > 0) {
      try {
        // Get the first available caption track (usually English)
        const captionTrack = captionTracks[0];
        const captionUrl = captionTrack.baseUrl;
        
        // Fetch captions
        const response = await fetch(captionUrl);
        const captionXml = await response.text();
        
        // Parse captions
        const captions = this.parseCaptions(captionXml);
        content.push(...captions);
      } catch (error) {
        console.error('Failed to extract captions:', error);
        // Continue without captions
      }
    }
    
    // If no content was extracted, add a placeholder
    if (content.length <= 1) {
      content.push(`This is a video titled "${videoInfo.videoDetails.title}" by ${videoInfo.videoDetails.author.name}.`);
      content.push(`The video is ${this.formatDuration(parseInt(videoInfo.videoDetails.lengthSeconds))} long.`);
    }
    
    return content;
  }
  
  /**
   * Parse captions from XML
   * @param captionXml The XML containing captions
   * @returns An array of caption strings
   */
  private parseCaptions(captionXml: string): string[] {
    const captions: string[] = [];
    const regex = /<text[^>]*>(.*?)<\/text>/g;
    let match;
    
    while ((match = regex.exec(captionXml)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      if (text.length > 0) {
        captions.push(text);
      }
    }
    
    // Combine captions into sentences
    return this.combineCaptions(captions);
  }
  
  /**
   * Combine captions into sentences
   * @param captions Array of caption fragments
   * @returns Array of combined sentences
   */
  private combineCaptions(captions: string[]): string[] {
    const sentences: string[] = [];
    let currentSentence = '';
    
    for (const caption of captions) {
      // If caption ends with sentence-ending punctuation
      if (/[.!?]$/.test(caption)) {
        currentSentence += (currentSentence ? ' ' : '') + caption;
        sentences.push(currentSentence);
        currentSentence = '';
      } else {
        // If current sentence is getting long, start a new one
        if (currentSentence.length > 150 && /[,;:]$/.test(caption)) {
          currentSentence += (currentSentence ? ' ' : '') + caption;
          sentences.push(currentSentence);
          currentSentence = '';
        } else {
          currentSentence += (currentSentence ? ' ' : '') + caption;
        }
      }
    }
    
    // Add any remaining text
    if (currentSentence) {
      sentences.push(currentSentence);
    }
    
    return sentences;
  }
  
  /**
   * Extract metadata from video info
   * @param videoInfo The video info from ytdl-core
   * @returns An object containing metadata
   */
  private extractMetadata(videoInfo: ytdl.videoInfo): Record<string, any> {
    const { videoDetails, player_response } = videoInfo;
    
    return {
      title: videoDetails.title,
      author: videoDetails.author.name,
      authorUrl: videoDetails.author.channel_url,
      lengthSeconds: parseInt(videoDetails.lengthSeconds),
      viewCount: parseInt(videoDetails.viewCount),
      publishDate: videoDetails.publishDate,
      category: player_response?.microformat?.playerMicroformatRenderer?.category,
      keywords: videoDetails.keywords || [],
      description: videoDetails.description,
      thumbnailUrl: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
      videoId: videoDetails.videoId,
      isLiveContent: videoDetails.isLiveContent
    };
  }
  
  /**
   * Format duration in seconds to a human-readable string
   * @param seconds Duration in seconds
   * @returns Formatted duration string
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
  
  /**
   * Generate a unique ID for the content package
   * @param url The source URL
   * @returns A unique ID
   */
  private generateId(url: string): string {
    return `video-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
