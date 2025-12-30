import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Set test environment variables
process.env.APP_NAME = 'test-app';
process.env.TENANT = 'test-tenant';
process.env.ENVIRONMENT = 'test';
process.env.TABLE_NAME = 'test-table';
process.env.IS_OFFLINE = 'true';

export const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
  memoryLimitInMB: '128',
  awsRequestId: 'test-id',
  logGroupName: 'test-group',
  logStreamName: 'test-stream',
  getRemainingTimeInMillis: () => 1000,
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn(),
};

const baseRequestContext = {
  accountId: '123456789',
  apiId: 'test-api',
  authorizer: { claims: { sub: 'user123' } },
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
    userArn: null,
  },
  path: '/',
  protocol: 'HTTP/1.1',
  requestId: 'test-request',
  requestTimeEpoch: Date.now(),
  resourceId: 'test',
  resourcePath: '/',
  stage: 'test',
};

const baseEvent: APIGatewayProxyEvent = {
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
  requestContext: baseRequestContext as APIGatewayProxyEvent['requestContext'],
};

export function createEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return { ...baseEvent, ...overrides };
}

export function createEventWithAuth(authorizer: APIGatewayProxyEvent['requestContext']['authorizer']): APIGatewayProxyEvent {
  return createEvent({
    requestContext: { ...baseRequestContext, authorizer } as APIGatewayProxyEvent['requestContext'],
  });
}

export function createGetEvent(path: string, params: Record<string, string> | null): APIGatewayProxyEvent {
  return createEvent({
    httpMethod: 'GET',
    path,
    queryStringParameters: params,
  });
}

export function createPostEvent(path: string, body: object | string | null): APIGatewayProxyEvent {
  let bodyStr: string | null;
  if (typeof body === 'string') {
    bodyStr = body;
  } else if (body) {
    bodyStr = JSON.stringify(body);
  } else {
    bodyStr = null;
  }
  return createEvent({
    httpMethod: 'POST',
    path,
    body: bodyStr,
  });
}

export function createDeleteEvent(path: string, params: Record<string, string> | null): APIGatewayProxyEvent {
  return createEvent({
    httpMethod: 'DELETE',
    path,
    queryStringParameters: params,
  });
}
