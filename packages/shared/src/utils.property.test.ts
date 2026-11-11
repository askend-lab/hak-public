// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import fc from "fast-check";
import { isNonEmpty, isEmpty } from "./utils";

describe("utils — property-based tests", () => {
  describe("isNonEmpty / isEmpty duality", () => {
    it("isNonEmpty and isEmpty are always complementary", () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
          (value) => {
            expect(isNonEmpty(value)).toBe(!isEmpty(value));
          },
        ),
      );
    });

    it("any non-whitespace string is non-empty", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          (value) => {
            expect(isNonEmpty(value)).toBe(true);
            expect(isEmpty(value)).toBe(false);
          },
        ),
      );
    });

    it("whitespace-only strings are empty", () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(" ", "\t", "\n", "\r")).map((arr) =>
            arr.join(""),
          ),
          (value: string) => {
            expect(isNonEmpty(value)).toBe(false);
            expect(isEmpty(value)).toBe(true);
          },
        ),
      );
    });
  });
});
