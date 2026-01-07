const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD || false;
// eslint-disable-next-line no-restricted-globals
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');

// Cognito configuration for Hosted UI
// Using centralized askend-lab-users pool with Google login
export const cognitoConfig = {
  region: 'eu-west-1',
  userPoolId: 'eu-west-1_wlRtuLkG2',
  clientId: '64tf6nf61n6sgftqif6q975hka',
  
  // Hosted UI domain (centralized)
  domain: 'askend-lab-auth.auth.eu-west-1.amazoncognito.com',
  
  // Callback URLs
  redirectUri: isDev 
    ? 'http://localhost:5180/auth/callback'
    : isProd 
      ? 'https://hak.askend-lab.com/auth/callback'
      : 'https://hak-dev.askend-lab.com/auth/callback',
  
  logoutUri: isDev
    ? 'http://localhost:5180'
    : isProd
      ? 'https://hak.askend-lab.com'
      : 'https://hak-dev.askend-lab.com',
  
  // OAuth scopes
  scopes: ['email', 'openid', 'profile'],
};

// PKCE helpers for secure authorization code flow
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Build Hosted UI URLs
export async function getLoginUrl(): Promise<string> {
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    response_type: 'code',
    scope: cognitoConfig.scopes.join(' '),
    redirect_uri: cognitoConfig.redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://${cognitoConfig.domain}/login?${params.toString()}`;
}

export function getLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    logout_uri: cognitoConfig.logoutUri,
  });
  return `https://${cognitoConfig.domain}/logout?${params.toString()}`;
}

// Exchange authorization code for tokens (PKCE flow)
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    console.error('[Auth] Missing PKCE code verifier - was login initiated from this tab?');
    return null;
  }

  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: cognitoConfig.clientId,
    code,
    redirect_uri: cognitoConfig.redirectUri,
    code_verifier: codeVerifier,
  });

  console.log('[Auth] Token exchange request:', {
    url: `https://${cognitoConfig.domain}/oauth2/token`,
    redirect_uri: cognitoConfig.redirectUri,
    code: code.substring(0, 10) + '...',
    verifier_length: codeVerifier.length,
  });

  try {
    const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Auth] Token exchange failed:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    sessionStorage.removeItem('pkce_code_verifier'); // Clean up

    console.log('[Auth] Token exchange successful, got refresh_token:', !!data.refresh_token);

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('[Auth] Token exchange error:', error);
    return null;
  }
}
