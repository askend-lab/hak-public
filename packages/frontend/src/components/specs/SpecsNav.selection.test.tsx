// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("SpecsNav feature expansion", () => {
  it("shows scenarios when feature expanded", () => {
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
      />,
    );
    expect(screen.getByText("Scenario 1")).toBeInTheDocument();
  });

  it("removes US ticket from feature name", () => {
    render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 2"])} />,
    );
    expect(screen.getByText(/Feature 2/)).toBeInTheDocument();
    expect(screen.queryByText(/US-123/)).not.toBeInTheDocument();
  });

  it("shows skipped badge for skipped features", () => {
    render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 2"])} />,
    );
    expect(screen.getByText("skip")).toBeInTheDocument();
  });

  it("highlights selected feature", () => {
    const { container } = render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        selectedFeature="Feature 1"
      />,
    );
    expect(
      container.querySelector(".specs-feature__item--selected"),
    ).toBeInTheDocument();
  });

});
