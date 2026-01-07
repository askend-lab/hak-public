import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth/context';

/**
 * Handles OAuth callback from Cognito Hosted UI.
 * Supports both authorization code flow (PKCE) and implicit flow (legacy).
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleCallback, handleCodeCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false); // Prevent double processing

  useEffect(() => {
    async function processCallback() {
      // Prevent double processing (React StrictMode, HMR, etc.)
      if (processedRef.current) return;
      processedRef.current = true;

      // Check for authorization code in query params (PKCE flow)
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      
      if (code && handleCodeCallback) {
        const success = await handleCodeCallback(code);
        if (success) {
          navigate('/', { replace: true });
          return;
        } else {
          setError('Failed to exchange authorization code');
          return;
        }
      }

      // Fallback: Check for tokens in hash (implicit flow - legacy)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      const accessToken = hashParams.get('access_token');
      const idToken = hashParams.get('id_token');
      const expiresIn = hashParams.get('expires_in');
      
      if (accessToken && idToken && handleCallback) {
        handleCallback({ accessToken, idToken, expiresIn: Number(expiresIn) });
        navigate('/', { replace: true });
        return;
      }

      // Check for errors
      const errorParam = queryParams.get('error') || hashParams.get('error');
      const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
      if (errorParam) {
        console.error('Auth callback error:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        return;
      }

      // No code or tokens found
      navigate('/', { replace: true });
    }
    
    void processCallback();
  }, [handleCallback, handleCodeCallback, navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'red' }}>Login failed: {error}</p>
        <button onClick={() => navigate('/', { replace: true })}>Go to Home</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Logging in...</p>
    </div>
  );
}
