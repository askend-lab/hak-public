import { REFRESH_COOKIE_NAME, getCookieDomain, createRefreshCookie, clearRefreshCookie, parseRefreshCookie } from '../src/handler';

const originalEnv = { ...process.env };

describe("handler.refresh.test", () => {
  beforeEach(() => {
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
  });

  afterEach(() => { process.env = { ...originalEnv }; });

  it('getCookieDomain uses exact frontend hostname', () => {
    expect(getCookieDomain()).toBe('hak-dev.askend-lab.com');
  });

  it('createRefreshCookie includes all required attributes', () => {
    const cookie = createRefreshCookie('tok123');
    expect(cookie).toContain(`${REFRESH_COOKIE_NAME}=tok123`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Domain=hak-dev.askend-lab.com');
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
