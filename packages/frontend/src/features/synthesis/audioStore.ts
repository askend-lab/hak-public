import { create } from 'zustand';
import type { SynthesisResult } from '../../services/audio';

interface SynthesisAudioState {
  result: SynthesisResult | null;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

interface SynthesisAudioActions {
  setResult: (result: SynthesisResult | null) => void;
  setAudioElement: (audio: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  resetAudio: () => void;
}

const initialState: SynthesisAudioState = {
  result: null,
  audioElement: null,
  isPlaying: false,
};

export const useSynthesisAudioStore = create<SynthesisAudioState & SynthesisAudioActions>(
  (set) => ({
    ...initialState,
    setResult: (result) => set({ result }),
    setAudioElement: (audioElement) => set({ audioElement }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    resetAudio: () => set(initialState),
  })
);
