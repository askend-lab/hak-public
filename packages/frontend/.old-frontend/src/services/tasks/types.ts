import type { Task, TaskEntry, CreateTaskRequest, ApiResponse } from '../../core/schemas';

export interface TasksApiConfig {
  baseUrl: string;
  getAuthToken: () => string | null;
}

export interface SaveTaskRequest {
  pk: string;
  sk: string;
  data: Omit<Task, 'id' | 'userId'>;
  type?: 'private' | 'shared' | 'public';
  ttl?: number;
}

export interface GetTaskRequest {
  pk: string;
  sk: string;
}

export interface QueryTasksRequest {
  pk: string;
  skPrefix?: string;
  limit?: number;
}

export interface DeleteTaskRequest {
  pk: string;
  sk: string;
}

export type { Task, TaskEntry, CreateTaskRequest, ApiResponse };
