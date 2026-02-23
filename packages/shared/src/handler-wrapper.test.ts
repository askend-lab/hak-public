// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { wrapLambdaHandler } from "./handler-wrapper";
import { AppError, ValidationError, NotFoundError } from "./errors";

describe("wrapLambdaHandler", () => {
  const mockEvent = {
    requestContext: { requestId: "req-123" },
  };

  it("passes event and contextual logger to handler", async () => {
    const wrapped = wrapLambdaHandler("test", async (_event, log) => {
      expect(log).toBeDefined();
      expect(typeof log.info).toBe("function");
      expect(typeof log.error).toBe("function");
      return { statusCode: 200, headers: {}, body: '{"ok":true}' };
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(200);
  });

  it("returns handler response on success", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      return { statusCode: 201, headers: { "X-Custom": "val" }, body: '{"created":true}' };
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toStrictEqual({ created: true });
  });

  it("catches AppError and returns its statusCode", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      throw new ValidationError("Bad input");
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toStrictEqual({ error: "Bad input" });
  });

  it("catches NotFoundError and returns 404", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      throw new NotFoundError("Item not found");
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toStrictEqual({ error: "Item not found" });
  });

  it("catches non-operational AppError as 500", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      throw new AppError("critical bug", "BUG", 500, false);
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toStrictEqual({ error: "Internal server error" });
  });

  it("catches unknown errors as 500", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      throw new Error("unexpected");
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toStrictEqual({ error: "Internal server error" });
  });

  it("catches non-Error throws as 500", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      throw "string error"; // eslint-disable-line no-throw-literal -- testing non-Error throw
    });

    const result = await wrapped(mockEvent);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toStrictEqual({ error: "Internal server error" });
  });

  it("handles event without requestContext", async () => {
    const wrapped = wrapLambdaHandler("test", async () => {
      return { statusCode: 200, headers: {}, body: '{"ok":true}' };
    });

    const result = await wrapped({});
    expect(result.statusCode).toBe(200);
  });
});
