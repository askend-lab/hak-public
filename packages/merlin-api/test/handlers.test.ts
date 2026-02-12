// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

jest.mock("../src/s3", () => {
  const actual = jest.requireActual("../src/s3");
  return {
    ...actual,
    checkS3Cache: jest.fn(),
  };
});

jest.mock("../src/sqs", () => ({
  sendToQueue: jest.fn().mockResolvedValue("msg-123"),
}));

jest.mock("../src/ecs", () => {
  const actual = jest.requireActual("../src/ecs");
  return {
    ...actual,
    describeService: jest.fn(),
    scaleService: jest.fn().mockResolvedValue(undefined),
  };
});

import { synthesize, status, warmup, resetRateLimit, WARMUP_COOLDOWN_MS } from "../src/handler";
import { checkS3Cache } from "../src/s3";
import { sendToQueue } from "../src/sqs";
import { describeService, scaleService } from "../src/ecs";
import { HTTP_STATUS } from "../src/response";
import {
  setupTestEnv,
  setupEcsEnv,
  createRequestEvent,
  createStatusEvent,
  TEST_BUCKET,
  TEST_REGION,
} from "./setup";

const mockCheckS3Cache = checkS3Cache as jest.MockedFunction<typeof checkS3Cache>;
const mockSendToQueue = sendToQueue as jest.MockedFunction<typeof sendToQueue>;
const mockDescribeService = describeService as jest.MockedFunction<typeof describeService>;
const mockScaleService = scaleService as jest.MockedFunction<typeof scaleService>;

beforeEach(() => {
  setupTestEnv();
  resetRateLimit();
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("synthesize", () => {
  it("should return 400 for missing text", async () => {
    const response = await synthesize({ body: JSON.stringify({}) });
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 for empty text", async () => {
    const response = await synthesize(createRequestEvent(""));
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return ready when cached", async () => {
    mockCheckS3Cache.mockResolvedValue(true);

    const response = await synthesize(createRequestEvent("hello"));
    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("ready");
    expect(body.cacheKey).toBeDefined();
    expect(body.audioUrl).toContain(`${TEST_BUCKET}.s3.${TEST_REGION}`);
    expect(mockSendToQueue).not.toHaveBeenCalled();
  });

  it("should return processing when not cached", async () => {
    mockCheckS3Cache.mockResolvedValue(false);

    const response = await synthesize(createRequestEvent("hello"));
    expect(response.statusCode).toBe(HTTP_STATUS.ACCEPTED);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("processing");
    expect(body.cacheKey).toBeDefined();
    expect(mockSendToQueue).toHaveBeenCalledTimes(1);
  });

  it("should return 500 on error", async () => {
    mockCheckS3Cache.mockRejectedValue(new Error("S3 down"));

    const response = await synthesize(createRequestEvent("hello"));
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it("should return 500 for invalid JSON body", async () => {
    const response = await synthesize({ body: "not json" });
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});

describe("status", () => {
  it("should return 400 for missing cacheKey", async () => {
    const response = await status(createStatusEvent());
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return ready when file exists", async () => {
    mockCheckS3Cache.mockResolvedValue(true);

    const response = await status(createStatusEvent("abc123"));
    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("ready");
    expect(body.audioUrl).toContain("abc123.wav");
  });

  it("should return processing when file not found", async () => {
    mockCheckS3Cache.mockResolvedValue(false);

    const response = await status(createStatusEvent("abc123"));
    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("processing");
    expect(body.audioUrl).toBeNull();
  });

  it("should return 500 on error", async () => {
    mockCheckS3Cache.mockRejectedValue(new Error("S3 down"));

    const response = await status(createStatusEvent("abc123"));
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});

describe("warmup", () => {
  it("should return 500 when ECS not configured", async () => {
    const response = await warmup();
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(response.body).error).toBe("Missing ECS config");
  });

  it("should return already_warm when desired >= 1", async () => {
    setupEcsEnv();
    mockDescribeService.mockResolvedValue({ desired: 1, running: 1 });

    const response = await warmup();
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(response.body).status).toBe("already_warm");
  });

  it("should scale up when desired is 0", async () => {
    setupEcsEnv();
    mockDescribeService.mockResolvedValue({ desired: 0, running: 0 });

    const response = await warmup();
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(response.body).status).toBe("warming");
    expect(mockScaleService).toHaveBeenCalledWith(1);
  });

  it("should return 500 on ECS error", async () => {
    setupEcsEnv();
    mockDescribeService.mockRejectedValue(new Error("ECS down"));

    const response = await warmup();
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it("should rate limit rapid calls", async () => {
    setupEcsEnv();
    mockDescribeService.mockResolvedValue({ desired: 0, running: 0 });

    const first = await warmup();
    expect(first.statusCode).toBe(HTTP_STATUS.OK);

    const second = await warmup();
    expect(second.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    const body = JSON.parse(second.body);
    expect(body.retryAfterMs).toBeGreaterThan(0);
    expect(body.retryAfterMs).toBeLessThanOrEqual(WARMUP_COOLDOWN_MS);
  });
});
