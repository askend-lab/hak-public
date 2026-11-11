// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { PageLoadingState } from "@/components/ui/PageLoadingState";

interface BackButtonProps {
  onBack: () => void;
}

function BackButton({ onBack }: BackButtonProps) {
  return (
    <button onClick={onBack} className="task-back-button">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15,18 9,12 15,6" />
      </svg>
      <span>Tagasi</span>
    </button>
  );
}

export function TaskDetailLoading() {
  return <PageLoadingState message="Laen ülesannet..." />;
}

interface TaskDetailErrorProps {
  onBack: () => void;
  error: string;
}

export function TaskDetailError({ onBack, error }: TaskDetailErrorProps) {
  return (
    <div className="task-detail-view">
      <div className="task-detail-hero">
        <div className="task-detail-hero-header">
          <BackButton onBack={onBack} />
        </div>
      </div>
      <div className="task-detail-error">
        <p>{error}</p>
      </div>
    </div>
  );
}
