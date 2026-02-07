export interface Task {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
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
  description?: string | null;
  speechSequences?: string[] | null;
  speechEntries?: Array<{ text: string; stressedText: string }> | null;
}

export interface UpdateTaskRequest {
  name?: string | null;
  description?: string | null;
}

export interface TaskSummary {
  id: string;
  name: string;
  description?: string | null;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
