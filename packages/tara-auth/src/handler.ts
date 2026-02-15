import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CORS_HEADERS, HTTP_STATUS, createLambdaResponse, getCorsOrigin } from '@hak/shared';
import { createTaraClient } from './tara-client';
import { createCognitoClient } from './cognito-client';
import { AuthState } from './types';

import {
  STATE_TTL_MS,
  getFrontendUrl,
  createStateCookie,
  parseStateCookie,
  clearStateCookie,
  createRefreshCookie,
  clearRefreshCookie,
  parseRefreshCookie,
  createAccessTokenCookie,
  createIdTokenCookie,
} from './cookies';

import {
  AUTH_CALLBACK_PATH,
  RANDOM_STRING_LENGTH,
  MAX_BODY_SIZE,
  generateRandomString,
  corsResponseHeaders,
  validateCsrfOrigin,
  requireCognitoConfig,
} from './middleware';

// Re-export everything from cookies and middleware for backward compatibility
export {
  STATE_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_NAME,
  ID_TOKEN_COOKIE_NAME,
  STATE_TTL_MS,
  REFRESH_TOKEN_MAX_AGE_S,
  SHORT_TOKEN_MAX_AGE_S,
  TOKEN_COOKIE_OPTIONS,
  DEFAULT_FRONTEND_URL_PROD,
  DEFAULT_FRONTEND_URL_DEV,
  getFrontendUrl,
  getCookieDomain,
  createStateCookie,
  parseStateCookie,
  clearStateCookie,
  createRefreshCookie,
  clearRefreshCookie,
  parseRefreshCookie,
  createAccessTokenCookie,
  createIdTokenCookie,
} from './cookies';

export {
  AUTH_CALLBACK_PATH,
  RANDOM_STRING_LENGTH,
  MAX_BODY_SIZE,
  generateRandomString,
  corsResponseHeaders,
  validateCsrfOrigin,
} from './middleware';

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
    console.error('TARA start error:', error instanceof Error ? error.message : 'Unknown error');
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
    console.error('TARA callback error:', error instanceof Error ? error.message : 'Unknown error');
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
  // Signal success without leaking tokens in URL
  url.searchParams.set('auth', 'success');

  // All tokens go in httpOnly cookies — never in URL params or JS
  const cookies = [
    createRefreshCookie(tokens.refreshToken),
    createAccessTokenCookie(tokens.accessToken),
    createIdTokenCookie(tokens.idToken),
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

  if (!validateCsrfOrigin(event)) {
    return createLambdaResponse(HTTP_STATUS.FORBIDDEN, { error: 'Invalid origin' }, corsResponseHeaders());
  }

  try {
    const refreshToken = parseRefreshCookie(event.headers.Cookie || event.headers.cookie);
    if (!refreshToken) {
      return createLambdaResponse(HTTP_STATUS.UNAUTHORIZED, { error: 'No refresh token' }, corsResponseHeaders());
    }

    const { cognitoDomain, clientId } = requireCognitoConfig();

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
    console.error('Refresh error:', error instanceof Error ? error.message : 'Unknown error');
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

  if (!validateCsrfOrigin(event)) {
    return createLambdaResponse(HTTP_STATUS.FORBIDDEN, { error: 'Invalid origin' }, corsResponseHeaders());
  }

  try {
    if (!event.body) {
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing request body' }, corsResponseHeaders());
    }

    if (event.body.length > MAX_BODY_SIZE) {
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Request body too large' }, corsResponseHeaders());
    }

    let parsed: Record<string, string>;
    try { parsed = JSON.parse(event.body) as Record<string, string>; }
    catch { return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Invalid JSON' }, corsResponseHeaders()); }

    const { code, code_verifier } = parsed;
    if (!code || !code_verifier) {
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing code or code_verifier' }, corsResponseHeaders());
    }

    const { cognitoDomain, clientId } = requireCognitoConfig();

    // Hardcode redirect_uri server-side — never trust client-supplied value
    const redirectUri = `${getFrontendUrl()}${AUTH_CALLBACK_PATH}`;

    const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, redirect_uri: redirectUri, code_verifier }),
    });

    if (!response.ok) {
      console.error('Code exchange failed:', response.status);
      return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Code exchange failed' }, corsResponseHeaders());
    }

    const data = await response.json() as Record<string, unknown>;
    const cookies = [
      createRefreshCookie(data.refresh_token as string),
      createAccessTokenCookie(data.access_token as string),
      createIdTokenCookie(data.id_token as string),
    ];
    return {
      statusCode: 200,
      headers: corsResponseHeaders(),
      multiValueHeaders: { 'Set-Cookie': cookies },
      body: JSON.stringify({ expires_in: data.expires_in }),
    };
  } catch (error) {
    console.error('Exchange code error:', error instanceof Error ? error.message : 'Unknown error');
    return createLambdaResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: 'Token exchange failed' }, corsResponseHeaders());
  }
}
