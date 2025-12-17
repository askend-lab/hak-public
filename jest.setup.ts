require('@testing-library/jest-dom');

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
