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

describe("SentenceMenu actions", () => {
  it("calls onExplorePhonetic", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onExplorePhonetic={fn} />);
    await userEvent.click(screen.getByText("Uuri häälduskuju"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onDownload", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onDownload={fn} />);
    await userEvent.click(screen.getByText("Lae alla .wav fail"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onCopyText", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onCopyText={fn} />);
    await userEvent.click(screen.getByText("Kopeeri tekst"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("calls onRemove", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onRemove={fn} />);
    await userEvent.click(screen.getByText("Eemalda"));
    expect(fn).toHaveBeenCalledWith("s1");
  });

  it("closes on backdrop", async () => {
    const fn = vi.fn();
    render(<SentenceMenu {...defaultProps} onClose={fn} />);
    const bd = document.querySelector(".synthesis__menu-backdrop");
    if (bd) {await userEvent.click(bd);}
    expect(fn).toHaveBeenCalled();
  });

});
