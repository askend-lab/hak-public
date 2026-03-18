import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CORS_HEADERS, HTTP_STATUS, createLambdaResponse, getCorsOrigin, logger, extractErrorMessage } from '@hak/shared';
import { createTaraClient } from './tara-client';
import { createStateCookie, getFrontendUrl, clearStateCookie, parseRefreshCookie } from './cookies';
import { corsResponseHeaders, validateCsrfOrigin, getRequestOrigin } from './middleware';

import {
  buildAuthState,
  redirectWithCookie,
  validateCallbackState,
  processCallback,
  redirectToFrontend,
  redirectToFrontendWithCookies,
  refreshFailedResponse,
  executeRefresh,
  parseExchangeBody,
  executeCodeExchange,
} from './handler-helpers';

export * from './exports';

export async function startHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const log = logger.withContext({ handler: 'startHandler', requestId: event.requestContext?.requestId });
  try {
    const taraClient = await createTaraClient();
    const authState = buildAuthState();
    const authUrl = taraClient.buildAuthorizationUrl(authState.state, authState.nonce);
    return redirectWithCookie(authUrl, createStateCookie(authState));
  } catch (error) {
    log.error('TARA start error:', extractErrorMessage(error));
    return createLambdaResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { error: 'Failed to start TARA authentication' },
      { ...CORS_HEADERS, "Access-Control-Allow-Origin": getCorsOrigin() },
    );
  }
}

function checkCallbackParams(
  event: APIGatewayProxyEvent,
  frontendUrl: string,
  log: ReturnType<typeof logger.withContext>,
): APIGatewayProxyResult | { code: string; state: string } {
  const { code, state, error, error_description } = event.queryStringParameters || {};
  if (error) {
    log.error('TARA error:', error, error_description);
    return redirectToFrontend(frontendUrl, { error: error_description || error });
  }
  if (!code || !state) {
    return redirectToFrontend(frontendUrl, { error: 'Missing code or state' });
  }
  return { code, state };
}

async function handleCallbackSuccess(
  event: APIGatewayProxyEvent,
  frontendUrl: string,
  log: ReturnType<typeof logger.withContext>,
): Promise<APIGatewayProxyResult> {
  const params = checkCallbackParams(event, frontendUrl, log);
  if ('statusCode' in params) {return params;}
  const stateResult = validateCallbackState(event, params.state);
  if (typeof stateResult === 'string') {
    return redirectToFrontend(frontendUrl, { error: stateResult });
  }
  log.info('TARA authentication successful');
  return redirectToFrontendWithCookies(frontendUrl, await processCallback(params.code, stateResult));
}

export async function callbackHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const log = logger.withContext({ handler: 'callbackHandler', requestId: event.requestContext?.requestId });
  const frontendUrl = getFrontendUrl();
  try {
    return await handleCallbackSuccess(event, frontendUrl, log);
  } catch (error) {
    log.error('TARA callback error:', extractErrorMessage(error));
    return redirectToFrontend(frontendUrl, { error: 'Authentication failed - please try again' }, clearStateCookie());
  }
}

function checkCorsPrereqs(event: APIGatewayProxyEvent): APIGatewayProxyResult | null {
  const origin = getRequestOrigin(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsResponseHeaders(origin), body: '' };
  }
  if (!validateCsrfOrigin(event)) {
    return createLambdaResponse(HTTP_STATUS.FORBIDDEN, { error: 'Invalid origin' }, corsResponseHeaders(origin));
  }
  return null;
}

async function handleRefreshBody(
  event: APIGatewayProxyEvent,
  log: ReturnType<typeof logger.withContext>,
): Promise<APIGatewayProxyResult> {
  const origin = getRequestOrigin(event);
  try {
    const token = parseRefreshCookie(event.headers.Cookie || event.headers.cookie);
    if (!token) {
      return createLambdaResponse(HTTP_STATUS.UNAUTHORIZED, { error: 'No refresh token' }, corsResponseHeaders(origin));
    }
    return await executeRefresh(token, origin);
  } catch (error) {
    log.error('Refresh error:', extractErrorMessage(error));
    return refreshFailedResponse(origin);
  }
}

export async function refreshHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const prereq = checkCorsPrereqs(event);
  if (prereq) {return prereq;}
  const log = logger.withContext({ handler: 'refreshHandler', requestId: event.requestContext?.requestId });
  return handleRefreshBody(event, log);
}

async function handleExchangeBody(
  event: APIGatewayProxyEvent,
  log: ReturnType<typeof logger.withContext>,
): Promise<APIGatewayProxyResult> {
  const origin = getRequestOrigin(event);
  try {
    const bodyResult = parseExchangeBody(event, origin);
    if ('statusCode' in bodyResult) {return bodyResult;}
    return await executeCodeExchange({ code: bodyResult.code, codeVerifier: bodyResult.code_verifier, log, requestOrigin: origin });
  } catch (error) {
    log.error('Exchange code error:', extractErrorMessage(error));
    return createLambdaResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: 'Token exchange failed' }, corsResponseHeaders(origin));
  }
}

export async function exchangeCodeHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const prereq = checkCorsPrereqs(event);
  if (prereq) {return prereq;}
  const log = logger.withContext({ handler: 'exchangeCodeHandler', requestId: event.requestContext?.requestId });
  return handleExchangeBody(event, log);
}

export function healthHandler(): APIGatewayProxyResult {
  return createLambdaResponse(HTTP_STATUS.OK, { status: 'ok' }, corsResponseHeaders());
}
