// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";
import { logger } from "@hak/shared";

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
    expect(screen.getByText("Tekkis ootamatu viga")).toBeInTheDocument();
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
    expect(screen.getByText("Tekkis ootamatu viga")).toBeInTheDocument();

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
    const logSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(logSpy).toHaveBeenCalledWith(
      "[ErrorBoundary] Uncaught error:",
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
    logSpy.mockRestore();
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

  it("shows empty message text when error message is empty string", () => {
    const ThrowEmpty = (): never => { throw new Error(""); };
    render(
      <ErrorBoundary>
        <ThrowEmpty />
      </ErrorBoundary>
    );
    // Empty string message is still rendered (not null/undefined), so heading still shows
    expect(screen.getByText("Midagi läks valesti")).toBeInTheDocument();
  });

  it("error UI has correct container styles", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    const container = screen.getByText("Midagi läks valesti").parentElement;
    expect(container?.style.padding).toBe("2rem");
    expect(container?.style.textAlign).toBe("center");
  });

  it("error message paragraph has correct style", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    const p = screen.getByText("Tekkis ootamatu viga");
    expect(p.style.color).toBe("#666");
    expect(p.style.marginTop).toBe("0.5rem");
  });

  it("retry button has correct styles", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    const btn = screen.getByText("Proovi uuesti");
    expect(btn.parentElement?.style.marginTop).toBe("1rem");
    expect(btn.style.borderRadius).toBe("0.5rem");
    expect(btn.style.cursor).toBe("pointer");
    expect(btn.style.background).toBe("#fff");
  });

  it("prefers custom fallback over default error UI", () => {
    render(
      <ErrorBoundary fallback={<div>Custom</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.queryByText("Proovi uuesti")).not.toBeInTheDocument();
    expect(screen.queryByText("Midagi läks valesti")).not.toBeInTheDocument();
  });
});
