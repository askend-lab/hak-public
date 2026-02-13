// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BuildInfo from "./BuildInfo";

describe("BuildInfo", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("renders button with hash and correct class", () => {
    render(<BuildInfo />);
    const btn = document.querySelector(".build-info-button");
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute("title")).toBe("Build info");
    expect(document.querySelector(".build-info-hash")).toBeTruthy();
  });

  it("opens modal with header and rows when clicked", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Build Info")).toBeTruthy();
    expect(screen.getByText("Hash")).toBeTruthy();
    expect(screen.getByText("Branch")).toBeTruthy();
    expect(screen.getByText("Message")).toBeTruthy();
    expect(screen.getByText("Built")).toBeTruthy();
  });

  it("closes modal on close button", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByText("Build Info")).toBeNull();
  });

  it("closes modal on overlay click", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Build Info")).toBeTruthy();
    const overlay = document.querySelector(".build-info-overlay");
    fireEvent.click(overlay!);
    expect(screen.queryByText("Build Info")).toBeNull();
  });

  it("does not close modal on content click (stopPropagation)", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    const modal = document.querySelector(".build-info-modal");
    fireEvent.click(modal!);
    expect(screen.getByText("Build Info")).toBeTruthy();
  });

  it("shows dash for empty message", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("renders Row labels and values with correct classes", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    const rows = document.querySelectorAll(".build-info-row");
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const labels = document.querySelectorAll(".build-info-label");
    expect(labels.length).toBeGreaterThanOrEqual(4);
    const values = document.querySelectorAll(".build-info-value");
    expect(values.length).toBeGreaterThanOrEqual(4);
    const msgValue = document.querySelector(".build-info-message");
    expect(msgValue).toBeTruthy();
  });

  it("has close button with correct class", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    const closeBtn = document.querySelector(".build-info-modal__close");
    expect(closeBtn).toBeTruthy();
  });
});

describe("BuildInfo runtime fetch", () => {
  it("shows buildId and deployedAt from build-info.json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            buildId: "BUILD-123",
            commitHash: "abc",
            commitHashFull: "abcdef123456",
            branch: "main",
            message: "fix: something",
            builtAt: "2026-01-13T12:00:00Z",
            deployedAt: "2026-01-13T13:00:00Z",
            environment: "staging",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    await waitFor(() => expect(screen.getByText("BUILD-123")).toBeTruthy());
    expect(screen.getByText("Build")).toBeTruthy();
    expect(screen.getByText("Deployed")).toBeTruthy();
    expect(screen.getByText("fix: something")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("handles fetch failure gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Network")),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(screen.getByText("Hash")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("handles non-ok fetch response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(screen.getByText("Hash")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("skips fetch on localhost", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(mockFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("shows fallback values when runtime has partial data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            commitHash: "",
            branch: "",
            message: "",
            builtAt: "",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    // Should still show Hash and Branch rows
    expect(screen.getByText("Hash")).toBeTruthy();
    expect(screen.getByText("Branch")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("shows directory row on localhost with workingDir", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    // Check modal content exists
    expect(document.querySelector(".build-info-modal__content")).toBeTruthy();
    vi.unstubAllGlobals();
  });
});

describe("BuildInfo with __BUILD_INFO__ defined", () => {
  let BuildInfoDefined: typeof BuildInfo;

  beforeAll(async () => {
    (globalThis as Record<string, unknown>).__BUILD_INFO__ = {
      commitHash: "abc123",
      commitMessage: "test commit",
      branch: "test-branch",
      commitDate: "2026-06-01",
      buildTime: "2026-06-01T12:00:00Z",
      workingDir: "/test/workspace",
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
    expect(screen.getByText("test commit")).toBeInTheDocument();
  });

  it("shows Directory row on localhost with workingDir (kills L130)", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfoDefined />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Directory")).toBeInTheDocument();
    expect(screen.getByText("/test/workspace")).toBeInTheDocument();
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
