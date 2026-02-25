// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Validation logic — Zod schemas with custom error messages
 */

import { z } from "zod";
import { DataType, StoreRequest, StoreConfig, VALID_DATA_TYPES, DEFAULT_CONFIG } from "./types";

/**
 * Validation result with collected errors
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

const MAX_KEY_LENGTH = 1024;
const ALLOWED_KEY_CHARS = /^[\w.\-:@]+$/;
const VALID_TYPES_MESSAGE = `type must be one of: ${VALID_DATA_TYPES.join(", ")}`;

/** Zod schema for key/id fields: non-empty string, max length, allowed chars */
function keySchema(name: string): z.ZodType<string> {
  return z
    .string({ message: `${name} is required and must be a string` })
    .refine((v) => v.trim() !== "", { message: `${name} cannot be empty` })
    .refine((v) => v.length <= MAX_KEY_LENGTH, {
      message: `${name} exceeds maximum length of ${MAX_KEY_LENGTH} characters`,
    })
    .refine((v) => v.trim() === "" || v.length > MAX_KEY_LENGTH || ALLOWED_KEY_CHARS.test(v), {
      message: `${name} contains invalid characters (allowed: a-z A-Z 0-9 . _ - : @)`,
    });
}

/** Zod schema for data type field */
const dataTypeSchema = z.enum(VALID_DATA_TYPES, { message: VALID_TYPES_MESSAGE });

/** Zod schema for required non-empty string (server context fields) */
function requiredStringSchema(name: string): z.ZodType<string> {
  return z
    .string({ message: `${name} is required and must be a string` })
    .refine((v) => v.trim() !== "", { message: `${name} cannot be empty` })
    .refine((v) => v.length <= MAX_KEY_LENGTH, {
      message: `${name} exceeds maximum length of ${MAX_KEY_LENGTH} characters`,
    });
}

/** Convert Zod issues to flat error strings */
function toValidationResult(result: z.SafeParseReturnType<unknown, unknown>): ValidationResult {
  if (result.success) {return { valid: true, errors: [] };}
  return {
    valid: false,
    errors: result.error.issues.map((i) => i.message),
  };
}

/**
 * Result of TTL parsing
 */
export type TtlResult =
  | { readonly valid: true; readonly value: number }
  | { readonly valid: false; readonly error: string };

/**
 * Parses and validates TTL value against constraints
 */
export function parseTtl(
  ttl: number,
  config: StoreConfig = DEFAULT_CONFIG,
): TtlResult {
  if (ttl < 0) {
    return { valid: false, error: "TTL must be 0 (no expiration) or positive" };
  }
  if (ttl === 0) {
    return { valid: true, value: 0 };
  }
  if (ttl > config.maxTtlSeconds) {
    return {
      valid: false,
      error: `TTL exceeds maximum of ${config.maxTtlSeconds} seconds (1 year)`,
    };
  }
  return { valid: true, value: ttl };
}

/** Build store request schema with config-dependent TTL/data size limits */
function storeRequestSchema(config: StoreConfig): z.ZodType {
  return z.object({
    key: keySchema("key"),
    id: keySchema("id"),
    type: dataTypeSchema,
    ttl: z.number({ message: "ttl must be a number" })
      .refine((v) => v >= 0, { message: "TTL must be 0 (no expiration) or positive" })
      .refine((v) => v === 0 || v <= config.maxTtlSeconds, {
        message: `TTL exceeds maximum of ${config.maxTtlSeconds} seconds (1 year)`,
      }),
    data: z.record(z.unknown())
      .refine((d) => !Array.isArray(d), { message: "data must be a plain object" })
      .refine(
        (d) => JSON.stringify(d).length <= config.maxDataSizeBytes,
        { message: `data exceeds maximum size of ${config.maxDataSizeBytes} bytes` },
      )
      .optional(),
  });
}

/**
 * Validates store request for save operations
 */
export function validateStoreRequest(
  request: Partial<StoreRequest>,
  config: StoreConfig = DEFAULT_CONFIG,
): ValidationResult {
  const schema = storeRequestSchema(config);
  const parsed = schema.safeParse(request);
  if (parsed.success) {return { valid: true, errors: [] };}

  const errors: string[] = [];
  for (const issue of parsed.error.issues) {
    // Replace Zod's generic record error with our custom message for non-object data
    if (issue.path.includes("data") && issue.code === "invalid_type") {
      if (!errors.includes("data must be a plain object")) {
        errors.push("data must be a plain object");
      }
    } else {
      errors.push(issue.message);
    }
  }

  return { valid: false, errors };
}

/**
 * Validates get/delete request parameters
 */
export function validateGetRequest(
  key: unknown,
  id: unknown,
  type: unknown,
): ValidationResult {
  const schema = z.object({
    key: keySchema("key"),
    id: keySchema("id"),
    type: dataTypeSchema,
  });
  return toValidationResult(schema.safeParse({ key, id, type }));
}

/** Zod schema for query prefix */
const queryPrefixSchema = z
  .string({ message: "prefix must be a string" })
  .refine((v) => v !== undefined && v !== null, { message: "prefix is required" })
  .refine((v) => v.length <= MAX_KEY_LENGTH, {
    message: `prefix exceeds maximum length of ${MAX_KEY_LENGTH} characters`,
  })
  .refine((v) => v.length === 0 || ALLOWED_KEY_CHARS.test(v), {
    message: "prefix contains invalid characters (allowed: a-z A-Z 0-9 . _ - : @)",
  });

/**
 * Validates query request parameters
 */
export function validateQueryRequest(
  pkPrefix: unknown,
  type: unknown,
): ValidationResult {
  if (pkPrefix == null) {
    const typeResult = toValidationResult(dataTypeSchema.safeParse(type));
    return {
      valid: false,
      errors: ["prefix is required", ...typeResult.errors],
    };
  }
  const schema = z.object({
    prefix: queryPrefixSchema,
    type: dataTypeSchema,
  });
  return toValidationResult(schema.safeParse({ prefix: pkPrefix, type }));
}

/**
 * Validates server context
 */
export function validateServerContext(
  context: Partial<Record<string, unknown>>,
): ValidationResult {
  const schema = z.object({
    app: requiredStringSchema("app"),
    tenant: requiredStringSchema("tenant"),
    env: requiredStringSchema("env"),
    userId: requiredStringSchema("userId"),
  });
  return toValidationResult(schema.safeParse(context));
}

/**
 * Check if type is valid
 */
export function isValidType(type: unknown): type is DataType {
  return dataTypeSchema.safeParse(type).success;
}
