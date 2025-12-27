import { describe, it, expect } from 'vitest';
import { API_CONFIG } from './config';

describe('config', () => {
  it('exports API_CONFIG with required URLs', () => {
    expect(API_CONFIG).toBeDefined();
    expect(API_CONFIG.baseUrl).toBeDefined();
    expect(API_CONFIG.vabamorfUrl).toBeDefined();
    expect(API_CONFIG.merlinUrl).toBeDefined();
    expect(API_CONFIG.cacheUrl).toBeDefined();
    expect(API_CONFIG.audioApiUrl).toBeDefined();
    expect(API_CONFIG.audioBucketUrl).toBeDefined();
  });

  it('uses development config in test environment', () => {
    expect(API_CONFIG.baseUrl).toBe('/api');
    expect(API_CONFIG.vabamorfUrl).toBe('/api/vabamorf/analyze');
    expect(API_CONFIG.merlinUrl).toBe('/api/merlin/synthesize');
    expect(API_CONFIG.cacheUrl).toBe('/api/audio-cache');
    expect(API_CONFIG.audioApiUrl).toBe('/api/audio/generate');
  });

  it('has correct S3 bucket URL', () => {
    expect(API_CONFIG.audioBucketUrl).toContain('s3.eu-west-1.amazonaws.com');
  });
});
