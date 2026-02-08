import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;

global.TextDecoder = TextDecoder;

// Mock import.meta.env for Vite compatibility
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        PROD: false,
        DEV: true,
        MODE: "test",
        BASE_URL: "/",
      },
    },
  },
});
