import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleStoreAdapter } from './SimpleStoreAdapter';
import { Task, TaskEntry } from '@/types/task';

describe('SimpleStoreAdapter', () => {
  let adapter: SimpleStoreAdapter;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    adapter = new SimpleStoreAdapter();
  });

  const createMockTask = (id: string, userId: string): Task => ({
    id,
    userId,
    name: 'Test Task',
    description: 'Test description',
    entries: [],
    speechSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: 'test-token',
  });

  const createMockEntry = (id: string, taskId: string): TaskEntry => ({
    id,
    taskId,
    text: 'Test entry',
    stressedText: 'Test entry',
    audioUrl: null,
    audioBlob: null,
    order: 1,
    createdAt: new Date(),
  });

  describe('loadUserTasks', () => {
    it('returns tasks from SimpleStore', async () => {
      const tasks = [createMockTask('task-1', 'user-1')];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { tasks } } }),
      });

      const result = await adapter.loadUserTasks('user-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/get?pk=tasks&sk=user-1&type=private');
      expect(result).toEqual(tasks);
    });

    it('returns empty array when no tasks exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await adapter.loadUserTasks('user-1');

      expect(result).toEqual([]);
    });

    it('returns empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await adapter.loadUserTasks('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('saveUserTasks', () => {
    it('saves tasks to SimpleStore', async () => {
      const tasks = [createMockTask('task-1', 'user-1')];
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveUserTasks('user-1', tasks);

      expect(mockFetch).toHaveBeenCalledWith('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"pk":"tasks"'),
      });
    });
  });

  describe('loadDeletedTaskIds', () => {
    it('returns deleted task IDs', async () => {
      const taskIds = ['task-1', 'task-2'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { taskIds } } }),
      });

      const result = await adapter.loadDeletedTaskIds('user-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/get?pk=tasks&sk=deleted-user-1&type=private');
      expect(result).toEqual(taskIds);
    });

    it('returns empty array when no deleted tasks', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.loadDeletedTaskIds('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('saveDeletedTaskIds', () => {
    it('saves deleted task IDs', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveDeletedTaskIds('user-1', ['task-1']);

      expect(mockFetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  describe('loadBaselineTaskAdditions', () => {
    it('returns baseline additions', async () => {
      const additions = { 'task-1': [createMockEntry('entry-1', 'task-1')] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { additions } } }),
      });

      const result = await adapter.loadBaselineTaskAdditions('user-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/get?pk=tasks&sk=baseline-user-1&type=private');
      expect(result).toEqual(additions);
    });

    it('returns empty object when no additions', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await adapter.loadBaselineTaskAdditions('user-1');

      expect(result).toEqual({});
    });
  });

  describe('saveBaselineTaskAdditions', () => {
    it('saves baseline additions', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveBaselineTaskAdditions('user-1', {});

      expect(mockFetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  describe('loadSharedTasks', () => {
    it('returns shared tasks', async () => {
      const tasks = [createMockTask('shared-1', 'user-1')];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, item: { data: { tasks } } }),
      });

      const result = await adapter.loadSharedTasks();

      expect(mockFetch).toHaveBeenCalledWith('/api/get?pk=shared&sk=tasks&type=shared');
      expect(result).toEqual(tasks);
    });
  });

  describe('saveSharedTasks', () => {
    it('saves shared tasks', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await adapter.saveSharedTasks([createMockTask('shared-1', 'user-1')]);

      expect(mockFetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({
        method: 'POST',
      }));
    });

    it('throws on save error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Error' });

      await expect(adapter.saveSharedTasks([])).rejects.toThrow();
    });
  });
});
