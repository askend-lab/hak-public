import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from './dataService';

describe('DataService Share Operations', () => {
  let ds: DataService;
  const userId = '38001085718';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    ds = DataService.getInstance();
  });

  it('shareUserTask shares a task', async () => {
    const task = await ds.createTask(userId, { name: 'Share Test', description: '' });
    const result = await ds.shareUserTask(userId, task.id);
    expect(result).toBeTruthy();
  });

  it('shareUserTask returns null for non-existent task', async () => {
    const result = await ds.shareUserTask(userId, 'non-existent');
    expect(result).toBeNull();
  });

  it('getTaskByShareToken finds shared task', async () => {
    const task = await ds.createTask(userId, { name: 'Token Test', description: '' });
    await ds.shareUserTask(userId, task.id);
    const found = await ds.getTaskByShareToken(task.shareToken);
    expect(found?.name).toBe('Token Test');
  });

  it('getTaskByShareToken returns null for invalid token', async () => {
    const found = await ds.getTaskByShareToken('invalid-token');
    expect(found).toBeNull();
  });

  it('getSharedTask returns null for non-shared task', async () => {
    const task = await ds.createTask(userId, { name: 'Not Shared', description: '' });
    const found = await ds.getSharedTask(task.id);
    expect(found).toBeNull();
  });

  it('getSharedTask finds shared task by id', async () => {
    const task = await ds.createTask(userId, { name: 'Shared Task', description: '' });
    await ds.shareUserTask(userId, task.id);
    const found = await ds.getSharedTask(task.id);
    expect(found?.name).toBe('Shared Task');
  });

  it('unshareTask removes task from shared storage', async () => {
    const task = await ds.createTask(userId, { name: 'Unshare Test', description: '' });
    await ds.shareUserTask(userId, task.id);
    await ds.deleteTask(userId, task.id);
    const found = await ds.getSharedTask(task.id);
    expect(found).toBeNull();
  });

  it('handles malformed shared tasks in storage', async () => {
    localStorage.setItem('eki_shared_tasks', 'invalid-json');
    const found = await ds.getTaskByShareToken('any-token');
    expect(found).toBeNull();
  });

  it('handles empty shared tasks array', async () => {
    localStorage.setItem('eki_shared_tasks', '[]');
    const found = await ds.getTaskByShareToken('any-token');
    expect(found).toBeNull();
  });
});
