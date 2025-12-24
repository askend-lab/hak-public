/**
 * This test imports all source files to ensure they are included in coverage reports.
 */

import * as config from '../src/config';
import * as handler from '../src/handler';
import * as hash from '../src/hash';
import * as s3 from '../src/s3';
import * as sqs from '../src/sqs';

describe('Coverage imports', () => {
  it('should import all source files for coverage', () => {
    expect(config).toBeDefined();
    expect(handler).toBeDefined();
    expect(hash).toBeDefined();
    expect(s3).toBeDefined();
    expect(sqs).toBeDefined();
  });
});
