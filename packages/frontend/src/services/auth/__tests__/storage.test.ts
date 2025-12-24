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
  });
});
