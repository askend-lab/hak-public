// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthError,
  ForbiddenError,
  ExternalServiceError,
  RateLimitError,
} from "./errors";

describe("AppError hierarchy", () => {
  it("AppError has correct defaults", () => {
    const err = new AppError("test", "TEST_CODE", 500, true);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST_CODE");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe("AppError");
  });

  it("AppError defaults to 500 and operational", () => {
    const err = new AppError("msg", "CODE");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it("ValidationError is 400", () => {
    const err = new ValidationError("bad input");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.name).toBe("ValidationError");
  });

  it("ValidationError accepts custom code", () => {
    const err = new ValidationError("bad", "CUSTOM");
    expect(err.code).toBe("CUSTOM");
  });

  it("NotFoundError is 404", () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("NotFoundError");
  });

  it("AuthError is 401 by default", () => {
    const err = new AuthError("unauthorized");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe("AuthError");
  });

  it("AuthError accepts custom status code", () => {
    const err = new AuthError("forbidden", "AUTH", 403);
    expect(err.statusCode).toBe(403);
  });

  it("ForbiddenError is 403", () => {
    const err = new ForbiddenError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Access denied");
    expect(err.name).toBe("ForbiddenError");
  });

  it("ExternalServiceError is 502", () => {
    const err = new ExternalServiceError("TARA down");
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(502);
    expect(err.name).toBe("ExternalServiceError");
  });

  it("RateLimitError is 429", () => {
    const err = new RateLimitError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe("Too many requests");
    expect(err.name).toBe("RateLimitError");
  });
});
