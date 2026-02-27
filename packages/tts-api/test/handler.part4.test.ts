// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createResponse, HTTP_STATUS, CORS_HEADERS } from "../src/response";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return response with CORS headers", () => {
    const response = createResponse(HTTP_STATUS.OK, { status: "ok" });

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "null" });
    expect(JSON.parse(response.body)).toStrictEqual({ status: "ok" });
  });

});
