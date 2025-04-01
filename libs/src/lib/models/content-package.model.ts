export interface ContentPackage {
  id: string;
  content: string[];
  metadata: Record<string, any>;
  extractedMedia?: Record<string, Blob>;
  citations?: string[];
  contentStructure?: string;
  sourceType: 'web' | 'pdf' | 'video' | 'text';
  sourceUrl?: string;
}

export interface ContentIngestionService {
  processUrl(url: string): Promise<ContentPackage>;
  processPdf(file: File): Promise<ContentPackage>;
  processVideo(url: string): Promise<ContentPackage>;
  processText(text: string): Promise<ContentPackage>;
}
