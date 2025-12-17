const isProd = import.meta.env.PROD;

// In development, Vite's proxy will handle these relative URLs.
// In production, the build should be configured with absolute URLs
// via environment variables (e.g., in a .env.production file).
const DEV_CONFIG = {
  baseUrl: '/api',
  vabamorfUrl: '/api/vabamorf/analyze',
  merlinUrl: '/api/merlin/synthesize',
  cacheUrl: '/api/audio-cache',
} as const;

const PROD_CONFIG = {
  // This should be the absolute URL of the deployed single-table-lambda API Gateway.
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  // These URLs are from the vite.config.ts proxy and are assumed to be production-ready.
  vabamorfUrl: 'https://ibgaeez4mm.eu-west-1.awsapprunner.com/analyze',
  merlinUrl: 'https://swq24fqfiu.eu-west-1.awsapprunner.com/synthesize',
  // This should point to the production audio cache endpoint.
  cacheUrl: `${import.meta.env.VITE_API_BASE_URL || ''}/audio-cache`,
} as const;

export const API_CONFIG = isProd ? PROD_CONFIG : DEV_CONFIG;
