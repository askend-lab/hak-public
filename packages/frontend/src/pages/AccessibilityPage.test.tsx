// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AccessibilityPage from "./AccessibilityPage";

describe("AccessibilityPage", () => {
  it("renders heading", () => {
    render(<AccessibilityPage />);
    expect(screen.getByText("Ligipääsetavuse teatis")).toBeInTheDocument();
  });
});
