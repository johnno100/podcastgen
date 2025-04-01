import { ContentPackage } from '../models/content-package.model';

export interface Topic {
  id: string;
  name: string;
  description: string;
  importance: number;
  relatedContent: string[];
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  mentions: string[];
  attributes: Record<string, string>;
}

export interface KnowledgeGraph {
  id: string;
  topics: Topic[];
  relationships: Relationship[];
  entities: Entity[];
  sources: string[];
}

export interface ContentUnderstandingService {
  analyzeContent(content: ContentPackage): Promise<KnowledgeGraph>;
  generateSummary(content: ContentPackage, maxLength?: number): Promise<string>;
  extractTopics(content: ContentPackage): Promise<Topic[]>;
  identifyEntities(content: ContentPackage): Promise<Entity[]>;
}
