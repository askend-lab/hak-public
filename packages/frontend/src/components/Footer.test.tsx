// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  describe("rendering", () => {
    it("renders footer content", () => {
      render(<Footer />);
      expect(screen.getByAltText("EKI Logo")).toBeInTheDocument();
    });

    it("renders contact information", () => {
      render(<Footer />);
      expect(screen.getByText(/Roosikrantsi 6/)).toBeInTheDocument();
    });

    it("renders Hääldusabiline section", () => {
      render(<Footer />);
      expect(screen.getByText("Hääldusabiline")).toBeInTheDocument();
    });

    it("renders social media section", () => {
      render(<Footer />);
      expect(screen.getByText("Sotsiaalmeedia")).toBeInTheDocument();
      expect(screen.getByText("Facebook")).toBeInTheDocument();
      expect(screen.getByText("Youtube")).toBeInTheDocument();
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("renders feedback section with email link", () => {
      render(<Footer />);
      expect(screen.getByText("Tagasiside")).toBeInTheDocument();
      expect(screen.getByText(/Saada meile oma mõtted/)).toBeInTheDocument();
      const emailLink = screen.getByText("eki@eki.ee");
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest("a")).toHaveAttribute(
        "href",
        "mailto:eki@eki.ee",
      );
    });

    it("social links have correct hrefs", () => {
      render(<Footer />);
      const fbLink = screen.getByText("Facebook").closest("a");
      expect(fbLink).toHaveAttribute(
        "href",
        "https://www.facebook.com/eestikeeleinstituut",
      );

      const ytLink = screen.getByText("Youtube").closest("a");
      expect(ytLink).toHaveAttribute(
        "href",
        "https://www.youtube.com/@EestiKeeleInstituut",
      );

      const liLink = screen.getByText("LinkedIn").closest("a");
      expect(liLink).toHaveAttribute(
        "href",
        "https://www.linkedin.com/company/eesti-keele-instituut",
      );
    });

    it("social links open in new tab", () => {
      render(<Footer />);
      const fbLink = screen.getByText("Facebook").closest("a");
      expect(fbLink).toHaveAttribute("target", "_blank");
      expect(fbLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders sponsor logos", () => {
      render(<Footer />);
      expect(
        screen.getByAltText("Kaasrahastanud Euroopa Liit"),
      ).toBeInTheDocument();
      expect(screen.getByAltText("Eesti tuleviku heaks")).toBeInTheDocument();
      expect(
        screen.getByAltText("Haridus- ja Teadusministeerium"),
      ).toBeInTheDocument();
    });
  });
});

describe("Footer — additional coverage", () => {
  it("renders footer links section", () => {
    render(<Footer />);
    expect(
      screen.getByText("Kasutus- ja privaatsustingimused"),
    ).toBeInTheDocument();
  });

  it("renders feedback motto", () => {
    render(<Footer />);
    expect(screen.getByText(/iga arvamus loeb/i)).toBeInTheDocument();
  });
});
