import { useSynthesisStore } from '../../features';

export const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;

export interface MockStoreState {
  text?: string;
  setText?: jest.Mock;
  isLoading?: boolean;
  phoneticText?: string;
  result?: { audioUrl: string; cached: boolean } | null;
  isPlaying?: boolean;
  setIsPlaying?: jest.Mock;
  setAudioElement?: jest.Mock;
}

const defaultMocks = {
  setText: jest.fn(),
  setIsPlaying: jest.fn(),
  setAudioElement: jest.fn(),
};

export function mockStoreWith(state: MockStoreState): void {
  mockUseSynthesisStore.mockReturnValue({
    text: state.text ?? '',
    setText: state.setText ?? defaultMocks.setText,
    isLoading: state.isLoading ?? false,
    phoneticText: state.phoneticText ?? '',
    result: state.result ?? null,
    isPlaying: state.isPlaying ?? false,
    setIsPlaying: state.setIsPlaying ?? defaultMocks.setIsPlaying,
    setAudioElement: state.setAudioElement ?? defaultMocks.setAudioElement,
  } as any);
}

export function mockEmptyStore(): void {
  mockStoreWith({});
}

export function mockStoreWithText(text: string, isLoading = false): void {
  mockStoreWith({ text, isLoading });
}

export function mockStoreWithAudio(audioUrl: string, cached: boolean, isPlaying = false): void {
  mockStoreWith({
    result: { audioUrl, cached },
    isPlaying,
  });
}

export function mockStoreWithPhonetic(phoneticText: string, text: string): void {
  mockStoreWith({ phoneticText, text });
}

export const TEST_AUDIO_URL = 'data:audio/wav;base64,test';
