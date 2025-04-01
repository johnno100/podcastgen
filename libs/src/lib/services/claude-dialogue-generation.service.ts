import { KnowledgeGraph } from '../models/knowledge-graph.model';
import { DialogueGenerationService, PodcastScript, Speaker, DialogueTurn, DialogueGenerationOptions } from '../models/dialogue.model';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeDialogueGenerationService implements DialogueGenerationService {
  private anthropic: Anthropic;
  private model = 'claude-3-opus-20240229';
  private maxRetries = 3;
  private initialBackoffMs = 1000;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Generate a complete podcast script from a knowledge graph
   * @param knowledgeGraph The knowledge graph to generate a podcast script from
   * @param options Options for dialogue generation
   * @returns A complete podcast script
   */
  async generatePodcastScript(
    knowledgeGraph: KnowledgeGraph,
    options: DialogueGenerationOptions = {}
  ): Promise<PodcastScript> {
    try {
      // Set default options
      const speakerCount = options.speakerCount || 2;
      const turnCount = options.turnCount || 15;
      const includeIntroduction = options.includeIntroduction !== false;
      const includeConclusion = options.includeConclusion !== false;

      // Generate speakers
      const speakers = await this.generateSpeakers(knowledgeGraph, speakerCount);

      // Generate introduction if requested
      const introduction = includeIntroduction
        ? await this.generateIntroduction(knowledgeGraph, speakers)
        : '';

      // Generate dialogue
      const dialogue = await this.generateDialogue(knowledgeGraph, speakers, turnCount);

      // Generate conclusion if requested
      const conclusion = includeConclusion
        ? await this.generateConclusion(knowledgeGraph, speakers, dialogue)
        : '';

      // Create podcast script
      return {
        id: `podcast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: this.generateTitle(knowledgeGraph),
        description: this.generateDescription(knowledgeGraph),
        speakers,
        introduction,
        dialogue,
        conclusion,
        sourceKnowledgeGraphId: knowledgeGraph.id,
        metadata: {
          topicCount: knowledgeGraph.topics.length,
          entityCount: knowledgeGraph.entities.length,
          speakerCount,
          turnCount: dialogue.length,
          generatedAt: new Date().toISOString(),
          options
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate podcast script: ${error.message}`);
    }
  }

  /**
   * Generate speakers for the podcast
   * @param knowledgeGraph The knowledge graph to generate speakers from
   * @param count The number of speakers to generate
   * @returns An array of speakers
   */
  async generateSpeakers(knowledgeGraph: KnowledgeGraph, count = 2): Promise<Speaker[]> {
    try {
      const prompt = this.createSpeakersPrompt(knowledgeGraph, count);
      
      const result = await this.executeWithRetry(() =>
        this.anthropic.messages.create({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.7,
          system: "You are an expert podcast producer who creates engaging, diverse speakers for podcast discussions.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      );
      
      const responseText = result.content[0].text;
      return this.parseSpeakersResponse(responseText, count);
    } catch (error) {
      throw new Error(`Failed to generate speakers: ${error.message}`);
    }
  }

  /**
   * Generate an introduction for the podcast
   * @param knowledgeGraph The knowledge graph to generate an introduction from
   * @param speakers The speakers participating in the podcast
   * @returns An introduction text
   */
  async generateIntroduction(knowledgeGraph: KnowledgeGraph, speakers: Speaker[]): Promise<string> {
    try {
      const prompt = this.createIntroductionPrompt(knowledgeGraph, speakers);
      
      const result = await this.executeWithRetry(() =>
        this.anthropic.messages.create({
          model: this.model,
          max_tokens: 1000,
          temperature: 0.7,
          system: "You are an expert podcast host who creates engaging introductions that set the stage for interesting discussions.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      );
      
      return result.content[0].text.trim();
    } catch (error) {
      throw new Error(`Failed to generate introduction: ${error.message}`);
    }
  }

  /**
   * Generate dialogue for the podcast
   * @param knowledgeGraph The knowledge graph to generate dialogue from
   * @param speakers The speakers participating in the podcast
   * @param turnCount The number of dialogue turns to generate
   * @returns An array of dialogue turns
   */
  async generateDialogue(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], turnCount = 15): Promise<DialogueTurn[]> {
    try {
      const prompt = this.createDialoguePrompt(knowledgeGraph, speakers, turnCount);
      
      const result = await this.executeWithRetry(() =>
        this.anthropic.messages.create({
          model: this.model,
          max_tokens: 4000,
          temperature: 0.8,
          system: "You are an expert podcast dialogue writer who creates engaging, informative, and natural-sounding conversations between multiple speakers.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      );
      
      const responseText = result.content[0].text;
      return this.parseDialogueResponse(responseText, speakers);
    } catch (error) {
      throw new Error(`Failed to generate dialogue: ${error.message}`);
    }
  }

  /**
   * Generate a conclusion for the podcast
   * @param knowledgeGraph The knowledge graph to generate a conclusion from
   * @param speakers The speakers participating in the podcast
   * @param dialogue The dialogue turns in the podcast
   * @returns A conclusion text
   */
  async generateConclusion(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], dialogue: DialogueTurn[]): Promise<string> {
    try {
      const prompt = this.createConclusionPrompt(knowledgeGraph, speakers, dialogue);
      
      const result = await this.executeWithRetry(() =>
        this.anthropic.messages.create({
          model: this.model,
          max_tokens: 1000,
          temperature: 0.7,
          system: "You are an expert podcast host who creates satisfying conclusions that summarize key points and leave the audience with final thoughts.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      );
      
      return result.content[0].text.trim();
    } catch (error) {
      throw new Error(`Failed to generate conclusion: ${error.message}`);
    }
  }

  /**
   * Generate a title for the podcast
   * @param knowledgeGraph The knowledge graph to generate a title from
   * @returns A title for the podcast
   */
  private generateTitle(knowledgeGraph: KnowledgeGraph): string {
    // Extract the most important topics
    const importantTopics = [...knowledgeGraph.topics]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 2);
    
    if (importantTopics.length > 0) {
      return `Exploring ${importantTopics[0].name}${importantTopics.length > 1 ? ` and ${importantTopics[1].name}` : ''}`;
    } else {
      return 'Podcast Discussion';
    }
  }

  /**
   * Generate a description for the podcast
   * @param knowledgeGraph The knowledge graph to generate a description from
   * @returns A description for the podcast
   */
  private generateDescription(knowledgeGraph: KnowledgeGraph): string {
    // Extract the most important topics
    const importantTopics = [...knowledgeGraph.topics]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    
    if (importantTopics.length > 0) {
      const topicNames = importantTopics.map(topic => topic.name).join(', ');
      const mainTopic = importantTopics[0];
      
      return `A thought-provoking discussion exploring ${topicNames}. ${mainTopic.description}`;
    } else {
      return 'An engaging podcast discussion on various topics.';
    }
  }

  /**
   * Create a prompt for generating speakers
   * @param knowledgeGraph The knowledge graph to generate speakers from
   * @param count The number of speakers to generate
   * @returns A prompt string
   */
  private createSpeakersPrompt(knowledgeGraph: KnowledgeGraph, count: number): string {
    const topicsJson = JSON.stringify(knowledgeGraph.topics, null, 2);
    const entitiesJson = JSON.stringify(knowledgeGraph.entities, null, 2);
    
    return `
Create ${count} distinct speakers for a podcast discussion on the following topics and entities.

TOPICS:
${topicsJson}

ENTITIES:
${entitiesJson}

For each speaker, provide:
1. A name
2. A brief personality description
3. Areas of expertise (2-3 areas)
4. A unique perspective or viewpoint they bring to the discussion

The speakers should have diverse backgrounds, expertise, and perspectives to create an engaging discussion.
They should be qualified to discuss the topics but have different angles or approaches.

Format your response as a JSON array of speaker objects with the following structure:
[
  {
    "id": "speaker-1",
    "name": "Speaker Name",
    "personality": "Brief personality description",
    "expertise": ["Area of expertise 1", "Area of expertise 2"],
    "perspective": "Unique perspective or viewpoint"
  },
  ...
]

Create exactly ${count} speakers with complementary but different perspectives.
`;
  }

  /**
   * Create a prompt for generating an introduction
   * @param knowledgeGraph The knowledge graph to generate an introduction from
   * @param speakers The speakers participating in the podcast
   * @returns A prompt string
   */
  private createIntroductionPrompt(knowledgeGraph: KnowledgeGraph, speakers: Speaker[]): string {
    const topicsJson = JSON.stringify(knowledgeGraph.topics.slice(0, 5), null, 2);
    const speakersJson = JSON.stringify(speakers, null, 2);
    
    return `
Create an engaging introduction for a podcast discussion on the following topics with the specified speakers.

TOPICS:
${topicsJson}

SPEAKERS:
${speakersJson}

The introduction should:
1. Welcome the audience to the podcast
2. Briefly introduce the main topics of discussion
3. Introduce each speaker with their name and relevant background
4. Set the stage for the conversation that will follow

The introduction should be conversational, engaging, and around 150-250 words.
Do not format this as a dialogue with speaker names - this is a narrator introduction.
`;
  }

  /**
   * Create a prompt for generating dialogue
   * @param knowledgeGraph The knowledge graph to generate dialogue from
   * @param speakers The speakers participating in the podcast
   * @param turnCount The number of dialogue turns to generate
   * @returns A prompt string
   */
  private createDialoguePrompt(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], turnCount: number): string {
    const topicsJson = JSON.stringify(knowledgeGraph.topics, null, 2);
    const entitiesJson = JSON.stringify(knowledgeGraph.entities.slice(0, 10), null, 2);
    const relationshipsJson = JSON.stringify(knowledgeGraph.relationships.slice(0, 15), null, 2);
    const speakersJson = JSON.stringify(speakers, null, 2);
    
    return `
Create a natural, engaging podcast dialogue between the following speakers discussing the provided topics, entities, and their relationships.

SPEAKERS:
${speakersJson}

TOPICS:
${topicsJson}

ENTITIES:
${entitiesJson}

RELATIONSHIPS:
${relationshipsJson}

Guidelines for the dialogue:
1. Create approximately ${turnCount} dialogue turns total
2. Each speaker should speak in their own distinct voice and perspective
3. The conversation should flow naturally with speakers building on each other's points
4. Include moments of agreement, disagreement, questions, and clarifications
5. Cover the most important topics and entities, focusing on those with higher importance scores
6. Ensure the dialogue is informative, engaging, and conversational
7. Speakers should reference specific facts or examples related to the topics
8. Include some emotional reactions or expressions where appropriate

Format the dialogue as a JSON array of dialogue turn objects with the following structure:
[
  {
    "speakerId": "speaker-1",
    "speakerName": "Speaker Name",
    "text": "What the speaker says in this turn",
    "emotion": "Optional emotion or tone for this line",
    "references": ["Optional array of references to topics or entities mentioned"]
  },
  ...
]

Create a natural conversation that flows logically from topic to topic while maintaining each speaker's unique perspective and expertise.
`;
  }

  /**
   * Create a prompt for generating a conclusion
   * @param knowledgeGraph The knowledge graph to generate a conclusion from
   * @param speakers The speakers participating in the podcast
   * @param dialogue The dialogue turns in the podcast
   * @returns A prompt string
   */
  private createConclusionPrompt(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], dialogue: DialogueTurn[]): string {
    const speakersJson = JSON.stringify(speakers, null, 2);
    
    // Extract a sample of dialogue turns to provide context
    const dialogueSample = dialogue.slice(-5).map(turn => `${turn.speakerName}: ${turn.text}`).join('\n\n');
    
    // Extract main topics discussed
    const topicNames = knowledgeGraph.topics
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map(topic => topic.name)
      .join(', ');
    
    return `
Create a satisfying conclusion for a podcast discussion between the following speakers who have been discussing ${topicNames}.

SPEAKERS:
${speakersJson}

RECENT DIALOGUE:
${dialogueSample}

The conclusion should:
1. Summarize the key points discussed
2. Highlight any areas of agreement or disagreement
3. Provide final thoughts from each speaker
4. Thank the audience for listening
5. Optionally include a brief teaser for future discussions

The conclusion should be conversational, provide closure, and be around 150-250 words.
Do not format this as a dialogue with speaker names - this is a narrator conclusion.
`;
  }

  /**
   * Parse the response from the speakers prompt
   * @param responseText The response text from the model
   * @param expectedCount The expected number of speakers
   * @returns An array of speakers
   */
  private parseSpeakersResponse(responseText: string, expectedCount: number): Speaker[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const speakers = JSON.parse(jsonMatch[0]) as Speaker[];
      
      // Validate and clean up speakers
      const validatedSpeakers = speakers.map((speaker, index) => ({
        id: speaker.id || `speaker-${index + 1}`,
        name: speaker.name || `Speaker ${index + 1}`,
        personality: speaker.personality || 'Thoughtful and articulate',
        expertise: Array.isArray(speaker.expertise) ? speaker.expertise : ['General knowledge'],
        perspective: speaker.perspective || 'Balanced viewpoint'
      }));
      
      // If we don't have enough speakers, add generic ones
      while (validatedSpeakers.length < expectedCount) {
        const index = validatedSpeakers.length;
        validatedSpeakers.push({
          id: `speaker-${index + 1}`,
          name: `Speaker ${index + 1}`,
          personality: 'Thoughtful and articulate',
          expertise: ['General knowledge'],
          perspective: 'Balanced viewpoint'
        });
      }
      
      // If we have too many speakers, trim the list
      return validatedSpeakers.slice(0, expectedCount);
    } catch (error) {
      console.error('Failed to parse speakers response:', error);
      
      // Return generic speakers as fallback
      return Array.from({ length: expectedCount }, (_, i) => ({
        id: `speaker-${i + 1}`,
        name: `Speaker ${i + 1}`,
        personality: 'Thoughtful and articulate',
        expertise: ['General knowledge'],
        perspective: 'Balanced viewpoint'
      }));
    }
  }

  /**
   * Parse the response from the dialogue prompt
   * @param responseText The response text from the model
   * @param speakers The speakers participating in the podcast
   * @returns An array of dialogue turns
   */
  private parseDialogueResponse(responseText: string, speakers: Speaker[]): DialogueTurn[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const dialogue = JSON.parse(jsonMatch[0]) as DialogueTurn[];
      
      // Create a map of speaker IDs to names for validation
      const speakerMap = new Map(speakers.map(s => [s.id, s.name]));
      
      // Validate and clean up dialogue turns
      return dialogue.map((turn, index) => {
        // If speakerId is invalid, assign to a valid speaker
        if (!speakerMap.has(turn.speakerId)) {
          const validSpeakerId = speakers[index % speakers.length].id;
          turn.speakerId = validSpeakerId;
          turn.speakerName = speakerMap.get(validSpeakerId) || 'Unknown Speaker';
        }
        
        // If speakerName is missing or doesn't match the ID, correct it
        if (!turn.speakerName || turn.speakerName !== speakerMap.get(turn.speakerId)) {
          turn.speakerName = speakerMap.get(turn.speakerId) || 'Unknown Speaker';
        }
        
        return {
          speakerId: turn.speakerId,
          speakerName: turn.speakerName,
          text: turn.text || 'I agree with what was said.',
          emotion: turn.emotion,
          references: Array.isArray(turn.references) ? turn.references : undefined
        };
      });
    } catch (error) {
      console.error('Failed to parse dialogue response:', error);
      
      // Return generic dialogue as fallback
      return speakers.flatMap(speaker => [
        {
          speakerId: speaker.id,
          speakerName: speaker.name,
          text: `As someone with expertise in ${speaker.expertise.join(', ')}, I find this topic fascinating.`
        },
        {
          speakerId: speaker.id,
          speakerName: speaker.name,
          text: `From my perspective as ${speaker.personality}, I think there's a lot to explore here.`
        }
      ]);
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
