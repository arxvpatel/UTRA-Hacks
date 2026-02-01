export type PartCategory = 'motion' | 'sensors' | 'power' | 'control' | 'structure' | 'communication';

export interface RobotPart {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: PartCategory;
  relatedTo?: string[];
  functionalRole?: string;
}

export interface GeminiResponse {
  partIds: string[];
  confidence: number;
  reasoning: string;
}

export interface VoiceProcessResponse {
  transcription: string;
  matchedParts: RobotPart[];
  confidence: number;
  reasoning: string;
}

export interface ApiStatus {
  demoMode: boolean;
  elevenlabsConfigured: boolean;
  geminiConfigured: boolean;
}
