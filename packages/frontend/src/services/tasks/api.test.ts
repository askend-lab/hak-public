import {
  setAuthTokenGetter,
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  addEntryToTask,
} from './api';

// Mock config
jest.mock('../config', () => ({
  API_CONFIG: { baseUrl: '/api' },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthTokenGetter(null);
  });

  describe('setAuthTokenGetter', () => {
    it('should set auth token getter', async () => {
      setAuthTokenGetter(() => 'test-token');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      });

      await getTask('user1', 'task1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const mockTask = { id: '1', name: 'Test', entries: [] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const result = await createTask('user1', { name: 'Test' });
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/save',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should return error on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await createTask('user1', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('getTask', () => {
    it('should get a task by id', async () => {
      const mockTask = { id: 'task1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const result = await getTask('user1', 'task1');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTask);
    });
  });

  describe('listTasks', () => {
    it('should list all tasks for user', async () => {
      const mockResponse = {
        items: [
          { data: { name: 'Task 1' }, SK: 'TASK#1' },
          { data: { name: 'Task 2' }, SK: 'TASK#2' },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await listTasks('user1');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return error on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await listTasks('user1');
      expect(result.success).toBe(false);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const existingTask = { id: 'task1', name: 'Original', entries: [] };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(existingTask),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...existingTask, name: 'Updated' }),
        });

      const result = await updateTask('user1', 'task1', { name: 'Updated' });
      
      expect(result.success).toBe(true);
    });

    it('should return error if task not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await updateTask('user1', 'nonexistent', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await deleteTask('user1', 'task1');
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/delete',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('addEntryToTask', () => {
    it('should add entry to existing task', async () => {
      const existingTask = { id: 'task1', name: 'Test', entries: [] };
      const entry = { text: 'Hello', audioUrl: 'test.mp3' };
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(existingTask),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(existingTask),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...existingTask, entries: [entry] }),
        });

      const result = await addEntryToTask('user1', 'task1', entry);
      
      expect(result.success).toBe(true);
    });

    it('should return error if task not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await addEntryToTask('user1', 'nonexistent', { text: 'Test' });
      expect(result.success).toBe(false);
    });
  });
});
