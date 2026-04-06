// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import fc from "fast-check";
import { validateServerContext } from "../src/core/validation";

describe("validation.property: edge cases", () => {
  const validContextArb = fc.record({
    app: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    tenant: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    env: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    userId: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
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
