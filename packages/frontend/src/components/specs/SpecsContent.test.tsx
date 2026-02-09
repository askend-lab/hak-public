// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SpecsContent from "./SpecsContent";

const mockFeature = (
  name: string,
  scenarios: { name: string; steps: string[] }[],
  tags: string[] = [],
  desc = "",
) => ({
  name,
  description: desc,
  tags,
  scenarios: scenarios.map((s) => ({ ...s, tags: [] })),
});

const mockSuites = [
  {
    name: "Suite1",
    status: "passed" as const,
    tests: [
      {
        name: "Scenario 1",
        fullName: "Suite1 Scenario 1",
        status: "passed" as const,
        duration: 123.45,
      },
    ],
  },
];

describe("SpecsContent empty state", () => {
  it("shows message when no feature selected", () => {
    render(<SpecsContent feature={null} testSuites={[]} />);
    expect(screen.getByText(/Vali feature/)).toBeInTheDocument();
  });
});

describe("SpecsContent with feature", () => {
  it("renders feature name", () => {
    const feature = mockFeature("My Feature", []);
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("My Feature")).toBeInTheDocument();
  });

  it("renders feature description when present", () => {
    const feature = mockFeature("Feature", [], [], "Description text");
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("renders scenarios", () => {
    const feature = mockFeature("Feature", [{ name: "Scenario 1", steps: [] }]);
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("Scenario 1")).toBeInTheDocument();
  });
});

describe("SpecsContent test results", () => {
  it("shows passed status with duration", () => {
    const feature = mockFeature("Feature", [{ name: "Scenario 1", steps: [] }]);
    render(<SpecsContent feature={feature} testSuites={mockSuites} />);
    expect(screen.getByText(/✓ passed/)).toBeInTheDocument();
    expect(screen.getByText(/123ms/)).toBeInTheDocument();
  });

  it("shows skipped status for skipped features", () => {
    const feature = mockFeature(
      "Feature",
      [{ name: "Scenario", steps: [] }],
      ["@skip"],
    );
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText(/○ skipped/)).toBeInTheDocument();
  });

  it("shows pending status when no test result", () => {
    const feature = mockFeature("Feature", [
      { name: "Unknown Scenario", steps: [] },
    ]);
    render(<SpecsContent feature={feature} testSuites={mockSuites} />);
    expect(screen.getByText(/○ pending/)).toBeInTheDocument();
  });
});

describe("SpecsContent steps", () => {
  it("renders step keywords", () => {
    const feature = mockFeature("Feature", [
      {
        name: "Scenario",
        steps: ["Given something", "When action", "Then result"],
      },
    ]);
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("Given")).toBeInTheDocument();
    expect(screen.getByText("When")).toBeInTheDocument();
    expect(screen.getByText("Then")).toBeInTheDocument();
  });

  it("renders And/But keywords", () => {
    const feature = mockFeature("Feature", [
      { name: "Scenario", steps: ["And more", "But not this"] },
    ]);
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("And")).toBeInTheDocument();
    expect(screen.getByText("But")).toBeInTheDocument();
  });

  it("handles steps without keyword", () => {
    const feature = mockFeature("Feature", [
      { name: "Scenario", steps: ["plain step text"] },
    ]);
    render(<SpecsContent feature={feature} testSuites={[]} />);
    expect(screen.getByText("plain step text")).toBeInTheDocument();
  });
});
