// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import fc from "fast-check";
import {
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  parseTtl,
  isValidType,
} from "../src/core/validation";
import { VALID_DATA_TYPES } from "../src/core/types";

describe("validation.property.test", () => {
  const validTypes = VALID_DATA_TYPES;

  const validTypeArb = fc.constantFrom(...validTypes);

  const allowedKeyChars = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-:@"];
  const validKeyArb = fc.array(fc.constantFrom(...allowedKeyChars), { minLength: 1, maxLength: 100 }).map((chars) => chars.join(""));

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
          validKeyArb,
          validKeyArb,
          validTypeArb,
          fc.integer({ min: 0, max: 31536000 }),
          (key, id, type, ttl) => {
            const result = validateStoreRequest({ key, id, type, ttl });
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
          (id, type, ttl) => {
            const result = validateStoreRequest({ id, type, ttl });
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
          validKeyArb,
          validKeyArb,
          validTypeArb,
          (key, id, type) => {
            const result = validateGetRequest(key, id, type);
            expect(result.valid).toBe(true);
          },
        ),
      );
    });
  });

  describe("validateQueryRequest", () => {
    it("any safe string prefix with valid type passes", () => {
      const safePrefixArb = fc.array(
        fc.constantFrom(...allowedKeyChars),
        { maxLength: 100 },
      ).map((chars) => chars.join(""));
      fc.assert(
        fc.property(safePrefixArb, validTypeArb, (prefix, type) => {
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
            expect(result.valid).toBe(false);
          },
        ),
      );
    });
  });

});
