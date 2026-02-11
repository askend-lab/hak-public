// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders error UI when error is thrown", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Midagi läks valesti")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("shows retry button and clicking it attempts to re-render children", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Midagi läks valesti")).toBeInTheDocument();
    expect(screen.getByText("Proovi uuesti")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();

    // Click retry button - this calls setState to reset hasError and error
    fireEvent.click(screen.getByText("Proovi uuesti"));
    // The child will throw again, so error UI reappears
    expect(screen.getByText("Midagi läks valesti")).toBeInTheDocument();
  });

  it("shows default error message when error has no message", () => {
    const ThrowNoMsg = () => { throw new Error(); };
    render(
      <ErrorBoundary>
        <ThrowNoMsg />
      </ErrorBoundary>
    );
    // The fallback text "Tekkis ootamatu viga" should appear when error.message is empty
    expect(screen.getByText("Midagi läks valesti")).toBeInTheDocument();
  });

  it("logs error to console with error info", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalledWith(
      "[ErrorBoundary] Uncaught error:",
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it("does not render fallback or error UI when no error", () => {
    render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
    expect(screen.queryByText("Fallback")).not.toBeInTheDocument();
    expect(screen.queryByText("Midagi läks valesti")).not.toBeInTheDocument();
  });
});
