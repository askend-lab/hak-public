// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("NotFoundPage", () => {
  it("renders 404 heading", () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders Estonian not found message", () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText("Lehekülge ei leitud")).toBeInTheDocument();
  });

  it("navigates to synthesis on button click", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    await user.click(screen.getByText("Tagasi avalehele"));
    expect(mockNavigate).toHaveBeenCalledWith("/synthesis");
  });
});
