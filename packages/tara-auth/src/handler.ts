import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CORS_HEADERS, HTTP_STATUS, createLambdaResponse, getCorsOrigin } from '@hak/shared';
import { createTaraClient } from './tara-client';
import { createCognitoClient } from './cognito-client';
import { AuthState } from './types';
import * as crypto from 'crypto';

export const STATE_COOKIE_NAME = 'tara_auth_state';
export const REFRESH_COOKIE_NAME = 'hak_refresh_token';
export const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const REFRESH_TOKEN_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days
export const AUTH_CALLBACK_PATH = '/auth/callback';
export const DEFAULT_FRONTEND_URL_PROD = 'https://hak.askend-lab.com';
export const DEFAULT_FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
export const TOKEN_COOKIE_OPTIONS = 'HttpOnly; Secure; SameSite=Lax; Path=/';
export const RANDOM_STRING_LENGTH = 32;

export function getFrontendUrl(): string {
  const stage = process.env.STAGE || 'dev';
  return stage === 'prod'
    ? process.env.FRONTEND_URL_PROD || DEFAULT_FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV || DEFAULT_FRONTEND_URL_DEV;
}

export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

export function getCookieDomain(): string {
  const url = new URL(getFrontendUrl());
  const parts = url.hostname.split('.');
  return parts.length >= 2 ? '.' + parts.slice(-2).join('.') : url.hostname;
}

export function createRefreshCookie(refreshToken: string): string {
  const domain = getCookieDomain();
  return `${REFRESH_COOKIE_NAME}=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=${REFRESH_TOKEN_MAX_AGE_S}`;
}

export function clearRefreshCookie(): string {
  const domain = getCookieDomain();
  return `${REFRESH_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Domain=${domain}; Path=/; Max-Age=0`;
}

export function parseRefreshCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const found = cookies.find(c => c.startsWith(`${REFRESH_COOKIE_NAME}=`));
  if (!found) return null;
  const value = found.substring(REFRESH_COOKIE_NAME.length + 1);
  return value || null;
}

function corsResponseHeaders(): Record<string, string> {
  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': getCorsOrigin(),
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function createStateCookie(state: AuthState): string {
  const encoded = Buffer.from(JSON.stringify(state)).toString('base64url');
  return `${STATE_COOKIE_NAME}=${encoded}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`;
}

export function parseStateCookie(cookieHeader: string | undefined): AuthState | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const stateCookie = cookies.find(c => c.startsWith(`${STATE_COOKIE_NAME}=`));
  
  if (!stateCookie) return null;

  try {
    const encoded = stateCookie.split('=')[1];
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as AuthState;
  } catch {
    return null;
  }
}

export function clearStateCookie(): string {
  return `${STATE_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}

export async function startHandler(
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const taraClient = await createTaraClient();

    const state = generateRandomString(RANDOM_STRING_LENGTH);
    const nonce = generateRandomString(RANDOM_STRING_LENGTH);
    
    const authState: AuthState = {
      state,
      nonce,
      redirectUri: getFrontendUrl(),
      createdAt: Date.now(),
    };

    const authUrl = taraClient.buildAuthorizationUrl(state, nonce);

    return {
      statusCode: 302,
      headers: {
        Location: authUrl,
        'Set-Cookie': createStateCookie(authState),
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  } catch (error) {
    console.error('TARA start error:', error);
    return createLambdaResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { error: 'Failed to start TARA authentication' },
      { ...CORS_HEADERS, "Access-Control-Allow-Origin": getCorsOrigin() },
    );
  }
}

export async function callbackHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const frontendUrl = getFrontendUrl();

  try {
    const { code, state: returnedState, error, error_description } = event.queryStringParameters || {};

    // Handle TARA errors
    if (error) {
      console.error('TARA error:', error, error_description);
      return redirectToFrontend(frontendUrl, { error: error_description || error });
    }

    if (!code || !returnedState) {
      return redirectToFrontend(frontendUrl, { error: 'Missing code or state' });
    }

    // Validate state from cookie
    const savedState = parseStateCookie(event.headers.Cookie || event.headers.cookie);
    
    if (!savedState) {
      return redirectToFrontend(frontendUrl, { error: 'Invalid session - please try again' });
    }

    if (savedState.state !== returnedState) {
      return redirectToFrontend(frontendUrl, { error: 'State mismatch - possible CSRF attack' });
    }

    if (Date.now() - savedState.createdAt > STATE_TTL_MS) {
      return redirectToFrontend(frontendUrl, { error: 'Session expired - please try again' });
    }

    // Exchange code for tokens
    const taraClient = await createTaraClient();
    const taraTokens = await taraClient.exchangeCodeForTokens(code);

    // Verify and decode ID token
    const taraIdToken = await taraClient.verifyIdToken(taraTokens.id_token, savedState.nonce);

    console.info('TARA authentication successful');

    // Find or create Cognito user
    const cognitoClient = createCognitoClient();
    const username = await cognitoClient.findOrCreateUser(taraIdToken);

    // Generate Cognito tokens
    const cognitoTokens = await cognitoClient.generateTokens(username);

    // Redirect to frontend with tokens in HttpOnly cookies
    return redirectToFrontendWithCookies(frontendUrl, cognitoTokens);

  } catch (error) {
    console.error('TARA callback error:', error);
    return redirectToFrontend(frontendUrl, { 
      error: 'Authentication failed - please try again' 
    }, clearStateCookie());
  }
}

function redirectToFrontend(
  baseUrl: string,
  params: Record<string, string>,
  setCookie?: string
): APIGatewayProxyResult {
  const url = new URL(AUTH_CALLBACK_PATH, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Location: url.toString(),
    'Cache-Control': 'no-store',
  };

  if (setCookie) {
    headers['Set-Cookie'] = setCookie;
  }

  return {
    statusCode: 302,
    headers,
    body: '',
  };
}

function redirectToFrontendWithCookies(
  baseUrl: string,
  tokens: { accessToken: string; idToken: string; refreshToken: string; expiresIn: number }
): APIGatewayProxyResult {
  const url = new URL(AUTH_CALLBACK_PATH, baseUrl);
  // Short-lived tokens go as URL params — frontend stores them in memory only
  url.searchParams.set('access_token', tokens.accessToken);
  url.searchParams.set('id_token', tokens.idToken);

  // Refresh token goes ONLY in httpOnly cookie — never touches JS
  const cookies = [
    createRefreshCookie(tokens.refreshToken),
    clearStateCookie(),
  ];

  return {
    statusCode: 302,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'no-store',
    },
    multiValueHeaders: {
      'Set-Cookie': cookies,
    },
    body: '',
  };
}

export async function refreshHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsResponseHeaders(), body: '' };
  }

  try {
    const refreshToken = parseRefreshCookie(event.headers.Cookie || event.headers.cookie);
    if (!refreshToken) {
      return createLambdaResponse(HTTP_STATUS.UNAUTHORIZED, { error: 'No refresh token' }, corsResponseHeaders());
    }

    const cognitoDomain = process.env.COGNITO_DOMAIN;
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!cognitoDomain || !clientId) {
      throw new Error('COGNITO_DOMAIN and COGNITO_CLIENT_ID must be set');
    }

    const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', client_id: clientId, refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return {
        statusCode: 401,
        headers: corsResponseHeaders(),
        multiValueHeaders: { 'Set-Cookie': [clearRefreshCookie()] },
        body: JSON.stringify({ error: 'Token refresh failed' }),
      };
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      statusCode: 200,
      headers: corsResponseHeaders(),
      body: JSON.stringify({ access_token: data.access_token, id_token: data.id_token }),
    };
  } catch (error) {
    console.error('Refresh error:', error);
    return {
      statusCode: 401,
      headers: corsResponseHeaders(),
      multiValueHeaders: { 'Set-Cookie': [clearRefreshCookie()] },
      body: JSON.stringify({ error: 'Token refresh failed' }),
    };
  }
}

export async function exchangeCodeHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsResponseHeaders(), body: '' };
  }

  try {
    if (!event.body) {
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing request body' }, corsResponseHeaders());
    }

    let parsed: Record<string, string>;
    try { parsed = JSON.parse(event.body) as Record<string, string>; }
    catch { return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Invalid JSON' }, corsResponseHeaders()); }

    const { code, code_verifier, redirect_uri } = parsed;
    if (!code || !code_verifier || !redirect_uri) {
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing code, code_verifier, or redirect_uri' }, corsResponseHeaders());
    }

    const cognitoDomain = process.env.COGNITO_DOMAIN;
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!cognitoDomain || !clientId) {
      throw new Error('COGNITO_DOMAIN and COGNITO_CLIENT_ID must be set');
    }

    const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, redirect_uri, code_verifier }),
    });

    if (!response.ok) {
      console.error('Code exchange failed:', response.status);
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Code exchange failed' }, corsResponseHeaders());
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      statusCode: 200,
      headers: corsResponseHeaders(),
      multiValueHeaders: { 'Set-Cookie': [createRefreshCookie(data.refresh_token as string)] },
      body: JSON.stringify({ access_token: data.access_token, id_token: data.id_token, expires_in: data.expires_in }),
    };
  } catch (error) {
    console.error('Exchange code error:', error);
    return createLambdaResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: 'Token exchange failed' }, corsResponseHeaders());
  }
}
