import * as jose from 'jose';
import { TaraIdToken, TaraTokens } from './types';

interface TaraClient {
  buildAuthorizationUrl(state: string, nonce: string): string;
  exchangeCodeForTokens(code: string): Promise<TaraTokens>;
  verifyIdToken(idToken: string, expectedNonce: string): Promise<TaraIdToken>;
}

export async function createTaraClient(): Promise<TaraClient> {
  const issuer = process.env.TARA_ISSUER || 'https://tara-test.ria.ee';
  const clientId = process.env.TARA_CLIENT_ID || '';
  const clientSecret = process.env.TARA_CLIENT_SECRET || '';
  const callbackUrl = process.env.TARA_CALLBACK_URL || 'https://auth.askend-lab.com/auth/tara/callback';

  const JWKS = jose.createRemoteJWKSet(new URL(`${issuer}/oidc/jwks`));

  return {
    buildAuthorizationUrl(state: string, nonce: string): string {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'openid',
        state,
        nonce,
        ui_locales: 'et',
      });
      return `${issuer}/oidc/authorize?${params.toString()}`;
    },

    async exchangeCodeForTokens(code: string): Promise<TaraTokens> {
      const tokenUrl = `${issuer}/oidc/token`;
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
