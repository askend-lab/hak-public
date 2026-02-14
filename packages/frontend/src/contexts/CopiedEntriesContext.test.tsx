// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CopiedEntriesProvider, useCopiedEntries } from "./CopiedEntriesContext";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <CopiedEntriesProvider>{children}</CopiedEntriesProvider>;
}

describe("CopiedEntriesContext", () => {
  it("initializes with no copied entries", () => {
    const { result } = renderHook(() => useCopiedEntries(), { wrapper });
    expect(result.current.copiedEntries).toBeNull();
    expect(result.current.hasCopiedEntries).toBe(false);
  });

  it("setCopiedEntries stores entries", () => {
    const { result } = renderHook(() => useCopiedEntries(), { wrapper });
    act(() => {
      result.current.setCopiedEntries([{ text: "hello", stressedText: "he`llo" }]);
    });
    expect(result.current.copiedEntries).toHaveLength(1);
    expect(result.current.hasCopiedEntries).toBe(true);
  });

  it("consumeCopiedEntries returns and clears entries", () => {
    const { result } = renderHook(() => useCopiedEntries(), { wrapper });
    act(() => {
      result.current.setCopiedEntries([{ text: "hello" }]);
    });
    expect(result.current.hasCopiedEntries).toBe(true);

    let consumed: unknown;
    act(() => {
      consumed = result.current.consumeCopiedEntries();
    });
    expect(consumed).toHaveLength(1);
    expect(result.current.copiedEntries).toBeNull();
    expect(result.current.hasCopiedEntries).toBe(false);
  });

  it("consumeCopiedEntries returns null when empty", () => {
    const { result } = renderHook(() => useCopiedEntries(), { wrapper });
    let consumed: unknown;
    act(() => {
      consumed = result.current.consumeCopiedEntries();
    });
    expect(consumed).toBeNull();
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useCopiedEntries());
    }).toThrow("useCopiedEntries must be used within CopiedEntriesProvider");
  });
});
