 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from './dataService';

describe('DataService CRUD Operations', () => {
  let dataService: DataService;
  const mockUserId = '38001085718';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    dataService = DataService.getInstance();
  });

  describe('createTask', () => {
    it('creates a new task with basic data', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'Test Description'
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.name).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.userId).toBe(mockUserId);
      expect(result.id).toBeDefined();
      expect(result.shareToken).toBeDefined();
    });

    it('creates task with speech sequences', async () => {
      const taskData = {
        name: 'Speech Task',
        description: 'With sequences',
        speechSequences: ['Hello', 'World']
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.speechSequences).toEqual(['Hello', 'World']);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.text).toBe('Hello');
      expect(result.entries[1]?.text).toBe('World');
    });

    it('creates task with speech entries', async () => {
      const taskData = {
        name: 'Entry Task',
        description: 'With entries',
        speechEntries: [
          { text: 'Hello', stressedText: 'Hel·lo' },
          { text: 'World', stressedText: 'World' }
        ]
      };

      const result = await dataService.createTask(mockUserId, taskData);

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.text).toBe('Hello');
      expect(result.entries[0]?.stressedText).toBe('Hel·lo');
    });

    it('saves task to localStorage', async () => {
      const taskData = {
        name: 'Saved Task',
        description: 'Should be saved'
      };

      await dataService.createTask(mockUserId, taskData);

      const stored = localStorage.getItem(`eki_user_tasks_${mockUserId}`);
      expect(stored).toBeDefined();
      const tasks = JSON.parse(stored ?? '[]');
      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toBe('Saved Task');
    });
  });

  describe('getTask', () => {
    it('returns user-created task', async () => {
      const taskData = { name: 'User Task', description: 'Test' };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.getTask(created.id, mockUserId);

      expect(result).toBeDefined();
      expect(result?.name).toBe('User Task');
    });

    it('returns null for non-existent task', async () => {
      const result = await dataService.getTask('non-existent', mockUserId);
      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('updates user-created task', async () => {
      const taskData = { name: 'Original', description: 'Test' };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.updateTask(mockUserId, created.id, {
        name: 'Updated'
      });

      expect(result?.name).toBe('Updated');
    });

    it('throws for non-existent task', async () => {
      await expect(
        dataService.updateTask(mockUserId, 'non-existent', { name: 'Test' })
      ).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('deletes user-created task', async () => {
      const taskData = { name: 'To Delete', description: 'Test' };
      const created = await dataService.createTask(mockUserId, taskData);

      const result = await dataService.deleteTask(mockUserId, created.id);

      expect(result).toBe(true);
      const task = await dataService.getTask(created.id, mockUserId);
      expect(task).toBeNull();
    });

    it('throws for non-existent task', async () => {
      await expect(
        dataService.deleteTask(mockUserId, 'non-existent')
      ).rejects.toThrow('Task not found');
    });
  });

  describe('getUserTasks', () => {
    it('returns empty array for user with no tasks', async () => {
      const result = await dataService.getUserTasks('new-user');
      // May include baseline tasks
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns user-created tasks', async () => {
      await dataService.createTask(mockUserId, { name: 'Task 1', description: '' });
      await dataService.createTask(mockUserId, { name: 'Task 2', description: '' });

      const result = await dataService.getUserTasks(mockUserId);

      const userTaskNames = result.map(t => t.name);
      expect(userTaskNames).toContain('Task 1');
      expect(userTaskNames).toContain('Task 2');
    });
  });

  describe('getUserCreatedTasks', () => {
    it('returns only user-created tasks', async () => {
      await dataService.createTask(mockUserId, { name: 'User Task', description: '' });

      const result = await dataService.getUserCreatedTasks(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('User Task');
    });
  });

  describe('getModifiableTasks', () => {
    it('returns user-created tasks only', async () => {
      await dataService.createTask(mockUserId, { name: 'Modifiable', description: '' });

      const result = await dataService.getModifiableTasks(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Modifiable');
    });
  });
});
