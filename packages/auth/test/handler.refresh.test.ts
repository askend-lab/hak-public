import { APIGatewayProxyEvent } from 'aws-lambda';
import { refreshHandler, REFRESH_COOKIE_NAME } from '../src/handler';

const originalFetch = global.fetch;
const originalEnv = { ...process.env };

const FRONTEND_URL = 'https://hak-dev.askend-lab.com';

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
  httpMethod: 'POST', path: '/tara/refresh', queryStringParameters: null,
  headers: { Origin: FRONTEND_URL }, body: null, isBase64Encoded: false, pathParameters: null,
  stageVariables: null, requestContext: {} as unknown as APIGatewayProxyEvent['requestContext'],
  resource: '', multiValueHeaders: {}, multiValueQueryStringParameters: null,
  ...overrides,
});

describe("handler.refresh.test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
    process.env.COGNITO_DOMAIN = 'auth.example.com';
    process.env.COGNITO_CLIENT_ID = 'client-id';
    process.env.ALLOWED_ORIGIN = 'https://hak-dev.askend-lab.com';
  });

  afterEach(() => { global.fetch = originalFetch; process.env = { ...originalEnv }; });

  it('returns 200 on OPTIONS (CORS preflight)', async () => {
    const event = makeEvent({ httpMethod: 'OPTIONS' });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('returns 401 when no refresh cookie', async () => {
    const event = makeEvent();
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).error).toBe('No refresh token');
  });

  it('returns 200 with new tokens on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'new-at', id_token: 'new-id' }),
    });
    const event = makeEvent({ headers: { Origin: FRONTEND_URL, Cookie: `${REFRESH_COOKIE_NAME}=my-refresh-token` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.access_token).toBe('new-at');
    expect(body.id_token).toBe('new-id');
  });

  it('returns 401 and clears cookie when Cognito rejects refresh', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 });
    const event = makeEvent({ headers: { Origin: FRONTEND_URL, Cookie: `${REFRESH_COOKIE_NAME}=bad-token` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(401);
    const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
    expect(cookies?.find(c => c.includes('Max-Age=0'))).toBeDefined();
  });

  it('returns 401 on fetch exception', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network'));
    const event = makeEvent({ headers: { Origin: FRONTEND_URL, Cookie: `${REFRESH_COOKIE_NAME}=tok` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(401);
  });

  it('throws when COGNITO_DOMAIN is missing', async () => {
    delete process.env.COGNITO_DOMAIN;
    const event = makeEvent({ headers: { Origin: FRONTEND_URL, Cookie: `${REFRESH_COOKIE_NAME}=tok` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(401);
  });

  it('includes Access-Control-Allow-Credentials header', async () => {
    const event = makeEvent();
    const result = await refreshHandler(event);
    expect(result.headers?.['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('returns 403 when Origin header is missing (CSRF protection)', async () => {
    const event = makeEvent({ headers: { Cookie: `${REFRESH_COOKIE_NAME}=tok` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body).error).toBe('Invalid origin');
  });

  it('returns 403 when Origin header is wrong (CSRF protection)', async () => {
    const event = makeEvent({ headers: { Origin: 'https://evil.com', Cookie: `${REFRESH_COOKIE_NAME}=tok` } });
    const result = await refreshHandler(event);
    expect(result.statusCode).toBe(403);
  });

});
