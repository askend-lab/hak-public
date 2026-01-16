import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskRepository } from './TaskRepository';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';
import { MockDataLoader } from '../storage/MockDataLoader';
import { ShareService } from '../storage/ShareService';
import { Task } from '@/types/task';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let storage: LocalStorageAdapter;
  let mockLoader: MockDataLoader;
  let shareService: ShareService;
  const testUserId = '38001085718';

  const createBaselineTask = (id: string, userId: string): Task => ({
    id,
    userId,
    name: 'Baseline Task',
    description: 'Test baseline',
    entries: [
      { id: 'baseline-entry-1', taskId: id, text: 'Entry 1', stressedText: 'Entry 1', audioUrl: null, audioBlob: null, order: 1, createdAt: new Date() }
    ],
    speechSequences: ['Entry 1'],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: 'baseline-token'
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    storage = new LocalStorageAdapter();
    mockLoader = new MockDataLoader();
    shareService = new ShareService(storage, mockLoader);
    repository = new TaskRepository(storage, mockLoader, shareService);
  });

  describe('updateTask with baseline task', () => {
    it('creates a copy when updating baseline task', async () => {
      const baselineTask = createBaselineTask('baseline-1', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);

      const updated = await repository.updateTask(testUserId, 'baseline-1', { name: 'Updated Name' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.id).not.toBe('baseline-1');
    });

    it('merges baseline additions when copying baseline task', async () => {
      const baselineTask = createBaselineTask('baseline-2', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);
      
      storage.saveBaselineTaskAdditions(testUserId, {
        'baseline-2': [{ id: 'added-1', taskId: 'baseline-2', text: 'Added', stressedText: 'Added', audioUrl: null, audioBlob: null, order: 2, createdAt: new Date() }]
      });

      const updated = await repository.updateTask(testUserId, 'baseline-2', { name: 'Updated' });

      expect(updated?.entries).toHaveLength(2);
    });

    it('marks original baseline task as deleted after copy', async () => {
      const baselineTask = createBaselineTask('baseline-3', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);

      await repository.updateTask(testUserId, 'baseline-3', { name: 'Copy' });

      const deletedIds = storage.loadDeletedTaskIds(testUserId);
      expect(deletedIds).toContain('baseline-3');
    });

    it('clears baseline additions after copying', async () => {
      const baselineTask = createBaselineTask('baseline-4', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);
      
      storage.saveBaselineTaskAdditions(testUserId, {
        'baseline-4': [{ id: 'added-1', taskId: 'baseline-4', text: 'Added', stressedText: 'Added', audioUrl: null, audioBlob: null, order: 2, createdAt: new Date() }]
      });

      await repository.updateTask(testUserId, 'baseline-4', { name: 'Copy' });

      const additions = storage.loadBaselineTaskAdditions(testUserId);
      expect(additions['baseline-4']).toBeUndefined();
    });
  });

  describe('addTextEntriesToTask with baseline task', () => {
    it('stores additions separately for baseline task', async () => {
      const baselineTask = createBaselineTask('baseline-5', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);

      const entries = await repository.addTextEntriesToTask(testUserId, 'baseline-5', ['New Text']);

      expect(entries).toHaveLength(1);
      expect(entries[0]?.text).toBe('New Text');

      const additions = storage.loadBaselineTaskAdditions(testUserId);
      expect(additions['baseline-5']).toHaveLength(1);
    });

    it('appends to existing baseline additions', async () => {
      const baselineTask = createBaselineTask('baseline-6', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);
      
      storage.saveBaselineTaskAdditions(testUserId, {
        'baseline-6': [{ id: 'existing-1', taskId: 'baseline-6', text: 'Existing', stressedText: 'Existing', audioUrl: null, audioBlob: null, order: 2, createdAt: new Date() }]
      });

      await repository.addTextEntriesToTask(testUserId, 'baseline-6', ['Another']);

      const additions = storage.loadBaselineTaskAdditions(testUserId);
      expect(additions['baseline-6']).toHaveLength(2);
    });
  });

  describe('deleteTask with baseline task', () => {
    it('soft-deletes baseline task by adding to deleted list', async () => {
      const baselineTask = createBaselineTask('baseline-del-1', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);

      const result = await repository.deleteTask(testUserId, 'baseline-del-1');

      expect(result).toBe(true);
      const deletedIds = storage.loadDeletedTaskIds(testUserId);
      expect(deletedIds).toContain('baseline-del-1');
    });

    it('does not duplicate in deleted list', async () => {
      const baselineTask = createBaselineTask('baseline-del-2', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);
      storage.saveDeletedTaskIds(testUserId, ['baseline-del-2']);

      const result = await repository.deleteTask(testUserId, 'baseline-del-2');

      expect(result).toBe(true);
      const deletedIds = storage.loadDeletedTaskIds(testUserId);
      expect(deletedIds.filter(id => id === 'baseline-del-2')).toHaveLength(1);
    });
  });

  describe('updateTaskEntry with baseline task', () => {
    it('updates baseline entry by creating task copy', async () => {
      const baselineTask = createBaselineTask('baseline-7', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);

      const updated = await repository.updateTaskEntry(testUserId, 'baseline-7', 'baseline-entry-1', {
        text: 'Modified',
        stressedText: 'Modified'
      });

      expect(updated?.text).toBe('Modified');
    });

    it('updates added entry in baseline task additions', async () => {
      const baselineTask = createBaselineTask('baseline-8', testUserId);
      vi.spyOn(mockLoader, 'loadBaselineTasks').mockResolvedValue([baselineTask]);
      
      const addedEntry = { id: 'added-entry-1', taskId: 'baseline-8', text: 'Added', stressedText: 'Added', audioUrl: null, audioBlob: null, order: 2, createdAt: new Date() };
      storage.saveBaselineTaskAdditions(testUserId, { 'baseline-8': [addedEntry] });

      const updated = await repository.updateTaskEntry(testUserId, 'baseline-8', 'added-entry-1', {
        text: 'Modified Added',
        stressedText: 'Modified Added'
      });

      expect(updated?.text).toBe('Modified Added');

      const additions = storage.loadBaselineTaskAdditions(testUserId);
      expect(additions['baseline-8']?.[0]?.text).toBe('Modified Added');
    });
  });
});
