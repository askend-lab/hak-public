// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import RoleSelectionContent from "./RoleSelectionPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/features/onboarding/contexts/OnboardingContext", () => ({
  useOnboarding: vi.fn(() => ({
    selectRole: vi.fn(),
  })),
}));

import { useOnboarding } from "@/features/onboarding/contexts/OnboardingContext";

/**
 * Mutation-killing tests for RoleSelectionPage
 */
describe("RoleSelectionPage mutation tests", () => {
  const mockSelectRole = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      selectRole: mockSelectRole,
    });
  });

  it("navigates to /synthesis on role select", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]!);
    expect(mockNavigate).toHaveBeenCalledWith("/synthesis");
  });

  it("renders avatar images with correct src for learner", () => {
    const { container } = render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const images = container.querySelectorAll("img");
    const srcs = Array.from(images).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/icons/student-avatar.png");
  });

  it("renders avatar images with correct src for teacher", () => {
    const { container } = render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const images = container.querySelectorAll("img");
    const srcs = Array.from(images).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/icons/teacher-avatar.png");
  });

  it("renders avatar images with correct src for specialist", () => {
    const { container } = render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const images = container.querySelectorAll("img");
    const srcs = Array.from(images).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/icons/researcher-avatar.png");
  });

  it("renders role titles in lowercase", () => {
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    // Titles should contain lowercase role names, not uppercase
    expect(screen.getByText(/Olen\s+õppija/)).toBeInTheDocument();
    expect(screen.getByText(/Olen\s+õpetaja/)).toBeInTheDocument();
    expect(screen.getByText(/Olen\s+uurija/)).toBeInTheDocument();
  });

  it("calls selectRole with teacher role", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]!);
    expect(mockSelectRole).toHaveBeenCalledWith("teacher");
  });

  it("calls selectRole with specialist role", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]!);
    expect(mockSelectRole).toHaveBeenCalledWith("specialist");
  });

  it("renders CTA text on buttons", () => {
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    expect(screen.getByText("Hakkan õppima")).toBeInTheDocument();
  });

  it("renders role descriptions", () => {
    render(
      <MemoryRouter>
        <RoleSelectionContent />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Sisesta lause ja kuula/)).toBeInTheDocument();
  });
});
