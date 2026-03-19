import * as jose from 'jose';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { logger } from '@hak/shared';
import { TaraIdToken, TaraTokens } from './types';
import { getFrontendUrl } from './cookies';

export const DEFAULT_TARA_ISSUER = 'https://tara-test.ria.ee';
export const TARA_CALLBACK_PATH = '/auth/tara/callback';
export const DEFAULT_CALLBACK_URL = `${getFrontendUrl()}${TARA_CALLBACK_PATH}`;
export const OIDC_AUTHORIZE_PATH = '/oidc/authorize';
export const OIDC_TOKEN_PATH = '/oidc/token';
export const OIDC_JWKS_PATH = '/oidc/jwks';
export const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
export const UI_LOCALE = 'et';

interface TaraClient {
  buildAuthorizationUrl(state: string, nonce: string): string;
  exchangeCodeForTokens(code: string): Promise<TaraTokens>;
  verifyIdToken(idToken: string, expectedNonce: string): Promise<TaraIdToken>;
}

interface TaraSecrets {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

// Cache secrets for Lambda container lifetime
let cachedSecrets: TaraSecrets | null = null;

function pickSecretValue(secret: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) { if (secret[key]) {return secret[key];} }
  return '';
}

async function loadFromSecretsManager(arn: string): Promise<TaraSecrets> {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'eu-west-1' });
  const result = await client.send(new GetSecretValueCommand({ SecretId: arn }));
  const secret = JSON.parse(result.SecretString || '{}') as Record<string, string>;
  return {
    clientId: pickSecretValue(secret, 'TARA_CLIENT_ID', 'tara-client-id'),
    clientSecret: pickSecretValue(secret, 'TARA_CLIENT_SECRET', 'tara-client-secret'),
    callbackUrl: pickSecretValue(secret, 'TARA_CALLBACK_URL', 'tara-callback-url') || DEFAULT_CALLBACK_URL,
  };
}

function loadFromEnvVars(): TaraSecrets {
  const isDev = process.env.STAGE === 'dev' || process.env.IS_OFFLINE === 'true';
  if (!isDev) {
    throw new Error('TARA_SECRETS_ARN must be set in non-dev environments');
  }
  return {
    clientId: process.env.TARA_CLIENT_ID || '',
    clientSecret: process.env.TARA_CLIENT_SECRET || '',
    callbackUrl: process.env.TARA_CALLBACK_URL || DEFAULT_CALLBACK_URL,
  };
}

async function loadTaraSecrets(): Promise<TaraSecrets> {
  if (cachedSecrets) {return cachedSecrets;}
  const secretsArn = process.env.TARA_SECRETS_ARN;
  // eslint-disable-next-line require-atomic-updates -- singleton cache, no concurrent writes
  cachedSecrets = secretsArn
    ? await loadFromSecretsManager(secretsArn)
    : loadFromEnvVars();
  return cachedSecrets;
}

/** @internal Reset secrets cache — for testing only */
export function _resetSecretsCache(): void {
  cachedSecrets = null;
}

interface TaraClientConfig {
  readonly issuer: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly callbackUrl: string;
}

async function exchangeCode(config: TaraClientConfig, code: string): Promise<TaraTokens> {
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: config.callbackUrl });
  const response = await fetch(`${config.issuer}${OIDC_TOKEN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': CONTENT_TYPE_FORM_URLENCODED, Authorization: `Basic ${credentials}` },
    body: body.toString(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    logger.error('TARA token exchange failed', { status: response.status });
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }
  return response.json() as Promise<TaraTokens>;
}

interface VerifyTokenInput {
  readonly jwks: Parameters<typeof jose.jwtVerify>[1];
  readonly issuer: string;
  readonly clientId: string;
}

async function verifyToken(
  idToken: string,
  expectedNonce: string,
  input: VerifyTokenInput,
): Promise<TaraIdToken> {
  const { payload } = await jose.jwtVerify(idToken, input.jwks, { issuer: input.issuer, audience: input.clientId });
  if (payload.nonce !== expectedNonce) {
    logger.error('TARA nonce mismatch');
    throw new Error('Nonce mismatch in TARA id_token');
  }
  return payload as unknown as TaraIdToken;
}

export async function createTaraClient(): Promise<TaraClient> {
  const issuer = process.env.TARA_ISSUER || DEFAULT_TARA_ISSUER;
  const secrets = await loadTaraSecrets();
  const JWKS = jose.createRemoteJWKSet(new URL(`${issuer}${OIDC_JWKS_PATH}`));
  return {
    buildAuthorizationUrl(state: string, nonce: string): string {
      const params = new URLSearchParams({
        response_type: 'code', client_id: secrets.clientId, redirect_uri: secrets.callbackUrl,
        scope: 'openid', state, nonce, ui_locales: UI_LOCALE,
      });
      return `${issuer}${OIDC_AUTHORIZE_PATH}?${params.toString()}`;
    },
    exchangeCodeForTokens: (code: string) => exchangeCode({ issuer, ...secrets }, code),
    verifyIdToken: (idToken: string, expectedNonce: string) => verifyToken(idToken, expectedNonce, { jwks: JWKS, issuer, clientId: secrets.clientId }),
  };
}
