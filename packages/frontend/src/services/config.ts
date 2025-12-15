export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  vabamorfUrl: import.meta.env.VITE_VABAMORF_URL || '/api/analyze',
  merlinUrl: import.meta.env.VITE_MERLIN_URL || '/api/synthesize',
  cacheUrl: import.meta.env.VITE_CACHE_URL || '/api/audio-cache',
} as const;
