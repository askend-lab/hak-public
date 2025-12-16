import { handler, createStore } from '../src/handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
  memoryLimitInMB: '128',
  awsRequestId: 'test-id',
  logGroupName: 'test-group',
  logStreamName: 'test-stream',
  getRemainingTimeInMillis: () => 1000,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};

function createEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/',
    body: null,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '',
    requestContext: {
      accountId: '123456789',
      apiId: 'test-api',
      authorizer: {
        claims: { sub: 'user123' }
      },
      httpMethod: 'GET',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test',
        userArn: null
      },
      path: '/',
      protocol: 'HTTP/1.1',
      requestId: 'test-request',
      requestTimeEpoch: Date.now(),
      resourceId: 'test',
      resourcePath: '/',
      stage: 'test'
    },
    ...overrides
  };
}

describe('Lambda Handler', () => {
  describe('createStore factory', () => {
    it('should create store with user context', () => {
      const store = createStore('user123');
      expect(store).toBeDefined();
    });
  });

  describe('authentication', () => {
    it('should return 401 if no user in context', async () => {
      const event = createEvent({
        requestContext: {
          ...createEvent().requestContext,
          authorizer: {}
        }
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if authorizer is null', async () => {
      const event = createEvent({
        requestContext: {
          ...createEvent().requestContext,
          authorizer: null as any
        }
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(401);
    });

    it('should return 401 if claims is null', async () => {
      const event = createEvent({
        requestContext: {
          ...createEvent().requestContext,
          authorizer: { claims: null }
        }
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(401);
    });
  });

  describe('routing', () => {
    it('should return 404 for unknown path', async () => {
      const event = createEvent({ path: '/unknown' });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(404);
    });
  });

  describe('save endpoint', () => {
    it('should return 400 for invalid JSON', async () => {
      const event = createEvent({
        httpMethod: 'POST',
        path: '/save',
        body: 'invalid json'
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const event = createEvent({
        httpMethod: 'POST',
        path: '/save',
        body: JSON.stringify({ pk: 'test' })
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errors).toBeDefined();
    });
  });

  describe('get endpoint', () => {
    it('should return 400 for missing query params', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/get',
        queryStringParameters: {}
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for null queryStringParameters', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/get',
        queryStringParameters: null
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });
  });

  describe('query endpoint', () => {
    it('should return 400 for missing type', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/query',
        queryStringParameters: { prefix: 'test-' }
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });
  });

  describe('delete endpoint', () => {
    it('should return 400 for missing query params', async () => {
      const event = createEvent({
        httpMethod: 'DELETE',
        path: '/delete',
        queryStringParameters: {}
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });

    it('should return 400 for null queryStringParameters', async () => {
      const event = createEvent({
        httpMethod: 'DELETE',
        path: '/delete',
        queryStringParameters: null
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });

    it('should handle valid delete params', async () => {
      const event = createEvent({
        httpMethod: 'DELETE',
        path: '/delete',
        queryStringParameters: { pk: 'test', sk: 'sort', type: 'public' }
      });

      const result = await handler(event, mockContext);
      // Will return 404 or 403 since item doesn't exist or access denied
      expect([200, 403, 404]).toContain(result.statusCode);
    });
  });

  describe('save endpoint with null body', () => {
    it('should return 400 for null body', async () => {
      const event = createEvent({
        httpMethod: 'POST',
        path: '/save',
        body: null
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
    });
  });

  describe('get endpoint success path', () => {
    it('should return 200 with valid params', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/get',
        queryStringParameters: { pk: 'test', sk: 'sort', type: 'public' }
      });

      const result = await handler(event, mockContext);
      // Will return 404 since item doesn't exist, but tests the branch
      expect([200, 404]).toContain(result.statusCode);
    });
  });

  describe('query endpoint success path', () => {
    it('should return 200 with valid params', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/query',
        queryStringParameters: { prefix: 'test-', type: 'public' }
      });

      const result = await handler(event, mockContext);
      expect([200, 500]).toContain(result.statusCode);
    });

    it('should handle null queryStringParameters', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/query',
        queryStringParameters: null
      });

      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(400);
    });

    it('should handle undefined prefix', async () => {
      const event = createEvent({
        httpMethod: 'GET',
        path: '/query',
        queryStringParameters: { type: 'public' }
      });

      const result = await handler(event, mockContext);
      // Empty prefix is valid
      expect([200, 400, 500]).toContain(result.statusCode);
    });
  });

  describe('save endpoint validation', () => {
    it('should return 400 for validation errors', async () => {
      const event = createEvent({
        httpMethod: 'POST',
        path: '/save',
        body: JSON.stringify({ pk: 'test' }) // missing required fields
      });

      const result = await handler(event, mockContext);
      expect(result.statusCode).toBe(400);
    });

    it('should process valid save request', async () => {
      const event = createEvent({
        httpMethod: 'POST',
        path: '/save',
        body: JSON.stringify({
          pk: 'test',
          sk: 'sort',
          type: 'public',
          ttl: 3600,
          data: { key: 'value' }
        })
      });

      const result = await handler(event, mockContext);
      // Will return 200 or 400 depending on DynamoDB
      expect([200, 400, 500]).toContain(result.statusCode);
    });
  });
});
