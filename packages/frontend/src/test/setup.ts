import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Make vi available globally for jest.fn() compatibility
globalThis.jest = vi as unknown as typeof jest;

// Mock HTMLAudioElement for jsdom
class MockAudio {
  src = '';
  currentTime = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor(src?: string) {
    if (src) this.src = src;
  }
  
  play(): Promise<void> {
    return Promise.resolve();
  }
  
  pause(): void {}
}

global.Audio = MockAudio as unknown as typeof Audio;
