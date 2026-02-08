/**
 * This test imports all source files to ensure they are included in coverage reports.
 */

import * as descriptionBuilder from "../src/description-builder";
import * as handler from "../src/handler";
import * as parserHelpers from "../src/parser-helpers";
import * as parser from "../src/parser";
import * as validation from "../src/validation";
import * as vmetajson from "../src/vmetajson";

describe("Coverage imports", () => {
  it("should import all source files for coverage", () => {
    expect(descriptionBuilder).toBeDefined();
    expect(handler).toBeDefined();
    expect(parserHelpers).toBeDefined();
    expect(parser).toBeDefined();
    expect(validation).toBeDefined();
    expect(vmetajson).toBeDefined();
  });
});
