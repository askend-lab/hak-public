import { APIGatewayProxyEvent, Context } from 'aws-lambda';

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
  done: () => {},
  fail: () => {},
  succeed: () => {},
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
  requestContext: baseRequestContext as any,
};

export function createEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return { ...baseEvent, ...overrides };
}

export function createEventWithAuth(authorizer: any): APIGatewayProxyEvent {
  return createEvent({
    requestContext: { ...baseRequestContext, authorizer } as any,
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
  return createEvent({
    httpMethod: 'POST',
    path,
    body: typeof body === 'string' ? body : body ? JSON.stringify(body) : null,
  });
}

export function createDeleteEvent(path: string, params: Record<string, string> | null): APIGatewayProxyEvent {
  return createEvent({
    httpMethod: 'DELETE',
    path,
    queryStringParameters: params,
  });
}
