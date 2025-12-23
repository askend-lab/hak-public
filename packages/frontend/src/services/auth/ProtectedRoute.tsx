import { ReactNode } from 'react';

import { useAuth } from './context';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, fallback, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback !== undefined ? <>{fallback}</> : <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Store return URL for post-login redirect
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      window.location.href = redirectTo;
    }
    return null;
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
