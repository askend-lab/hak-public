export interface Task {
  id: string;
  userId: string;
  name: string;
  description?: string | undefined;
  speechSequences: string[];
  entries: TaskEntry[];
  createdAt: Date;
  updatedAt: Date;
  shareToken: string;
}

export interface TaskEntry {
  id: string;
  taskId: string;
  text: string;
  stressedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
  order: number;
  createdAt: Date;
}

export interface CreateTaskRequest {
  name: string;
  description?: string | undefined;
  speechSequences?: string[] | undefined;
  speechEntries?: Array<{text: string; stressedText: string}> | undefined;
}

export interface UpdateTaskRequest {
  name?: string | undefined;
  description?: string | undefined;
}

export interface TaskSummary {
  id: string;
  name: string;
  description?: string | undefined;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
}