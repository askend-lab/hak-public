import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth/context';

/**
 * Handles OAuth callback from Cognito Hosted UI.
 * Parses tokens from URL hash and stores them.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');
    const expiresIn = params.get('expires_in');
    
    if (accessToken && idToken && handleCallback) {
      handleCallback({ accessToken, idToken, expiresIn: Number(expiresIn) });
      navigate('/', { replace: true });
    } else if (!accessToken || !idToken) {
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      console.error('Auth callback error:', error, errorDescription);
      navigate('/', { replace: true });
    }
  }, [handleCallback, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Logging in...</p>
    </div>
  );
}
