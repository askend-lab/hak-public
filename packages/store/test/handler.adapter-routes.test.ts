// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, setAdapter } from "../src/lambda/handler";

import { createEvent, createPostEvent } from "./setup";

describe("handler: adapter and routes", () => {
  describe("adapter selection", () => {
    it("should use InMemory adapter when IS_OFFLINE is true", async () => {
      process.env.IS_OFFLINE = "true";
      process.env.TABLE_NAME = "test-table";
      setAdapter(null); // Reset adapter
      const event = createPostEvent("/save", {
        key: "adapter-test",
        id: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should use InMemory adapter when TABLE_NAME is not set", async () => {
      process.env.IS_OFFLINE = "false";
      delete process.env.TABLE_NAME;
      setAdapter(null);
      const event = createPostEvent("/save", {
        key: "adapter-test2",
        id: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });

  describe("route matching", () => {
    it.each([
      ["unknown routes", "GET", "/unknown", {}, 404],
      ["wrong method on valid path", "PUT", "/save", {}, 404],
    ])("should return %s for %s", async (_name, method, path, params, status) => {
      const event = createEvent({
        httpMethod: method,
        path,
        resource: path,
        queryStringParameters: params,
        body: method === "PUT" ? "{}" : undefined,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(status);
    });
  });

});
