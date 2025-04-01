import { KnowledgeGraph, Topic, Entity } from '../models/knowledge-graph.model';

export interface Speaker {
  id: string;
  name: string;
  personality: string;
  expertise: string[];
  perspective: string;
}

export interface DialogueTurn {
  speakerId: string;
  speakerName: string;
  text: string;
  emotion?: string;
  references?: string[];
}

export interface PodcastScript {
  id: string;
  title: string;
  description: string;
  speakers: Speaker[];
  introduction: string;
  dialogue: DialogueTurn[];
  conclusion: string;
  sourceKnowledgeGraphId: string;
  metadata: Record<string, any>;
}

export interface DialogueGenerationService {
  generatePodcastScript(knowledgeGraph: KnowledgeGraph, options?: DialogueGenerationOptions): Promise<PodcastScript>;
  generateSpeakers(knowledgeGraph: KnowledgeGraph, count?: number): Promise<Speaker[]>;
  generateIntroduction(knowledgeGraph: KnowledgeGraph, speakers: Speaker[]): Promise<string>;
  generateDialogue(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], turnCount?: number): Promise<DialogueTurn[]>;
  generateConclusion(knowledgeGraph: KnowledgeGraph, speakers: Speaker[], dialogue: DialogueTurn[]): Promise<string>;
}

export interface DialogueGenerationOptions {
  speakerCount?: number;
  turnCount?: number;
  maxScriptLength?: number;
  toneStyle?: 'formal' | 'casual' | 'educational' | 'entertaining' | 'debate';
  focusTopics?: string[];
  includeIntroduction?: boolean;
  includeConclusion?: boolean;
  speakerPersonalities?: string[];
}
