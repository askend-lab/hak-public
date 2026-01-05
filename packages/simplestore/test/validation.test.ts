import { validateStoreRequest, validateGetRequest, validateQueryRequest } from '../src/core/validation';

describe('Validation', () => {
  describe('validateStoreRequest', () => {
    it('should accept valid request', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: 3600,
        data: { key: 'value' }
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing pk', () => {
      const result = validateStoreRequest({
        sk: 'sort1',
        type: 'private',
        ttl: 3600
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('pk is required and must be a string');
    });

    it('should reject missing sk', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        type: 'private',
        ttl: 3600
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sk is required and must be a string');
    });

    it('should reject invalid type', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'invalid' as any,
        ttl: 3600
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('type must be one of');
    });

    it('should accept zero ttl (no expiration)', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: 0
      });

      expect(result.valid).toBe(true);
    });

    it('should reject negative ttl', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: -1
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('TTL must be 0');
    });

    it('should reject ttl exceeding max', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: 31536001
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('exceeds maximum');
    });

    it('should reject invalid data type', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: 3600,
        data: 'not an object' as unknown as Record<string, unknown>
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data must be an object');
    });

    it('should accept request without data', () => {
      const result = validateStoreRequest({
        pk: 'entity1',
        sk: 'sort1',
        type: 'public',
        ttl: 3600
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('validateGetRequest', () => {
    it('should accept valid request', () => {
      const result = validateGetRequest('entity1', 'sort1', 'private');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid pk', () => {
      const result = validateGetRequest(null, 'sort1', 'private');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('pk is required and must be a string');
    });

    it('should reject invalid type', () => {
      const result = validateGetRequest('entity1', 'sort1', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('type must be one of');
    });
  });

  describe('validateQueryRequest', () => {
    it('should accept valid request', () => {
      const result = validateQueryRequest('prefix-', 'private');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept empty prefix', () => {
      const result = validateQueryRequest('', 'public');

      expect(result.valid).toBe(true);
    });

    it('should reject non-string prefix', () => {
      const result = validateQueryRequest(123, 'private');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('prefix must be a string');
    });

    it('should reject invalid type', () => {
      const result = validateQueryRequest('prefix-', null);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('type must be one of');
    });
  });
});
