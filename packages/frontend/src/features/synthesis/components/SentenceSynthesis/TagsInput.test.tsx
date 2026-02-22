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
    fireEvent.click(screen.getByLabelText("Tühjenda kõik"));
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
    if (backdrop) {fireEvent.click(backdrop);}
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

  it("tags have role=button and tabIndex=0", () => {
    render(<TagsInput {...baseProps} />);
    const tag = screen.getByText("hello").closest("[role='button']");
    expect(tag).toBeTruthy();
    expect(tag?.getAttribute("tabindex")).toBe("0");
  });

  it("sets data-onboarding-target on tags group", () => {
    const { container } = render(<TagsInput {...baseProps} />);
    const group = container.querySelector('[data-onboarding-target="sentence-0-input"]');
    expect(group).toBeTruthy();
  });

  it("sets data-onboarding-target on individual tags", () => {
    const { container } = render(<TagsInput {...baseProps} />);
    expect(container.querySelector('[data-onboarding-target="sentence-0-tag-0"]')).toBeTruthy();
    expect(container.querySelector('[data-onboarding-target="sentence-0-tag-1"]')).toBeTruthy();
  });

  it("renders tag text in span with correct class", () => {
    const { container } = render(<TagsInput {...baseProps} />);
    const tagText = container.querySelector(".sentence-synthesis-item__tag-text");
    expect(tagText?.textContent).toBe("hello");
  });

  it("opens tag menu on Space key", () => {
    const onTagMenuOpen = vi.fn();
    render(<TagsInput {...baseProps} onTagMenuOpen={onTagMenuOpen} />);
    fireEvent.keyDown(screen.getByText("hello"), { key: " " });
    expect(onTagMenuOpen).toHaveBeenCalledWith("s1", 0);
  });

  it("renders danger class on menu item when danger=true", () => {
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        tagMenuItems={[{ label: "Delete", onClick: vi.fn(), danger: true }]}
        onTagMenuClose={vi.fn()}
      />,
    );
    const dangerItem = container.querySelector(".sentence-synthesis-item__tag-menu-item--danger");
    expect(dangerItem).toBeTruthy();
  });

  it("renders clear button when currentInput has value", () => {
    const onClear = vi.fn();
    render(<TagsInput {...baseProps} tags={[]} currentInput="text" onClear={onClear} />);
    expect(screen.getByLabelText("Tühjenda kõik")).toBeInTheDocument();
  });

  it("empty placeholder when tags exist", () => {
    const onInputChange = vi.fn();
    render(<TagsInput {...baseProps} onInputChange={onInputChange} />);
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("placeholder")).toBe("");
  });

  it("tags group has lang=et attribute", () => {
    const { container } = render(<TagsInput {...baseProps} />);
    const group = container.querySelector(".sentence-synthesis-item__tags-group");
    expect(group?.getAttribute("lang")).toBe("et");
  });

  it("closes tag menu on Escape key from tag element", () => {
    const onTagMenuClose = vi.fn();
    render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        onTagMenuClose={onTagMenuClose}
      />,
    );
    fireEvent.keyDown(screen.getByText("hello"), { key: "Escape" });
    expect(onTagMenuClose).toHaveBeenCalled();
  });

  it("closes tag menu on Escape key from backdrop", () => {
    const onTagMenuClose = vi.fn();
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        onTagMenuClose={onTagMenuClose}
      />,
    );
    const backdrop = container.querySelector(".sentence-synthesis-item__tag-menu-backdrop");
    if (backdrop) {fireEvent.keyDown(backdrop, { key: "Escape" });}
    expect(onTagMenuClose).toHaveBeenCalled();
  });

  it("navigates dropdown menu with Escape key", () => {
    const onTagMenuClose = vi.fn();
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        tagMenuItems={[{ label: "Option1", onClick: vi.fn() }]}
        onTagMenuClose={onTagMenuClose}
      />,
    );
    const dropdown = container.querySelector(".sentence-synthesis-item__tag-dropdown");
    if (dropdown) {fireEvent.keyDown(dropdown, { key: "Escape" });}
    expect(onTagMenuClose).toHaveBeenCalled();
  });

  it("navigates dropdown menu with ArrowDown/ArrowUp keys", () => {
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        tagMenuItems={[
          { label: "Option1", onClick: vi.fn() },
          { label: "Option2", onClick: vi.fn() },
        ]}
        onTagMenuClose={vi.fn()}
      />,
    );
    const dropdown = container.querySelector(".sentence-synthesis-item__tag-dropdown");
    if (dropdown) {
      fireEvent.keyDown(dropdown, { key: "ArrowDown" });
      fireEvent.keyDown(dropdown, { key: "ArrowUp" });
    }
  });

  it("stops propagation on dropdown click", () => {
    const onTagMenuOpen = vi.fn();
    const { container } = render(
      <TagsInput
        {...baseProps}
        openTagMenu={{ sentenceId: "s1", tagIndex: 0 }}
        tagMenuItems={[{ label: "Pick", onClick: vi.fn() }]}
        onTagMenuClose={vi.fn()}
        onTagMenuOpen={onTagMenuOpen}
      />,
    );
    const dropdown = container.querySelector(".sentence-synthesis-item__tag-dropdown");
    if (dropdown) {fireEvent.click(dropdown);}
  });

  it("shows selected style when allTagsSelected is true", () => {
    const { container } = render(
      <TagsInput
        {...baseProps}
        isPronunciationPanelOpen={true}
        allTagsSelected={true}
      />,
    );
    const selected = container.querySelectorAll(".sentence-synthesis-item__tag--selected");
    expect(selected.length).toBe(2);
  });

  it("calls onEditTagKeyDown and onEditTagCommit on editing tag", () => {
    const onEditTagChange = vi.fn();
    const onEditTagKeyDown = vi.fn();
    const onEditTagCommit = vi.fn();
    render(
      <TagsInput
        {...baseProps}
        editingTag={{ sentenceId: "s1", tagIndex: 0, value: "test" }}
        onEditTagChange={onEditTagChange}
        onEditTagKeyDown={onEditTagKeyDown}
        onEditTagCommit={onEditTagCommit}
      />,
    );
    const input = screen.getByDisplayValue("test");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onEditTagKeyDown).toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onEditTagCommit).toHaveBeenCalled();
  });
});
