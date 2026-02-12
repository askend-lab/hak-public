// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginModal from "./LoginModal";

vi.mock("@/services/auth", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(undefined),
    loginWithTara: vi.fn(),
  })),
}));

import { useAuth } from "@/services/auth";

/**
 * Mutation-killing tests for LoginModal
 * Targets: inline styles, SVG attributes, GoogleIcon/TaraIcon content, handleClose guard
 */
describe("LoginModal mutation kills", () => {
  const mockLogin = vi.fn().mockResolvedValue(undefined);
  const mockLoginWithTara = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      loginWithTara: mockLoginWithTara,
    });
  });

  it("renders null when not open", () => {
    const { container } = render(
      <LoginModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("TARA button has marginBottom style", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const taraBtn = screen.getByText(/Logi sisse TARA/).closest("button");
    expect(taraBtn?.style.marginBottom).toBe("0.75rem");
  });

  it("divider has flex display and gap", () => {
    const { container } = render(
      <LoginModal isOpen={true} onClose={vi.fn()} />,
    );
    const divider = container.querySelector(".login-modal__divider") as HTMLElement;
    expect(divider?.style.display).toBe("flex");
    expect(divider?.style.alignItems).toBe("center");
    expect(divider?.style.gap).toBe("1rem");
    expect(divider?.style.margin).toBe("0.5rem 0px");
  });

  it("hr elements have correct styles", () => {
    const { container } = render(
      <LoginModal isOpen={true} onClose={vi.fn()} />,
    );
    const hrs = container.querySelectorAll("hr");
    expect(hrs.length).toBe(2);
    hrs.forEach((hr) => {
      const styleAttr = hr.getAttribute("style") || "";
      // happy-dom expands shorthand: flex:1 → flex-grow:1, border:none → border: none none
      expect(styleAttr).toContain("flex-grow");
      expect(styleAttr).toContain("border");
    });
  });

  it("separator span has correct font size", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const span = screen.getByText("või");
    expect((span as HTMLElement).style.fontSize).toBe("0.875rem");
  });

  it("GoogleIcon SVG has correct viewBox", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const googleBtn = screen.getByText(/Jätka Google/).closest("button");
    const svg = googleBtn?.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("height")).toBe("20");
  });

  it("TaraIcon SVG has correct attributes", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const taraBtn = screen.getByText(/Logi sisse TARA/).closest("button");
    const svg = taraBtn?.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    const rect = svg?.querySelector("rect");
    expect(rect?.getAttribute("fill")).toBe("#0066CC");
    const text = svg?.querySelector("text");
    expect(text?.textContent).toBe("EE");
  });

  it("handleClose does not call onClose while loading", async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal isOpen={true} onClose={onClose} />);

    await user.click(screen.getByText(/Jätka Google/));
    // Now loading — close via BaseModal's close button
    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    await user.click(closeBtn);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("handleClose calls onClose and clears error when not loading", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole("button", { name: /sulge/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("handleTaraLogin sets error to null and loading to true", async () => {
    const user = userEvent.setup();
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    await user.click(screen.getByText(/Logi sisse TARA/));
    // Both buttons should show loading text
    const loadingTexts = screen.getAllByText("Suunan...");
    expect(loadingTexts.length).toBe(2);
    expect(mockLoginWithTara).toHaveBeenCalled();
  });

  it("Google button has flex class", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const googleBtn = screen.getByText(/Jätka Google/).closest("button");
    expect(googleBtn?.className).toContain("login-modal__google-button--flex");
  });

  it("logo image has correct src and alt", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const logo = document.querySelector(".login-modal__intro-logo") as HTMLImageElement;
    expect(logo.src).toContain("/icons/logo.png");
    expect(logo.alt).toBe("Logo");
  });

  it("intro title text is 'Logi sisse'", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const title = document.querySelector(".login-modal__intro-title");
    expect(title?.textContent).toBe("Logi sisse");
  });

  it("passes className='login-modal' to BaseModal", () => {
    const { container } = render(
      <LoginModal isOpen={true} onClose={vi.fn()} />,
    );
    expect(container.querySelector(".login-modal")).toBeTruthy();
  });

  it("returns null when isOpen is false (kills L102 false mutant)", () => {
    const { container } = render(
      <LoginModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.querySelector(".login-modal")).toBeNull();
  });

  it("hr elements have borderTop style (kills L139/L154 empty string)", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const divider = document.querySelector(".login-modal__divider");
    const hrs = divider?.querySelectorAll("hr");
    expect(hrs?.length).toBe(2);
    hrs?.forEach((hr) => {
      expect(hr.style.borderTop).toBeTruthy();
    });
  });

  it("divider container has expected children", () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const divider = document.querySelector(".login-modal__divider");
    expect(divider?.childElementCount).toBe(3);
    expect(divider?.querySelector("span")?.textContent).toBe("või");
  });
});
