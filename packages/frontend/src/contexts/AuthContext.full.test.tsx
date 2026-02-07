import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const TestConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.isLoading ? "loading" : "ready"}</div>
      <div data-testid="authenticated">
        {auth.isAuthenticated ? "yes" : "no"}
      </div>
      <div data-testid="user">{auth.user ? auth.user.id : "none"}</div>
      <div data-testid="modal">{auth.showLoginModal ? "open" : "closed"}</div>
      <button onClick={() => auth.setShowLoginModal(true)}>openModal</button>
      <button onClick={() => auth.setShowLoginModal(false)}>closeModal</button>
      <button onClick={auth.logout}>logout</button>
    </div>
  );
};

describe("AuthContext Full Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ users: [] }),
    });
  });

  describe("AuthProvider", () => {
    it("provides initial state", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });

    it("loads valid user from localStorage", async () => {
      localStorage.setItem(
        "eki_user",
        JSON.stringify({
          id: "38001085718",
          name: "Test User",
          email: "test@test.ee",
        }),
      );

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
        expect(screen.getByTestId("user")).toHaveTextContent("38001085718");
      });
    });

    it("clears invalid user from localStorage", async () => {
      localStorage.setItem(
        "eki_user",
        JSON.stringify({
          id: "invalid",
          name: "Bad User",
          email: "bad@test.ee",
        }),
      );

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      });
      expect(localStorage.getItem("eki_user")).toBeNull();
    });

    it("handles malformed JSON in localStorage", async () => {
      localStorage.setItem("eki_user", "not-json");
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");

      consoleSpy.mockRestore();
    });

    it("handles empty user object in localStorage", async () => {
      localStorage.setItem("eki_user", JSON.stringify({}));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      });
    });
  });

  describe("setShowLoginModal", () => {
    it("opens login modal", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("openModal").click();
      });

      expect(screen.getByTestId("modal")).toHaveTextContent("open");
    });

    it("closes login modal", async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("openModal").click();
      });
      expect(screen.getByTestId("modal")).toHaveTextContent("open");

      await act(async () => {
        screen.getByText("closeModal").click();
      });
      expect(screen.getByTestId("modal")).toHaveTextContent("closed");
    });
  });

  describe("logout", () => {
    it("clears user from state and localStorage", async () => {
      localStorage.setItem(
        "eki_user",
        JSON.stringify({
          id: "38001085718",
          name: "Test User",
          email: "test@test.ee",
        }),
      );

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      });

      await act(async () => {
        screen.getByText("logout").click();
      });

      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(screen.getByTestId("user")).toHaveTextContent("none");
      expect(localStorage.getItem("eki_user")).toBeNull();
    });
  });

  describe("useAuth hook", () => {
    it("throws when used outside provider", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });
});
