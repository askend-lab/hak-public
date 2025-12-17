// Mock localStorage BEFORE any imports
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i) => Object.keys(store)[i] || null,
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

require('@testing-library/jest-dom');

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
