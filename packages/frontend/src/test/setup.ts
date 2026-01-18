import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock localStorage with actual storage
const createLocalStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string): void => { store[key] = value; }),
    removeItem: vi.fn((key: string): void => { delete store[key]; }),
    clear: vi.fn((): void => { store = {}; }),
    get length(): number { return Object.keys(store).length; },
    key: vi.fn((i: number): string | null => Object.keys(store)[i] ?? null),
  };
};
const localStorageMock = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Audio
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
