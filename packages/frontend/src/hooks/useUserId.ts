import { useAuth } from '@/services/auth';

/**
 * Get the current user ID or fallback to test user
 * Simplifies the repeated pattern: user?.id ?? 'test-user'
 */
export function useUserId(): string {
  const { user } = useAuth();
  return user?.id ?? 'test-user';
}
