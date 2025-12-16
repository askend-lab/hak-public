const DEFAULT_CONFIG = {
  baseUrl: '/api',
  vabamorfUrl: '/api/analyze',
  merlinUrl: '/api/synthesize',
  cacheUrl: '/api/audio-cache',
} as const;

const EKI_CONFIG = {
  baseUrl: '/api',
  vabamorfUrl: '/api/vabamorf/analyze',
  merlinUrl: '/api/merlin/synthesize',
  cacheUrl: '/api/audio-cache',
} as const;

export const API_CONFIG = EKI_CONFIG;
