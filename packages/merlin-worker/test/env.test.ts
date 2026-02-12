// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { loadConfig, validateConfig, getQueueUrl, getBucketName, getMerlinUrl } from "../src/env";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getQueueUrl", () => {
    it("should return QUEUE_URL from env", () => {
      process.env.QUEUE_URL = "https://queue";
      expect(getQueueUrl()).toBe("https://queue");
    });

    it("should return empty string when unset", () => {
      delete process.env.QUEUE_URL;
      expect(getQueueUrl()).toBe("");
    });
  });

  describe("getBucketName", () => {
    it("should return BUCKET_NAME from env", () => {
      process.env.BUCKET_NAME = "my-bucket";
      expect(getBucketName()).toBe("my-bucket");
    });

    it("should return empty string when unset", () => {
      delete process.env.BUCKET_NAME;
      expect(getBucketName()).toBe("");
    });
  });

  describe("getMerlinUrl", () => {
    it("should return MERLIN_URL from env", () => {
      process.env.MERLIN_URL = "https://merlin";
      expect(getMerlinUrl()).toBe("https://merlin");
    });

    it("should return empty string when unset", () => {
      delete process.env.MERLIN_URL;
      expect(getMerlinUrl()).toBe("");
    });
  });

  describe("loadConfig", () => {
    it("should load config from env", () => {
      process.env.QUEUE_URL = "https://q";
      process.env.BUCKET_NAME = "b";
      process.env.MERLIN_URL = "https://m";
      const config = loadConfig();
      expect(config.queueUrl).toBe("https://q");
      expect(config.bucketName).toBe("b");
      expect(config.merlinUrl).toBe("https://m");
    });
  });

  describe("validateConfig", () => {
    it("should return empty array for valid config", () => {
      expect(validateConfig({ queueUrl: "q", bucketName: "b", merlinUrl: "m" })).toStrictEqual([]);
    });

    it("should return missing fields", () => {
      expect(validateConfig({ queueUrl: "", bucketName: "", merlinUrl: "" })).toStrictEqual([
        "QUEUE_URL", "BUCKET_NAME", "MERLIN_URL",
      ]);
    });

    it("should return only missing fields", () => {
      expect(validateConfig({ queueUrl: "q", bucketName: "", merlinUrl: "m" })).toStrictEqual(["BUCKET_NAME"]);
    });
  });
});
