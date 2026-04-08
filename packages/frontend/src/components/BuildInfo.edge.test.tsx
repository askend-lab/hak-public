// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import BuildInfo from "./BuildInfo";

describe("BuildInfo with __BUILD_INFO__ defined", () => {
  let BuildInfoDefined: typeof BuildInfo;

  beforeAll(async () => {
    (globalThis as Record<string, unknown>).__BUILD_INFO__ = {
      commitHash: "abc123",
      branch: "test-branch",
      commitDate: "2026-06-01",
      buildTime: "2026-06-01T12:00:00Z",
    };
    vi.resetModules();
    const mod = await import("./BuildInfo");
    BuildInfoDefined = mod.default;
  });

  afterAll(() => {
    delete (globalThis as Record<string, unknown>).__BUILD_INFO__;
    vi.resetModules();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses __BUILD_INFO__ values when defined (kills L27 mutations)", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfoDefined />);
    // The button text includes the commit hash
    expect(screen.getByText("abc123")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("test-branch")).toBeInTheDocument();
  });

  it("formats buildTime with formatDateTime (kills L35 empty string)", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfoDefined />);
    fireEvent.click(screen.getByRole("button"));
    const builtRow = screen.getByText("Built").closest(".build-info-row");
    const builtValue = builtRow?.querySelector(".build-info-value");
    // buildTime "2026-06-01T12:00:00Z" should format to a non-empty date string
    expect(builtValue?.textContent?.length).toBeGreaterThan(0);
  });

});
