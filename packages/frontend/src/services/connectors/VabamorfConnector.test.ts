import { describe, it, expect } from 'vitest';

import type { VabamorfConnector } from './VabamorfConnector';
import { createMockVabamorfConnector } from './mocks/MockVabamorfConnector';

describe('VabamorfConnector', () => {
  describe('analyze', () => {
    it('returns phonetic text for given input', async () => {
      const connector: VabamorfConnector = createMockVabamorfConnector();
      
      const result = await connector.analyze('tere');
      
      expect(result.phoneticText).toBeDefined();
      expect(typeof result.phoneticText).toBe('string');
    });

    it('returns configured phonetic text', async () => {
      const connector = createMockVabamorfConnector({
        phoneticResponses: { 'mees': 'm`ees' }
      });
      
      const result = await connector.analyze('mees');
      
      expect(result.phoneticText).toBe('m`ees');
    });
  });

  describe('getVariants', () => {
    it('returns variant list for word', async () => {
      const connector: VabamorfConnector = createMockVabamorfConnector();
      
      const variants = await connector.getVariants('mees');
      
      expect(Array.isArray(variants)).toBe(true);
    });

    it('returns configured variants', async () => {
      const connector = createMockVabamorfConnector({
        variantResponses: {
          'mees': [
            { phonetic: 'm`ees', stress: 1 },
            { phonetic: 'mee`s', stress: 2 }
          ]
        }
      });
      
      const variants = await connector.getVariants('mees');
      
      expect(variants).toHaveLength(2);
      expect(variants[0]?.phonetic).toBe('m`ees');
      expect(variants[1]?.phonetic).toBe('mee`s');
    });
  });

  describe('call tracking', () => {
    it('tracks analyze calls', async () => {
      const connector = createMockVabamorfConnector();
      
      await connector.analyze('tere');
      await connector.analyze('mees');
      
      expect(connector.getAnalyzeCalls()).toEqual(['tere', 'mees']);
    });

    it('tracks getVariants calls', async () => {
      const connector = createMockVabamorfConnector();
      
      await connector.getVariants('mees');
      await connector.getVariants('koer');
      
      expect(connector.getVariantCalls()).toEqual(['mees', 'koer']);
    });
  });
});
