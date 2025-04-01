import { ContentPackage } from '../models/content-package.model';
import { KnowledgeGraph } from '../models/knowledge-graph.model';

/**
 * Interface for environment configuration
 */
export interface EnvironmentConfig {
  geminiApiKey: string;
  claudeApiKey: string;
  elevenLabsApiKey: string;
}

/**
 * Service for loading environment configuration
 */
export class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = {
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      claudeApiKey: process.env.CLAUDE_API_KEY || '',
      elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    };
  }

  /**
   * Get the environment configuration
   * @returns The environment configuration
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * Check if all required API keys are available
   * @returns True if all required API keys are available, false otherwise
   */
  validateConfig(): boolean {
    return (
      !!this.config.geminiApiKey &&
      !!this.config.claudeApiKey &&
      !!this.config.elevenLabsApiKey
    );
  }

  /**
   * Get the Gemini API key
   * @returns The Gemini API key
   */
  getGeminiApiKey(): string {
    return this.config.geminiApiKey;
  }

  /**
   * Get the Claude API key
   * @returns The Claude API key
   */
  getClaudeApiKey(): string {
    return this.config.claudeApiKey;
  }

  /**
   * Get the ElevenLabs API key
   * @returns The ElevenLabs API key
   */
  getElevenLabsApiKey(): string {
    return this.config.elevenLabsApiKey;
  }
}
