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
          onBack={() => navigate("/tasks")}
          onViewTask={(id) => navigate(`/tasks/${id}`)}
          onCreateTask={taskHandlers.crud.handleCreateTask}
          onEditTask={taskHandlers.crud.handleEditTask}
          onDeleteTask={taskHandlers.crud.handleDeleteTask}
          onShareTask={taskHandlers.sharing.handleShareTask}
          onNavigateToSynthesis={() => navigate("/synthesis")}
        />
      </ErrorBoundary>
    </Suspense>
  );
}
