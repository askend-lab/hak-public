import { config } from '../src/config';
import { buildKeys, buildPartitionKey, validateTtl } from '../src/keyBuilder';
import { ServerContext } from '../src/types';

describe('KeyBuilder', () => {
  const context: ServerContext = {
    app: 'myapp',
    tenant: 'tenant1',
    env: 'dev',
    userId: 'user123'
  };

  describe('buildKeys', () => {
    it('should build public keys without user in PK', () => {
      const keys = buildKeys(context, 'public', 'entity1', 'sort1');
      expect(keys.pk).toBe('myapp#tenant1#dev#public');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should build shared keys without user in PK', () => {
      const keys = buildKeys(context, 'shared', 'entity1', 'sort1');
      expect(keys.pk).toBe('myapp#tenant1#dev#shared');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should build private keys with user in PK', () => {
      const keys = buildKeys(context, 'private', 'entity1', 'sort1');
      expect(keys.pk).toBe('myapp#tenant1#dev#private#user123');
      expect(keys.sk).toBe('entity1#sort1');
    });

    it('should handle special characters', () => {
      const keys = buildKeys(context, 'public', 'my-entity_123', 'v1');
      expect(keys.pk).toBe('myapp#tenant1#dev#public');
      expect(keys.sk).toBe('my-entity_123#v1');
    });
  });

  describe('buildPartitionKey', () => {
    it('should build public partition key', () => {
      const pk = buildPartitionKey(context, 'public');
      expect(pk).toBe('myapp#tenant1#dev#public');
    });

    it('should build private partition key with user', () => {
      const pk = buildPartitionKey(context, 'private');
      expect(pk).toBe('myapp#tenant1#dev#private#user123');
    });
  });

  describe('validateTtl', () => {
    it('should accept valid TTL within limits', () => {
      expect(validateTtl(3600)).toEqual({ valid: true, ttl: 3600 });
    });

    it('should reject TTL of zero', () => {
      const result = validateTtl(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('TTL must be positive');
    });

    it('should reject negative TTL', () => {
      const result = validateTtl(-100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('TTL must be positive');
    });

    it('should reject TTL exceeding max limit', () => {
      const result = validateTtl(config.maxTtlSeconds + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should accept TTL at max limit', () => {
      expect(validateTtl(config.maxTtlSeconds)).toEqual({ valid: true, ttl: config.maxTtlSeconds });
    });
  });
});
