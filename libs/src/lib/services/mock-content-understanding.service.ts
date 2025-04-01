import { ContentPackage } from '../models/content-package.model';
import { KnowledgeGraph } from '../models/knowledge-graph.model';

/**
 * Mock implementation of the content understanding service for testing
 */
export class MockContentUnderstandingService {
  /**
   * Analyze content to create a knowledge graph
   * @param content The content package to analyze
   * @returns A mock knowledge graph
   */
  async analyzeContent(content: ContentPackage): Promise<KnowledgeGraph> {
    return {
      id: `mock-kg-${Date.now()}`,
      topics: [
        {
          id: 'topic-1',
          name: 'Mock Topic 1',
          description: 'This is a mock topic for testing',
          importance: 8,
          relatedContent: ['Mock related content 1', 'Mock related content 2']
        },
        {
          id: 'topic-2',
          name: 'Mock Topic 2',
          description: 'This is another mock topic for testing',
          importance: 6,
          relatedContent: ['Mock related content 3', 'Mock related content 4']
        }
      ],
      entities: [
        {
          id: 'entity-1',
          name: 'Mock Entity 1',
          type: 'person',
          mentions: ['Mock mention 1', 'Mock mention 2'],
          attributes: { attribute1: 'value1', attribute2: 'value2' }
        },
        {
          id: 'entity-2',
          name: 'Mock Entity 2',
          type: 'organization',
          mentions: ['Mock mention 3', 'Mock mention 4'],
          attributes: { attribute3: 'value3', attribute4: 'value4' }
        }
      ],
      relationships: [
        {
          id: 'rel-1',
          sourceId: 'topic-1',
          targetId: 'entity-1',
          relationshipType: 'mentions',
          strength: 7
        },
        {
          id: 'rel-2',
          sourceId: 'topic-2',
          targetId: 'entity-2',
          relationshipType: 'contains',
          strength: 5
        }
      ],
      sources: content.citations || []
    };
  }

  /**
   * Generate a summary of the content
   * @param content The content package to summarize
   * @param maxLength The maximum length of the summary
   * @returns A mock summary
   */
  async generateSummary(content: ContentPackage, maxLength = 1000): Promise<string> {
    return `This is a mock summary of the content with title "${content.metadata.title || 'Untitled'}". It is designed for testing purposes and does not reflect the actual content.`;
  }

  /**
   * Extract topics from the content
   * @param content The content package to extract topics from
   * @returns Mock topics
   */
  async extractTopics(content: ContentPackage) {
    return [
      {
        id: 'topic-1',
        name: 'Mock Topic 1',
        description: 'This is a mock topic for testing',
        importance: 8,
        relatedContent: ['Mock related content 1', 'Mock related content 2']
      },
      {
        id: 'topic-2',
        name: 'Mock Topic 2',
        description: 'This is another mock topic for testing',
        importance: 6,
        relatedContent: ['Mock related content 3', 'Mock related content 4']
      }
    ];
  }

  /**
   * Identify entities in the content
   * @param content The content package to identify entities in
   * @returns Mock entities
   */
  async identifyEntities(content: ContentPackage) {
    return [
      {
        id: 'entity-1',
        name: 'Mock Entity 1',
        type: 'person',
        mentions: ['Mock mention 1', 'Mock mention 2'],
        attributes: { attribute1: 'value1', attribute2: 'value2' }
      },
      {
        id: 'entity-2',
        name: 'Mock Entity 2',
        type: 'organization',
        mentions: ['Mock mention 3', 'Mock mention 4'],
        attributes: { attribute3: 'value3', attribute4: 'value4' }
      }
    ];
  }
}
