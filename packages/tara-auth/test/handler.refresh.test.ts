import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  refreshHandler,
  exchangeCodeHandler,
  REFRESH_COOKIE_NAME,
  getCookieDomain,
  createRefreshCookie,
  clearRefreshCookie,
  parseRefreshCookie,
} from '../src/handler';

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

describe('refreshHandler', () => {
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

describe('exchangeCodeHandler', () => {
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

  it('returns 200 on OPTIONS', async () => {
    const event = makeEvent({ httpMethod: 'OPTIONS', path: '/tara/exchange-code' });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(200);
  });

  it('returns 403 when Origin header is wrong (CSRF protection)', async () => {
    const event = makeEvent({ headers: { Origin: 'https://evil.com' }, body: JSON.stringify({ code: 'c', code_verifier: 'v' }) });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(403);
  });

  it('returns 400 when body is missing', async () => {
    const event = makeEvent({ body: null });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const event = makeEvent({ body: 'not-json' });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Invalid JSON');
  });

  it('returns 400 when required fields are missing', async () => {
    const event = makeEvent({ body: JSON.stringify({ code: 'c' }) });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain('Missing');
  });

  it('returns 200 with tokens and sets refresh cookie on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'at', id_token: 'id', refresh_token: 'rt', expires_in: 3600 }),
    });
    const event = makeEvent({
      body: JSON.stringify({ code: 'c', code_verifier: 'v', redirect_uri: 'https://app.com/cb' }),
    });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.access_token).toBe('at');
    expect(body.id_token).toBe('id');
    expect(body.expires_in).toBe(3600);
    const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
    expect(cookies?.find(c => c.includes('rt'))).toBeDefined();
  });

  it('returns 400 when Cognito rejects code exchange', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 });
    const event = makeEvent({
      body: JSON.stringify({ code: 'bad', code_verifier: 'v', redirect_uri: 'u' }),
    });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(400);
  });

  it('returns 500 on unexpected error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Boom'));
    const event = makeEvent({
      body: JSON.stringify({ code: 'c', code_verifier: 'v', redirect_uri: 'u' }),
    });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(500);
  });

  it('throws when COGNITO_DOMAIN is missing', async () => {
    delete process.env.COGNITO_DOMAIN;
    const event = makeEvent({
      body: JSON.stringify({ code: 'c', code_verifier: 'v', redirect_uri: 'u' }),
    });
    const result = await exchangeCodeHandler(event);
    expect(result.statusCode).toBe(500);
  });
});

describe('cookie helpers', () => {
  beforeEach(() => {
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
  });

  afterEach(() => { process.env = { ...originalEnv }; });

  it('getCookieDomain uses exact frontend hostname', () => {
    expect(getCookieDomain()).toBe('.hak-dev.askend-lab.com');
  });

  it('createRefreshCookie includes all required attributes', () => {
    const cookie = createRefreshCookie('tok123');
    expect(cookie).toContain(`${REFRESH_COOKIE_NAME}=tok123`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Domain=.hak-dev.askend-lab.com');
    expect(cookie).toContain('Max-Age=2592000');
  });

  it('clearRefreshCookie sets Max-Age=0', () => {
    const cookie = clearRefreshCookie();
    expect(cookie).toContain(`${REFRESH_COOKIE_NAME}=`);
    expect(cookie).toContain('Max-Age=0');
  });

  it('parseRefreshCookie extracts value', () => {
    expect(parseRefreshCookie(`${REFRESH_COOKIE_NAME}=abc123; other=x`)).toBe('abc123');
  });

  it('parseRefreshCookie returns null when missing', () => {
    expect(parseRefreshCookie('other=x')).toBeNull();
    expect(parseRefreshCookie(undefined)).toBeNull();
  });

  it('parseRefreshCookie returns null for empty value', () => {
    expect(parseRefreshCookie(`${REFRESH_COOKIE_NAME}=`)).toBeNull();
  });
});
