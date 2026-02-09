// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { Task } from "@/types/task";

interface TaskDetailEmptyProps {
  task: Task | null;
  onNavigateToSynthesis: () => void;
}

export function TaskDetailEmpty({
  task,
  onNavigateToSynthesis,
}: TaskDetailEmptyProps) {
  return (
    <div className="page-content page-content--empty">
      <div className="empty-state">
        <img
          className="empty-state__icon"
          src="/icons/avatar_task_empty.png"
          alt=""
          style={{ width: 213, height: 186, opacity: 1 }}
        />
        <h2 className="empty-state__title">{task?.name || "Ülesanne"}</h2>
        <p className="empty-state__description">
          {task?.description ||
            "Alusta sisu loomisega, et lisada lauseid sellesse ülesandesse."}
        </p>
        <button
          onClick={onNavigateToSynthesis}
          className="empty-state__action button button--primary"
        >
          Hakkan sisu looma
        </button>
      </div>
    </div>
  );
}
