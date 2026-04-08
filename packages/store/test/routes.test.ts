// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createResponse } from "../src/lambda/routes";

describe("routes.test", () => {
  describe("createResponse", () => {
    it("should create response with correct status and body", () => {
      const response = createResponse(200, { message: "ok" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('{"message":"ok"}');
      expect(response.headers?.["Content-Type"]).toBe("application/json");
      expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("null");
    });

    it("should stringify complex objects", () => {
      const response = createResponse(201, { items: [1, 2, 3], nested: { a: 1 } });
      expect(response.statusCode).toBe(201);
      const parsed = JSON.parse(response.body);
      expect(parsed.items).toStrictEqual([1, 2, 3]);
      expect(parsed.nested.a).toBe(1);
    });
  });

});
