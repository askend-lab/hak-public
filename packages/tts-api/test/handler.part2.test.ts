// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseRequestBody, MAX_BODY_SIZE } from "../src/handler";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should parse valid JSON body", () => {
    const result = parseRequestBody(JSON.stringify({ text: "hello" }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.text).toBe("hello");
    }
  });

  it("should return empty object for undefined body", () => {
    const result = parseRequestBody(undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toStrictEqual({});
    }
  });

  it("should return error on invalid JSON", () => {
    const result = parseRequestBody("not json");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid JSON body");
    }
  });

  it("should return error on body exceeding MAX_BODY_SIZE", () => {
    const largeBody = "x".repeat(MAX_BODY_SIZE + 1);
    const result = parseRequestBody(largeBody);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Request body too large");
    }
  });

  it("should accept body at MAX_BODY_SIZE", () => {
    const body = JSON.stringify({ text: "a".repeat(MAX_BODY_SIZE - 20) });
    const result = parseRequestBody(body.slice(0, MAX_BODY_SIZE));
    expect(result.ok).toBe(true);
  });

});
