import { vi, type Mock } from 'vitest';
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
declare global {
  var fetch: Mock;
}
global.fetch = vi.fn();

// DRY: Helper functions for fetch mocks
const mockFetchSuccess = (data: unknown): void => {
  (global.fetch as Mock).mockResolvedValue({
    ok: true,
    json: (): Promise<unknown> => Promise.resolve(data),
  });
};

const mockFetchError = (status = 500): void => {
  (global.fetch as Mock).mockResolvedValue({ ok: false, status });
};

const mockFetchSequence = (responses: { ok: boolean; data?: unknown; status?: number }[]): void => {
  const mock = global.fetch as Mock;
  responses.forEach((res, i) => {
    if (i === 0) {
      mock.mockResolvedValueOnce({
        ok: res.ok,
        status: res.status,
        json: () => Promise.resolve(res.data),
      });
    } else {
      mock.mockResolvedValueOnce({
        ok: res.ok,
        status: res.status,
        json: () => Promise.resolve(res.data),
      });
    }
  });
};

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthTokenGetter(null);
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
      const entry = { text: 'Hello', audioUrl: 'test.mp3' };
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
      const result = await addEntryToTask('user1', 'nonexistent', { text: 'Test' });
      expect(result.success).toBe(false);
    });
  });
});
