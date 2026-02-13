// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { AuthStorage } from "./storage";

describe("AuthStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    AuthStorage.clear();
  });

  describe("User storage", () => {
    it("should return null when no user stored", () => {
      expect(AuthStorage.getUser()).toBeNull();
    });

    it("should store and retrieve user", () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      };
      AuthStorage.setUser(user);
      expect(AuthStorage.getUser()).toStrictEqual(user);
    });

    it("stores user under correct key", () => {
      AuthStorage.setUser({ id: "u1", email: "e" });
      expect(localStorage.getItem("hak_user")).not.toBeNull();
    });
  });

  describe("Token key verification", () => {
    it("stores access token in memory only (not localStorage)", () => {
      AuthStorage.setAccessToken("tok");
      expect(AuthStorage.getAccessToken()).toBe("tok");
      expect(localStorage.getItem("hak_access_token")).toBeNull();
    });

    it("stores id token in memory only (not localStorage)", () => {
      AuthStorage.setIdToken("tok");
      expect(AuthStorage.getIdToken()).toBe("tok");
      expect(localStorage.getItem("hak_id_token")).toBeNull();
    });

    it("stores refresh token under correct key", () => {
      AuthStorage.setRefreshToken("tok");
      expect(localStorage.getItem("hak_refresh_token")).toBe("tok");
    });
  });

  describe("Token storage", () => {
    it("should store and retrieve access token", () => {
      const token = "access-token-123";
      AuthStorage.setAccessToken(token);
      expect(AuthStorage.getAccessToken()).toBe(token);
    });

    it("should store and retrieve ID token", () => {
      const token = "id-token-123";
      AuthStorage.setIdToken(token);
      expect(AuthStorage.getIdToken()).toBe(token);
    });

    it("should store and retrieve refresh token", () => {
      const token = "refresh-token-123";
      AuthStorage.setRefreshToken(token);
      expect(AuthStorage.getRefreshToken()).toBe(token);
    });

    it("should return null for missing tokens", () => {
      expect(AuthStorage.getAccessToken()).toBeNull();
      expect(AuthStorage.getIdToken()).toBeNull();
      expect(AuthStorage.getRefreshToken()).toBeNull();
    });
  });

  describe("clear", () => {
    it("should remove all stored auth data", () => {
      AuthStorage.setUser({ id: "123", email: "test@example.com" });
      AuthStorage.setAccessToken("access-token");
      AuthStorage.setIdToken("id-token");
      AuthStorage.setRefreshToken("refresh-token");

      AuthStorage.clear();

      expect(AuthStorage.getUser()).toBeNull();
      expect(AuthStorage.getAccessToken()).toBeNull();
      expect(AuthStorage.getIdToken()).toBeNull();
      expect(AuthStorage.getRefreshToken()).toBeNull();
    });

    it("should clear Cognito-related localStorage keys", () => {
      localStorage.setItem("CognitoIdentityServiceProvider.abc.user", "data");
      localStorage.setItem("CognitoIdentityServiceProvider.abc.token", "token");
      localStorage.setItem("other-key", "value");

      AuthStorage.clear();

      expect(
        localStorage.getItem("CognitoIdentityServiceProvider.abc.user"),
      ).toBeNull();
      expect(
        localStorage.getItem("CognitoIdentityServiceProvider.abc.token"),
      ).toBeNull();
      expect(localStorage.getItem("other-key")).toBe("value");
    });
  });
});
