import { AuthStorage } from './storage';

describe('AuthStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUser', () => {
    it('should return null when no user stored', () => {
      expect(AuthStorage.getUser()).toBeNull();
    });

    it('should return stored user', () => {
      const user = { id: '123', name: 'Test User' };
      localStorage.setItem('hak_auth', JSON.stringify(user));
      expect(AuthStorage.getUser()).toEqual(user);
    });

    it('should return null and clear storage on invalid JSON', () => {
      localStorage.setItem('hak_auth', 'invalid-json');
      expect(AuthStorage.getUser()).toBeNull();
      expect(localStorage.getItem('hak_auth')).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should store user in localStorage', () => {
      const user = { id: '456', name: 'Another User' };
      AuthStorage.setUser(user);
      expect(localStorage.getItem('hak_auth')).toBe(JSON.stringify(user));
    });
  });

  describe('clear', () => {
    it('should remove user from localStorage', () => {
      localStorage.setItem('hak_auth', '{"id":"123"}');
      AuthStorage.clear();
      expect(localStorage.getItem('hak_auth')).toBeNull();
    });
  });
});
