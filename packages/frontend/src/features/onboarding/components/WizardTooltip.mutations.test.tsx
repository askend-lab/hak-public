// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import WizardTooltip from "./WizardTooltip";
import type { WizardStep } from "@/types/onboarding";

/**
 * Mutation-killing tests for WizardTooltip
 *
 * These tests use non-zero tooltip dimensions to properly verify
 * position calculations, viewport clamping, and arrow offsets.
 */
describe("WizardTooltip mutation tests", () => {
  const TOOLTIP_W = 300;
  const TOOLTIP_H = 200;
  const TARGET = { top: 100, bottom: 150, left: 200, right: 300, width: 100, height: 50 };
  const PADDING = 16;
  const ARROW = 12;

  const makeStep = (position: "top" | "bottom" | "left" | "right"): WizardStep => ({
    id: "step-1",
    title: "Title",
    description: "Desc",
    targetSelector: ".mut-target",
    position,
  });

  const baseProps = {
    currentIndex: 0,
    totalSteps: 3,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSkip: vi.fn(),
    isFirst: true,
    isLast: false,
  };

  let targetEl: HTMLDivElement;

  const mockBCR = (targetRect: Record<string, number>) => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      if (this.classList.contains("mut-target")) {
        return { ...targetRect, x: targetRect.left, y: targetRect.top, toJSON: () => {} } as DOMRect;
      }
      if (this.classList.contains("wizard__tooltip")) {
        return { top: 0, bottom: TOOLTIP_H, left: 0, right: TOOLTIP_W, width: TOOLTIP_W, height: TOOLTIP_H, x: 0, y: 0, toJSON: () => {} } as DOMRect;
      }
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {} } as DOMRect;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    targetEl = document.createElement("div");
    targetEl.className = "mut-target";
    targetEl.scrollIntoView = vi.fn();
    document.body.appendChild(targetEl);

    mockBCR(TARGET);

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => { cb(0); return 1; });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true, configurable: true });
  });

  afterEach(() => {
    if (targetEl.parentNode) document.body.removeChild(targetEl);
    vi.restoreAllMocks();
  });

  // ─── Position calculations with non-zero tooltip dimensions ───

  describe("positioning with realistic dimensions", () => {
    it("position=bottom: top = target.bottom + padding + arrow", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(parseFloat(tooltip.style.top)).toBe(TARGET.bottom + PADDING + ARROW); // 178
    });

    it("position=bottom: left centers tooltip under target", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const expected = TARGET.left + TARGET.width / 2 - TOOLTIP_W / 2; // 100
      expect(parseFloat(tooltip.style.left)).toBe(expected);
    });

    it("position=top: top clamped when going above viewport", () => {
      const { container } = render(<WizardTooltip step={makeStep("top")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // 100 - 200 - 16 - 12 = -128 → clamped to padding (16)
      expect(parseFloat(tooltip.style.top)).toBe(PADDING);
    });

    it("position=top: left centers when not clamped", () => {
      mockBCR({ top: 400, bottom: 450, left: 400, right: 500, width: 100, height: 50 });
      const { container } = render(<WizardTooltip step={makeStep("top")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // left = 400 + 50 - 150 = 300 (not clamped)
      expect(parseFloat(tooltip.style.left)).toBe(300);
      // top = 400 - 200 - 16 - 12 = 172 (not clamped)
      expect(parseFloat(tooltip.style.top)).toBe(172);
    });

    it("position=left: left clamped when going off left", () => {
      const { container } = render(<WizardTooltip step={makeStep("left")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // 200 - 300 - 16 - 12 = -128 → clamped to 16
      expect(parseFloat(tooltip.style.left)).toBe(PADDING);
    });

    it("position=left: top = target.top + target.height/2 - tooltipH/2", () => {
      const { container } = render(<WizardTooltip step={makeStep("left")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(parseFloat(tooltip.style.top)).toBe(TARGET.top + TARGET.height / 2 - TOOLTIP_H / 2); // 25
    });

    it("position=right: left = target.right + padding + arrow", () => {
      const { container } = render(<WizardTooltip step={makeStep("right")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(parseFloat(tooltip.style.left)).toBe(TARGET.right + PADDING + ARROW); // 328
    });

    it("position=right: top centers vertically", () => {
      const { container } = render(<WizardTooltip step={makeStep("right")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(parseFloat(tooltip.style.top)).toBe(TARGET.top + TARGET.height / 2 - TOOLTIP_H / 2); // 25
    });
  });

  // ─── Viewport clamping ───

  describe("viewport clamping", () => {
    it("clamps left to padding when going off left edge", () => {
      mockBCR({ top: 300, bottom: 350, left: 10, right: 60, width: 50, height: 50 });
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // left = 10 + 25 - 150 = -115 → clamped to 16
      expect(parseFloat(tooltip.style.left)).toBe(PADDING);
    });

    it("clamps right edge when going off right side", () => {
      Object.defineProperty(window, "innerWidth", { value: 400, writable: true, configurable: true });
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // left = 100, but 100 + 300 > 400 - 16 → clamped to 400 - 300 - 16 = 84
      expect(parseFloat(tooltip.style.left)).toBe(400 - TOOLTIP_W - PADDING);
    });

    it("clamps top to padding when going above viewport", () => {
      mockBCR({ top: 30, bottom: 80, left: 400, right: 500, width: 100, height: 50 });
      const { container } = render(<WizardTooltip step={makeStep("top")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // top = 30 - 200 - 16 - 12 = -198 → clamped to 16
      expect(parseFloat(tooltip.style.top)).toBe(PADDING);
    });

    it("clamps bottom edge when going below viewport", () => {
      Object.defineProperty(window, "innerHeight", { value: 300, writable: true, configurable: true });
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      // top = 178, but 178 + 200 > 300 - 16 → clamped to 300 - 200 - 16 = 84
      expect(parseFloat(tooltip.style.top)).toBe(300 - TOOLTIP_H - PADDING);
    });
  });

  // ─── Arrow offset calculations ───

  describe("arrow offset", () => {
    it("calculates horizontal arrow offset for bottom position", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // targetCenter = 250, tooltipLeft = 100, offset = ((250-100)/300)*100 = 50%
      expect(style).toContain("--arrow-offset: 50%");
    });

    it("clamps arrow offset to minimum 15%", () => {
      mockBCR({ top: 300, bottom: 350, left: 5, right: 25, width: 20, height: 50 });
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // targetCenter = 15, tooltipLeft = 16 (clamped), offset = ((15-16)/300)*100 = -0.33 → clamped to 15
      expect(style).toContain("--arrow-offset: 15%");
    });

    it("calculates non-50% horizontal offset for position=top", () => {
      mockBCR({ top: 400, bottom: 450, left: 100, right: 150, width: 50, height: 50 });
      const { container } = render(<WizardTooltip step={makeStep("top")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // arrowPosition=bottom, targetCenter.x = 125, tooltipLeft = -25 → clamped to 16
      // offset = ((125 - 16) / 300) * 100 ≈ 36.3%
      expect(style).not.toContain("--arrow-offset: 50%");
      expect(tooltip.className).toContain("wizard__tooltip--arrow-bottom");
    });

    it("calculates non-50% vertical offset for position=right", () => {
      mockBCR({ top: 30, bottom: 60, left: 10, right: 60, width: 50, height: 30 });
      const { container } = render(<WizardTooltip step={makeStep("right")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // arrowPosition=left, targetCenter.y = 45, tooltipTop = -55 → clamped to 16
      // offset = ((45-16)/200)*100 = 14.5 → clamped to 15
      expect(style).toContain("--arrow-offset: 15%");
    });

    it("calculates non-50% vertical offset for position=left", () => {
      mockBCR({ top: 700, bottom: 730, left: 400, right: 500, width: 100, height: 30 });
      const { container } = render(<WizardTooltip step={makeStep("left")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // arrowPosition=right, targetCenter.y = 715, tooltipTop = 615 → clamped to 552
      // offset = ((715-552)/200)*100 = 81.5% (not 50%)
      expect(style).not.toContain("--arrow-offset: 50%");
    });

    it("calculates 50% vertical offset for position=right when centered", () => {
      const { container } = render(<WizardTooltip step={makeStep("right")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      // targetCenter.y = 125, tooltipTop = 25, offset = ((125-25)/200)*100 = 50%
      expect(style).toContain("--arrow-offset: 50%");
    });
  });

  // ─── Opacity logic ───

  describe("opacity", () => {
    it("is 0 when position not yet calculated (top=0, left=0)", () => {
      document.body.removeChild(targetEl);
      const { container } = render(
        <WizardTooltip step={{ ...makeStep("bottom"), targetSelector: ".nonexistent" }} {...baseProps} />,
      );
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(tooltip.style.opacity).toBe("0");
    });

    it("is 1 when position is calculated (both non-zero)", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      expect(parseFloat(tooltip.style.top)).toBeGreaterThan(0);
      expect(parseFloat(tooltip.style.left)).toBeGreaterThan(0);
      expect(tooltip.style.opacity).toBe("1");
    });
  });

  // ─── Retry mechanism ───

  describe("retry mechanism", () => {
    it("retries when target not found initially then found", () => {
      let callCount = 0;
      const origQS = document.querySelector.bind(document);
      vi.spyOn(document, "querySelector").mockImplementation((selector: string) => {
        if (selector === ".mut-target") {
          callCount++;
          if (callCount <= 2) return null;
          return origQS(selector);
        }
        return origQS(selector);
      });

      const rafCalls: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCalls.push(cb);
        cb(0);
        return rafCalls.length;
      });

      render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      expect(callCount).toBeGreaterThan(1);
    });
  });

  // ─── Event listeners ───

  describe("event listeners", () => {
    it("recalculates on resize", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const topBefore = parseFloat(tooltip.style.top);

      mockBCR({ top: 200, bottom: 250, left: 200, right: 300, width: 100, height: 50 });
      act(() => { fireEvent.resize(window); });
      expect(parseFloat(tooltip.style.top)).not.toBe(topBefore);
    });

    it("recalculates on scroll", () => {
      const { container } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;

      mockBCR({ top: 50, bottom: 100, left: 200, right: 300, width: 100, height: 50 });
      act(() => { fireEvent.scroll(window); });
      expect(parseFloat(tooltip.style.top)).toBe(100 + PADDING + ARROW); // 128
    });

    it("cleans up event listeners on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    });

    it("addEventListener uses capture=true for scroll", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      render(<WizardTooltip step={makeStep("bottom")} {...baseProps} />);
      const scrollCalls = addSpy.mock.calls.filter(c => c[0] === "scroll");
      expect(scrollCalls.length).toBeGreaterThan(0);
      expect(scrollCalls[0]?.[2]).toBe(true);
    });
  });

  // ─── No target element found ───

  describe("no target element", () => {
    it("does not crash and keeps initial state", () => {
      document.body.removeChild(targetEl);
      const { container } = render(
        <WizardTooltip step={{ ...makeStep("bottom"), targetSelector: ".nonexistent" }} {...baseProps} />,
      );
      expect(container.querySelector(".wizard__tooltip")).toBeInTheDocument();
    });
  });

  // ─── Arrow offset fallback & initial state ───

  describe("initial state", () => {
    it("uses 50 as default arrow offset when not positioned", () => {
      document.body.removeChild(targetEl);
      const { container } = render(
        <WizardTooltip step={{ ...makeStep("bottom"), targetSelector: ".nonexistent" }} {...baseProps} />,
      );
      const tooltip = container.querySelector(".wizard__tooltip") as HTMLElement;
      const style = tooltip.getAttribute("style") || "";
      expect(style).toContain("--arrow-offset: 50%");
    });

    it("initial arrowPosition is 'top' (not empty string)", () => {
      document.body.removeChild(targetEl);
      const { container } = render(
        <WizardTooltip step={{ ...makeStep("bottom"), targetSelector: ".nonexistent" }} {...baseProps} />,
      );
      const tooltip = container.querySelector(".wizard__tooltip");
      expect(tooltip?.className).toContain("wizard__tooltip--arrow-top");
    });
  });
});
