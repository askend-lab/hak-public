import { create } from 'zustand';

import type { SynthesisResult } from '../../services/audio';

interface SynthesisState {
  text: string;
  phoneticText: string;
  isLoading: boolean;
  error: string | null;
  result: SynthesisResult | null;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  sentences: string[];
}

interface SynthesisActions {
  setText: (text: string) => void;
  setPhoneticText: (phoneticText: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: SynthesisResult | null) => void;
  setAudioElement: (audio: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSentences: (sentences: string[]) => void;
  reset: () => void;
}

const initialState: SynthesisState = {
  text: '',
  phoneticText: '',
  isLoading: false,
  error: null,
  result: null,
  audioElement: null,
  isPlaying: false,
  sentences: [],
};

export const useSynthesisStore = create<SynthesisState & SynthesisActions>((set) => ({
  ...initialState,
  setText: (text): void => { set({ text }); },
  setPhoneticText: (phoneticText): void => { set({ phoneticText }); },
  setLoading: (isLoading): void => { set({ isLoading }); },
  setError: (error): void => { set({ error }); },
  setResult: (result): void => { set({ result, phoneticText: result?.phoneticText ?? '' }); },
  setAudioElement: (audioElement): void => { set({ audioElement }); },
  setIsPlaying: (isPlaying): void => { set({ isPlaying }); },
  setSentences: (sentences): void => { set({ sentences }); },
  reset: (): void => { set(initialState); },
}));
