// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent } from "@testing-library/react";
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
