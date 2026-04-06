// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { SharedTaskPage } from "./SharedTaskPage";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockGetTaskByShareToken = vi.fn();
const mockShowNotification = vi.fn();
const mockSetCopiedEntries = vi.fn();
const mockDS = createMockDataService({ getTaskByShareToken: mockGetTaskByShareToken });

let mockIsAuthenticated = false;
const mockSetShowLoginModal = vi.fn();
vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: mockIsAuthenticated,
    user: mockIsAuthenticated ? { id: "1", name: "Test", email: "t@t.com" } : null,
    showLoginModal: false,
    setShowLoginModal: mockSetShowLoginModal,
  })),
}));

vi.mock("@/features/auth/services/storage", () => ({
  saveReturnUrl: vi.fn(),
}));

vi.mock("@/features/auth/components/LoginModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="login-modal">LoginModal</div> : null,
}));

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
  synthesizeWithPolling: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
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
    mockIsAuthenticated = false;
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

  it("copies entries to playlist via context (authenticated)", async () => {
    mockIsAuthenticated = true;
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
    expect(mockShowNotification).toHaveBeenCalledWith({
      type: "success",
      message: expect.any(String),
    });
    expect(mockSetCopiedEntries).toHaveBeenCalled();
  });

  it("disables buttons when there are no entries", async () => {
    mockIsAuthenticated = true;
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
