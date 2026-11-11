// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskDetailView from "./TaskDetailView";
import { Task } from "@/types/task";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockGetTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockShowNotification = vi.fn();
const mockDS = createMockDataService({ getTask: mockGetTask, updateTask: mockUpdateTask } as never);
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({ user: { id: "u1", email: "test@test.com" } })),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({ showNotification: mockShowNotification })),
}));
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: ({
    id,
    rowMenuItems,
    onPlay,
  }: {
    id: string;
    rowMenuItems?: {
      label: string;
      onClick: (id: string) => void;
      danger?: boolean;
    }[];
    onPlay?: (id: string) => void;
  }) => (
    <div data-testid={`entry-${id}`}>
      {rowMenuItems?.map((item) => (
        <button key={item.label} onClick={() => item.onClick(id)}>
          {item.label}
        </button>
      ))}
      {onPlay && <button onClick={() => onPlay(id)}>Play</button>}
    </div>
  ),
}));

vi.mock("@/features/sharing/components/ShareTaskModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="share-modal">
        <button onClick={onClose}>Close Share</button>
      </div>
    ) : null,
}));

vi.mock("@/features/synthesis/components/PronunciationVariants", () => ({ default: () => null }));
vi.mock("@/features/synthesis/components/SentencePhoneticPanel", () => ({ default: () => null }));
vi.mock("./TaskDetailHeader", () => ({
  TaskDetailHeader: ({
    onShare,
    onEditTask,
    onDeleteTask,
  }: {
    onShare: () => void;
    onEditTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
  }) => (
    <div data-testid="header">
      <button onClick={onShare}>Share</button>
      <button onClick={() => onEditTask("t1")}>Edit</button>
      <button onClick={() => onDeleteTask("t1")}>Delete Task</button>
    </div>
  ),
}));
vi.mock("./TaskDetailStates", () => ({
  TaskDetailLoading: () => (
    <div data-testid="loading">Loading...</div>
  ),
  TaskDetailError: ({
    error,
    onBack,
  }: {
    error: string;
    onBack: () => void;
  }) => (
    <div data-testid="error">
      {error}
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));
vi.mock("./TaskDetailEmpty", () => ({
  TaskDetailEmpty: () => <div data-testid="empty">No entries</div>,
}));
vi.mock("./hooks", () => ({
  useDragAndDrop: vi.fn(() => ({
    draggedId: null,
    dragOverId: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
  })),
  useAudioPlayback: vi.fn(() => ({
    currentPlayingId: null,
    currentLoadingId: null,
    isPlayingAll: false,
    isLoadingPlayAll: false,
    handlePlayEntry: vi.fn(),
    handlePlayAll: vi.fn(),
  })),
  usePronunciationVariants: vi.fn(() => ({
    selectedEntryId: null,
    selectedTagIndex: null,
    isVariantsPanelOpen: false,
    variantsWord: null,
    variantsCustomPhonetic: null,
    loadingVariantsTag: null,
    handleTagClick: vi.fn(),
    handleCloseVariants: vi.fn(),
    handleUseVariant: vi.fn(),
  })),
  usePhoneticPanel: vi.fn(() => ({
    phoneticPanelEntryId: null,
    showPhoneticPanel: false,
    handleExplorePhonetic: vi.fn(),
    handleClosePhoneticPanel: vi.fn(),
    handlePhoneticApply: vi.fn(),
  })),
}));

const mockTask: Task = {
  id: "t1",
  userId: "u1",
  name: "Test Task",
  description: "desc",
  entries: [
    {
      id: "e1",
      taskId: "t1",
      text: "Hello world",
      stressedText: "Hello world",
      audioUrl: null,
      audioBlob: null,
      order: 0,
      createdAt: new Date(),
    },
    {
      id: "e2",
      taskId: "t1",
      text: "Tere",
      stressedText: "Tere",
      audioUrl: null,
      audioBlob: null,
      order: 1,
      createdAt: new Date(),
    },
  ],
  speechSequences: [],
  shareToken: "tok1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TaskDetailView", () => {
  const defaultProps = {
    taskId: "t1",
    onBack: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onNavigateToSynthesis: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth } = await import("@/features/auth/services");
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "u1", email: "test@test.com" },
    });
    mockGetTask.mockResolvedValue(mockTask);
    mockUpdateTask.mockResolvedValue({});
  });

  it("opens share modal from header", async () => {
    const user = userEvent.setup();
    render(<TaskDetailView {...defaultProps} />, { wrapper: dsWrapper });
    await waitFor(() =>
      expect(screen.getByTestId("header")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Share"));
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();

    await user.click(screen.getByText("Close Share"));
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });

});
