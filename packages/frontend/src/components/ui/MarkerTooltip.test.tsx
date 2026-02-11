// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarkerTooltip from "./MarkerTooltip";
import { markers } from "@/data/markerData";

describe("MarkerTooltip", () => {
  const testMarker = markers[0]!; // kolmas välde

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders children", () => {
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );
      expect(screen.getByText("Test Button")).toBeInTheDocument();
    });

    it("does not show tooltip initially", () => {
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("wraps children in a wrapper element", () => {
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );
      const wrapper = screen
        .getByText("Test Button")
        .closest(".marker-tooltip-wrapper");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("hover behavior", () => {
    it("shows tooltip on hover", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("hides tooltip when mouse leaves", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      await user.unhover(screen.getByText("Test Button"));

      await waitFor(
        () => {
          expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        },
        { timeout: 200 },
      );
    });
  });

  describe("tooltip content", () => {
    it("shows marker symbol", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));

      await waitFor(() => {
        expect(screen.getByText("`")).toBeInTheDocument();
      });
    });

    it("shows marker name", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));

      await waitFor(() => {
        expect(screen.getByText("kolmas välde")).toBeInTheDocument();
      });
    });

    it("shows marker rule", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));

      await waitFor(() => {
        expect(
          screen.getByText(/Paikneb kolmandavältelise/),
        ).toBeInTheDocument();
      });
    });

    it("shows marker examples", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));

      await waitFor(() => {
        expect(screen.getByText("k`ätte")).toBeInTheDocument();
      });
    });
  });

  describe("keyboard handling", () => {
    it("hides tooltip on Escape key", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      const wrapper = screen
        .getByText("Test Button")
        .closest(".marker-tooltip-wrapper")!;
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.keyDown(wrapper, { key: "Escape" });
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });
  });

  describe("touch handling", () => {
    it("toggles tooltip on touch", async () => {
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      const wrapper = screen
        .getByText("Test Button")
        .closest(".marker-tooltip-wrapper")!;
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.touchStart(wrapper);
    });
  });

  describe("tooltip mouse interactions", () => {
    it("keeps tooltip visible when hovering tooltip", async () => {
      const user = userEvent.setup();
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Test Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Test Button"));
      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      const tooltip = screen.getByRole("tooltip");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.mouseEnter(tooltip);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.mouseLeave(tooltip);
    });
  });

  describe("touch device click outside", () => {
    it("closes tooltip when clicking outside on touch device", async () => {
      // Simulate touch device
      Object.defineProperty(window, "ontouchstart", {
        value: true,
        configurable: true,
      });
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: 1,
        configurable: true,
        writable: true,
      });

      const { fireEvent } = await import("@testing-library/react");
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <MarkerTooltip marker={testMarker}>
            <button>Touch Button</button>
          </MarkerTooltip>
        </div>,
      );

      const wrapper = screen
        .getByText("Touch Button")
        .closest(".marker-tooltip-wrapper")!;
      fireEvent.touchStart(wrapper);
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();
      });

      // Click outside to close
      fireEvent.mouseDown(screen.getByTestId("outside"));
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });

      // Cleanup
      delete (window as unknown as Record<string, unknown>).ontouchstart;
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: 0,
        configurable: true,
        writable: true,
      });
    });
  });

  describe("showTooltip clears pending hide timeout", () => {
    it("keeps tooltip visible when re-entering quickly", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <MarkerTooltip marker={testMarker}>
          <button>Hover Button</button>
        </MarkerTooltip>,
      );

      await user.hover(screen.getByText("Hover Button"));
      await waitFor(() =>
        expect(screen.getByRole("tooltip")).toBeInTheDocument(),
      );

      // Leave and quickly re-enter before hide timeout
      await user.unhover(screen.getByText("Hover Button"));
      await user.hover(screen.getByText("Hover Button"));

      // Tooltip should still be visible
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe("all markers", () => {
    it.each(markers)(
      "renders tooltip for marker: $symbol",
      async ({ symbol, name }) => {
        const user = userEvent.setup();
        const marker = markers.find((m) => m.symbol === symbol)!;

        render(
          <MarkerTooltip marker={marker}>
            <button>Test Button</button>
          </MarkerTooltip>,
        );

        await user.hover(screen.getByText("Test Button"));

        await waitFor(() => {
          expect(screen.getByText(name)).toBeInTheDocument();
        });
      },
    );
  });
});
