import { ContentPackage, ContentIngestionService } from '../models/content-package.model';
import { WebAdapter } from './web-adapter';
import { PdfAdapter } from './pdf-adapter';
import { VideoAdapter } from './video-adapter';
import { TextAdapter } from './text-adapter';

export class ContentIngestionServiceImpl implements ContentIngestionService {
  private webAdapter: WebAdapter;
  private pdfAdapter: PdfAdapter;
  private videoAdapter: VideoAdapter;
  private textAdapter: TextAdapter;

  constructor() {
    this.webAdapter = new WebAdapter();
    this.pdfAdapter = new PdfAdapter();
    this.videoAdapter = new VideoAdapter();
    this.textAdapter = new TextAdapter();
  }

  /**
   * Process a web URL to extract content
   * @param url The URL to process
   * @returns A ContentPackage containing the extracted content
   */
  async processUrl(url: string): Promise<ContentPackage> {
    // Check if it's a YouTube URL
    if (this.isYouTubeUrl(url)) {
      return this.processVideo(url);
    }
    
    // Otherwise process as a web page
    return this.webAdapter.processUrl(url);
  }

  /**
   * Process a PDF file to extract content
   * @param file The PDF file to process
   * @returns A ContentPackage containing the extracted content
   */
  async processPdf(file: File): Promise<ContentPackage> {
    return this.pdfAdapter.processPdf(file);
  }

  /**
   * Process a video URL to extract content
   * @param url The video URL to process
   * @returns A ContentPackage containing the extracted content
   */
  async processVideo(url: string): Promise<ContentPackage> {
    return this.videoAdapter.processVideo(url);
  }

  /**
   * Process plain text to extract content
   * @param text The text to process
   * @returns A ContentPackage containing the extracted content
   */
  async processText(text: string): Promise<ContentPackage> {
    return this.textAdapter.processText(text);
  }

  /**
   * Check if a URL is a YouTube URL
   * @param url The URL to check
   * @returns True if the URL is a YouTube URL, false otherwise
   */
  private isYouTubeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      return hostname === 'youtube.com' || 
             hostname === 'www.youtube.com' || 
             hostname === 'youtu.be' ||
             hostname === 'www.youtu.be';
    } catch (error) {
      return false;
    }
  }
}
