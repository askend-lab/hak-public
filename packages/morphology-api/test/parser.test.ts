// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { extractStressedText } from "../src/parser";
import { VmetajsonResponse } from "../src/types";

describe("parser.test", () => {
  it("should return stressed text from valid response", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "mees",
              mrf: [
                {
                  stem: "m<ees",
                  ending: "0",
                  pos: "S",
                  lemma: "mees",
                  fs: "sg n",
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractStressedText(response, "mees");
    expect(result).toBe("m<ees");
  });

  it("should combine stem and ending with + separator", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "peeti",
              mrf: [
                {
                  stem: "p<ee",
                  ending: "ti",
                  pos: "V",
                  lemma: "pidama",
                  fs: "impf",
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractStressedText(response, "peeti");
    expect(result).toBe("p<ee+ti");
  });

  it("should handle multiple tokens", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "mees",
              mrf: [{ stem: "m<ees", ending: "0" }],
            },
          },
          {
            features: {
              token: "peeti",
              mrf: [{ stem: "p<ee", ending: "ti" }],
            },
          },
        ],
      },
    };

    const result = extractStressedText(response, "mees peeti");
    expect(result).toBe("m<ees p<ee+ti");
  });

  it("should return original text if no annotations", () => {
    const response: VmetajsonResponse = {};
    const result = extractStressedText(response, "hello");
    expect(result).toBe("hello");
  });

  it("should return original text if tokens array is empty", () => {
    const response: VmetajsonResponse = { annotations: { tokens: [] } };
    const result = extractStressedText(response, "hello");
    expect(result).toBe("hello");
  });

  it("should fallback to original token if no stem", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "xyz",
              mrf: [{ pos: "X" }],
            },
          },
        ],
      },
    };

    const result = extractStressedText(response, "xyz");
    expect(result).toBe("xyz");
  });

});
