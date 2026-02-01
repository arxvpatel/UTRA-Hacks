export type PartCategory = 'motion' | 'sensors' | 'power' | 'control' | 'structure' | 'communication';

export interface RobotPart {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: PartCategory;
}

export interface ProcessedVoiceResponse {
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

export interface RobotState {
  highlightedParts: string[];
  selectedPart: string | null;
  isLoading: boolean;
  lastTranscription: string | null;
  error: string | null;
  parts: RobotPart[];
  apiStatus: ApiStatus | null;
  explodeStrength: number;
  showGround: boolean;
  groundY: number;
  cameraMode: 'third' | 'first';
}

export interface RobotActions {
  highlightParts: (partIds: string[]) => void;
  clearHighlights: () => void;
  selectPart: (partId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setTranscription: (text: string | null) => void;
  setError: (error: string | null) => void;
  setParts: (parts: RobotPart[]) => void;
  setApiStatus: (status: ApiStatus) => void;
  setExplodeStrength: (strength: number) => void;
  toggleGround: () => void;
  setGroundY: (y: number) => void;
  toggleCameraMode: () => void;
}
