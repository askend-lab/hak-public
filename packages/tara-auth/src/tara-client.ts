import * as jose from 'jose';
import { TaraIdToken, TaraTokens } from './types';

export const DEFAULT_TARA_ISSUER = 'https://tara-test.ria.ee';
export const DEFAULT_CALLBACK_URL = 'https://auth.askend-lab.com/auth/tara/callback';
export const OIDC_AUTHORIZE_PATH = '/oidc/authorize';
export const OIDC_TOKEN_PATH = '/oidc/token';
export const OIDC_JWKS_PATH = '/oidc/jwks';
export const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
export const UI_LOCALE = 'et';

export interface TaraClient {
  buildAuthorizationUrl(state: string, nonce: string): string;
  exchangeCodeForTokens(code: string): Promise<TaraTokens>;
  verifyIdToken(idToken: string, expectedNonce: string): Promise<TaraIdToken>;
}

export async function createTaraClient(): Promise<TaraClient> {
  const issuer = process.env.TARA_ISSUER || DEFAULT_TARA_ISSUER;
  const clientId = process.env.TARA_CLIENT_ID || '';
  const clientSecret = process.env.TARA_CLIENT_SECRET || '';
  const callbackUrl = process.env.TARA_CALLBACK_URL || DEFAULT_CALLBACK_URL;

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
        throw new Error('Nonce mismatch in TARA id_token');
      }

      return payload as unknown as TaraIdToken;
    },
  };
}
