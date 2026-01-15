/**
 * DataService - Facade class for task data operations
 * Split from 640-line monolith into modules for SOLID compliance
 * 
 * Modules: storage.ts, queries.ts, mutations.ts
 */
import { Task, TaskSummary, TaskEntry, CreateTaskRequest } from '@/types/task';
import * as queries from './dataService/queries';
import * as mutations from './dataService/mutations';

export class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async getUserTasks(userId: string): Promise<TaskSummary[]> {
    return queries.getUserTasks(userId);
  }

  async getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
    return queries.getUserCreatedTasks(userId);
  }

  async getModifiableTasks(userId: string): Promise<TaskSummary[]> {
    return queries.getModifiableTasks(userId);
  }

  async getTask(taskId: string, userId: string): Promise<Task | null> {
    return queries.getTask(taskId, userId);
  }

  async getSharedTask(taskId: string): Promise<Task | null> {
    return queries.getSharedTask(taskId);
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    return queries.getTaskByShareToken(shareToken);
  }

  async shareUserTask(userId: string, taskId: string): Promise<void> {
    return mutations.shareUserTask(userId, taskId);
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    return mutations.createTask(userId, taskData);
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    return mutations.updateTask(userId, taskId, updates);
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    return mutations.deleteTask(userId, taskId);
  }

  async addEntryToTask(userId: string, taskId: string, entryData: Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>): Promise<TaskEntry> {
    return mutations.addEntryToTask(userId, taskId, entryData);
  }

  async addTextEntriesToTask(userId: string, taskId: string, textEntries: string[] | Array<{text: string; stressedText: string}>): Promise<TaskEntry[]> {
    return mutations.addTextEntriesToTask(userId, taskId, textEntries);
  }

  async updateTaskEntry(userId: string, taskId: string, entryId: string, updates: Partial<Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>>): Promise<TaskEntry | null> {
    return mutations.updateTaskEntry(userId, taskId, entryId, updates);
  }
}