import { create } from 'zustand';
import type { RobotState, RobotActions, RobotPart, ApiStatus } from '../types/robot';

export const useRobotStore = create<RobotState & RobotActions>((set) => ({
  highlightedParts: [],
  selectedPart: null,
  isLoading: false,
  lastTranscription: null,
  error: null,
  parts: [],
  apiStatus: null,
  explodeStrength: 25,
  showGround: false,
  groundY: -0.15,
  cameraMode: 'third',

  highlightParts: (partIds: string[]) => set({ highlightedParts: partIds, error: null }),
  clearHighlights: () => set({ highlightedParts: [], selectedPart: null }),
  selectPart: (partId: string | null) => set({ selectedPart: partId }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setTranscription: (text: string | null) => set({ lastTranscription: text }),
  setError: (error: string | null) => set({ error }),
  setParts: (parts: RobotPart[]) => set({ parts }),
  setApiStatus: (status: ApiStatus) => set({ apiStatus: status }),
  setExplodeStrength: (strength: number) => set({ explodeStrength: strength }),
  toggleGround: () => set((state) => ({ showGround: !state.showGround })),
  setGroundY: (y: number) => set({ groundY: y }),
  toggleCameraMode: () =>
    set((state) => ({ cameraMode: state.cameraMode === 'third' ? 'first' : 'third' })),
}));
