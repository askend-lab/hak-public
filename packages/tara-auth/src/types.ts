export interface AuthState {
  state: string;
  nonce: string;
  redirectUri: string;
  createdAt: number;
}

export interface TaraIdToken {
  sub: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string;
  amr: string[];
  acr: string;
}

export interface TaraTokens {
  id_token: string;
  access_token: string;
}

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const TARA_VERIFIED = 'TARA_VERIFIED';
export const FALLBACK_EMAIL_DOMAIN = 'tara.ee';

export function buildFallbackEmail(personalCode: string): string {
  return `${personalCode}@${FALLBACK_EMAIL_DOMAIN}`;
}
