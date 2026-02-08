/**
 * This test imports all source files to ensure they are included in coverage reports.
 */

describe("Coverage imports", () => {
  it("should import all source files for coverage", () => {
    expect(require("../src/merlin")).toBeDefined();
    expect(require("../src/s3")).toBeDefined();
    expect(require("../src/sqs")).toBeDefined();
  });
});
