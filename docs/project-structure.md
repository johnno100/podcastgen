# Podcast Generator MVP - Project Structure

## Overview

This document outlines the project structure for the Multimodal Dialogue Podcast Generation MVP using Nx, React, and Expo. The architecture follows 12factor.net principles and is designed for a Test First approach.

## Technology Stack

- **Frontend Framework**: React with Expo
- **Monorepo Management**: Nx
- **Content Ingestion**: Custom libraries (axios, cheerio, pdf-parse, ytdl-core)
- **Content Understanding**: Google Gemini API
- **Dialogue Generation**: Anthropic Claude 3 API
- **Voice Synthesis**: ElevenLabs API
- **Delivery**: Custom libraries (ffmpeg, audio-manipulator)
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Google Cloud (Cloud Run, Cloud Storage)
- **CI/CD**: GitHub Actions

## Project Structure

```
podcast-generator-mvp/
├── apps/
│   ├── web/                      # React web application
│   │   ├── src/
│   │   │   ├── app/              # Application components
│   │   │   ├── assets/           # Static assets
│   │   │   ├── environments/     # Environment configurations
│   │   │   └── main.tsx          # Entry point
│   │   ├── jest.config.js        # Jest configuration
│   │   ├── tsconfig.json         # TypeScript configuration
│   │   └── project.json          # Nx project configuration
│   └── web-e2e/                  # End-to-end tests
│       ├── src/
│       │   ├── e2e/              # E2E test specs
│       │   └── support/          # Test support files
│       ├── cypress.config.ts     # Cypress configuration
│       └── project.json          # Nx project configuration
├── libs/
│   ├── content-ingestion/        # Content Ingestion Layer
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── adapters/     # Content type adapters
│   │   │   │   │   ├── web-adapter.ts
│   │   │   │   │   ├── pdf-adapter.ts
│   │   │   │   │   ├── video-adapter.ts
│   │   │   │   │   └── text-adapter.ts
│   │   │   │   ├── models/       # Data models
│   │   │   │   ├── services/     # Services
│   │   │   │   └── utils/        # Utilities
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   ├── content-understanding/     # Content Understanding Layer
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── gemini/       # Gemini API integration
│   │   │   │   ├── models/       # Data models
│   │   │   │   ├── services/     # Services
│   │   │   │   └── utils/        # Utilities
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   ├── dialogue-generation/       # Dialogue Generation Layer
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── claude/       # Claude API integration
│   │   │   │   ├── models/       # Data models
│   │   │   │   ├── services/     # Services
│   │   │   │   └── utils/        # Utilities
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   ├── voice-synthesis/           # Voice Synthesis Layer
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── elevenlabs/   # ElevenLabs API integration
│   │   │   │   ├── models/       # Data models
│   │   │   │   ├── services/     # Services
│   │   │   │   └── utils/        # Utilities
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   ├── delivery/                  # Delivery Layer
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── formatters/   # Audio formatters
│   │   │   │   ├── storage/      # Storage services
│   │   │   │   ├── models/       # Data models
│   │   │   │   ├── services/     # Services
│   │   │   │   └── utils/        # Utilities
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   ├── shared/                    # Shared utilities and components
│   │   ├── src/
│   │   │   ├── lib/              # Core functionality
│   │   │   │   ├── components/   # Shared UI components
│   │   │   │   ├── hooks/        # Custom React hooks
│   │   │   │   ├── types/        # TypeScript types
│   │   │   │   └── utils/        # Utility functions
│   │   │   ├── index.ts          # Public API
│   │   │   └── test/             # Unit tests
│   │   ├── jest.config.js        # Jest configuration
│   │   └── project.json          # Nx project configuration
│   └── api/                       # API integration layer
│       ├── src/
│       │   ├── lib/              # Core functionality
│       │   │   ├── controllers/  # API controllers
│       │   │   ├── middleware/   # API middleware
│       │   │   ├── models/       # API models
│       │   │   └── services/     # API services
│       │   ├── index.ts          # Public API
│       │   └── test/             # Unit tests
│       ├── jest.config.js        # Jest configuration
│       └── project.json          # Nx project configuration
├── tools/                         # Development and build tools
│   ├── generators/               # Custom Nx generators
│   └── scripts/                  # Build and deployment scripts
├── .github/                       # GitHub configuration
│   └── workflows/                # GitHub Actions workflows
├── .env.example                   # Example environment variables
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore file
├── .prettierrc                    # Prettier configuration
├── jest.config.js                 # Jest configuration
├── nx.json                        # Nx configuration
├── package.json                   # Package configuration
├── tsconfig.base.json             # Base TypeScript configuration
└── README.md                      # Project documentation
```

## Layer Interfaces

### Content Ingestion Layer

```typescript
// libs/content-ingestion/src/lib/models/content-package.model.ts
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

// libs/content-ingestion/src/lib/services/content-ingestion.service.ts
export interface ContentIngestionService {
  processUrl(url: string): Promise<ContentPackage>;
  processPdf(file: File): Promise<ContentPackage>;
  processVideo(url: string): Promise<ContentPackage>;
  processText(text: string): Promise<ContentPackage>;
}
```

### Content Understanding Layer

```typescript
// libs/content-understanding/src/lib/models/knowledge-graph.model.ts
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

// libs/content-understanding/src/lib/services/content-understanding.service.ts
export interface ContentUnderstandingService {
  analyzeContent(content: ContentPackage): Promise<KnowledgeGraph>;
  generateSummary(content: ContentPackage, maxLength?: number): Promise<string>;
  extractTopics(content: ContentPackage): Promise<Topic[]>;
  identifyEntities(content: ContentPackage): Promise<Entity[]>;
}
```

### Dialogue Generation Layer

```typescript
// libs/dialogue-generation/src/lib/models/dialogue-script.model.ts
export interface SpeakerProfile {
  id: string;
  name: string;
  personality: string;
  role: string;
  voiceParams: VoiceParameters;
}

export interface DialogueTurn {
  id: string;
  speakerId: string;
  text: string;
  emotion?: string;
  pace?: number;
  pitch?: number;
  citations?: string[];
}

export interface DialogueScript {
  id: string;
  turns: DialogueTurn[];
  speakers: Record<string, SpeakerProfile>;
  title: string;
  description: string;
  estimatedDuration: number;
}

export interface DialogueParameters {
  targetDuration?: number;
  speakerIds: string[];
  style?: string;
  tonePreference?: string;
  includeHumor?: boolean;
  emphasisTopics?: string[];
}

// libs/dialogue-generation/src/lib/services/dialogue-generation.service.ts
export interface DialogueGenerationService {
  generateDialogue(knowledge: KnowledgeGraph, params: DialogueParameters): Promise<DialogueScript>;
  refineDialogue(script: DialogueScript, feedback: string): Promise<DialogueScript>;
  generateAlternatives(knowledge: KnowledgeGraph, params: DialogueParameters, count: number): Promise<DialogueScript[]>;
}
```

### Voice Synthesis Layer

```typescript
// libs/voice-synthesis/src/lib/models/audio-package.model.ts
export interface AudioClip {
  id: string;
  audioData: Blob;
  format: string;
  duration: number;
  speakerId: string;
  startTime: number;
  endTime: number;
}

export interface AudioPackage {
  id: string;
  segments: AudioClip[];
  speakerSamples: Record<string, AudioClip>;
  totalDuration: number;
  metadata: Record<string, string>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: string;
  languages: string[];
  emotionCapabilities: string[];
  sample?: AudioClip;
}

export interface VoiceParameters {
  speed?: number;
  pitch?: number;
  emotion?: string;
  emphasis?: number;
  customParams?: Record<string, string>;
}

// libs/voice-synthesis/src/lib/services/voice-synthesis.service.ts
export interface VoiceSynthesisService {
  synthesizeDialogue(script: DialogueScript): Promise<AudioPackage>;
  synthesizeTurn(turn: DialogueTurn, speaker: SpeakerProfile): Promise<AudioClip>;
  getAvailableVoices(): Promise<VoiceProfile[]>;
  createCustomVoice(name: string, samples: Blob[]): Promise<VoiceProfile>;
}
```

### Delivery Layer

```typescript
// libs/delivery/src/lib/models/podcast-package.model.ts
export interface PodcastMetadata {
  id: string;
  title: string;
  description: string;
  authors: string[];
  categories: string[];
  language: string;
  keywords: string[];
  publicationDate: Date;
}

export interface PodcastPackage {
  id: string;
  audioFile: Blob;
  metadata: PodcastMetadata;
  artwork?: Blob;
  transcript?: string;
  chapters?: { title: string; startTime: number }[];
}

// libs/delivery/src/lib/services/delivery.service.ts
export interface DeliveryService {
  createPodcast(audio: AudioPackage, metadata: PodcastMetadata): Promise<PodcastPackage>;
  publish(podcast: PodcastPackage, platform: string): Promise<string>;
  generateArtwork(metadata: PodcastMetadata): Promise<Blob>;
  generateRssFeed(podcasts: PodcastPackage[]): Promise<string>;
}
```

## 12factor.net Compliance

1. **Codebase**: One codebase tracked in Git, many deploys
   - Single monorepo managed with Nx
   - Different environments for development, staging, and production

2. **Dependencies**: Explicitly declare and isolate dependencies
   - All dependencies declared in package.json
   - Nx manages workspace dependencies

3. **Config**: Store config in the environment
   - Environment variables for all configuration
   - .env.example provided as a template

4. **Backing services**: Treat backing services as attached resources
   - External APIs (Gemini, Claude, ElevenLabs) accessed via environment variables
   - Google Cloud services accessed via environment variables

5. **Build, release, run**: Strictly separate build and run stages
   - Nx build process creates artifacts
   - GitHub Actions for CI/CD pipeline
   - Deployment to Google Cloud Run

6. **Processes**: Execute the app as one or more stateless processes
   - Stateless React application
   - State managed through APIs and cloud storage

7. **Port binding**: Export services via port binding
   - Web application binds to port provided by environment
   - API services bind to assigned ports

8. **Concurrency**: Scale out via the process model
   - Horizontal scaling through Google Cloud Run

9. **Disposability**: Maximize robustness with fast startup and graceful shutdown
   - Fast startup React application
   - Proper cleanup on component unmount

10. **Dev/prod parity**: Keep development, staging, and production as similar as possible
    - Same dependencies across environments
    - Environment-specific configuration via environment variables

11. **Logs**: Treat logs as event streams
    - Centralized logging through Google Cloud Logging
    - Structured logging format

12. **Admin processes**: Run admin/management tasks as one-off processes
    - Admin tasks implemented as separate scripts
    - Nx commands for various tasks

## Testing Strategy

Following the Test First approach, we will implement:

1. **Unit Tests**:
   - Test individual functions and components
   - Mock external dependencies
   - Located alongside the code they test

2. **Integration Tests**:
   - Test interaction between different layers
   - Test API integrations with mocked responses
   - Located in dedicated test directories

3. **End-to-End Tests**:
   - Test complete user flows
   - Located in the web-e2e application
   - Use Cypress for browser testing

4. **API Tests**:
   - Test API endpoints
   - Validate request/response formats
   - Located in the api library

## Deployment Strategy

The MVP will be deployed to Google Cloud using:

1. **Google Cloud Run**: For hosting the web application
2. **Google Cloud Storage**: For storing audio files and assets
3. **Google Cloud Build**: For CI/CD integration
4. **Google Cloud Logging**: For centralized logging
5. **Google Cloud Secret Manager**: For managing API keys and secrets

## Next Steps

1. Initialize the Nx workspace
2. Set up the basic project structure
3. Implement the core interfaces for each layer
4. Set up testing infrastructure
5. Implement each layer following the Test First approach
6. Integrate the layers into a complete pipeline
7. Develop the user interface
8. Set up CI/CD and deployment
