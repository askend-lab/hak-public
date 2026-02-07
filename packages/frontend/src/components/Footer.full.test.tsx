import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  describe("rendering", () => {
    it("renders logo", () => {
      render(<Footer />);
      expect(screen.getByAltText("EKI Logo")).toBeInTheDocument();
    });

    it("renders contact information", () => {
      render(<Footer />);
      expect(screen.getByText(/roosikrantsi/i)).toBeInTheDocument();
    });

    it("renders Hääldusabiline section", () => {
      render(<Footer />);
      expect(screen.getByText("Hääldusabiline")).toBeInTheDocument();
    });

    it("renders footer links", () => {
      render(<Footer />);
      expect(screen.getByText("Portaalist")).toBeInTheDocument();
      expect(screen.getByText("Versiooniajalugu")).toBeInTheDocument();
      expect(
        screen.getByText("Kasutus- ja privaatsustingimused"),
      ).toBeInTheDocument();
    });

    it("renders social media section", () => {
      render(<Footer />);
      expect(screen.getByText("Sotsiaalmeedia")).toBeInTheDocument();
      expect(screen.getByText("Facebook")).toBeInTheDocument();
      expect(screen.getByText("Youtube")).toBeInTheDocument();
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("renders social media links with correct hrefs", () => {
      render(<Footer />);
      const facebookLink = screen.getByText("Facebook").closest("a");
      const youtubeLink = screen.getByText("Youtube").closest("a");
      const linkedinLink = screen.getByText("LinkedIn").closest("a");

      expect(facebookLink).toHaveAttribute(
        "href",
        "https://www.facebook.com/eestikeeleinstituut",
      );
      expect(youtubeLink).toHaveAttribute(
        "href",
        "https://www.youtube.com/@EestiKeeleInstituut",
      );
      expect(linkedinLink).toHaveAttribute(
        "href",
        "https://www.linkedin.com/company/eesti-keele-instituut",
      );
    });

    it("social media links open in new tab", () => {
      render(<Footer />);
      const facebookLink = screen.getByText("Facebook").closest("a");
      expect(facebookLink).toHaveAttribute("target", "_blank");
      expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders feedback section", () => {
      render(<Footer />);
      expect(screen.getByText("Tagasiside")).toBeInTheDocument();
      expect(screen.getByText(/iga arvamus loeb/i)).toBeInTheDocument();
      expect(screen.getByText(/Saada meile oma mõtted/)).toBeInTheDocument();
    });

    it("renders feedback email link", () => {
      render(<Footer />);
      const emailLink = screen.getByText("kristjan.suluste@eki.ee");
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest("a")).toHaveAttribute(
        "href",
        "mailto:kristjan.suluste@eki.ee",
      );
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
