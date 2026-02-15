// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksView from "./TasksView";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockGetTask = vi.fn();
const mockDS = createMockDataService({ getTask: mockGetTask });
const dsWrapper = ({ children }: { children: React.ReactNode }) => <DataServiceTestWrapper dataService={mockDS}>{children}</DataServiceTestWrapper>;

const mockUseAuth = vi.fn();
vi.mock("@/features/auth/services", () => ({ useAuth: (...args: unknown[]) => mockUseAuth(...args) }));

const mockUseUserTasks = vi.fn();
vi.mock("@/hooks", () => ({ useUserTasks: (...args: unknown[]) => mockUseUserTasks(...args) }));

vi.mock("./TaskManager", () => ({
  default: ({ tasks, onEditTask, onViewTask, onDeleteTask, onShareTask }: {
    tasks: { id: string; name: string }[];
    onEditTask: (id: string) => void;
    onViewTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onShareTask: (id: string) => void;
  }) => (
    <div data-testid="task-manager">
      {tasks.map(t => (
        <div key={t.id}>
          <span>{t.name}</span>
          <button onClick={() => onEditTask(t.id)}>edit-{t.id}</button>
          <button onClick={() => onViewTask(t.id)}>view-{t.id}</button>
          <button onClick={() => onDeleteTask(t.id)}>del-{t.id}</button>
          <button onClick={() => onShareTask(t.id)}>share-{t.id}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("./TaskDetailView", () => ({
  default: ({ taskId, onBack, onEditTask, onDeleteTask, onNavigateToSynthesis }: {
    taskId: string; onBack: () => void;
    onEditTask: (id: string) => void; onDeleteTask: (id: string) => void;
    onNavigateToSynthesis: () => void;
  }) => (
    <div data-testid="detail">
      <span>Detail:{taskId}</span>
      <button onClick={onBack}>back</button>
      <button onClick={() => onEditTask(taskId)}>edit-detail</button>
      <button onClick={() => onDeleteTask(taskId)}>del-detail</button>
      <button onClick={onNavigateToSynthesis}>synth</button>
    </div>
  ),
}));

describe("TasksView mutation kills", () => {
  const props = {
    selectedTaskId: null as string | null,
    taskRefreshTrigger: 0,
    onBack: vi.fn(), onViewTask: vi.fn(), onCreateTask: vi.fn(),
    onEditTask: vi.fn(), onDeleteTask: vi.fn(), onShareTask: vi.fn(),
    onNavigateToSynthesis: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1", name: "Test" }, isAuthenticated: true });
    mockUseUserTasks.mockReturnValue({
      tasks: [{ id: "t1", name: "Task One", description: "desc", entryCount: 2, createdAt: new Date() }],
      isLoading: false, error: null, isEmpty: false,
    });
    mockGetTask.mockResolvedValue({
      id: "t1", name: "Task One", description: "desc", shareToken: "tok-1",
    });
  });

  it("renders task list with header when tasks exist", () => {
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText("Ülesanded")).toBeInTheDocument();
    expect(screen.getByText("Loo uus ülesanne")).toBeInTheDocument();
    expect(screen.getByTestId("task-manager")).toBeInTheDocument();
  });

  it("passes taskRefreshTrigger to useUserTasks", () => {
    render(<TasksView {...props} taskRefreshTrigger={5} />, { wrapper: dsWrapper });
    expect(mockUseUserTasks).toHaveBeenCalledWith(5);
  });

  it("shows loading spinner", () => {
    mockUseUserTasks.mockReturnValue({ tasks: [], isLoading: true, error: null, isEmpty: false });
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText("Laen ülesandeid...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows empty state with create button", async () => {
    mockUseUserTasks.mockReturnValue({ tasks: [], isLoading: false, error: null, isEmpty: true });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText("Ülesanded puuduvad")).toBeInTheDocument();
    expect(screen.getByText(/Sul pole veel/)).toBeInTheDocument();
    const btn = screen.getByText("Loo esimene ülesanne");
    await user.click(btn);
    expect(props.onCreateTask).toHaveBeenCalled();
  });

  it("shows error message when error exists", () => {
    mockUseUserTasks.mockReturnValue({
      tasks: [{ id: "t1", name: "T", entryCount: 0 }],
      isLoading: false, error: "Load failed", isEmpty: false,
    });
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    expect(screen.getByText(/Viga ülesannete laadimisel: Load failed/)).toBeInTheDocument();
  });

  it("renders TaskDetailView when selectedTaskId is set", () => {
    render(<TasksView {...props} selectedTaskId="t1" />, { wrapper: dsWrapper });
    expect(screen.getByTestId("detail")).toBeInTheDocument();
    expect(screen.getByText("Detail:t1")).toBeInTheDocument();
  });

  it("calls onCreateTask from header button", async () => {
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("Loo uus ülesanne"));
    expect(props.onCreateTask).toHaveBeenCalled();
  });

  it("handleEditTask fetches task and calls onEditTask with data", async () => {
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("edit-t1"));
    await waitFor(() => {
      expect(mockGetTask).toHaveBeenCalledWith("t1");
      expect(props.onEditTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: "t1", name: "Task One" }),
      );
    });
  });

  it("handleEditTask includes description only when present", async () => {
    mockGetTask.mockResolvedValueOnce({ id: "t1", name: "T1", description: null });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("edit-t1"));
    await waitFor(() => {
      const arg = props.onEditTask.mock.calls[0]?.[0];
      expect(arg.id).toBe("t1");
      expect(arg.description).toBeUndefined();
    });
  });

  it("handleEditTask skips onEditTask when task is null", async () => {
    mockGetTask.mockResolvedValueOnce(null);
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("edit-t1"));
    await waitFor(() => expect(mockGetTask).toHaveBeenCalled());
    expect(props.onEditTask).not.toHaveBeenCalled();
  });

  it("handleEditTask does nothing when user is null", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("edit-t1"));
    expect(mockGetTask).not.toHaveBeenCalled();
  });

  it("handleEditTask logs error on failure", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockGetTask.mockRejectedValueOnce(new Error("fail"));
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("edit-t1"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Failed to fetch task for editing:", expect.any(Error)));
    spy.mockRestore();
  });

  it("handleShareTask fetches task and calls onShareTask with shareToken", async () => {
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    await waitFor(() => {
      expect(props.onShareTask).toHaveBeenCalledWith(
        expect.objectContaining({ id: "t1", shareToken: "tok-1" }),
      );
    });
  });

  it("handleShareTask omits description when null", async () => {
    mockGetTask.mockResolvedValueOnce({ id: "t1", name: "T", description: null, shareToken: "s" });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    await waitFor(() => {
      const arg = props.onShareTask.mock.calls[0]?.[0];
      expect(arg.description).toBeUndefined();
    });
  });

  it("handleShareTask omits shareToken when falsy", async () => {
    mockGetTask.mockResolvedValueOnce({ id: "t1", name: "T", description: "d", shareToken: "" });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    await waitFor(() => {
      const arg = props.onShareTask.mock.calls[0]?.[0];
      expect(arg.shareToken).toBeUndefined();
    });
  });

  it("handleShareTask does nothing when user is null", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    expect(mockGetTask).not.toHaveBeenCalled();
  });

  it("handleShareTask logs error on failure", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockGetTask.mockRejectedValueOnce(new Error("fail"));
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Failed to fetch task for sharing:", expect.any(Error)));
    spy.mockRestore();
  });

  it("handleShareTask skips when task null", async () => {
    mockGetTask.mockResolvedValueOnce(null);
    const user = userEvent.setup();
    render(<TasksView {...props} />, { wrapper: dsWrapper });
    await user.click(screen.getByText("share-t1"));
    await waitFor(() => expect(mockGetTask).toHaveBeenCalled());
    expect(props.onShareTask).not.toHaveBeenCalled();
  });
});
