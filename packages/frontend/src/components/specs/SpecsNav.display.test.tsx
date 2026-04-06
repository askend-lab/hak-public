// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpecsNav from "./SpecsNav";

const mockFeature = (
  name: string,
  scenarios: string[],
  tags: string[] = [],
) => ({
  name,
  description: "",
  tags,
  scenarios: scenarios.map((s) => ({ name: s, steps: [], tags: [], examples: [] })),
  rules: [],
  errors: [],
});

const mockTestSuites = [
  {
    name: "Suite1",
    status: "passed" as const,
    tests: [
      {
        name: "Scenario 1",
        fullName: "Suite1 Scenario 1",
        status: "passed" as const,
        duration: 100,
      },
      {
        name: "Scenario 2",
        fullName: "Suite1 Scenario 2",
        status: "failed" as const,
        duration: 50,
      },
    ],
  },
];

const defaultProps = {
  groups: [
    {
      name: "Group 1",
      features: [mockFeature("Feature 1", ["Scenario 1", "Scenario 2"])],
    },
    {
      name: "Group 2",
      features: [
        mockFeature("Feature 2 (US-123)", ["Scenario 3"]),
        mockFeature("Skipped Feature", ["Scenario 4"], ["@skip"]),
      ],
    },
  ],
  testSuites: mockTestSuites,
  selectedFeature: null,
  expandedGroups: new Set<string>(),
  expandedFeatures: new Set<string>(),
  onToggleGroup: vi.fn(),
  onToggleFeature: vi.fn(),
  onSelectFeature: vi.fn(),
};

describe("SpecsNav test status", () => {
  it("shows passed count for scenarios", () => {
    render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />,
    );
    expect(screen.getAllByText("1/2").length).toBeGreaterThan(0);
  });

  it("shows checkmark for passed scenarios", () => {
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
      />,
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("calls onSelectFeature when scenario clicked", async () => {
    const onSelectFeature = vi.fn();
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
        onSelectFeature={onSelectFeature}
      />,
    );
    await userEvent.click(screen.getByText("Scenario 1"));
    expect(onSelectFeature).toHaveBeenCalledWith("Feature 1");
  });

  it("shows circle for pending scenarios in expanded skipped feature", () => {
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 2"])}
        expandedFeatures={new Set(["Skipped Feature"])}
      />,
    );
    expect(screen.getByText("○")).toBeInTheDocument();
  });

});
