export const API_CONFIG = {
  baseUrl: '/api',
  vabamorfUrl: '/api/vabamorf/analyze',
  merlinUrl: '/api/merlin/synthesize',
  cacheUrl: '/api/audio-cache',
  audioApiUrl: '/api/audio/generate',
  audioBucketUrl: 'https://hak-audio-dev.s3.eu-west-1.amazonaws.com',
} as const;
