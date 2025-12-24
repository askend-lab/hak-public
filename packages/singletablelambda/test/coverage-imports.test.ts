/**
 * This test imports all source files to ensure they are included in coverage reports.
 */

describe('Coverage imports', () => {
  it('should import all source files for coverage', () => {
    expect(require('../src/auth')).toBeDefined();
    expect(require('../src/config')).toBeDefined();
    expect(require('../src/dynamoClient')).toBeDefined();
    expect(require('../src/keyBuilder')).toBeDefined();
    expect(require('../src/response')).toBeDefined();
    expect(require('../src/store')).toBeDefined();
    expect(require('../src/validation')).toBeDefined();
  });
});
