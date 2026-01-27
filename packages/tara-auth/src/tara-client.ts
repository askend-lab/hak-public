import * as jose from 'jose';
import { TaraConfig, TaraIdToken, TaraTokenResponse } from './types';

export class TaraClient {
  private config: TaraConfig;
  private jwksUri: string;
  private tokenEndpoint: string;
  private authorizationEndpoint: string;

  constructor(config: TaraConfig) {
    this.config = config;
    this.jwksUri = `${config.issuer}/.well-known/openid-configuration`;
    this.tokenEndpoint = `${config.issuer}/token`;
    this.authorizationEndpoint = `${config.issuer}/authorize`;
  }

  buildAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid',
      state,
      nonce,
    });
    return `${this.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TaraTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TARA token exchange failed: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<TaraTokenResponse>;
  }

  async verifyIdToken(idToken: string, nonce: string): Promise<TaraIdToken> {
    const JWKS = jose.createRemoteJWKSet(new URL(`${this.config.issuer}/jwks`));

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: this.config.issuer,
      audience: this.config.clientId,
    });

    if (payload.nonce !== nonce) {
      throw new Error('Invalid nonce in ID token');
    }

    return payload as unknown as TaraIdToken;
  }

  extractPersonalCode(sub: string): { countryCode: string; personalCode: string } {
    // TARA sub format: "EE38001085718" (country code + personal code)
    const countryCode = sub.substring(0, 2);
    const personalCode = sub.substring(2);
    return { countryCode, personalCode };
  }
}

export function createTaraClient(): TaraClient {
  const config: TaraConfig = {
    issuer: process.env.TARA_ISSUER || 'https://tara-test.ria.ee/oidc',
    clientId: process.env.TARA_CLIENT_ID || '',
    clientSecret: process.env.TARA_CLIENT_SECRET || '',
    redirectUri: getRedirectUri(),
  };

  if (!config.clientId || !config.clientSecret) {
    throw new Error('TARA_CLIENT_ID and TARA_CLIENT_SECRET must be set');
  }

  return new TaraClient(config);
}

function getRedirectUri(): string {
  const stage = process.env.STAGE || 'dev';
  const domain = stage === 'prod' 
    ? 'hak-api.askend-lab.com' 
    : 'hak-api-dev.askend-lab.com';
  return `https://${domain}/auth/tara/callback`;
}
