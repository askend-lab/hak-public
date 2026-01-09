 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from './dataService';

describe('DataService Entry Operations', () => {
  let dataService: DataService;
  const mockUserId = '38001085718';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    dataService = DataService.getInstance();
  });

  describe('addEntryToTask', () => {
    it('adds entry to user task', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Test Task',
        description: ''
      });

      const entry = await dataService.addEntryToTask(mockUserId, task.id, {
        text: 'New entry',
        stressedText: 'New entry',
        audioUrl: null,
        audioBlob: null,
        order: 1
      });

      expect(entry.text).toBe('New entry');
      expect(entry.taskId).toBe(task.id);
    });

    it('throws for non-existent task', async () => {
      await expect(
        dataService.addEntryToTask(mockUserId, 'non-existent', {
          text: 'Test',
          stressedText: 'Test',
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
        name: 'Test Task',
        description: ''
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId, 
        task.id, 
        ['Entry 1', 'Entry 2', 'Entry 3']
      );

      expect(entries).toHaveLength(3);
      expect(entries[0]?.text).toBe('Entry 1');
      expect(entries[1]?.text).toBe('Entry 2');
      expect(entries[2]?.text).toBe('Entry 3');
    });

    it('adds entries with stressed text', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Test Task',
        description: ''
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId, 
        task.id, 
        [
          { text: 'Hello', stressedText: 'Hel·lo' },
          { text: 'World', stressedText: 'World' }
        ]
      );

      expect(entries).toHaveLength(2);
      expect(entries[0]?.stressedText).toBe('Hel·lo');
    });

    it('calculates correct order numbers', async () => {
      const task = await dataService.createTask(mockUserId, {
        name: 'Test Task',
        description: '',
        speechSequences: ['Existing']
      });

      const entries = await dataService.addTextEntriesToTask(
        mockUserId, 
        task.id, 
        ['New 1', 'New 2']
      );

      expect(entries[0]?.order).toBe(2);
      expect(entries[1]?.order).toBe(3);
    });

    it('throws for non-existent task', async () => {
      await expect(
        dataService.addTextEntriesToTask(mockUserId, 'non-existent', ['Test'])
      ).rejects.toThrow('Task not found');
    });
  });
});
