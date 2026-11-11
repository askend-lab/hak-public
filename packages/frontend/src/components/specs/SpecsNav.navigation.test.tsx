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

describe("SpecsNav group expansion", () => {
  it("shows features when group expanded", () => {
    render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />,
    );
    expect(screen.getByText(/Feature 1/)).toBeInTheDocument();
  });

  it("hides features when group collapsed", () => {
    render(<SpecsNav {...defaultProps} expandedGroups={new Set()} />);
    expect(screen.queryByText(/Feature 1/)).not.toBeInTheDocument();
  });

  it("calls onToggleGroup when header clicked", async () => {
    const onToggleGroup = vi.fn();
    render(<SpecsNav {...defaultProps} onToggleGroup={onToggleGroup} />);
    await userEvent.click(screen.getByText(/Group 1/));
    expect(onToggleGroup).toHaveBeenCalledWith("Group 1");
  });

});
