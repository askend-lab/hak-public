import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from './keys';

describe('keys', () => {
  describe('buildUserPK', () => {
    it('should build user partition key with USER# prefix', () => {
      expect(buildUserPK('123')).toBe('USER#123');
    });

    it('should handle empty userId', () => {
      expect(buildUserPK('')).toBe('USER#');
    });
  });

  describe('buildTaskSK', () => {
    it('should build task sort key with TASK# prefix', () => {
      expect(buildTaskSK('456')).toBe('TASK#456');
    });

    it('should handle empty taskId', () => {
      expect(buildTaskSK('')).toBe('TASK#');
    });
  });

  describe('TASK_SK_PREFIX', () => {
    it('should be TASK#', () => {
      expect(TASK_SK_PREFIX).toBe('TASK#');
    });
  });
});
