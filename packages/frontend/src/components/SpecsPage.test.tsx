// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SpecsPage from "./SpecsPage";

vi.mock("./specs", () => ({
  SpecsNav: ({ onToggleGroup, onToggleFeature, onSelectFeature }: { onToggleGroup: (g: string) => void; onToggleFeature: (f: string) => void; onSelectFeature: (f: string) => void }) => (
    <div data-testid="specs-nav">
      <button onClick={() => onToggleGroup("Group A")}>Toggle Group</button>
      <button onClick={() => onToggleFeature("Test Feature")}>
        Toggle Feature
      </button>
      <button onClick={() => onSelectFeature("Test Feature")}>
        Select Feature
      </button>
    </div>
  ),
  SpecsContent: () => <div data-testid="specs-content">Content</div>,
}));

vi.mock("../services/specs", () => ({
  loadCucumberResults: vi.fn().mockResolvedValue(null),
  getFeatureGroups: vi.fn(() => ({})),
  parseCucumberResults: vi.fn(() => []),
}));

vi.mock("@hak/specifications", () => ({
  parseFeatureContent: vi.fn(() => null),
}));

describe("SpecsPage", () => {
  const mockOnBack = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders specs page container", () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(document.querySelector(".specs-page")).toBeTruthy();
  });

  it("renders header with title", () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText("Testid")).toBeTruthy();
  });

  it("toggles group and feature via nav callbacks", async () => {
    const { getFeatureGroups } = await import("../services/specs");
    const { parseFeatureContent } = await import("@hak/specifications");
    (getFeatureGroups as ReturnType<typeof vi.fn>).mockReturnValue({
      "Group A": {
        "f1.feature": "Feature: Test Feature\n  Scenario: S1\n    Given x",
      },
    });
    (parseFeatureContent as ReturnType<typeof vi.fn>).mockReturnValue({
      name: "Test Feature",
      description: "",
      scenarios: [{ name: "S1", steps: [] }],
    });

    render(<SpecsPage onBack={mockOnBack} />);
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(screen.getByTestId("specs-nav")).toBeTruthy());

    // Toggle group (exercises toggleSet adding)
    fireEvent.click(screen.getByText("Toggle Group"));
    // Toggle again (exercises toggleSet removing)
    fireEvent.click(screen.getByText("Toggle Group"));
    // Toggle feature
    fireEvent.click(screen.getByText("Toggle Feature"));
    fireEvent.click(screen.getByText("Toggle Feature"));
  });

  it("renders back button with text", () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText(/Tagasi/)).toBeTruthy();
  });

  it("calls onBack when back button clicked", () => {
    render(<SpecsPage onBack={mockOnBack} />);
    fireEvent.click(screen.getByText(/Tagasi/));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it("shows loading text initially", () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText(/Laen spetsifikatsioone/)).toBeTruthy();
  });

  it("renders nav and content after loading with feature groups", async () => {
    const { getFeatureGroups } = await import("../services/specs");
    const { parseFeatureContent } = await import("@hak/specifications");
    (getFeatureGroups as ReturnType<typeof vi.fn>).mockReturnValue({
      "Group A": {
        "feature1.feature":
          "Feature: Test\n  Scenario: S1\n    Given something",
      },
    });
    (parseFeatureContent as ReturnType<typeof vi.fn>).mockReturnValue({
      name: "Test Feature",
      description: "desc",
      scenarios: [
        { name: "S1", steps: [{ keyword: "Given", text: "something" }] },
      ],
    });

    render(<SpecsPage onBack={mockOnBack} />);
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(screen.getByTestId("specs-nav")).toBeTruthy();
      expect(screen.getByTestId("specs-content")).toBeTruthy();
    });
  });

  it("renders back button in loaded state", async () => {
    const { getFeatureGroups } = await import("../services/specs");
    const { parseFeatureContent } = await import("@hak/specifications");
    (getFeatureGroups as ReturnType<typeof vi.fn>).mockReturnValue({
      "Group A": { "feature1.feature": "content" },
    });
    (parseFeatureContent as ReturnType<typeof vi.fn>).mockReturnValue({
      name: "Feature",
      description: "",
      scenarios: [],
    });

    render(<SpecsPage onBack={mockOnBack} />);
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(screen.getByTestId("specs-nav")).toBeTruthy();
    });
    fireEvent.click(screen.getByText(/Tagasi/));
    expect(mockOnBack).toHaveBeenCalled();
  });
});
