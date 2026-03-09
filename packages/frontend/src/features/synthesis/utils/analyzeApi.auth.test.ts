// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeText, postJSON } from "./analyzeApi";
import { AuthStorage } from "@/features/auth/services/storage";

vi.mock("@/utils/reportApiError", () => ({
  reportApiError: vi.fn(),
}));

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: {
    getAccessToken: vi.fn(),
  },
}));

describe("analyzeApi — auth gating (SEC-01)", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("T-F5: analyzeText rejects when not authenticated", () => {
    it("throws AuthRequiredError when no access token is available", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue(null);

      await expect(analyzeText("test")).rejects.toThrow(
        "Authentication required",
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("T-F6: analyzeText sends auth header when authenticated", () => {
    it("includes Authorization: Bearer header in analyze request", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("analyze-token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "ˈtɛst" }),
      });

      await analyzeText("test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/analyze",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer analyze-token",
          }),
        }),
      );
    });
  });

  describe("T-F7: postJSON to /api/variants sends auth header", () => {
    it("includes Authorization header in variants request", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("variants-token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ variants: [] }),
      });

      await postJSON("/api/variants", { text: "test" }, {
        headers: { Authorization: "Bearer variants-token" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/variants",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer variants-token",
          }),
        }),
      );
    });
  });

  describe("T-F8: 401 response triggers auth error", () => {
    it("throws AuthRequiredError on 401 from analyze endpoint", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("expired-token");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(analyzeText("test")).rejects.toThrow(
        "Authentication required",
      );
    });
  });
});
