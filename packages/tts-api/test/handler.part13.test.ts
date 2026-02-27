// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createBadRequest, HTTP_STATUS } from "../src/response";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return 400 with error message", () => {
    const response = createBadRequest("test error");
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(JSON.parse(response.body).error).toBe("test error");
  });

});
