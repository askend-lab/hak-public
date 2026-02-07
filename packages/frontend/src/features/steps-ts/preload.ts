/**
 * Preload script - sets up import.meta.env before any other imports
 * Must be loaded first via NODE_OPTIONS
 */

interface ImportMetaEnv {
  PROD: boolean;
  DEV: boolean;
  MODE: string;
  VITE_API_BASE_URL: string;
}

interface ImportMetaWithEnv {
  env?: ImportMetaEnv;
}

// Shim import.meta.env for Vite compatibility in Node.js
const meta = import.meta as unknown as ImportMetaWithEnv;
if (typeof meta.env === "undefined") {
  meta.env = {
    PROD: false,
    DEV: true,
    MODE: "test",
    VITE_API_BASE_URL: "/api",
  };
}
