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
}

interface SynthesisActions {
  setText: (text: string) => void;
  setPhoneticText: (phoneticText: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: SynthesisResult | null) => void;
  setAudioElement: (audio: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
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
};

export const useSynthesisStore = create<SynthesisState & SynthesisActions>((set) => ({
  ...initialState,
  setText: (text) => { set({ text }); },
  setPhoneticText: (phoneticText) => { set({ phoneticText }); },
  setLoading: (isLoading) => { set({ isLoading }); },
  setError: (error) => { set({ error }); },
  setResult: (result) => { set({ result, phoneticText: result?.phoneticText ?? '' }); },
  setAudioElement: (audioElement) => { set({ audioElement }); },
  setIsPlaying: (isPlaying) => { set({ isPlaying }); },
  reset: () => { set(initialState); },
}));
