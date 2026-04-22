// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HTTP_STATUS, createLambdaResponse, logger } from '@hak/shared';
import { AuthState } from './types';

import {
  STATE_TTL_MS,
  getFrontendUrl,
  parseStateCookie,
  clearStateCookie,
  createRefreshCookie,
  clearRefreshCookie,
  createAccessTokenCookie,
  createIdTokenCookie,
} from './cookies';

import {
  AUTH_CALLBACK_PATH,
  RANDOM_STRING_LENGTH,
  MAX_BODY_SIZE,
  generateRandomString,
  corsResponseHeaders,
  requireCognitoConfig,
} from './middleware';

import { createTaraClient } from './tara-client';
import { createCognitoClient } from './cognito-client';

export function buildAuthState(): AuthState {
  return {
    state: generateRandomString(RANDOM_STRING_LENGTH),
    nonce: generateRandomString(RANDOM_STRING_LENGTH),
    redirectUri: getFrontendUrl(),
    createdAt: Date.now(),
  };
}

export function redirectWithCookie(url: string, cookie: string): APIGatewayProxyResult {
  return {
    statusCode: 302,
    headers: { Location: url, 'Set-Cookie': cookie, 'Cache-Control': 'no-store' },
    body: '',
  };
}

export function validateCallbackState(
  event: APIGatewayProxyEvent,
  returnedState: string,
): AuthState | string {
  const saved = parseStateCookie(event.headers.Cookie || event.headers.cookie);
  if (!saved) {return 'Invalid session - please try again';}
  if (saved.state !== returnedState) {return 'State mismatch - possible CSRF attack';}
  if (Date.now() - saved.createdAt > STATE_TTL_MS) {return 'Session expired - please try again';}
  return saved;
}

export async function processCallback(
  code: string,
  savedState: AuthState,
): Promise<{ accessToken: string; idToken: string; refreshToken: string; expiresIn: number }> {
  const taraClient = await createTaraClient();
  const taraTokens = await taraClient.exchangeCodeForTokens(code);
  const taraIdToken = await taraClient.verifyIdToken(taraTokens.id_token, savedState.nonce);
  const cognitoClient = createCognitoClient();
  const username = await cognitoClient.findOrCreateUser(taraIdToken);
  return cognitoClient.generateTokens(username);
}

export function redirectToFrontend(
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
  return { statusCode: 302, headers, body: '' };
}

export function redirectToFrontendWithCookies(
  baseUrl: string,
  tokens: { accessToken: string; idToken: string; refreshToken: string; expiresIn: number }
): APIGatewayProxyResult {
  const url = new URL(AUTH_CALLBACK_PATH, baseUrl);
  url.searchParams.set('auth', 'success');
  const cookies = [
    createRefreshCookie(tokens.refreshToken),
    createAccessTokenCookie(tokens.accessToken),
    createIdTokenCookie(tokens.idToken),
    clearStateCookie(),
  ];
  return {
    statusCode: 302,
    headers: { Location: url.toString(), 'Cache-Control': 'no-store' },
    multiValueHeaders: { 'Set-Cookie': cookies },
    body: '',
  };
}

export function refreshFailedResponse(requestOrigin?: string): APIGatewayProxyResult {
  return {
    statusCode: 401,
    headers: corsResponseHeaders(requestOrigin),
    multiValueHeaders: { 'Set-Cookie': [clearRefreshCookie(requestOrigin)] },
    body: JSON.stringify({ error: 'Token refresh failed' }),
  };
}

export async function executeRefresh(
  refreshToken: string,
  requestOrigin?: string,
): Promise<APIGatewayProxyResult> {
  const { cognitoDomain, clientId } = requireCognitoConfig();
  const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', client_id: clientId, refresh_token: refreshToken }),
  });
  if (!response.ok) {return refreshFailedResponse(requestOrigin);}
  const data = await response.json() as Record<string, unknown>;
  return {
    statusCode: 200,
    headers: corsResponseHeaders(requestOrigin),
    body: JSON.stringify({ access_token: data.access_token, id_token: data.id_token }),
  };
}

function badRequest(error: string, requestOrigin?: string): APIGatewayProxyResult {
  return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error }, corsResponseHeaders(requestOrigin));
}

function safeParseJson(body: string): Record<string, string> | null {
  try { return JSON.parse(body) as Record<string, string>; }
  catch { return null; }
}

export function parseExchangeBody(
  event: APIGatewayProxyEvent,
  requestOrigin?: string,
): { code: string; code_verifier: string } | APIGatewayProxyResult {
  if (!event.body) {return badRequest('Missing request body', requestOrigin);}
  if (event.body.length > MAX_BODY_SIZE) {return badRequest('Request body too large', requestOrigin);}
  const parsed = safeParseJson(event.body);
  if (!parsed) {return badRequest('Invalid JSON', requestOrigin);}
  if (!parsed.code || !parsed.code_verifier) {return badRequest('Missing code or code_verifier', requestOrigin);}
  return { code: parsed.code, code_verifier: parsed.code_verifier };
}

interface CodeExchangeOptions {
  code: string;
  codeVerifier: string;
  log: ReturnType<typeof logger.withContext>;
  requestOrigin?: string;
}

export async function executeCodeExchange(
  options: CodeExchangeOptions,
): Promise<APIGatewayProxyResult> {
  const { code, codeVerifier, log, requestOrigin } = options;
  const { cognitoDomain, clientId } = requireCognitoConfig();
  const redirectUri = `${getFrontendUrl(requestOrigin)}${AUTH_CALLBACK_PATH}`;
  const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, redirect_uri: redirectUri, code_verifier: codeVerifier }),
  });
  if (!response.ok) {
    log.error('Code exchange failed:', response.status);
    return createLambdaResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Code exchange failed' }, corsResponseHeaders(requestOrigin));
  }
  const data = await response.json() as Record<string, unknown>;
  return {
    statusCode: 200,
    headers: corsResponseHeaders(requestOrigin),
    multiValueHeaders: { 'Set-Cookie': [
      createRefreshCookie(data.refresh_token as string, requestOrigin),
      createAccessTokenCookie(data.access_token as string, requestOrigin),
      createIdTokenCookie(data.id_token as string, requestOrigin),
    ] },
    body: JSON.stringify({ access_token: data.access_token, id_token: data.id_token, expires_in: data.expires_in }),
  };
}
