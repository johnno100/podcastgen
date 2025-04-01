import { ContentPackage } from '../models/content-package.model';
import { KnowledgeGraph, Topic, Entity, Relationship, ContentUnderstandingService } from '../models/knowledge-graph.model';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export class GeminiContentUnderstandingService implements ContentUnderstandingService {
  private geminiModel: GenerativeModel;
  private maxRetries = 3;
  private initialBackoffMs = 1000;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  /**
   * Analyze content to create a knowledge graph
   * @param content The content package to analyze
   * @returns A knowledge graph containing topics, entities, and relationships
   */
  async analyzeContent(content: ContentPackage): Promise<KnowledgeGraph> {
    try {
      // Extract topics
      const topics = await this.extractTopics(content);
      
      // Identify entities
      const entities = await this.identifyEntities(content);
      
      // Identify relationships between topics and entities
      const relationships = await this.identifyRelationships(topics, entities, content);
      
      // Create knowledge graph
      return {
        id: `kg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        topics,
        entities,
        relationships,
        sources: content.citations || []
      };
    } catch (error) {
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  /**
   * Generate a summary of the content
   * @param content The content package to summarize
   * @param maxLength The maximum length of the summary in characters
   * @returns A summary of the content
   */
  async generateSummary(content: ContentPackage, maxLength = 1000): Promise<string> {
    const prompt = this.createSummaryPrompt(content, maxLength);
    
    try {
      const result = await this.executeWithRetry(() => 
        this.geminiModel.generateContent(prompt)
      );
      
      return result.response.text();
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Extract topics from the content
   * @param content The content package to extract topics from
   * @returns An array of topics
   */
  async extractTopics(content: ContentPackage): Promise<Topic[]> {
    const prompt = this.createTopicsPrompt(content);
    
    try {
      const result = await this.executeWithRetry(() => 
        this.geminiModel.generateContent(prompt)
      );
      
      const responseText = result.response.text();
      return this.parseTopicsResponse(responseText);
    } catch (error) {
      throw new Error(`Failed to extract topics: ${error.message}`);
    }
  }

  /**
   * Identify entities in the content
   * @param content The content package to identify entities in
   * @returns An array of entities
   */
  async identifyEntities(content: ContentPackage): Promise<Entity[]> {
    const prompt = this.createEntitiesPrompt(content);
    
    try {
      const result = await this.executeWithRetry(() => 
        this.geminiModel.generateContent(prompt)
      );
      
      const responseText = result.response.text();
      return this.parseEntitiesResponse(responseText);
    } catch (error) {
      throw new Error(`Failed to identify entities: ${error.message}`);
    }
  }

  /**
   * Identify relationships between topics and entities
   * @param topics The topics to identify relationships between
   * @param entities The entities to identify relationships between
   * @param content The original content package
   * @returns An array of relationships
   */
  private async identifyRelationships(topics: Topic[], entities: Entity[], content: ContentPackage): Promise<Relationship[]> {
    const prompt = this.createRelationshipsPrompt(topics, entities, content);
    
    try {
      const result = await this.executeWithRetry(() => 
        this.geminiModel.generateContent(prompt)
      );
      
      const responseText = result.response.text();
      return this.parseRelationshipsResponse(responseText);
    } catch (error) {
      throw new Error(`Failed to identify relationships: ${error.message}`);
    }
  }

  /**
   * Create a prompt for generating a summary
   * @param content The content package to summarize
   * @param maxLength The maximum length of the summary
   * @returns A prompt string
   */
  private createSummaryPrompt(content: ContentPackage, maxLength: number): string {
    const contentText = content.content.join('\n\n');
    const metadata = JSON.stringify(content.metadata, null, 2);
    
    return `
You are an expert content analyst. Your task is to create a concise summary of the following content.
The summary should be no longer than ${maxLength} characters.

CONTENT:
${contentText}

METADATA:
${metadata}

Please provide a clear, informative summary that captures the main points and key information from the content.
Focus on factual information and maintain the original tone and perspective.
`;
  }

  /**
   * Create a prompt for extracting topics
   * @param content The content package to extract topics from
   * @returns A prompt string
   */
  private createTopicsPrompt(content: ContentPackage): string {
    const contentText = content.content.join('\n\n');
    const metadata = JSON.stringify(content.metadata, null, 2);
    
    return `
You are an expert content analyst. Your task is to identify the main topics discussed in the following content.
For each topic, provide:
1. A short, descriptive name
2. A brief description
3. An importance score from 1-10 (10 being most important)
4. Related content excerpts (direct quotes from the original content)

CONTENT:
${contentText}

METADATA:
${metadata}

Format your response as a JSON array of topic objects with the following structure:
[
  {
    "id": "topic-1",
    "name": "Topic Name",
    "description": "Brief description of the topic",
    "importance": 8,
    "relatedContent": ["Quote 1 from content", "Quote 2 from content"]
  },
  ...
]

Identify between 3-7 distinct topics, focusing on the most significant themes in the content.
`;
  }

  /**
   * Create a prompt for identifying entities
   * @param content The content package to identify entities in
   * @returns A prompt string
   */
  private createEntitiesPrompt(content: ContentPackage): string {
    const contentText = content.content.join('\n\n');
    
    return `
You are an expert content analyst. Your task is to identify important entities mentioned in the following content.
Entities can include people, organizations, locations, products, technologies, concepts, etc.

For each entity, provide:
1. A canonical name
2. The entity type (person, organization, location, product, technology, concept, etc.)
3. All mentions of this entity in the content (direct quotes)
4. Key attributes of the entity mentioned in the content

CONTENT:
${contentText}

Format your response as a JSON array of entity objects with the following structure:
[
  {
    "id": "entity-1",
    "name": "Entity Name",
    "type": "person|organization|location|product|technology|concept|other",
    "mentions": ["Quote 1 mentioning entity", "Quote 2 mentioning entity"],
    "attributes": {
      "attribute1": "value1",
      "attribute2": "value2"
    }
  },
  ...
]

Identify between 5-15 distinct entities, focusing on those most relevant to understanding the content.
`;
  }

  /**
   * Create a prompt for identifying relationships
   * @param topics The topics to identify relationships between
   * @param entities The entities to identify relationships between
   * @param content The original content package
   * @returns A prompt string
   */
  private createRelationshipsPrompt(topics: Topic[], entities: Entity[], content: ContentPackage): string {
    const contentText = content.content.join('\n\n');
    const topicsJson = JSON.stringify(topics, null, 2);
    const entitiesJson = JSON.stringify(entities, null, 2);
    
    return `
You are an expert content analyst. Your task is to identify relationships between topics and entities in the following content.

CONTENT:
${contentText}

TOPICS:
${topicsJson}

ENTITIES:
${entitiesJson}

For each relationship, provide:
1. The source ID (either a topic ID or entity ID)
2. The target ID (either a topic ID or entity ID)
3. The type of relationship (e.g., "contains", "mentions", "contradicts", "supports", "explains", "is part of", etc.)
4. A strength score from 1-10 (10 being strongest relationship)

Format your response as a JSON array of relationship objects with the following structure:
[
  {
    "id": "rel-1",
    "sourceId": "topic-1",
    "targetId": "entity-3",
    "relationshipType": "mentions",
    "strength": 7
  },
  ...
]

Identify the most significant relationships that help understand the connections between topics and entities in the content.
`;
  }

  /**
   * Parse the response from the topics prompt
   * @param responseText The response text from the model
   * @returns An array of topics
   */
  private parseTopicsResponse(responseText: string): Topic[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const topics = JSON.parse(jsonMatch[0]) as Topic[];
      
      // Validate and clean up topics
      return topics.map((topic, index) => ({
        id: topic.id || `topic-${index + 1}`,
        name: topic.name || `Unnamed Topic ${index + 1}`,
        description: topic.description || '',
        importance: topic.importance || 5,
        relatedContent: Array.isArray(topic.relatedContent) ? topic.relatedContent : []
      }));
    } catch (error) {
      console.error('Failed to parse topics response:', error);
      return [];
    }
  }

  /**
   * Parse the response from the entities prompt
   * @param responseText The response text from the model
   * @returns An array of entities
   */
  private parseEntitiesResponse(responseText: string): Entity[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const entities = JSON.parse(jsonMatch[0]) as Entity[];
      
      // Validate and clean up entities
      return entities.map((entity, index) => ({
        id: entity.id || `entity-${index + 1}`,
        name: entity.name || `Unnamed Entity ${index + 1}`,
        type: entity.type || 'unknown',
        mentions: Array.isArray(entity.mentions) ? entity.mentions : [],
        attributes: entity.attributes || {}
      }));
    } catch (error) {
      console.error('Failed to parse entities response:', error);
      return [];
    }
  }

  /**
   * Parse the response from the relationships prompt
   * @param responseText The response text from the model
   * @returns An array of relationships
   */
  private parseRelationshipsResponse(responseText: string): Relationship[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const relationships = JSON.parse(jsonMatch[0]) as Relationship[];
      
      // Validate and clean up relationships
      return relationships.map((relationship, index) => ({
        id: relationship.id || `rel-${index + 1}`,
        sourceId: relationship.sourceId || '',
        targetId: relationship.targetId || '',
        relationshipType: relationship.relationshipType || 'unknown',
        strength: relationship.strength || 5
      })).filter(rel => rel.sourceId && rel.targetId);
    } catch (error) {
      console.error('Failed to parse relationships response:', error);
      return [];
    }
  }

  /**
   * Execute a function with exponential backoff retry logic
   * @param fn The function to execute
   * @returns The result of the function
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    let backoffMs = this.initialBackoffMs;
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        
        if (retries > this.maxRetries) {
          throw error;
        }
        
        console.warn(`API call failed, retrying in ${backoffMs}ms...`, error);
        
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        
        // Exponential backoff with jitter
        backoffMs = backoffMs * 2 * (0.5 + Math.random() / 2);
      }
    }
  }
}
