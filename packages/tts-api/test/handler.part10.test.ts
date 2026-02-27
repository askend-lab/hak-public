// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { getAwsRegion, getS3Bucket, getSqsQueueUrl, getEcsCluster, getEcsService } from "../src/env";
import { setupTestEnv, TEST_REGION, TEST_BUCKET, TEST_QUEUE_URL } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("getAwsRegion should return env value", () => {
    expect(getAwsRegion()).toBe(TEST_REGION);
  });

  it("getAwsRegion should return default when unset", () => {
    delete process.env.AWS_REGION;
    expect(getAwsRegion()).toBe("eu-west-1");
  });

  it("getS3Bucket should return env value", () => {
    expect(getS3Bucket()).toBe(TEST_BUCKET);
  });

  it("getSqsQueueUrl should return env value", () => {
    expect(getSqsQueueUrl()).toBe(TEST_QUEUE_URL);
  });

  it("getS3Bucket should throw when unset", () => {
    delete process.env.S3_BUCKET;
    expect(() => getS3Bucket()).toThrow("Invalid or missing S3_BUCKET");
  });

  it("getSqsQueueUrl should throw when unset", () => {
    delete process.env.SQS_QUEUE_URL;
    expect(() => getSqsQueueUrl()).toThrow("Missing required environment variable: SQS_QUEUE_URL");
  });

  it("getEcsCluster should throw when unset", () => {
    delete process.env.ECS_CLUSTER;
    expect(() => getEcsCluster()).toThrow("Missing required environment variable: ECS_CLUSTER");
  });

  it("getEcsService should throw when unset", () => {
    delete process.env.ECS_SERVICE;
    expect(() => getEcsService()).toThrow("Missing required environment variable: ECS_SERVICE");
  });

});
