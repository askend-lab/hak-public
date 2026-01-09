import { AuthStorage } from '../storage';

import type { User } from '../types';

describe('AuthStorage', () => {
  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    // Clear storage before each test
    AuthStorage.clear();
  });

  describe('getUser', () => {
    it('should return null when no user is stored', () => {
      expect(AuthStorage.getUser()).toBeNull();
    });

    it('should return the stored user', () => {
      AuthStorage.setUser(mockUser);
      expect(AuthStorage.getUser()).toStrictEqual(mockUser);
    });
  });

  describe('setUser', () => {
    it('should store the user', () => {
      AuthStorage.setUser(mockUser);
      expect(AuthStorage.getUser()).toStrictEqual(mockUser);
    });

    it('should overwrite existing user', () => {
      const anotherUser: User = {
        id: 'user456',
        email: 'another@example.com',
        name: 'Another User',
      };
      
      AuthStorage.setUser(mockUser);
      AuthStorage.setUser(anotherUser);
      expect(AuthStorage.getUser()).toStrictEqual(anotherUser);
    });
  });

  describe('clear', () => {
    it('should clear the stored user', () => {
      AuthStorage.setUser(mockUser);
      AuthStorage.clear();
      expect(AuthStorage.getUser()).toBeNull();
    });

    it('should do nothing when no user is stored', () => {
      AuthStorage.clear();
      expect(AuthStorage.getUser()).toBeNull();
    });

    it('should clear Cognito-related keys', () => {
      localStorage.setItem('CognitoIdentityServiceProvider.abc123.user', 'test');
      localStorage.setItem('CognitoIdentityServiceProvider.def456.token', 'test');
      localStorage.setItem('other_key', 'should_remain');
      
      AuthStorage.clear();
      
      expect(localStorage.getItem('CognitoIdentityServiceProvider.abc123.user')).toBeNull();
      expect(localStorage.getItem('CognitoIdentityServiceProvider.def456.token')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('should_remain');
    });
  });

  describe('getAccessToken', () => {
    it('should return null when no token is stored', () => {
      expect(AuthStorage.getAccessToken()).toBeNull();
    });

    it('should return the stored access token', () => {
      AuthStorage.setAccessToken('test-access-token');
      expect(AuthStorage.getAccessToken()).toBe('test-access-token');
    });
  });

  describe('setAccessToken', () => {
    it('should store the access token', () => {
      AuthStorage.setAccessToken('my-token');
      expect(AuthStorage.getAccessToken()).toBe('my-token');
    });
  });

  describe('getIdToken', () => {
    it('should return null when no token is stored', () => {
      expect(AuthStorage.getIdToken()).toBeNull();
    });

    it('should return the stored id token', () => {
      AuthStorage.setIdToken('test-id-token');
      expect(AuthStorage.getIdToken()).toBe('test-id-token');
    });
  });

  describe('setIdToken', () => {
    it('should store the id token', () => {
      AuthStorage.setIdToken('my-id-token');
      expect(AuthStorage.getIdToken()).toBe('my-id-token');
    });
  });
});
