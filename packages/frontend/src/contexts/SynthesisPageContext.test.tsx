// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSynthesisPage } from "./SynthesisPageContext";

describe("SynthesisPageContext", () => {
  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useSynthesisPage())).toThrow(
      "useSynthesisPage must be used within SynthesisPageProvider",
    );
  });
});
