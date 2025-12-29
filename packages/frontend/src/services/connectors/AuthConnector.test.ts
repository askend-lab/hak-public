import { describe, it, expect } from 'vitest';

import type { AuthConnector } from './AuthConnector';
import { createMockAuthConnector } from './mocks/MockAuthConnector';

describe('AuthConnector', () => {
  describe('login', () => {
    it('returns user object for given userId', async () => {
      const connector: AuthConnector = createMockAuthConnector();
      
      const user = await connector.login('alice@test.com');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('alice@test.com');
    });

    it('sets authenticated state to true', async () => {
      const connector = createMockAuthConnector();
      
      expect(connector.isAuthenticated()).toBe(false);
      await connector.login('alice@test.com');
      expect(connector.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears session and sets authenticated to false', async () => {
      const connector = createMockAuthConnector();
      
      await connector.login('alice@test.com');
      expect(connector.isAuthenticated()).toBe(true);
      
      await connector.logout();
      expect(connector.isAuthenticated()).toBe(false);
    });

    it('clears current user', async () => {
      const connector = createMockAuthConnector();
      
      await connector.login('alice@test.com');
      expect(connector.getCurrentUser()).not.toBeNull();
      
      await connector.logout();
      expect(connector.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false initially', () => {
      const connector = createMockAuthConnector();
      expect(connector.isAuthenticated()).toBe(false);
    });

    it('returns true after login', async () => {
      const connector = createMockAuthConnector();
      await connector.login('user@test.com');
      expect(connector.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when not authenticated', () => {
      const connector = createMockAuthConnector();
      expect(connector.getCurrentUser()).toBeNull();
    });

    it('returns user after login', async () => {
      const connector = createMockAuthConnector();
      await connector.login('bob@test.com');
      
      const user = connector.getCurrentUser();
      expect(user?.email).toBe('bob@test.com');
    });
  });
});
