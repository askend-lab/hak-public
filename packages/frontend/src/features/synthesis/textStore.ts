import { create } from 'zustand';

interface SynthesisTextState {
  text: string;
  phoneticText: string;
}

interface SynthesisTextActions {
  setText: (text: string) => void;
  setPhoneticText: (phoneticText: string) => void;
  resetText: () => void;
}

const initialState: SynthesisTextState = {
  text: '',
  phoneticText: '',
};

export const useSynthesisTextStore = create<SynthesisTextState & SynthesisTextActions>(
  (set) => ({
    ...initialState,
    setText: (text): void => { set({ text }); },
    setPhoneticText: (phoneticText): void => { set({ phoneticText }); },
    resetText: (): void => { set(initialState); },
  })
);
