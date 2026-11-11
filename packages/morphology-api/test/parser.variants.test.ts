// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { extractVariants } from "../src/parser";
import { VmetajsonResponse } from "../src/types";

describe("parser: variants", () => {
  it("should extract all morphological variants", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "noormees",
              mrf: [
                {
                  stem: "n<oor_m<ees",
                  ending: "0",
                  pos: "S",
                  lemma: "noormees",
                  fs: "sg n",
                },
                {
                  stem: "n<oor_m<ehe",
                  ending: "0",
                  pos: "S",
                  lemma: "noormees",
                  fs: "sg g",
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractVariants(response, "noormees");
    expect(result).toHaveLength(2);
    expect(result[0]?.text).toBe("n<oor_m<ees");
    expect(result[1]?.text).toBe("n<oor_m<ehe");
  });

  it("should include morphology info in variants", () => {
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

    const result = extractVariants(response, "mees");
    expect(result[0]?.morphology.lemma).toBe("mees");
    expect(result[0]?.morphology.pos).toBe("S");
    expect(result[0]?.morphology.fs).toBe("sg n");
  });

  it("should generate description with POS translation", () => {
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

    const result = extractVariants(response, "mees");
    expect(result[0]?.description).toContain("nimisõna");
  });

  it("should avoid duplicate variants", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "test",
              mrf: [
                {
                  stem: "t<est",
                  ending: "0",
                  pos: "S",
                  lemma: "test",
                  fs: "sg n",
                },
                {
                  stem: "t<est",
                  ending: "0",
                  pos: "S",
                  lemma: "test",
                  fs: "sg n",
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractVariants(response, "test");
    expect(result).toHaveLength(1);
  });

  it("should return empty array if no tokens", () => {
    const response: VmetajsonResponse = {};
    const result = extractVariants(response, "word");
    expect(result).toStrictEqual([]);
  });

  it("should include lemma in description if different from word", () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: "meest",
              mrf: [
                {
                  stem: "m<ees",
                  ending: "t",
                  pos: "S",
                  lemma: "mees",
                  fs: "sg p",
                },
              ],
            },
          },
        ],
      },
    };

    const result = extractVariants(response, "meest");
    expect(result[0]?.description).toContain("lemma: mees");
  });

});
