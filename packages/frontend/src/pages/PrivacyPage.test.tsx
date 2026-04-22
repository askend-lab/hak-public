// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "./PrivacyPage";

describe("PrivacyPage", () => {
  it("renders heading", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Privaatsuspoliitika")).toBeInTheDocument();
  });
});
