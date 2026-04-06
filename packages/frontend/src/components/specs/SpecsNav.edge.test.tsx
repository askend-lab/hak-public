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

describe("SpecsNav badge classes and icons", () => {
  it("group header has expanded class when expanded", () => {
    const { container } = render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />,
    );
    expect(container.querySelector(".specs-group__header--expanded")).toBeTruthy();
  });

  it("group header has no expanded class when collapsed", () => {
    const { container } = render(<SpecsNav {...defaultProps} />);
    expect(container.querySelector(".specs-group__header--expanded")).toBeNull();
  });

  it("shows folder open icon for expanded group", () => {
    render(<SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />);
    expect(screen.getByText(/📂/)).toBeInTheDocument();
  });

  it("shows folder closed icon for collapsed group", () => {
    render(<SpecsNav {...defaultProps} />);
    expect(screen.getAllByText(/📁/).length).toBeGreaterThan(0);
  });

  it("shows down arrow for expanded feature", () => {
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
      />,
    );
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  it("shows right arrow for collapsed feature", () => {
    render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />,
    );
    expect(screen.getByText(/▶/)).toBeInTheDocument();
  });

  it("skipped feature has skipped class", () => {
    const { container } = render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 2"])} />,
    );
    expect(container.querySelector(".specs-feature__item--skipped")).toBeTruthy();
  });

  it("calls onToggleFeature and onSelectFeature on feature click", async () => {
    const onToggleFeature = vi.fn();
    const onSelectFeature = vi.fn();
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        onToggleFeature={onToggleFeature}
        onSelectFeature={onSelectFeature}
      />,
    );
    await userEvent.click(screen.getByText(/Feature 1/));
    expect(onToggleFeature).toHaveBeenCalledWith("Feature 1");
    expect(onSelectFeature).toHaveBeenCalledWith("Feature 1");
  });

  it("badge has correct class based on pass status", () => {
    const { container } = render(
      <SpecsNav {...defaultProps} expandedGroups={new Set(["Group 1"])} />,
    );
    expect(container.querySelector(".specs-badge--pending")).toBeTruthy();
  });

  it("scenario item has correct class", () => {
    const { container } = render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
      />,
    );
    expect(container.querySelector(".specs-scenario__item")).toBeTruthy();
    expect(container.querySelector(".specs-scenario__name")).toBeTruthy();
  });

  it("nav title shows Features text", () => {
    render(<SpecsNav {...defaultProps} />);
    expect(screen.getByText(/Features/)).toBeInTheDocument();
  });

  it("toggles group on Enter key", async () => {
    const onToggleGroup = vi.fn();
    render(<SpecsNav {...defaultProps} onToggleGroup={onToggleGroup} />);
    const { fireEvent } = await import("@testing-library/react");
    const groupHeader = screen.getByText(/Group 1/).closest("[role='button']");
    if (groupHeader) {fireEvent.keyDown(groupHeader, { key: "Enter" });}
    expect(onToggleGroup).toHaveBeenCalledWith("Group 1");
  });

  it("toggles feature on Enter key", async () => {
    const onToggleFeature = vi.fn();
    const onSelectFeature = vi.fn();
    render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        onToggleFeature={onToggleFeature}
        onSelectFeature={onSelectFeature}
      />,
    );
    const { fireEvent } = await import("@testing-library/react");
    const featureItem = screen.getByText(/Feature 1/).closest("[role='button']");
    if (featureItem) {fireEvent.keyDown(featureItem, { key: "Enter" });}
    expect(onToggleFeature).toHaveBeenCalledWith("Feature 1");
  });

  it("selects feature on scenario Enter key", async () => {
    const onSelectFeature = vi.fn();
    const { container } = render(
      <SpecsNav
        {...defaultProps}
        expandedGroups={new Set(["Group 1"])}
        expandedFeatures={new Set(["Feature 1"])}
        onSelectFeature={onSelectFeature}
      />,
    );
    const { fireEvent } = await import("@testing-library/react");
    const scenarioItem = container.querySelector(".specs-scenario__item");
    if (scenarioItem) {fireEvent.keyDown(scenarioItem, { key: "Enter" });}
    expect(onSelectFeature).toHaveBeenCalledWith("Feature 1");
  });

});
