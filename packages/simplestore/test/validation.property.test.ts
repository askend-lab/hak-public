// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import fc from "fast-check";
import {
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  validateServerContext,
  parseTtl,
  isValidType,
} from "../src/core/validation";
import { VALID_DATA_TYPES } from "../src/core/types";

describe("validation — property-based tests", () => {
  const validTypes = VALID_DATA_TYPES;

  const validTypeArb = fc.constantFrom(...validTypes);

  const validContextArb = fc.record({
    app: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    tenant: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    env: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    userId: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  });

  describe("parseTtl", () => {
    it("zero TTL is always valid (no expiration)", () => {
      const result = parseTtl(0);
      expect(result.valid).toBe(true);
    });

    it("any positive TTL within max is valid", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 31536000 }), (ttl) => {
          const result = parseTtl(ttl);
          expect(result.valid).toBe(true);
          if (result.valid) {
            expect(result.value).toBe(ttl);
          }
        }),
      );
    });

    it("any negative TTL is invalid", () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000000, max: -1 }), (ttl) => {
          const result = parseTtl(ttl);
          expect(result.valid).toBe(false);
        }),
      );
    });

    it("any TTL exceeding max is invalid", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 31536001, max: 100000000 }),
          (ttl) => {
            const result = parseTtl(ttl);
            expect(result.valid).toBe(false);
          },
        ),
      );
    });
  });

  describe("isValidType", () => {
    it("all listed types are valid", () => {
      fc.assert(
        fc.property(validTypeArb, (type) => {
          expect(isValidType(type)).toBe(true);
        }),
      );
    });

    it("random strings are almost never valid types", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8 }),
          (type) => {
            // Random strings longer than 7 chars can't match our short type names
            expect(isValidType(type)).toBe(false);
          },
        ),
      );
    });
  });

  describe("validateStoreRequest", () => {
    it("valid requests always pass", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1024 }).filter(
            (s) => s.trim().length > 0,
          ),
          fc.string({ minLength: 1, maxLength: 1024 }).filter(
            (s) => s.trim().length > 0,
          ),
          validTypeArb,
          fc.integer({ min: 0, max: 31536000 }),
          (pk, sk, type, ttl) => {
            const result = validateStoreRequest({ pk, sk, type, ttl });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
      );
    });

    it("missing pk always fails", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(
            (s) => s.trim().length > 0,
          ),
          validTypeArb,
          fc.integer({ min: 0, max: 31536000 }),
          (sk, type, ttl) => {
            const result = validateStoreRequest({ sk, type, ttl });
            expect(result.valid).toBe(false);
          },
        ),
      );
    });
  });

  describe("validateGetRequest", () => {
    it("valid pk + sk + type always passes", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1024 }).filter(
            (s) => s.trim().length > 0,
          ),
          fc.string({ minLength: 1, maxLength: 1024 }).filter(
            (s) => s.trim().length > 0,
          ),
          validTypeArb,
          (pk, sk, type) => {
            const result = validateGetRequest(pk, sk, type);
            expect(result.valid).toBe(true);
          },
        ),
      );
    });
  });

  describe("validateQueryRequest", () => {
    it("any string prefix with valid type passes", () => {
      fc.assert(
        fc.property(fc.string(), validTypeArb, (prefix, type) => {
          const result = validateQueryRequest(prefix, type);
          expect(result.valid).toBe(true);
        }),
      );
    });

    it("non-string prefix always fails", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
          ),
          validTypeArb,
          (prefix, type) => {
            const result = validateQueryRequest(prefix, type);
            // null/undefined prefix is allowed (optional), but number/boolean fails
            if (typeof prefix === "number" || typeof prefix === "boolean") {
              expect(result.valid).toBe(false);
            }
          },
        ),
      );
    });
  });

  describe("validateServerContext", () => {
    it("valid contexts always pass", () => {
      fc.assert(
        fc.property(validContextArb, (context) => {
          const result = validateServerContext(context);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
      );
    });

    it("empty string fields always fail", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("app", "tenant", "env", "userId"),
          validContextArb,
          (field, context) => {
            const invalid = { ...context, [field]: "" };
            const result = validateServerContext(invalid);
            expect(result.valid).toBe(false);
          },
        ),
      );
    });
  });
});
