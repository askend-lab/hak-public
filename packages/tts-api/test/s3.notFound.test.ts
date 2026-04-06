// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { isNotFoundError } from "../src/s3";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("isNotFoundError", () => {
  it("should return true for NotFound error", () => {
    expect(isNotFoundError({ name: "NotFound" })).toBe(true);
  });

  it("should return true for NoSuchKey error", () => {
    expect(isNotFoundError({ name: "NoSuchKey" })).toBe(true);
  });

  it("should return true for 404 status code", () => {
    expect(isNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(true);
  });

  it("should return false for other errors", () => {
    expect(isNotFoundError({ name: "AccessDenied" })).toBe(false);
  });

  it("should return false for null", () => {
    expect(isNotFoundError(null)).toBe(false);
  });

  it("should return false for primitives", () => {
    expect(isNotFoundError("error")).toBe(false);
    expect(isNotFoundError(42)).toBe(false);
  });

});
