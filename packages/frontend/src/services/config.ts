const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

// In development, Vite's proxy will handle these relative URLs.
// In production, the build should be configured with absolute URLs
// via environment variables (e.g., in a .env.production file).
const DEV_CONFIG = {
  baseUrl: '/api',
  vabamorfUrl: '/api/vabamorf/analyze',
  merlinUrl: '/api/merlin/synthesize',
  cacheUrl: '/api/audio-cache',
  audioApiUrl: '/api/audio/generate',
  audioBucketUrl: 'https://hak-audio-dev.s3.eu-west-1.amazonaws.com',
} as const;

const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] as string | undefined;
  }
  return undefined;
};

const PROD_CONFIG = {
  baseUrl: getEnvVar('VITE_API_BASE_URL') ?? 'https://hak-api-dev.askend-lab.com/api',
  vabamorfUrl: getEnvVar('VITE_VABAMORF_URL') ?? 'https://ibgaeez4mm.eu-west-1.awsapprunner.com/analyze',
  merlinUrl: getEnvVar('VITE_MERLIN_URL') ?? 'https://swq24fqfiu.eu-west-1.awsapprunner.com/synthesize',
  cacheUrl: `${getEnvVar('VITE_API_BASE_URL') ?? 'https://hak-api-dev.askend-lab.com/api'}/audio-cache`,
  audioApiUrl: getEnvVar('VITE_AUDIO_API_URL') ?? 'https://hak-api-dev.askend-lab.com/api/audio/generate',
  audioBucketUrl: getEnvVar('VITE_AUDIO_BUCKET_URL') ?? 'https://hak-audio-dev.s3.eu-west-1.amazonaws.com',
} as const;

export const API_CONFIG = isProd ? PROD_CONFIG : DEV_CONFIG;
