// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { lambdaHandler, healthHandler, warmHandler } from "../src/index";

jest.mock("../src/handler", () => ({
  handler: jest.fn().mockResolvedValue({ statusCode: 200, body: JSON.stringify({ success: true }) }),
}));

jest.mock("../src/sqs", () => ({
  publishWarmMessage: jest.fn().mockResolvedValue(undefined),
}));

describe("Index Lambda Handlers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("lambdaHandler", () => {
    it("should return response with CORS headers", async () => {
      const event = { body: JSON.stringify({ text: "test" }) };
      const response = await lambdaHandler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toBeDefined();
      expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
      expect(response.headers["Content-Type"]).toBe("application/json");
    });

    it("should include all CORS headers", async () => {
      const event = { body: JSON.stringify({ text: "test" }) };
      const response = await lambdaHandler(event);

      expect(response.headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
      expect(response.headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
    });
  });

  describe("healthHandler", () => {
    it("should return healthy status", async () => {
      const response = await healthHandler();

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("healthy");
      expect(body.service).toBe("audio-api");
      expect(body.timestamp).toBeDefined();
    });

    it("should include CORS headers", async () => {
      const response = await healthHandler();

      expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
    });
  });

  describe("warmHandler", () => {
    it("should return error when QUEUE_URL not configured", async () => {
      delete process.env.QUEUE_URL;
      const response = await warmHandler();

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("QUEUE_URL not configured");
    });

    it("should return error when QUEUE_URL is empty string", async () => {
      process.env.QUEUE_URL = "";
      const response = await warmHandler();

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("QUEUE_URL not configured");
    });

    it("should trigger warm-up when QUEUE_URL is configured", async () => {
      process.env.QUEUE_URL = "https://sqs.example.com/queue";
      const response = await warmHandler();

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("warming");
      expect(body.message).toBe("Audio worker warm-up triggered");
      expect(body.timestamp).toBeDefined();
    });

    it("should handle publishWarmMessage errors with Error instance", async () => {
      process.env.QUEUE_URL = "https://sqs.example.com/queue";
      const { publishWarmMessage } = require("../src/sqs");
      publishWarmMessage.mockRejectedValueOnce(new Error("SQS error"));

      const response = await warmHandler();

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("SQS error");
    });

    it("should handle publishWarmMessage errors with non-Error", async () => {
      process.env.QUEUE_URL = "https://sqs.example.com/queue";
      const { publishWarmMessage } = require("../src/sqs");
      publishWarmMessage.mockRejectedValueOnce("string error");

      const response = await warmHandler();

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Failed to trigger warm-up");
    });
  });
});
