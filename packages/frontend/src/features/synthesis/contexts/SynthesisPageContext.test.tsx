// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSynthesisCore, useSynthesisInteraction, useSynthesisPage } from "./SynthesisPageContext";

describe("SynthesisPageContext", () => {
  it("useSynthesisCore throws when used outside provider", () => {
    expect(() => renderHook(() => useSynthesisCore())).toThrow(
      "useSynthesisCore must be used within SynthesisPageProvider",
    );
  });

  it("useSynthesisInteraction throws when used outside provider", () => {
    expect(() => renderHook(() => useSynthesisInteraction())).toThrow(
      "useSynthesisInteraction must be used within SynthesisPageProvider",
    );
  });

  it("useSynthesisPage throws when used outside provider", () => {
    expect(() => renderHook(() => useSynthesisPage())).toThrow(
      "useSynthesisCore must be used within SynthesisPageProvider",
    );
  });
});
