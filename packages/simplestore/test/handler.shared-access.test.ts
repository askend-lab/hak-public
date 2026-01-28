import { describe, it, expect, beforeEach } from '@jest/globals';
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

describe('Shared data access without authentication', () => {
  beforeEach(() => {
    setAdapter(new InMemoryAdapter());
    process.env.IS_OFFLINE = 'true';
  });

  it('should allow reading shared data without authentication', async () => {
    // First, save shared data as authenticated user
    const saveEvent = createEvent('POST', '/save', undefined, {
      pk: 'shared',
      sk: 'tasks',
      type: 'shared',
      ttl: 3600,
      data: { tasks: [{ id: 'task-1', name: 'Shared Task', shareToken: 'abc123' }] }
    }, 'user-1');

    const saveResult = await handler(saveEvent);
    expect(saveResult.statusCode).toBe(200);

    // BUG: Try to read shared data WITHOUT authentication (simulating incognito browser)
    // This should succeed for 'shared' type data, but currently returns 401
    const getEvent = createEvent('GET', '/get', {
      pk: 'shared',
      sk: 'tasks',
      type: 'shared'
    }); // No userId - simulating unauthenticated request

    const getResult = await handler(getEvent);
    
    // Now should succeed for shared data
    expect(getResult.statusCode).toBe(200);
    
    const body = JSON.parse(getResult.body);
    // For shared data, item should contain our saved data
    // Note: item may be null if not found, or contain {data: {tasks: [...]}}
    expect(body.item).toBeDefined();
    expect(body.item.data).toBeDefined();
    expect(body.item.data.tasks).toBeDefined();
  });

  it('should still require authentication for private data', async () => {
    // Save private data
    const saveEvent = createEvent('POST', '/save', undefined, {
      pk: 'tasks',
      sk: 'user-1',
      type: 'private',
      ttl: 3600,
      data: { tasks: [{ id: 'task-1', name: 'Private Task' }] }
    }, 'user-1');

    await handler(saveEvent);

    // Try to read private data without auth - should fail
    const getEvent = createEvent('GET', '/get', {
      pk: 'tasks',
      sk: 'user-1',
      type: 'private'
    }); // No userId

    const getResult = await handler(getEvent);
    expect(getResult.statusCode).toBe(401);
  });
});
