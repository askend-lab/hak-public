import { ReactNode, useEffect } from 'react';

import { useAuth } from './context';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      void login();
    }
  }, [isLoading, isAuthenticated, login]);

  if (isLoading) {
    return fallback !== undefined ? <>{fallback}</> : <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback !== undefined ? <>{fallback}</> : <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

export function useRequireAuth(): { isReady: boolean; userId: string | null } {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return {
    isReady: !isLoading && isAuthenticated,
    userId: user?.id ?? null,
  };
}
