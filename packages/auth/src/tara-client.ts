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

async function loadTaraSecrets(): Promise<TaraSecrets> {
  if (cachedSecrets) {return cachedSecrets;}

  const secretsArn = process.env.TARA_SECRETS_ARN;
  if (secretsArn) {
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'eu-west-1' });
    const result = await client.send(new GetSecretValueCommand({ SecretId: secretsArn }));
    const secret = JSON.parse(result.SecretString || '{}') as Record<string, string>;
    // eslint-disable-next-line require-atomic-updates -- singleton cache, no concurrent writes
    cachedSecrets = {
      clientId: secret.TARA_CLIENT_ID || '',
      clientSecret: secret.TARA_CLIENT_SECRET || '',
      callbackUrl: secret.TARA_CALLBACK_URL || DEFAULT_CALLBACK_URL,
    };
  } else {
    const isDev = process.env.STAGE === 'dev' || process.env.IS_OFFLINE === 'true';
    if (!isDev) {
      throw new Error('TARA_SECRETS_ARN must be set in non-dev environments');
    }
    // Fallback to env vars for local development only
     
    cachedSecrets = {
      clientId: process.env.TARA_CLIENT_ID || '',
      clientSecret: process.env.TARA_CLIENT_SECRET || '',
      callbackUrl: process.env.TARA_CALLBACK_URL || DEFAULT_CALLBACK_URL,
    };
  }

  return cachedSecrets;
}

/** @internal Reset secrets cache — for testing only */
export function _resetSecretsCache(): void {
  cachedSecrets = null;
}

export async function createTaraClient(): Promise<TaraClient> {
  const issuer = process.env.TARA_ISSUER || DEFAULT_TARA_ISSUER;
  const { clientId, clientSecret, callbackUrl } = await loadTaraSecrets();

  const JWKS = jose.createRemoteJWKSet(new URL(`${issuer}${OIDC_JWKS_PATH}`));

  return {
    buildAuthorizationUrl(state: string, nonce: string): string {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'openid',
        state,
        nonce,
        ui_locales: UI_LOCALE,
      });
      return `${issuer}${OIDC_AUTHORIZE_PATH}?${params.toString()}`;
    },

    async exchangeCodeForTokens(code: string): Promise<TaraTokens> {
      const tokenUrl = `${issuer}${OIDC_TOKEN_PATH}`;
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': CONTENT_TYPE_FORM_URLENCODED,
          Authorization: `Basic ${credentials}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('TARA token exchange failed', { status: response.status });
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      return response.json() as Promise<TaraTokens>;
    },

    async verifyIdToken(idToken: string, expectedNonce: string): Promise<TaraIdToken> {
      const { payload } = await jose.jwtVerify(idToken, JWKS, {
        issuer,
        audience: clientId,
      });

      if (payload.nonce !== expectedNonce) {
        logger.error('TARA nonce mismatch');
        throw new Error('Nonce mismatch in TARA id_token');
      }

      return payload as unknown as TaraIdToken;
    },
  };
}
