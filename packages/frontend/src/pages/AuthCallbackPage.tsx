 
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleCodeCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    async function processCallback() {
      if (processedRef.current) return;
      processedRef.current = true;

      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      
      if (code) {
        const success = await handleCodeCallback(code);
        if (success) {
          navigate('/', { replace: true });
          return;
        } else {
          setError('Autentimise viga. Palun proovi uuesti.');
          return;
        }
      }

      const errorParam = queryParams.get('error');
      const errorDescription = queryParams.get('error_description');
      if (errorParam) {
        console.error('Auth callback error:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        return;
      }

      navigate('/', { replace: true });
    }
    
    void processCallback();
  }, [handleCodeCallback, navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <p style={{ color: 'var(--color-error, red)' }}>Sisselogimine ebaõnnestus: {error}</p>
        <button 
          onClick={() => navigate('/', { replace: true })}
          className="button button--primary"
        >
          Tagasi avalehele
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="loader-spinner" style={{ width: 48, height: 48 }}></div>
      <p style={{ marginLeft: '1rem' }}>Sisenen...</p>
    </div>
  );
}
