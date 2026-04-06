// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("variants", () => {
    it("applies danger variant class", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          variant="danger"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(
        document.querySelector(".confirmation-modal--danger"),
      ).toBeInTheDocument();
    });

    it("applies warning variant class", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          variant="warning"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(
        document.querySelector(".confirmation-modal--warning"),
      ).toBeInTheDocument();
    });

    it("applies info variant class", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          variant="info"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(
        document.querySelector(".confirmation-modal--info"),
      ).toBeInTheDocument();
    });

    it("defaults to danger variant", () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Test"
          message="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(
        document.querySelector(".confirmation-modal--danger"),
      ).toBeInTheDocument();
    });
  });

  });

  });

  });

  });

  });

});
