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

// Build Hosted UI URLs
export function getLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    response_type: 'token',
    scope: cognitoConfig.scopes.join(' '),
    redirect_uri: cognitoConfig.redirectUri,
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
