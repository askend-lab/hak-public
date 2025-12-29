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
      mockFetchSuccess({ id: '1', name: 'Test', entries: [] });
      const result = await createTask('user1', { name: 'Test' });
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({ method: 'POST' }));
    });

    it('should return error on failure', async () => {
      mockFetchError();
      const result = await createTask('user1', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('getTask', () => {
    it('should get a task by id', async () => {
      const mockTask = { id: 'task1', name: 'Test' };
      mockFetchSuccess(mockTask);
      const result = await getTask('user1', 'task1');
      expect(result.success).toBe(true);
      expect(result.data).toStrictEqual(mockTask);
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
      const task = { id: 'task1', name: 'Original', entries: [] };
      mockFetchSequence([
        { ok: true, data: task },
        { ok: true, data: { ...task, name: 'Updated' } },
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
    it('should delete a task', async () => {
      mockFetchSuccess({});
      const result = await deleteTask('user1', 'task1');
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/delete', expect.objectContaining({ method: 'POST' }));
    });
  });

  describe('addEntryToTask', () => {
    it('should add entry to existing task', async () => {
      const task = { id: 'task1', name: 'Test', entries: [] };
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
        { ok: true, data: task },
        { ok: true, data: task },
        { ok: true, data: { ...task, entries: [entry] } },
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
