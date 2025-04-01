import { ContentPackage } from '../models/content-package.model';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebAdapter {
  /**
   * Process a web URL to extract content
   * @param url The URL to process
   * @returns A ContentPackage containing the extracted content
   */
  async processUrl(url: string): Promise<ContentPackage> {
    try {
      // Validate URL
      const validatedUrl = this.validateUrl(url);
      
      // Fetch the web page
      const response = await axios.get(validatedUrl);
      
      // Parse the HTML content
      const $ = cheerio.load(response.data);
      
      // Extract main content
      const title = $('title').text().trim();
      const metaTags = this.extractMetaTags($);
      const mainContent = this.extractMainContent($);
      
      // Create content package
      return {
        id: this.generateId(url),
        content: mainContent,
        metadata: {
          title,
          url: validatedUrl,
          description: metaTags.description || '',
          author: metaTags.author || '',
          publishedDate: metaTags.publishedDate || '',
          siteName: metaTags.siteName || '',
          ...metaTags
        },
        sourceType: 'web',
        sourceUrl: validatedUrl,
        citations: [validatedUrl]
      };
    } catch (error) {
      throw new Error(`Failed to process URL: ${error.message}`);
    }
  }
  
  /**
   * Validate and normalize a URL
   * @param url The URL to validate
   * @returns The validated URL
   */
  private validateUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
  
  /**
   * Extract meta tags from the HTML
   * @param $ The cheerio instance
   * @returns An object containing meta tag values
   */
  private extractMetaTags($: cheerio.CheerioAPI): Record<string, string> {
    const metaTags: Record<string, string> = {};
    
    // Extract standard meta tags
    $('meta').each((_, element) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');
      
      if (name && content) {
        metaTags[name] = content;
      }
    });
    
    // Extract OpenGraph meta tags
    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      
      if (property && content) {
        const key = property.replace('og:', '');
        metaTags[key] = content;
      }
    });
    
    return {
      description: metaTags['description'] || metaTags['og:description'],
      author: metaTags['author'] || metaTags['article:author'],
      publishedDate: metaTags['article:published_time'] || metaTags['publishedDate'],
      siteName: metaTags['og:site_name'],
      ...metaTags
    };
  }
  
  /**
   * Extract the main content from the HTML
   * @param $ The cheerio instance
   * @returns An array of content strings
   */
  private extractMainContent($: cheerio.CheerioAPI): string[] {
    const content: string[] = [];
    
    // Try to find the main content container
    const mainSelectors = [
      'article',
      'main',
      '.content',
      '#content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ];
    
    let mainElement = $('body');
    
    for (const selector of mainSelectors) {
      if ($(selector).length > 0) {
        mainElement = $(selector).first();
        break;
      }
    }
    
    // Extract paragraphs
    mainElement.find('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 0) {
        content.push(text);
      }
    });
    
    // Extract headings
    mainElement.find('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 0) {
        content.push(`Heading: ${text}`);
      }
    });
    
    // If no content was found, extract all text from the body
    if (content.length === 0) {
      const bodyText = $('body').text().trim()
        .replace(/\s+/g, ' ')
        .split('. ')
        .map(sentence => sentence.trim() + '.');
      
      content.push(...bodyText.filter(sentence => sentence.length > 10));
    }
    
    return content;
  }
  
  /**
   * Generate a unique ID for the content package
   * @param url The source URL
   * @returns A unique ID
   */
  private generateId(url: string): string {
    return `web-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
