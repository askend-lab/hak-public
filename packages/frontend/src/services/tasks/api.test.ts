import { vi } from 'vitest';
import {
  setAuthTokenGetter,
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  addEntryToTask,
} from './api';

vi.mock('../config', () => ({
  API_CONFIG: { baseUrl: '/api' },
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// DRY: Helper functions for fetch mocks
const mockFetchSuccess = (data: unknown): void => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: (): Promise<unknown> => Promise.resolve(data),
  });
};

const mockFetchError = (status = 500): void => {
  mockFetch.mockResolvedValue({ ok: false, status });
};

const mockFetchSequence = (responses: { ok: boolean; data?: unknown; status?: number }[]): void => {
  responses.forEach((res) => {
    mockFetch.mockResolvedValueOnce({
      ok: res.ok,
      status: res.status,
      json: () => Promise.resolve(res.data),
    });
  });
};

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthTokenGetter(() => null);
  });

  describe('setAuthTokenGetter', () => {
    it('should set auth token getter', async () => {
      setAuthTokenGetter(() => 'test-token');
      mockFetchSuccess({ id: '1' });
      await getTask('user1', 'task1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = { name: 'Test', entries: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockFetchSuccess({
        item: {
          PK: 'USER#user1',
          SK: 'TASK#12345',
          data: taskData,
        },
      });
      const result = await createTask('user1', { name: 'Test' });
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test');
      expect(result.data?.id).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({ method: 'POST' }));
    });

    it('should return error on failure', async () => {
      mockFetchError();
      const result = await createTask('user1', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('getTask', () => {
    it('should get a task by id and unwrap backend response', async () => {
      const taskData = { name: 'Test Task', entries: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockFetchSuccess({
        item: {
          PK: 'USER#user1',
          SK: 'TASK#task1',
          data: taskData,
        },
      });
      const result = await getTask('user1', 'task1');
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test Task');
      expect(result.data?.id).toBe('task1');
    });

    it('should return error if item not found', async () => {
      mockFetchSuccess({ item: null });
      const result = await getTask('user1', 'nonexistent');
      expect(result.success).toBe(false);
    });
  });

  describe('listTasks', () => {
    it('should list all tasks for user', async () => {
      mockFetchSuccess({
        items: [
          { data: { name: 'Task 1' }, SK: 'TASK#1' },
          { data: { name: 'Task 2' }, SK: 'TASK#2' },
        ],
      });
      const result = await listTasks('user1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]?.name).toBe('Task 1');
      expect(result.data?.[1]?.name).toBe('Task 2');
    });

    it('should return error on failure', async () => {
      mockFetchError();
      const result = await listTasks('user1');
      expect(result.success).toBe(false);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const taskData = { name: 'Original', entries: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockFetchSequence([
        { ok: true, data: { item: { PK: 'USER#user1', SK: 'TASK#task1', data: taskData } } },
        { ok: true, data: { item: { PK: 'USER#user1', SK: 'TASK#task1', data: { ...taskData, name: 'Updated' } } } },
      ]);
      const result = await updateTask('user1', 'task1', { name: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('should return error if task not found', async () => {
      mockFetchError(404);
      const result = await updateTask('user1', 'nonexistent', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task using DELETE method with query params', async () => {
      mockFetchSuccess({});
      const result = await deleteTask('user1', 'task1');
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/delete?'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('addEntryToTask', () => {
    it('should add entry to existing task', async () => {
      const taskData = { name: 'Test', entries: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      const entry = {
        id: 'entry1',
        synthesis: {
          id: 'synth1',
          originalText: 'Hello',
          phoneticText: 'Hello',
          audioHash: 'abc123',
          voiceModel: 'efm_s' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
        order: 0,
        addedAt: '2024-01-01T00:00:00Z',
      };
      mockFetchSequence([
        { ok: true, data: { item: { PK: 'USER#user1', SK: 'TASK#task1', data: taskData } } },
        { ok: true, data: { item: { PK: 'USER#user1', SK: 'TASK#task1', data: { ...taskData, entries: [entry] } } } },
      ]);
      const result = await addEntryToTask('user1', 'task1', entry);
      expect(result.success).toBe(true);
    });

    it('should return error if task not found', async () => {
      mockFetchError(404);
      const entry = {
        id: 'entry1',
        synthesis: {
          id: 'synth1',
          originalText: 'Test',
          phoneticText: 'Test',
          audioHash: 'abc123',
          voiceModel: 'efm_s' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
        order: 0,
        addedAt: '2024-01-01T00:00:00Z',
      };
      const result = await addEntryToTask('user1', 'nonexistent', entry);
      expect(result.success).toBe(false);
    });
  });
});
