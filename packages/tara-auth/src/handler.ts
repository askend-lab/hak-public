import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createTaraClient } from './tara-client';
import { createCognitoClient } from './cognito-client';
import { AuthState } from './types';
import * as crypto from 'crypto';

export const STATE_COOKIE_NAME = 'tara_auth_state';
export const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const REFRESH_TOKEN_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days
export const AUTH_CALLBACK_PATH = '/auth/callback';

export function getFrontendUrl(): string {
  const stage = process.env.STAGE || 'dev';
  return stage === 'prod'
    ? process.env.FRONTEND_URL_PROD || 'https://hak.askend-lab.com'
    : process.env.FRONTEND_URL_DEV || 'https://hak-dev.askend-lab.com';
}

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
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

    const state = generateRandomString(32);
    const nonce = generateRandomString(32);
    
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
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to start TARA authentication' }),
    };
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

    console.log('TARA authentication successful for:', taraIdToken.sub);

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
  
  // Token cookies - HttpOnly, Secure, SameSite=Strict
  const cookieOptions = 'HttpOnly; Secure; SameSite=Strict; Path=/';
  const maxAge = tokens.expiresIn;
  const refreshMaxAge = REFRESH_TOKEN_MAX_AGE_S;

  const cookies = [
    `access_token=${tokens.accessToken}; ${cookieOptions}; Max-Age=${maxAge}`,
    `id_token=${tokens.idToken}; ${cookieOptions}; Max-Age=${maxAge}`,
    `refresh_token=${tokens.refreshToken}; ${cookieOptions}; Max-Age=${refreshMaxAge}`,
    // is_authenticated is NOT HttpOnly so frontend JS can check auth state
    `is_authenticated=true; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`,
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
