// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { extractStressedText, extractVariants } from "../src/parser";
import { VmetajsonResponse } from "../src/types";

describe("parser: edge cases", () => {
  it("should handle token without mrf", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "xyz",
            },
          },
        ],
      },
    };

    const result = extractVariants(response, "xyz");
    expect(result).toStrictEqual([]);
  });

  it("should handle empty mrf array", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "test",
              mrf: [],
            },
          },
        ],
      },
    };

    const result = extractStressedText(response, "test");
    expect(result).toBe("test");
  });

});
