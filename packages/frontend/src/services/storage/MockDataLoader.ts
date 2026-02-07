import { Task, TaskEntry } from "@/types/task";
import mockTasksData from "../../../public/data/mock-tasks.json";

export class MockDataLoader {
  private generateShareToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 16);
  }

  private normalizeTaskEntry(
    entry: TaskEntry,
    taskId: string,
    taskCreatedAt: Date,
  ): TaskEntry {
    return {
      ...entry,
      taskId: entry.taskId || taskId,
      audioBlob: entry.audioBlob || null,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : taskCreatedAt,
    };
  }

  async loadBaselineTasks(): Promise<Task[]> {
    try {
      const data = mockTasksData;

      return (data.tasks as unknown[]).map((task: unknown) => {
        const taskData = task as Record<string, unknown>;
        const taskId = taskData.id as string;
        const createdAt = new Date(taskData.createdAt as string);
        const entries = (taskData.entries as TaskEntry[] | undefined) || [];

        return {
          ...taskData,
          shareToken:
            (taskData.shareToken as string) || this.generateShareToken(),
          speechSequences:
            (taskData.speechSequences as string[]) ||
            entries.map((e: TaskEntry) => e.text) ||
            [],
          entries: entries.map((entry: TaskEntry) =>
            this.normalizeTaskEntry(entry, taskId, createdAt),
          ),
          createdAt,
          updatedAt: new Date(taskData.updatedAt as string),
        } as Task;
      });
    } catch (error) {
      console.error("Failed to load baseline tasks:", error);
      return [];
    }
  }

  async findTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const data = mockTasksData;
      const taskData = (data.tasks as unknown[]).find((task: unknown) => {
        const t = task as Record<string, unknown>;
        return t.shareToken === shareToken;
      });

      if (!taskData) {
        return null;
      }

      const task = taskData as Record<string, unknown>;
      const taskId = task.id as string;
      const createdAt = new Date(task.createdAt as string);
      const entries = (task.entries as TaskEntry[] | undefined) || [];

      return {
        ...task,
        speechSequences:
          (task.speechSequences as string[]) ||
          entries.map((e: TaskEntry) => e.text) ||
          [],
        entries: entries.map((entry: TaskEntry) =>
          this.normalizeTaskEntry(entry, taskId, createdAt),
        ),
        createdAt,
        updatedAt: new Date(task.updatedAt as string),
      } as Task;
    } catch (error) {
      console.error("Failed to find task by share token:", error);
      return null;
    }
  }
}
