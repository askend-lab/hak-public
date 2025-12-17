import { AuthStorage } from './storage';

describe('AuthStorage', () => {
  beforeEach(() => {
    AuthStorage.clear();
  });

  describe('getUser', () => {
    it('should return null when no user stored', () => {
      expect(AuthStorage.getUser()).toBeNull();
    });

    it('should return stored user', () => {
      const user = { id: '123', email: 'test@example.com' };
      AuthStorage.setUser(user);
      expect(AuthStorage.getUser()).toEqual(user);
    });
  });

  describe('setUser', () => {
    it('should store user in memory', () => {
      const user = { id: '456', email: 'another@example.com' };
      AuthStorage.setUser(user);
      expect(AuthStorage.getUser()).toEqual(user);
    });
  });

  describe('clear', () => {
    it('should remove user from memory', () => {
      AuthStorage.setUser({ id: '123', email: 'test@example.com' });
      AuthStorage.clear();
      expect(AuthStorage.getUser()).toBeNull();
    });
  });
});
