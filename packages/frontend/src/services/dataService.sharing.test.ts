import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from './dataService';
import { setupSimpleStoreMock, resetSimpleStoreMock, getStoredSharedTasks } from './__mocks__/simpleStoreMock';

describe('DataService Sharing', () => {
  let dataService: DataService;
  const mockUserId = '38001085718';

  beforeEach(() => {
    vi.clearAllMocks();
    resetSimpleStoreMock();
    setupSimpleStoreMock();
    (DataService as unknown as { instance: null }).instance = null;
    dataService = DataService.getInstance();
  });

  describe('shareUserTask', () => {
    it('shares a user task to global storage', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Task to Share',
        description: 'Test'
      });

      await dataService.shareUserTask(mockUserId, task.id);

      const sharedTasks = getStoredSharedTasks();
      expect(sharedTasks.length).toBeGreaterThan(0);
      expect(sharedTasks.some((t: { id: string }) => t.id === task.id)).toBe(true);
    });

    it('throws when task not found', async () => {
      await expect(
        dataService.shareUserTask(mockUserId, 'non-existent')
      ).rejects.toThrow('Task not found');
    });

    it('updates existing shared task', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Task v1',
        description: 'Original'
      });

      await dataService.shareUserTask(mockUserId, task.id);

      await dataService.updateTask(mockUserId, task.id, { name: 'Task v2' });
      await dataService.shareUserTask(mockUserId, task.id);

      const sharedTasks = getStoredSharedTasks();
      const sharedTask = sharedTasks.find((t: { id: string }) => t.id === task.id);
      expect(sharedTask?.name).toBe('Task v2');
    });
  });

  describe('getSharedTask', () => {
    it('returns shared task by ID', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Shared Task',
        description: 'Test'
      });

      await dataService.shareUserTask(mockUserId, task.id);

      const result = await dataService.getSharedTask(task.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Shared Task');
    });

    it('returns null for non-shared task', async () => {
      const result = await dataService.getSharedTask('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getTaskByShareToken', () => {
    it('returns task by share token after sharing', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Token Task',
        description: 'Test'
      });

      // Share the task first so it can be found by token
      await dataService.shareUserTask(mockUserId, task.id);

      const result = await dataService.getTaskByShareToken(task.shareToken);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Token Task');
    });

    it('returns null for invalid token', async () => {
      const result = await dataService.getTaskByShareToken('invalid-token');
      expect(result).toBeNull();
    });
  });
});
