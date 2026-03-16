// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { DataServiceProvider, useDataService } from "./DataServiceContext";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <DataServiceProvider>{children}</DataServiceProvider>;
}

describe("DataServiceContext", () => {
  it("provides a DataService instance within provider", () => {
    const { result } = renderHook(() => useDataService(), { wrapper });
    expect(result.current).toBeDefined();
    expect(typeof result.current.getUserTasks).toBe("function");
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useDataService());
    }).toThrow("useDataService must be used within DataServiceProvider");
  });
});
