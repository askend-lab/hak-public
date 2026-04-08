// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { HTTP_STATUS } from "../src/response";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("HTTP_STATUS", () => {
  it("should have all expected status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.ACCEPTED).toBe(202);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

});
