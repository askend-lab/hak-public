import { handler, setAdapter } from '../src/lambda/handler';
import { InMemoryAdapter } from '../src/adapters';
import { APIGatewayProxyEvent } from 'aws-lambda';

function createEvent(method: string, resource: string, params?: Record<string, string>, body?: object, userId?: string): APIGatewayProxyEvent {
  return {
    httpMethod: method,
    resource,
    path: resource,
    queryStringParameters: params || null,
    body: body ? JSON.stringify(body) : null,
    headers: userId ? { 'X-User-Id': userId } : {},
    requestContext: {
      authorizer: userId ? { claims: { sub: userId } } : null,
    },
  } as unknown as APIGatewayProxyEvent;
}

describe('Anonymous data access', () => {
  beforeEach(() => {
    setAdapter(new InMemoryAdapter());
    process.env.IS_OFFLINE = 'true';
  });

  describe('unlisted type', () => {
    it('should allow reading unlisted data without authentication', async () => {
      // Save unlisted task with shareToken as key
      const saveEvent = createEvent('POST', '/save', undefined, {
        pk: 'tasks',
        sk: 'token_abc123',
        type: 'unlisted',
        ttl: 3600,
        data: { id: 'task-1', name: 'Unlisted Task', shareToken: 'abc123' }
      }, 'user-1');

      const saveResult = await handler(saveEvent);
      expect(saveResult.statusCode).toBe(200);

      // Try to read unlisted data WITHOUT authentication
      const getEvent = createEvent('GET', '/get', {
        pk: 'tasks',
        sk: 'token_abc123',
        type: 'unlisted'
      }); // No userId - anonymous request

      const getResult = await handler(getEvent);
      
      // Should succeed for unlisted data
      expect(getResult.statusCode).toBe(200);
      
      const body = JSON.parse(getResult.body);
      expect(body.item).toBeDefined();
      expect(body.item.data.name).toBe('Unlisted Task');
    });

    it('should not allow modifying unlisted data without authentication', async () => {
      // Save unlisted task
      const saveEvent = createEvent('POST', '/save', undefined, {
        pk: 'tasks',
        sk: 'token_abc123',
        type: 'unlisted',
        ttl: 3600,
        data: { id: 'task-1', name: 'Original' }
      }, 'user-1');

      await handler(saveEvent);

      // Try to modify without auth - should fail
      const modifyEvent = createEvent('POST', '/save', undefined, {
        pk: 'tasks',
        sk: 'token_abc123',
        type: 'unlisted',
        ttl: 3600,
        data: { id: 'task-1', name: 'Hacked' }
      }); // No userId

      const modifyResult = await handler(modifyEvent);
      expect(modifyResult.statusCode).toBe(401);
    });
  });

  describe('shared type', () => {
    it('should allow reading shared data without authentication', async () => {
      const saveEvent = createEvent('POST', '/save', undefined, {
        pk: 'shared',
        sk: 'tasks',
        type: 'shared',
        ttl: 3600,
        data: { tasks: [{ id: 'task-1', name: 'Shared Task', shareToken: 'abc123' }] }
      }, 'user-1');

      const saveResult = await handler(saveEvent);
      expect(saveResult.statusCode).toBe(200);

      const getEvent = createEvent('GET', '/get', {
        pk: 'shared',
        sk: 'tasks',
        type: 'shared'
      });

      const getResult = await handler(getEvent);
      expect(getResult.statusCode).toBe(200);
      
      const body = JSON.parse(getResult.body);
      expect(body.item).toBeDefined();
      expect(body.item.data).toBeDefined();
      expect(body.item.data.tasks).toBeDefined();
    });
  });

  describe('private type', () => {
    it('should require authentication for private data', async () => {
      const saveEvent = createEvent('POST', '/save', undefined, {
        pk: 'tasks',
        sk: 'user-1',
        type: 'private',
        ttl: 3600,
        data: { tasks: [{ id: 'task-1', name: 'Private Task' }] }
      }, 'user-1');

      await handler(saveEvent);

      const getEvent = createEvent('GET', '/get', {
        pk: 'tasks',
        sk: 'user-1',
        type: 'private'
      });

      const getResult = await handler(getEvent);
      expect(getResult.statusCode).toBe(401);
    });
  });
});
