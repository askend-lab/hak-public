import * as jose from 'jose';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { TaraConfig, TaraIdToken, TaraTokenResponse } from './types';

interface TaraSecrets {
  'tara-client-id': string;
  'tara-client-secret': string;
}

let cachedSecrets: TaraSecrets | null = null;

async function getTaraSecrets(): Promise<TaraSecrets> {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  const secretsArn = process.env.TARA_SECRETS_ARN;
  if (!secretsArn) {
    throw new Error('TARA_SECRETS_ARN environment variable is not set');
  }

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'eu-west-1' });
  const command = new GetSecretValueCommand({ SecretId: secretsArn });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error('Secret value is empty');
  }

  cachedSecrets = JSON.parse(response.SecretString) as TaraSecrets;
  return cachedSecrets;
}

export class TaraClient {
  private config: TaraConfig;
  private jwksUri: string;
  private tokenEndpoint: string;
  private authorizationEndpoint: string;

  constructor(config: TaraConfig) {
    this.config = config;
    // TARA OIDC endpoints are at /oidc/* but issuer claim is just the base URL
    this.jwksUri = `${config.issuer}/oidc/jwks`;
    this.tokenEndpoint = `${config.issuer}/oidc/token`;
    this.authorizationEndpoint = `${config.issuer}/oidc/authorize`;
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
    });

    // TARA requires client_secret_basic authentication (Basic Auth header)
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
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

export async function createTaraClient(): Promise<TaraClient> {
  const secrets = await getTaraSecrets();
  
  const config: TaraConfig = {
    issuer: process.env.TARA_ISSUER || 'https://tara-test.ria.ee/oidc',
    clientId: secrets['tara-client-id'],
    clientSecret: secrets['tara-client-secret'],
    redirectUri: getRedirectUri(),
  };

  if (!config.clientId || !config.clientSecret) {
    throw new Error('TARA credentials not found in Secrets Manager');
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
