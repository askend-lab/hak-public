export function buildUserPK(userId: string): string {
  return `USER#${userId}`;
}

export function buildTaskSK(taskId: string): string {
  return `TASK#${taskId}`;
}

export const TASK_SK_PREFIX = 'TASK#';
