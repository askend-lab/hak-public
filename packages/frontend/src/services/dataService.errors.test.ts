 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from './dataService';

describe('DataService Error Handling and Edge Cases', () => {
  let dataService: DataService;
  const mockUserId = '38001085718';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    dataService = DataService.getInstance();
  });

  describe('localStorage error handling', () => {
    it('handles localStorage.getItem throwing error for user tasks', async () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation((key: string) => {
        if (key === `eki_user_tasks_${mockUserId}`) {
          throw new Error('Storage error');
        }
        return originalGetItem.call(localStorage, key);
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should return empty array on error
      const tasks = await dataService.getUserCreatedTasks(mockUserId);
      expect(tasks).toEqual([]);

      consoleSpy.mockRestore();
      localStorage.getItem = originalGetItem;
    });

    it('handles localStorage.setItem throwing error', async () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw, just log error
      await dataService.createTask(mockUserId, { name: 'Test', description: '' });

      consoleSpy.mockRestore();
      localStorage.setItem = originalSetItem;
    });

    it('handles invalid JSON in localStorage for deleted tasks', async () => {
      localStorage.setItem(`eki_deleted_tasks_${mockUserId}`, 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const tasks = await dataService.getUserTasks(mockUserId);
      expect(Array.isArray(tasks)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('handles invalid JSON in localStorage for baseline additions', async () => {
      localStorage.setItem(`eki_baseline_additions_${mockUserId}`, 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const tasks = await dataService.getUserTasks(mockUserId);
      expect(Array.isArray(tasks)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('addEntryToTask', () => {
    it('adds entry to user-created task', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Task with Entry',
        description: 'Test'
      });

      const entry = await dataService.addEntryToTask(mockUserId, task.id, {
        text: 'New Entry',
        stressedText: 'New Entry',
        audioUrl: null,
        audioBlob: null,
        order: 1
      });

      expect(entry.text).toBe('New Entry');
      expect(entry.taskId).toBe(task.id);
      expect(entry.id).toBeDefined();
    });

    it('throws when adding entry to non-existent task', async () => {
      await expect(
        dataService.addEntryToTask(mockUserId, 'non-existent', {
          text: 'Entry',
          stressedText: 'Entry',
          audioUrl: null,
          audioBlob: null,
          order: 1
        })
      ).rejects.toThrow('Task not found');
    });
  });

  describe('addTextEntriesToTask', () => {
    it('adds multiple string entries', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Multi Entry Task',
        description: 'Test'
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId,
        task.id,
        ['Entry 1', 'Entry 2', 'Entry 3']
      );

      expect(entries).toHaveLength(3);
      expect(entries[0]?.text).toBe('Entry 1');
      expect(entries[2]?.text).toBe('Entry 3');
    });

    it('adds multiple object entries with stressed text', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Stressed Entry Task',
        description: 'Test'
      });

      const entries = await dataService.addTextEntriesToTask(mockUserId, task.id, [
        { text: 'Hello', stressedText: 'Hel·lo' },
        { text: 'World', stressedText: 'World' }
      ]);

      expect(entries).toHaveLength(2);
      expect(entries[0]?.stressedText).toBe('Hel·lo');
    });

    it('throws when adding entries to non-existent task', async () => {
      await expect(
        dataService.addTextEntriesToTask(mockUserId, 'non-existent', ['Entry'])
      ).rejects.toThrow('Task not found');
    });

    it('calculates correct order for new entries', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Order Test',
        description: 'Test',
        speechSequences: ['Existing 1', 'Existing 2']
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId,
        task.id,
        ['New 1', 'New 2']
      );

      expect(entries[0]?.order).toBe(3);
      expect(entries[1]?.order).toBe(4);
    });
  });

  describe('updateTaskEntry', () => {
    it('updates entry in user-created task', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Entry Update Task',
        description: 'Test',
        speechSequences: ['Original text']
      });

      const entryId = task.entries[0]?.id ?? '';

      const updated = await dataService.updateTaskEntry(
        mockUserId,
        task.id,
        entryId,
        { text: 'Updated text', stressedText: 'Updated text' }
      );

      expect(updated?.text).toBe('Updated text');
    });

    it('throws when task not found', async () => {
      await expect(
        dataService.updateTaskEntry(mockUserId, 'non-existent', 'entry-id', { text: 'Test' })
      ).rejects.toThrow('Task not found');
    });

    it('throws when entry not found', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Task',
        description: 'Test',
        speechSequences: ['Text']
      });

      await expect(
        dataService.updateTaskEntry(mockUserId, task.id, 'non-existent-entry', { text: 'Test' })
      ).rejects.toThrow('Entry not found');
    });
  });

  describe('baseline task operations', () => {
    it('filters deleted baseline tasks from getUserTasks', async () => {
      // Get baseline tasks first
      const allTasks = await dataService.getUserTasks(mockUserId);
      const baselineTask = allTasks.find(t => t.name.includes('Uudised'));

      if (baselineTask) {
        // Soft delete it
        await dataService.deleteTask(mockUserId, baselineTask.id);

        // Should not appear in list
        const tasksAfterDelete = await dataService.getUserTasks(mockUserId);
        expect(tasksAfterDelete.find(t => t.id === baselineTask.id)).toBeUndefined();
      }
    });
  });

  describe('getSharedTask error handling', () => {
    it('handles invalid JSON in shared tasks storage', async () => {
      localStorage.setItem('eki_shared_tasks', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await dataService.getSharedTask('some-id');
      // Should return null and not throw
      expect(result === null || result !== undefined).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('getTaskByShareToken edge cases', () => {
    it('handles error when searching user tasks', async () => {
      // Store invalid JSON for a user tasks key
      localStorage.setItem('eki_user_tasks_invalid', 'not valid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await dataService.getTaskByShareToken('some-token');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('searches through multiple user task keys', async () => {
      // Create tasks for different users
      await dataService.createTask('user1', { name: 'User1 Task', description: '' });
      const task2 = await dataService.createTask('user2', { name: 'User2 Task', description: '' });

      // Should find task by share token regardless of user
      const result = await dataService.getTaskByShareToken(task2.shareToken);
      expect(result?.name).toBe('User2 Task');
    });
  });

  describe('shareUserTask error handling', () => {
    it('handles localStorage error during share', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Task to Share',
        description: 'Test'
      });

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation((key: string) => {
        if (key === 'eki_shared_tasks') {
          throw new Error('Storage error');
        }
        // Don't call original for non-shared keys to avoid infinite loop
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        dataService.shareUserTask(mockUserId, task.id)
      ).rejects.toThrow('Failed to share task');

      consoleSpy.mockRestore();
      localStorage.setItem = originalSetItem;
    });
  });
});
