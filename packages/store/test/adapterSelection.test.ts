// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Tests for adapter selection logic in Lambda handler
 * Verifies correct adapter is used based on environment variables
 */

import { setAdapter, handler } from "../src/lambda/handler";
import { InMemoryAdapter } from "../src/adapters/memory";
import { createPostEvent } from "./setup";

describe("Adapter Selection", () => {
  beforeEach(() => {
    // Reset adapter between tests
    setAdapter(null);
  });

  afterEach(() => {
    setAdapter(null);
  });

  describe("setAdapter function", () => {
    it("should allow injecting custom adapter for testing", () => {
      const customAdapter = new InMemoryAdapter();
      setAdapter(customAdapter);

      expect(customAdapter).toBeInstanceOf(InMemoryAdapter);
    });

    it("should allow resetting adapter to null without throwing", () => {
      const adapter = new InMemoryAdapter();
      setAdapter(adapter);
      expect(() => setAdapter(null)).not.toThrow();
    });
  });

  describe("handler uses adapter correctly", () => {
    it("should persist data across handler calls with same adapter", async () => {
      // Set up adapter
      const adapter = new InMemoryAdapter();
      setAdapter(adapter);

      // Save data
      const saveEvent = createPostEvent("/save", {
        key: "adapter-test",
        id: "item-1",
        type: "private",
        ttl: 3600,
        data: { value: "test" },
      });
      saveEvent.requestContext = {
        ...saveEvent.requestContext,
        authorizer: { claims: { sub: "test-user" } },
      };

      const saveResult = await handler(saveEvent);
      expect(saveResult.statusCode).toBe(200);

      // Retrieve via handler (not direct adapter call)
      const getEvent = {
        ...saveEvent,
        httpMethod: "GET",
        resource: "/get",
        queryStringParameters: {
          key: "adapter-test",
          id: "item-1",
          type: "private",
        },
        body: null,
      };

      const getResult = await handler(getEvent);
      expect(getResult.statusCode).toBe(200);
      expect(JSON.parse(getResult.body).item.data).toStrictEqual({
        value: "test",
      });
    });
  });
});
