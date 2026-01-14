'use client';

import { Task } from '@/types/task';

interface TaskDetailEmptyProps {
  task: Task | null;
  onAddEntry: () => void;
}

export function TaskDetailEmpty({ task, onAddEntry }: TaskDetailEmptyProps) {
  return (
    <div className="task-detail__entries-empty">
      <div className="task-detail__empty-image">
        <img src="/icons/avatar_task_empty.png" alt="Tühi ülesanne" />
      </div>
      <h4 className="task-detail__empty-title">
        {task?.name || '[Siin on ülesande pealkiri]'}
      </h4>
      <p className="task-detail__empty-description">
        {task?.description || '[Siin on ülesande lühikirjeldus]'}
      </p>
      <button onClick={onAddEntry} className="task-detail__empty-cta">
        Hakkan sisu looma
      </button>
    </div>
  );
}
