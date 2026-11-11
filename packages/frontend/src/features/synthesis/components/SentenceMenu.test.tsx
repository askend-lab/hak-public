// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentenceMenu from "./SentenceMenu";

const defaultProps = {
  isAuthenticated: false,
  sentenceId: "s1",
  sentenceText: "test",
  menuSearchQuery: "",
  onSearchChange: vi.fn(),
  isLoadingTasks: false,
  tasks: [],
  onAddToTask: vi.fn(),
  onCreateNewTask: vi.fn(),
  onExplorePhonetic: vi.fn(),
  onDownload: vi.fn(),
  onCopyText: vi.fn(),
  onRemove: vi.fn(),
  onLogin: vi.fn(),
  onClose: vi.fn(),
};

describe("SentenceMenu unauthenticated", () => {
  it("shows login button when not authenticated", () => {
    render(<SentenceMenu {...defaultProps} />);
    expect(screen.getByText("Lisa ülesandesse")).toBeInTheDocument();
  });

  it("calls onLogin on click", async () => {
    const onLogin = vi.fn();
      const onClose = vi.fn();
    render(
      <SentenceMenu {...defaultProps} onLogin={onLogin} onClose={onClose} />,
    );
    await userEvent.click(screen.getByText("Lisa ülesandesse"));
    expect(onLogin).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

});
