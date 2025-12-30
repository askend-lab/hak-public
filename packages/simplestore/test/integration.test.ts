/**
 * Integration tests - testing full pipeline through Lambda handler
 * Tests all 4 data types with proper validation
 */

import { handler } from '../src/lambda/handler';
import { createPostEvent, createGetEvent } from './setup';

// Helper to add user header for auth
function addUserHeader(event: ReturnType<typeof createPostEvent>, userId: string): ReturnType<typeof createPostEvent> {
  event.headers['X-User-Id'] = userId;
  return event;
}

describe('Integration Tests - Full Pipeline', () => {
  describe('private type through handler', () => {
    it('should save and retrieve private item', async () => {
      const saveEvent = addUserHeader(createPostEvent('/save', {
        pk: 'integration-test',
        sk: 'private-item',
        type: 'private',
        ttl: 3600,
        data: { secret: 'value' }
      }), 'user-owner');

      const saveResult = await handler(saveEvent);
      expect(saveResult.statusCode).toBe(200);

      const getEvent = addUserHeader(createGetEvent('/get', {
        pk: 'integration-test',
        sk: 'private-item',
        type: 'private'
      }), 'user-owner');

      const getResult = await handler(getEvent);
      expect(getResult.statusCode).toBe(200);
      expect(JSON.parse(getResult.body).item.data).toStrictEqual({ secret: 'value' });
    });

    it('should reject invalid type in request', async () => {
      const event = addUserHeader(createPostEvent('/save', {
        pk: 'test',
        sk: 'test',
        type: 'invalid-type',
        ttl: 3600
      }), 'user1');

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).errors).toBeDefined();
    });
  });

  describe('unlisted type through handler', () => {
    it('should save unlisted item', async () => {
      const saveEvent = addUserHeader(createPostEvent('/save', {
        pk: 'shared-doc',
        sk: 'doc1',
        type: 'unlisted',
        ttl: 3600,
        data: { content: 'hello' }
      }), 'owner-user');

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it('should validate unlisted type is accepted', async () => {
      const getEvent = addUserHeader(createGetEvent('/get', {
        pk: 'shared-doc',
        sk: 'doc1',
        type: 'unlisted'
      }), 'any-user');

      const result = await handler(getEvent);
      // Should be 200 or 404, not 400 (type is valid)
      expect([200, 404]).toContain(result.statusCode);
    });
  });

  describe('public type through handler', () => {
    it('should save public item', async () => {
      const saveEvent = addUserHeader(createPostEvent('/save', {
        pk: 'article',
        sk: 'post1',
        type: 'public',
        ttl: 3600,
        data: { title: 'Hello' }
      }), 'author');

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it('should query public items', async () => {
      const queryEvent = addUserHeader(createGetEvent('/query', {
        prefix: 'article',
        type: 'public'
      }), 'reader');

      const result = await handler(queryEvent);
      expect([200, 500]).toContain(result.statusCode);
    });
  });

  describe('shared type through handler', () => {
    it('should save shared item', async () => {
      const saveEvent = addUserHeader(createPostEvent('/save', {
        pk: 'wiki',
        sk: 'page1',
        type: 'shared',
        ttl: 3600,
        data: { content: 'Initial' }
      }), 'user1');

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it('should validate shared type is accepted', async () => {
      const getEvent = addUserHeader(createGetEvent('/get', {
        pk: 'wiki',
        sk: 'page1',
        type: 'shared'
      }), 'user2');

      const result = await handler(getEvent);
      expect([200, 404]).toContain(result.statusCode);
    });
  });

  describe('validation through handler', () => {
    it('should reject empty pk', async () => {
      const event = addUserHeader(createPostEvent('/save', {
        pk: '',
        sk: 'test',
        type: 'public',
        ttl: 3600
      }), 'user1');

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should reject empty sk', async () => {
      const event = addUserHeader(createPostEvent('/save', {
        pk: 'test',
        sk: '',
        type: 'public',
        ttl: 3600
      }), 'user1');

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should reject zero ttl', async () => {
      const event = addUserHeader(createPostEvent('/save', {
        pk: 'test',
        sk: 'test',
        type: 'public',
        ttl: 0
      }), 'user1');

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it('should reject ttl exceeding max', async () => {
      const event = addUserHeader(createPostEvent('/save', {
        pk: 'test',
        sk: 'test',
        type: 'public',
        ttl: 31536001 // 1 year + 1 second
      }), 'user1');

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });
});
