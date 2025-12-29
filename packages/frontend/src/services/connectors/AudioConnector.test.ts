import { describe, it, expect } from 'vitest';

import type { AudioConnector } from './AudioConnector';
import { createMockAudioConnector } from './mocks/MockAudioConnector';

describe('AudioConnector', () => {
  describe('synthesize', () => {
    it('returns WAV blob for given text', async () => {
      const connector: AudioConnector = createMockAudioConnector();
      
      const result = await connector.synthesize('tere');
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('audio/wav');
    });

    it('tracks calls for verification', async () => {
      const connector = createMockAudioConnector();
      
      await connector.synthesize('tere');
      await connector.synthesize('hommikust');
      
      expect(connector.getCalls()).toHaveLength(2);
      expect(connector.getCalls()[0]).toBe('tere');
      expect(connector.getCalls()[1]).toBe('hommikust');
    });

    it('can be configured to return specific response', async () => {
      const customBlob = new Blob(['custom audio'], { type: 'audio/wav' });
      const connector = createMockAudioConnector({ response: customBlob });
      
      const result = await connector.synthesize('test');
      
      expect(result).toBe(customBlob);
    });
  });

  describe('caching behavior (future implementation)', () => {
    it('returns same blob for same text (cache hit)', async () => {
      const connector = createMockAudioConnector();
      
      const result1 = await connector.synthesize('tere');
      const result2 = await connector.synthesize('tere');
      
      // Mock returns same type, real impl would return cached blob
      expect(result1.type).toBe(result2.type);
    });

    it('tracks different texts separately', async () => {
      const connector = createMockAudioConnector();
      
      await connector.synthesize('tere');
      await connector.synthesize('hommikust');
      await connector.synthesize('tere');
      
      // All calls tracked, cache would reduce backend calls
      expect(connector.getCalls()).toHaveLength(3);
    });
  });
});
