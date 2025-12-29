export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * AuthConnector interface for authentication operations.
 * Abstracts Cognito internals from Gherkin tests.
 */
export interface AuthConnector {
  /**
   * Login with user ID (e.g., isikukood or email)
   */
  login(userId: string): Promise<User>;

  /**
   * Logout and clear session
   */
  logout(): Promise<void>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null;
}

/**
 * Extended interface for mock connectors
 */
export interface MockableAuthConnector extends AuthConnector {
  reset(): void;
}
