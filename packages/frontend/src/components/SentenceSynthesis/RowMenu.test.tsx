import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RowMenu } from "./RowMenu";

vi.mock("../ui/Icons", () => ({
  MoreIcon: (): React.ReactElement => <span data-testid="more-icon">⋮</span>,
}));

describe("RowMenu", () => {
  const baseProps = {
    id: "s1",
    isOpen: false,
    items: [
      { label: "Edit", onClick: vi.fn() },
      {
        label: "Delete",
        onClick: vi.fn(),
        danger: true,
        icon: <span>🗑</span>,
      },
    ],
    onOpen: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders menu button", () => {
    render(<RowMenu {...baseProps} />);
    expect(
      screen.getByRole("button", { name: "Rohkem valikuid" }),
    ).toBeInTheDocument();
  });

  it("opens menu on button click", () => {
    const onOpen = vi.fn();
    render(<RowMenu {...baseProps} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Rohkem valikuid" }));
    expect(onOpen).toHaveBeenCalledWith("s1");
  });

  it("renders dropdown when open", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls item onClick and onClose when item clicked", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const items = [{ label: "Action", onClick }];
    render(
      <RowMenu {...baseProps} isOpen={true} items={items} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText("Action"));
    expect(onClick).toHaveBeenCalledWith("s1");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click", () => {
    const onClose = vi.fn();
    const { container } = render(
      <RowMenu {...baseProps} isOpen={true} onClose={onClose} />,
    );
    const backdrop = container.querySelector(
      ".sentence-synthesis-item__menu-backdrop",
    );
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<RowMenu {...baseProps} isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders icon when provided", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    expect(screen.getByText("🗑")).toBeInTheDocument();
  });

  it("renders danger class for danger items", () => {
    render(<RowMenu {...baseProps} isOpen={true} />);
    const deleteBtn = screen.getByText("Delete").closest("button");
    expect(deleteBtn?.className).toContain("danger");
  });
});
