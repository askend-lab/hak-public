// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createInternalError, HTTP_STATUS } from "../src/response";
import { logger } from "@hak/shared";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return 500 with generic error message", () => {
    const spy = jest.spyOn(logger, "error").mockImplementation();
    const response = createInternalError("Test context", new Error("fail"));

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(response.body).error).toBe("Internal server error");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Test context:"), "fail");
    spy.mockRestore();
  });

  it("should handle non-Error values", () => {
    const spy = jest.spyOn(logger, "error").mockImplementation();
    const response = createInternalError("Context", "string error");

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Context:"), "string error");
    spy.mockRestore();
  });

});
