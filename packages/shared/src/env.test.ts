// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { getAwsRegion } from "./env";

describe("getAwsRegion", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns AWS_REGION when set", () => {
    process.env.AWS_REGION = "us-east-1";
    expect(getAwsRegion()).toBe("us-east-1");
  });

  it("returns eu-west-1 as default", () => {
    delete process.env.AWS_REGION;
    expect(getAwsRegion()).toBe("eu-west-1");
  });
});
