import { PodcastScript, DialogueTurn, Speaker } from '../models/dialogue.model';

/**
 * Mock implementation of the dialogue generation service for testing
 */
export class MockDialogueGenerationService {
  /**
   * Generate a mock podcast script
   * @returns A mock podcast script
   */
  async generatePodcastScript(): Promise<PodcastScript> {
    const speakers = this.generateMockSpeakers();
    const dialogue = this.generateMockDialogue(speakers);
    
    return {
      id: `mock-podcast-${Date.now()}`,
      title: 'Understanding Modern Technology Trends',
      description: 'A fascinating discussion about AI, cloud computing, and their impact on society.',
      speakers,
      introduction: this.generateMockIntroduction(),
      dialogue,
      conclusion: this.generateMockConclusion(),
      sourceKnowledgeGraphId: 'mock-kg-123',
      metadata: {
        topicCount: 3,
        entityCount: 5,
        speakerCount: speakers.length,
        turnCount: dialogue.length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate mock speakers
   * @returns An array of mock speakers
   */
  private generateMockSpeakers(): Speaker[] {
    return [
      {
        id: 'speaker-1',
        name: 'Dr. Sarah Chen',
        personality: 'Analytical and thoughtful',
        expertise: ['Artificial Intelligence', 'Machine Learning', 'Ethics'],
        perspective: 'Balanced view of technology with focus on ethical implications'
      },
      {
        id: 'speaker-2',
        name: 'Marcus Johnson',
        personality: 'Enthusiastic and forward-thinking',
        expertise: ['Cloud Computing', 'Digital Transformation', 'Startups'],
        perspective: 'Technology optimist who sees innovation as key to solving problems'
      },
      {
        id: 'speaker-3',
        name: 'Amara Okafor',
        personality: 'Pragmatic and user-focused',
        expertise: ['User Experience', 'Digital Inclusion', 'Technology Policy'],
        perspective: 'Advocate for accessible technology that serves diverse populations'
      }
    ];
  }

  /**
   * Generate a mock introduction
   * @returns A mock introduction
   */
  private generateMockIntroduction(): string {
    return `Welcome to today's discussion on modern technology trends. We're exploring the fascinating intersection of artificial intelligence, cloud computing, and their impact on society. Joining us today are Dr. Sarah Chen, an AI researcher with a focus on ethics; Marcus Johnson, a cloud computing expert and technology optimist; and Amara Okafor, who specializes in user experience and digital inclusion. Together, they'll share insights on where technology is headed and what it means for all of us.`;
  }

  /**
   * Generate mock dialogue
   * @param speakers The speakers to generate dialogue for
   * @returns An array of mock dialogue turns
   */
  private generateMockDialogue(speakers: Speaker[]): DialogueTurn[] {
    return [
      {
        speakerId: speakers[0].id,
        speakerName: speakers[0].name,
        text: "I think we need to start by acknowledging how rapidly AI has evolved in the past few years. The capabilities we're seeing today were considered science fiction just a decade ago.",
        emotion: "thoughtful",
        references: ["Artificial Intelligence evolution"]
      },
      {
        speakerId: speakers[1].id,
        speakerName: speakers[1].name,
        text: "Absolutely, Sarah. And what's exciting is how cloud computing has democratized access to these AI capabilities. Companies of all sizes can now leverage powerful AI without massive infrastructure investments.",
        emotion: "enthusiastic",
        references: ["Cloud Computing", "AI accessibility"]
      },
      {
        speakerId: speakers[2].id,
        speakerName: speakers[2].name,
        text: "That's true, but I'm concerned about who gets left behind. There's still a significant digital divide, and as these technologies advance, we risk widening inequality if we don't actively work to make them accessible.",
        emotion: "concerned",
        references: ["Digital divide", "Technology accessibility"]
      },
      {
        speakerId: speakers[0].id,
        speakerName: speakers[0].name,
        text: "Amara raises an important point. The ethical implications of AI deployment are substantial. We're seeing issues with bias in AI systems that can reinforce existing social inequalities.",
        emotion: "serious",
        references: ["AI ethics", "Algorithmic bias"]
      },
      {
        speakerId: speakers[1].id,
        speakerName: speakers[1].name,
        text: "I don't disagree, but I also see tremendous potential for these technologies to solve previously intractable problems. Look at how AI is being used in healthcare to improve diagnostics and treatment planning.",
        emotion: "optimistic",
        references: ["AI in healthcare", "Technology benefits"]
      }
    ];
  }

  /**
   * Generate a mock conclusion
   * @returns A mock conclusion
   */
  private generateMockConclusion(): string {
    return `As we wrap up today's discussion, it's clear that modern technology trends like AI and cloud computing offer both tremendous opportunities and significant challenges. Our speakers have highlighted the importance of ethical considerations, accessibility, and the potential for positive impact across various sectors. While there are valid concerns about the digital divide and algorithmic bias, there's also reason for optimism about how these technologies can help solve complex problems. Thank you for joining us for this thought-provoking conversation.`;
  }
}
