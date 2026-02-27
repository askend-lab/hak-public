// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SharedTaskPage } from "./SharedTaskPage";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockGetTaskByShareToken = vi.fn();
const mockShowNotification = vi.fn();
const mockSetCopiedEntries = vi.fn();
const mockDS = createMockDataService({ getTaskByShareToken: mockGetTaskByShareToken });

vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({
    copiedEntries: null,
    setCopiedEntries: mockSetCopiedEntries,
    consumeCopiedEntries: vi.fn().mockReturnValue(null),
    hasCopiedEntries: false,
  }),
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({
    showNotification: mockShowNotification,
  })),
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: vi.fn().mockReturnValue("default"),
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@/components/AppHeader", () => ({
  default: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock("@/components/ui/PlayAllButton", () => ({
  PlayAllButton: ({
    isPlaying,
    isLoading,
    disabled,
    onClick,
  }: {
    isPlaying: boolean;
    isLoading: boolean;
    disabled?: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-is-playing={isPlaying}
      data-is-loading={isLoading}
    >
      {isLoading ? "Laadimine" : isPlaying ? "Peata" : "Mängi kõik"}
    </button>
  ),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: ({
    id,
    text,
    mode,
    onPlay,
    isPlaying,
    isLoading,
  }: {
    id: string;
    text: string;
    mode: string;
    onPlay: (id: string) => void;
    isPlaying: boolean;
    isLoading: boolean;
  }) => (
    <div
      data-testid={`sentence-item-${id}`}
      data-mode={mode}
      data-is-playing={isPlaying}
      data-is-loading={isLoading}
    >
      <span>{text}</span>
      <button onClick={() => onPlay(id)}>Play</button>
    </div>
  ),
}));

describe("SharedTaskPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (token: string) => {
    return render(
      <MemoryRouter initialEntries={[`/shared/task/${token}`]}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: ({ children }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper> },
    );
  };

  it("renders loading state initially", () => {
    mockGetTaskByShareToken.mockImplementation(() => new Promise(() => {}));

    renderWithRouter("abc123");

    expect(screen.getByText(/Laadimine/i)).toBeInTheDocument();
  });

  it("renders page with task name and description", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task Name",
      description: "Test Task Description",
      shareToken: "abc123",
      entries: [],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByTestId("app-header")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Task Name")).toBeInTheDocument();
    expect(screen.getByText("Test Task Description")).toBeInTheDocument();
    expect(screen.getByText("Jagatud ülesanne")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders entries using SentenceSynthesisItem with readonly mode", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task",
      shareToken: "abc123",
      entries: [
        { id: "e1", text: "First sentence", stressedText: "First sentence" },
        { id: "e2", text: "Second sentence", stressedText: "Second sentence" },
      ],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByTestId("sentence-item-e1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("sentence-item-e1")).toHaveAttribute(
      "data-mode",
      "readonly",
    );
    expect(screen.getByTestId("sentence-item-e2")).toHaveAttribute(
      "data-mode",
      "readonly",
    );
    expect(screen.getByText("First sentence")).toBeInTheDocument();
    expect(screen.getByText("Second sentence")).toBeInTheDocument();
  });

  it("renders error message when task not found", async () => {
    mockGetTaskByShareToken.mockResolvedValue(null);

    renderWithRouter("invalid");

    await waitFor(() => {
      expect(screen.getByText(/Ülesannet ei leitud/i)).toBeInTheDocument();
    });
  });

  it("calls getTaskByShareToken with correct token", async () => {
    mockGetTaskByShareToken.mockResolvedValue({
      id: "task-1",
      name: "Task",
      shareToken: "test-token",
      entries: [],
    });

    renderWithRouter("test-token");

    await waitFor(() => {
      expect(mockGetTaskByShareToken).toHaveBeenCalledWith("test-token");
    });
  });

  it("handles error during task loading", async () => {
    mockGetTaskByShareToken.mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByText(/Viga ülesande laadimisel/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("renders Mängi kõik button", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task",
      shareToken: "abc123",
      entries: [{ id: "e1", text: "Hello", stressedText: "Hello" }],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mängi kõik/i }),
      ).toBeInTheDocument();
    });
  });

});
