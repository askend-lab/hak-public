import type { MockableAuthConnector, User } from '../AuthConnector';

/**
 * Creates a mock AuthConnector for testing.
 * Tracks authentication state and returns configured users.
 */
export function createMockAuthConnector(): MockableAuthConnector {
  let currentUser: User | null = null;
  let authenticated = false;

  return {
    async login(userId: string): Promise<User> {
      const namePart = userId.split('@')[0];
      const user: User = {
        id: userId,
        email: userId,
        name: namePart ?? userId,
      };
      currentUser = user;
      authenticated = true;
      return user;
    },

    async logout(): Promise<void> {
      currentUser = null;
      authenticated = false;
    },

    isAuthenticated(): boolean {
      return authenticated;
    },

    getCurrentUser(): User | null {
      return currentUser;
    },

    reset(): void {
      currentUser = null;
      authenticated = false;
    },
  };
}
