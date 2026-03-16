import {
  createStateCookie,
  parseStateCookie,
  clearStateCookie,
  getFrontendUrl,
  STATE_COOKIE_NAME,
  DEFAULT_FRONTEND_URL_PROD,
  DEFAULT_FRONTEND_URL_DEV,
} from '../src/handler';
import { AuthState } from '../src/types';

describe('createStateCookie', () => {
  const state: AuthState = {
    state: 'test-state',
    nonce: 'test-nonce',
    redirectUri: 'https://example.com',
    createdAt: 1000000,
  };

  it('should contain cookie name', () => {
    expect(createStateCookie(state)).toContain(`${STATE_COOKIE_NAME}=`);
  });

  it('should be HttpOnly and Secure', () => {
    const cookie = createStateCookie(state);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
  });

  it('should encode state as base64url', () => {
    const cookie = createStateCookie(state);
    const encoded = cookie.split('=')[1].split(';')[0];
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    expect(decoded.state).toBe('test-state');
    expect(decoded.nonce).toBe('test-nonce');
  });
});

describe('parseStateCookie', () => {
  const state: AuthState = {
    state: 'parse-state',
    nonce: 'parse-nonce',
    redirectUri: 'https://example.com',
    createdAt: 2000000,
  };
  const encoded = Buffer.from(JSON.stringify(state)).toString('base64url');

  it('should return null for undefined header', () => {
    expect(parseStateCookie(undefined)).toBeNull();
  });

  it('should return null for empty header', () => {
    expect(parseStateCookie('')).toBeNull();
  });

  it('should return null when cookie not found', () => {
    expect(parseStateCookie('other_cookie=value')).toBeNull();
  });

  it('should return null for malformed base64', () => {
    expect(parseStateCookie(`${STATE_COOKIE_NAME}=!!!invalid`)).toBeNull();
  });

  it('should parse valid state cookie', () => {
    const result = parseStateCookie(`${STATE_COOKIE_NAME}=${encoded}`);
    expect(result).toStrictEqual(state);
  });

  it('should parse cookie among other cookies', () => {
    const result = parseStateCookie(`foo=bar; ${STATE_COOKIE_NAME}=${encoded}; baz=qux`);
    expect(result?.state).toBe('parse-state');
  });
});

describe('clearStateCookie', () => {
  it('should contain cookie name with empty value', () => {
    expect(clearStateCookie()).toContain(`${STATE_COOKIE_NAME}=;`);
  });

  it('should set Max-Age=0', () => {
    expect(clearStateCookie()).toContain('Max-Age=0');
  });

  it('should be HttpOnly and Secure', () => {
    const cookie = clearStateCookie();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
  });
});

describe('getFrontendUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return dev URL when STAGE is dev', () => {
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://custom-dev.example.com';
    expect(getFrontendUrl()).toBe('https://custom-dev.example.com');
  });

  it('should return prod URL when STAGE is prod', () => {
    process.env.STAGE = 'prod';
    process.env.FRONTEND_URL_PROD = 'https://custom-prod.example.com';
    expect(getFrontendUrl()).toBe('https://custom-prod.example.com');
  });

  it('should default to dev URL when STAGE not set', () => {
    delete process.env.STAGE;
    delete process.env.FRONTEND_URL_DEV;
    expect(getFrontendUrl()).toBe(DEFAULT_FRONTEND_URL_DEV);
  });

  it('should default to prod URL when STAGE=prod and no env', () => {
    process.env.STAGE = 'prod';
    delete process.env.FRONTEND_URL_PROD;
    expect(getFrontendUrl()).toBe(DEFAULT_FRONTEND_URL_PROD);
  });
});
