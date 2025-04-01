import { PodcastAudio } from '../models/voice-synthesis.model';

export interface PodcastDeliveryFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
}

export interface PodcastDeliveryOptions {
  format: PodcastDeliveryFormat;
  includeTranscript: boolean;
  includeSpeakerLabels: boolean;
  includeChapters: boolean;
  includeMetadata: boolean;
}

export interface PodcastPackage {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  transcriptUrl?: string;
  imageUrl?: string;
  duration: number;
  format: string;
  size: number;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface DeliveryService {
  getAvailableFormats(): PodcastDeliveryFormat[];
  packagePodcast(audio: PodcastAudio, options: PodcastDeliveryOptions): Promise<PodcastPackage>;
  savePodcast(packagedPodcast: PodcastPackage): Promise<string>;
  generateShareableLink(packagedPodcast: PodcastPackage): Promise<string>;
  generateRssFeed(podcasts: PodcastPackage[]): Promise<string>;
  generateTranscript(audio: PodcastAudio): Promise<string>;
}
