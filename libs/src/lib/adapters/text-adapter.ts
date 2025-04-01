import { ContentPackage } from '../models/content-package.model';

export class TextAdapter {
  /**
   * Process plain text to extract content
   * @param text The text to process
   * @returns A ContentPackage containing the extracted content
   */
  async processText(text: string): Promise<ContentPackage> {
    try {
      // Extract content
      const content = this.extractContent(text);
      
      // Extract metadata
      const metadata = this.extractMetadata(text);
      
      // Create content package
      return {
        id: this.generateId(),
        content,
        metadata,
        sourceType: 'text',
        citations: []
      };
    } catch (error) {
      throw new Error(`Failed to process text: ${error.message}`);
    }
  }
  
  /**
   * Extract content from text
   * @param text The text to extract content from
   * @returns An array of content strings
   */
  private extractContent(text: string): string[] {
    // Remove excessive whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    // Try to split by paragraphs first
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 0);
    
    if (paragraphs.length > 1) {
      return paragraphs;
    }
    
    // If no paragraphs, split by sentences
    const sentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 0);
    
    // Group sentences into paragraphs of reasonable size
    const result: string[] = [];
    let currentParagraph = '';
    
    for (const sentence of sentences) {
      if (currentParagraph.length + sentence.length > 500) {
        result.push(currentParagraph);
        currentParagraph = sentence;
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + sentence;
      }
    }
    
    if (currentParagraph) {
      result.push(currentParagraph);
    }
    
    return result.length > 0 ? result : [cleanedText];
  }
  
  /**
   * Extract metadata from text
   * @param text The text to extract metadata from
   * @returns An object containing metadata
   */
  private extractMetadata(text: string): Record<string, any> {
    // Try to extract a title from the first line
    const lines = text.split('\n');
    let title = lines[0].trim();
    
    // If the first line is too long, it's probably not a title
    if (title.length > 100) {
      title = 'Untitled Text';
    }
    
    return {
      title,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      lineCount: lines.length,
      language: this.detectLanguage(text),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Simple language detection based on common words
   * @param text The text to detect language from
   * @returns The detected language code
   */
  private detectLanguage(text: string): string {
    const sample = text.toLowerCase().substring(0, 1000);
    
    // Simple language detection based on common words
    const languagePatterns: Record<string, RegExp[]> = {
      'en': [/\bthe\b/, /\band\b/, /\bof\b/, /\bto\b/, /\ba\b/, /\bin\b/, /\bthat\b/],
      'es': [/\bel\b/, /\bla\b/, /\bde\b/, /\by\b/, /\ben\b/, /\bque\b/, /\bun\b/],
      'fr': [/\ble\b/, /\bla\b/, /\bde\b/, /\bet\b/, /\ben\b/, /\bun\b/, /\bune\b/],
      'de': [/\bder\b/, /\bdie\b/, /\bdas\b/, /\bund\b/, /\bin\b/, /\bist\b/, /\bzu\b/]
    };
    
    const scores: Record<string, number> = {};
    
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      scores[lang] = patterns.reduce((score, pattern) => {
        return score + (pattern.test(sample) ? 1 : 0);
      }, 0);
    }
    
    // Find language with highest score
    let maxScore = 0;
    let detectedLanguage = 'en'; // Default to English
    
    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    }
    
    return detectedLanguage;
  }
  
  /**
   * Generate a unique ID for the content package
   * @returns A unique ID
   */
  private generateId(): string {
    return `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
