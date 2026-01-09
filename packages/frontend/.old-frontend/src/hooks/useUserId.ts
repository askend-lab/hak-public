import { useAuth } from '../services/auth'

const DEFAULT_USER_ID = 'test-user'

/**
 * Returns the current user's ID or a default fallback.
 * Centralizes the user ID retrieval logic to avoid repetition.
 */
export function useUserId(): string {
  const { user } = useAuth()
  return user?.id ?? DEFAULT_USER_ID
}
