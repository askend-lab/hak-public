// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable max-classes-per-file -- error hierarchy requires multiple related classes in one file */

/**
 * Unified error hierarchy for the HAK monorepo.
 *
 * AppError is the base class for all operational errors (expected failures).
 * Programmer errors (bugs) should remain as plain Error instances.
 *
 * Each subclass carries an HTTP status code and machine-readable code,
 * enabling wrapLambdaHandler() to return the correct response automatically.
 */

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode = 500,
    isOperational = true,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code = "NOT_FOUND") {
    super(message, code, 404);
    this.name = "NotFoundError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = "AUTH_ERROR", statusCode = 401) {
    super(message, code, statusCode);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied", code = "FORBIDDEN") {
    super(message, code, 403);
    this.name = "ForbiddenError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code = "EXTERNAL_SERVICE_ERROR") {
    super(message, code, 502);
    this.name = "ExternalServiceError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", code = "RATE_LIMIT") {
    super(message, code, 429);
    this.name = "RateLimitError";
  }
}

/* eslint-enable max-classes-per-file -- end error hierarchy */
