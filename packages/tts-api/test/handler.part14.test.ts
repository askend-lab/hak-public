// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { health, VERSION } from "../src/handler";
import { HTTP_STATUS, CORS_HEADERS } from "../src/response";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return OK with version", async () => {
    const response = await health();
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.version).toBe(VERSION);
  });

  it("should include CORS headers", async () => {
    const response = await health();
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "null" });
  });

});
