import { PodcastScript, DialogueTurn } from '../models/dialogue.model';

export interface VoiceOptions {
  stability: number;
  similarityBoost: number;
  style: number;
  speakerBoost: number;
}

export interface Voice {
  id: string;
  name: string;
  category: string;
  description?: string;
  previewUrl?: string;
  defaultVoiceOptions?: VoiceOptions;
}

export interface SpeakerVoiceMapping {
  speakerId: string;
  voiceId: string;
  voiceOptions?: VoiceOptions;
}

export interface AudioSegment {
  id: string;
  speakerId: string;
  voiceId: string;
  text: string;
  audioData: ArrayBuffer;
  duration: number;
  startTime: number;
  endTime: number;
}

export interface PodcastAudio {
  id: string;
  scriptId: string;
  segments: AudioSegment[];
  fullAudio?: ArrayBuffer;
  totalDuration: number;
  format: 'mp3' | 'wav' | 'ogg';
  metadata: Record<string, any>;
}

export interface VoiceSynthesisService {
  getAvailableVoices(): Promise<Voice[]>;
  synthesizeSpeech(text: string, voiceId: string, options?: VoiceOptions): Promise<ArrayBuffer>;
  synthesizePodcast(script: PodcastScript, speakerVoiceMappings: SpeakerVoiceMapping[]): Promise<PodcastAudio>;
  synthesizeDialogueTurn(turn: DialogueTurn, voiceId: string, options?: VoiceOptions): Promise<AudioSegment>;
  combineAudioSegments(segments: AudioSegment[]): Promise<ArrayBuffer>;
}
