// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { lazy, Suspense } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingState } from "@/components/ui/PageLoadingState";
import type { AppLayoutContext } from "./types";

const TasksView = lazy(() => import("@/features/tasks/components/TasksView"));

export default function TasksRoute() {
  const { taskHandlers } = useOutletContext<AppLayoutContext>();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<PageLoadingState />}>
      <ErrorBoundary>
        <TasksView
          selectedTaskId={taskId ?? null}
          taskRefreshTrigger={taskHandlers.modals.taskRefreshTrigger}
          onBack={() => { void navigate("/tasks"); }}
          onViewTask={(id) => { void navigate(`/tasks/${id}`); }}
          onCreateTask={taskHandlers.crud.handleCreateTask}
          onEditTask={(...args) => { void taskHandlers.crud.handleEditTask(...args); }}
          onDeleteTask={(...args) => { void taskHandlers.crud.handleDeleteTask(...args); }}
          onShareTask={(...args) => { void taskHandlers.sharing.handleShareTask(...args); }}
          onNavigateToSynthesis={() => { void navigate("/synthesis"); }}
        />
      </ErrorBoundary>
    </Suspense>
  );
}
