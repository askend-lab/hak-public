import { buildKeys, buildPartitionKey } from '../src/core/store';
import { parseTtl } from '../src/core/validation';
import { ServerContext } from '../src/core/types';

const config = { maxTtlSeconds: 31536000, keyDelimiter: '#' };
const D = '#';

describe('KeyBuilder', () => {
  const context: ServerContext = {
    app: 'myapp',
    tenant: 'tenant1',
    env: 'dev',
    userId: 'user123'
  };

  describe('buildKeys', () => {
    it('should build public keys without user in PK', () => {
      const keys = buildKeys(context, 'public', 'entity1', 'sort1', D);
      expect(keys.pk).toBe('myapp#tenant1#dev#public');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should build shared keys without user in PK', () => {
      const keys = buildKeys(context, 'shared', 'entity1', 'sort1', D);
      expect(keys.pk).toBe('myapp#tenant1#dev#shared');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should build private keys with user in PK', () => {
      const keys = buildKeys(context, 'private', 'entity1', 'sort1', D);
      expect(keys.pk).toBe('myapp#tenant1#dev#private#user123');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should handle special characters', () => {
      const keys = buildKeys(context, 'public', 'my-entity_123', 'v1', D);
      expect(keys.pk).toBe('myapp#tenant1#dev#public');
      expect(keys.sk).toBe('my-entity_123#v1');
    });
  });

  describe('buildPartitionKey', () => {
    it('should build public partition key', () => {
      const pk = buildPartitionKey(context, 'public', D);
      expect(pk).toBe('myapp#tenant1#dev#public');
    });

    it('should build private partition key with user', () => {
      const pk = buildPartitionKey(context, 'private', D);
      expect(pk).toBe('myapp#tenant1#dev#private#user123');
    });
  });

  describe('parseTtl', () => {
    it('should accept valid TTL within limits', () => {
      expect(parseTtl(3600)).toStrictEqual({ valid: true, value: 3600 });
    });

    it('should reject TTL of zero', () => {
      const result = parseTtl(0);
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toContain('TTL must be positive');
    });

    it('should reject negative TTL', () => {
      const result = parseTtl(-100);
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toContain('TTL must be positive');
    });

    it('should reject TTL exceeding max limit', () => {
      const result = parseTtl(config.maxTtlSeconds + 1);
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error).toContain('exceeds maximum');
    });

    it('should accept TTL at max limit', () => {
      expect(parseTtl(config.maxTtlSeconds)).toStrictEqual({ valid: true, value: config.maxTtlSeconds });
    });
  });
});
