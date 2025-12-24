import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from '../keys';

describe('keys', () => {
  describe('buildUserPK', () => {
    it('should build user partition key with USER# prefix', () => {
      expect(buildUserPK('user123')).toBe('USER#user123');
      expect(buildUserPK('')).toBe('USER#');
      expect(buildUserPK('user-with-dash')).toBe('USER#user-with-dash');
    });
  });

  describe('buildTaskSK', () => {
    it('should build task sort key with TASK# prefix', () => {
      expect(buildTaskSK('task456')).toBe('TASK#task456');
      expect(buildTaskSK('')).toBe('TASK#');
      expect(buildTaskSK('task-with-underscore')).toBe('TASK#task-with-underscore');
    });
  });

  describe('TASK_SK_PREFIX', () => {
    it('should be TASK#', () => {
      expect(TASK_SK_PREFIX).toBe('TASK#');
    });
  });
});
