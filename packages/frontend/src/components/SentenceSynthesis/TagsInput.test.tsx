// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagsInput } from "./TagsInput";

vi.mock("../ui/Icons", () => ({
  ChevronDownIcon: (): React.ReactElement => (
    <span data-testid="chevron">▼</span>
  ),
  CloseIcon: (): React.ReactElement => <span data-testid="close">×</span>,
}));

describe("TagsInput", () => {
  const baseProps = {
    id: "s1",
    tags: ["hello", "world"],
    currentInput: "",
    sentenceIndex: 0,
    tagMenuItems: [{ label: "Variant", onClick: vi.fn() }],
  };

  it("renders tags", () => {
    render(<TagsInput {...baseProps} />);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders input when onInputChange provided", () => {
    const onInputChange = vi.fn();
    render(<TagsInput {...baseProps} onInputChange={onInputChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new" } });
    expect(onInputChange).toHaveBeenCalledWith("s1", "new");
  });

  it("renders clear button when tags exist and onClear provided", () => {
    const onClear = vi.fn();
    render(<TagsInput {...baseProps} onClear={onClear} />);
    fireEvent.click(screen.getByLabelText("Clear all"));
    expect(onClear).toHaveBeenCalledWith("s1");
  });

  it("opens tag menu on click", () => {
    const onTagMenuOpen = vi.fn();
    render(<TagsInput {...baseProps} onTagMenuOpen={onTagMenuOpen} />);
    fireEvent.click(screen.getByText("hello"));
    expect(onTagMenuOpen).toHaveBeenCalledWith("s1", 0);
  });

  it("opens tag menu on Enter key", () => {
    const onTagMenuOpen = vi.fn();
    render(<TagsInput {...baseProps} onTagMenuOpen={onTagMenuOpen} />);
    fireEvent.keyDown(screen.getByText("hello"), { key: "Enter" });
    expect(onTagMenuOpen).toHaveBeenCalledWith("s1", 0);
  });

  it("renders tag dropdown menu when open", () => {
    const onTagMenuClose = vi.fn();
    const onClick = vi.fn();
    render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        tagMenuItems={[{ label: "Pick", onClick }]}
        onTagMenuClose={onTagMenuClose}
      />,
    );
    expect(screen.getByText("Pick")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pick"));
    expect(onClick).toHaveBeenCalledWith("s1", 0, "hello");
    expect(onTagMenuClose).toHaveBeenCalled();
  });

  it("closes tag menu on backdrop click", () => {
    const onTagMenuClose = vi.fn();
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        onTagMenuClose={onTagMenuClose}
      />,
    );
    const backdrop = container.querySelector(
      ".sentence-synthesis-item__tag-menu-backdrop",
    );
    if (backdrop) fireEvent.click(backdrop);
    expect(onTagMenuClose).toHaveBeenCalled();
  });

  it("renders editing input when editingTag matches", () => {
    const onEditTagChange = vi.fn();
    const onEditTagKeyDown = vi.fn();
    const onEditTagCommit = vi.fn();
    render(
      <TagsInput
        {...baseProps}
        editingTag={{ sentenceId: "s1", tagIndex: 0, value: "hel" }}
        onEditTagChange={onEditTagChange}
        onEditTagKeyDown={onEditTagKeyDown}
        onEditTagCommit={onEditTagCommit}
      />,
    );
    const input = screen.getByDisplayValue("hel");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "hello2" } });
    expect(onEditTagChange).toHaveBeenCalledWith("hello2");
  });

  it("shows loading spinner when loadingTagIndex matches", () => {
    render(<TagsInput {...baseProps} loadingTagIndex={0} />);
    expect(screen.getByLabelText("Laen variante")).toBeInTheDocument();
  });

  it("shows selected tag style", () => {
    const { container } = render(
      <TagsInput
        {...baseProps}
        selectedTagIndex={0}
        isPronunciationPanelOpen={true}
      />,
    );
    const tag = container.querySelector(
      ".sentence-synthesis-item__tag--selected",
    );
    expect(tag).toBeInTheDocument();
  });

  it("calls onInputBlur when input loses focus", () => {
    const onInputBlur = vi.fn();
    const onInputChange = vi.fn();
    render(
      <TagsInput
        {...baseProps}
        onInputChange={onInputChange}
        onInputBlur={onInputBlur}
      />,
    );
    fireEvent.blur(screen.getByRole("textbox"));
    expect(onInputBlur).toHaveBeenCalledWith("s1");
  });

  it("renders placeholder when no tags", () => {
    const onInputChange = vi.fn();
    render(
      <TagsInput {...baseProps} tags={[]} onInputChange={onInputChange} />,
    );
    expect(
      screen.getByPlaceholderText("Kirjuta sõna või lause ja vajuta Enter"),
    ).toBeInTheDocument();
  });
});
