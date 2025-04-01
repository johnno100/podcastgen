import { ContentPackage } from '../models/content-package.model';
import * as pdfParse from 'pdf-parse';

export class PdfAdapter {
  /**
   * Process a PDF file to extract content
   * @param file The PDF file to process
   * @returns A ContentPackage containing the extracted content
   */
  async processPdf(file: File): Promise<ContentPackage> {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      // Parse PDF content
      const pdfData = await pdfParse(Buffer.from(arrayBuffer));
      
      // Extract content
      const content = this.extractContent(pdfData);
      
      // Extract metadata
      const metadata = this.extractMetadata(pdfData, file);
      
      // Create content package
      return {
        id: this.generateId(file.name),
        content,
        metadata,
        sourceType: 'pdf',
        citations: [file.name]
      };
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }
  
  /**
   * Convert a File object to ArrayBuffer
   * @param file The file to convert
   * @returns A Promise resolving to an ArrayBuffer
   */
  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Extract content from PDF data
   * @param pdfData The parsed PDF data
   * @returns An array of content strings
   */
  private extractContent(pdfData: pdfParse.Result): string[] {
    // Split text into paragraphs
    const paragraphs = pdfData.text
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 0);
    
    // If no paragraphs were found, split by sentences
    if (paragraphs.length === 0) {
      return pdfData.text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .split(/\.(?=\s)/)
        .map(s => s.trim() + '.')
        .filter(s => s.length > 10);
    }
    
    return paragraphs;
  }
  
  /**
   * Extract metadata from PDF data and file
   * @param pdfData The parsed PDF data
   * @param file The original PDF file
   * @returns An object containing metadata
   */
  private extractMetadata(pdfData: pdfParse.Result, file: File): Record<string, any> {
    const { info, metadata, numPages } = pdfData;
    
    return {
      title: info?.Title || file.name,
      author: info?.Author || 'Unknown',
      creator: info?.Creator || 'Unknown',
      producer: info?.Producer || 'Unknown',
      creationDate: info?.CreationDate || null,
      modificationDate: info?.ModDate || null,
      pageCount: numPages,
      fileSize: file.size,
      fileName: file.name,
      fileType: file.type,
      ...metadata
    };
  }
  
  /**
   * Generate a unique ID for the content package
   * @param fileName The source file name
   * @returns A unique ID
   */
  private generateId(fileName: string): string {
    return `pdf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
