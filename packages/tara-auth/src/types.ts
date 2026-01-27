export interface TaraIdToken {
  sub: string; // Personal code (isikukood) e.g., "EE38001085718"
  given_name: string;
  family_name: string;
  date_of_birth?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  amr: string[]; // Authentication methods used
  acr: string; // Level of assurance
  at_hash?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  nonce?: string;
  state?: string;
  jti?: string;
}

export interface TaraTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  state: string;
  nonce: string;
  redirectUri: string;
  createdAt: number;
}

export interface TaraConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}
