// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { SharedTaskPage } from "./SharedTaskPage";

const mockGetTaskByShareToken = vi.fn();
const mockShowNotification = vi.fn();

vi.mock("@/services/dataService", () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getTaskByShareToken: mockGetTaskByShareToken,
    })),
  },
}));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({
    showNotification: mockShowNotification,
  })),
}));

vi.mock("@/utils/synthesize", () => ({
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

vi.mock("@/components/SentenceSynthesisItem", () => ({
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
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const renderWithRouter = (token: string) => {
    return render(
      <MemoryRouter initialEntries={[`/shared/task/${token}`]}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>,
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

  it("stores entries in sessionStorage when Kopeeri button clicked", async () => {
    const user = userEvent.setup();
    const mockTask = {
      id: "task-1",
      name: "Task",
      shareToken: "abc123",
      entries: [{ id: "e1", text: "Test entry", stressedText: "Test entry" }],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByText("Jagatud ülesanne")).toBeInTheDocument();
    });

    const copyButton = screen.getByRole("button", { name: /kopeeri/i });
    await user.click(copyButton);

    // Check that entries were stored in sessionStorage
    const storedEntries = sessionStorage.getItem("copiedEntries");
    expect(storedEntries).not.toBeNull();
    expect(JSON.parse(storedEntries!)).toEqual(mockTask.entries);

    // Check notification was shown
    expect(mockShowNotification).toHaveBeenCalledWith(
      "success",
      "Laused kopeeritud!",
    );
  });

  it("shows empty state when task has no entries", async () => {
    const mockTask = {
      id: "task-123",
      name: "Empty Task",
      shareToken: "abc123",
      entries: [],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByText(/ei sisalda ühtegi lauset/i)).toBeInTheDocument();
    });
  });

  it("shows error when token is missing", async () => {
    render(
      <MemoryRouter initialEntries={["/shared/"]}>
        <Routes>
          <Route path="/shared/" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Token puudub/i)).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
    mockGetTaskByShareToken.mockRejectedValue(new Error("Network fail"));

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByText(/Viga/i)).toBeInTheDocument();
    });
  });

  it("calls handlePlayEntry when play button clicked", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task",
      shareToken: "abc123",
      entries: [
        {
          id: "e1",
          taskId: "task-123",
          text: "Hello",
          stressedText: "Hello",
          audioUrl: null,
          audioBlob: null,
          order: 0,
          createdAt: new Date(),
        },
      ],
    };
    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });

  it("calls handlePlayAll when play all button clicked", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task",
      shareToken: "abc123",
      entries: [
        {
          id: "e1",
          taskId: "task-123",
          text: "Hello",
          stressedText: "Hello",
          audioUrl: null,
          audioBlob: null,
          order: 0,
          createdAt: new Date(),
        },
      ],
    };
    mockGetTaskByShareToken.mockResolvedValue(mockTask);
    const user = userEvent.setup();

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mängi kõik/i }),
      ).not.toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /mängi kõik/i }));
  });

  it("copies entries to playlist via sessionStorage", async () => {
    const mockTask = {
      id: "task-123",
      name: "Test Task",
      shareToken: "abc123",
      entries: [
        {
          id: "e1",
          taskId: "task-123",
          text: "Hello",
          stressedText: "Hello",
          audioUrl: null,
          audioBlob: null,
          order: 0,
          createdAt: new Date(),
        },
      ],
    };
    mockGetTaskByShareToken.mockResolvedValue(mockTask);
    const user = userEvent.setup();

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /kopeeri/i }),
      ).not.toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /kopeeri/i }));
    expect(mockShowNotification).toHaveBeenCalledWith(
      "success",
      expect.any(String),
    );
    expect(sessionStorage.getItem("copiedEntries")).toBeTruthy();
  });

  it("disables buttons when there are no entries", async () => {
    const mockTask = {
      id: "task-123",
      name: "Empty Task",
      shareToken: "abc123",
      entries: [],
    };

    mockGetTaskByShareToken.mockResolvedValue(mockTask);

    renderWithRouter("abc123");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mängi kõik/i }),
      ).toBeDisabled();
    });

    expect(screen.getByRole("button", { name: /kopeeri/i })).toBeDisabled();
  });
});
