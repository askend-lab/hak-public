const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;

// Cognito configuration for Hosted UI
export const cognitoConfig = {
  region: 'eu-west-1',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? 'eu-west-1_placeholder',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? 'placeholder',
  
  // Hosted UI domain
  domain: import.meta.env.VITE_COGNITO_DOMAIN ?? 'hak-dev.auth.eu-west-1.amazoncognito.com',
  
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
