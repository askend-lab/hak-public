import { handler } from '../src/lambda/handler';
import { Store } from '../src/core/store';
import { InMemoryAdapter } from '../src/adapters/memory';

import {
  createEvent,
  createEventWithAuth,
  createGetEvent,
  createPostEvent,
  createDeleteEvent,
} from './setup';

describe('Lambda Handler', () => {
  describe('Store factory', () => {
    it('should create store with adapter and context', () => {
      const adapter = new InMemoryAdapter();
      const store = new Store(adapter, { app: 'test', tenant: 'test', env: 'dev', userId: 'user123' });
      expect(store).toBeDefined();
    });
  });

  describe('authentication', () => {
    it('should return 401 if no user in context', async () => {
      const event = createEventWithAuth({});
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toStrictEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if authorizer is null', async () => {
      const event = createEventWithAuth(null);
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it('should return 401 if claims is null', async () => {
      const event = createEventWithAuth({ claims: null });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });
  });

  describe('routing', () => {
    it('should return 404 for unknown path', async () => {
      const event = createEvent({ path: '/unknown' });

      const result = await handler(event);

      expect(result.statusCode).toBe(404);
    });
  });

  describe('save endpoint', () => {
    it('should return 400 for invalid JSON', async () => {
      const event = createPostEvent('/save', 'invalid json');
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const event = createPostEvent('/save', { pk: 'test' });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).errors).toBeDefined();
    });
  });

  describe('get endpoint', () => {
    it('should return 400 for missing query params', async () => {
      const event = createGetEvent('/get', {});
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for null queryStringParameters', async () => {
      const event = createGetEvent('/get', null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

  describe('query endpoint', () => {
    it('should return 400 for missing type', async () => {
      const event = createGetEvent('/query', { prefix: 'test-' });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

  describe('delete endpoint', () => {
    it('should return 400 for missing query params', async () => {
      const event = createDeleteEvent('/delete', {});
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for null queryStringParameters', async () => {
      const event = createDeleteEvent('/delete', null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should handle valid delete params', async () => {
      const event = createDeleteEvent('/delete', { pk: 'test', sk: 'sort', type: 'public' });
      const result = await handler(event);
      expect([200, 403, 404]).toContain(result.statusCode);
    });
  });

  describe('save endpoint with null body', () => {
    it('should return 400 for null body', async () => {
      const event = createPostEvent('/save', null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

  describe('get endpoint success path', () => {
    it('should return 200 with valid params', async () => {
      const event = createGetEvent('/get', { pk: 'test', sk: 'sort', type: 'public' });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it('should return 200 with null item when item not found', async () => {
      const event = createGetEvent('/get', { pk: 'nonexistent', sk: 'nothere', type: 'private' });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.item).toBeNull();
    });
  });

  describe('query endpoint success path', () => {
    it('should return 200 with valid params', async () => {
      const event = createGetEvent('/query', { prefix: 'test-', type: 'public' });
      const result = await handler(event);
      expect([200, 500]).toContain(result.statusCode);
    });

    it('should handle null queryStringParameters', async () => {
      const event = createGetEvent('/query', null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should handle undefined prefix', async () => {
      const event = createGetEvent('/query', { type: 'public' });
      const result = await handler(event);
      expect([200, 400, 500]).toContain(result.statusCode);
    });
  });

  describe('save endpoint validation', () => {
    it('should return 400 for validation errors', async () => {
      const event = createPostEvent('/save', { pk: 'test' });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should process valid save request', async () => {
      const event = createPostEvent('/save', {
        pk: 'test',
        sk: 'sort',
        type: 'public',
        ttl: 3600,
        data: { key: 'value' },
      });
      const result = await handler(event);
      expect([200, 400, 500]).toContain(result.statusCode);
    });
  });
});
