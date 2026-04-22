// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

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

});
