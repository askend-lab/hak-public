// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { synthesize, status } from "../src/handler";
import { checkS3Cache } from "../src/s3";
import { sendToQueue, QueueFullError } from "../src/sqs";
import { HTTP_STATUS } from "../src/response";
import {
  setupTestEnv,
  createRequestEvent,
  createStatusEvent,
  TEST_BUCKET,
  TEST_REGION,
} from "./setup";

jest.mock("../src/s3", () => {
  const actual = jest.requireActual("../src/s3");
  return {
    ...actual,
    checkS3Cache: jest.fn(),
  };
});

jest.mock("../src/sqs", () => {
  const actual = jest.requireActual("../src/sqs");
  return {
    ...actual,
    sendToQueue: jest.fn().mockResolvedValue("msg-123"),
  };
});

const mockCheckS3Cache = checkS3Cache as jest.MockedFunction<typeof checkS3Cache>;
const mockSendToQueue = sendToQueue as jest.MockedFunction<typeof sendToQueue>;

beforeEach(() => {
  setupTestEnv();
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

  it("should return 400 for text exceeding max length", async () => {
    const longText = "a".repeat(101);
    const response = await synthesize(createRequestEvent(longText));
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(JSON.parse(response.body).error).toContain("100 characters");
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

  it("should return 503 when queue is full", async () => {
    mockCheckS3Cache.mockResolvedValue(false);
    mockSendToQueue.mockRejectedValue(new QueueFullError(55));

    const response = await synthesize(createRequestEvent("hello"));
    expect(response.statusCode).toBe(HTTP_STATUS.SERVICE_UNAVAILABLE);
    expect(JSON.parse(response.body).error).toContain("temporarily unavailable");
  });

  it("should return 500 on error", async () => {
    mockCheckS3Cache.mockRejectedValue(new Error("S3 down"));

    const response = await synthesize(createRequestEvent("hello"));
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it("should return 400 for invalid JSON body", async () => {
    const response = await synthesize({ body: "not json" });
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});

describe("status", () => {
  it("should return 400 for missing cacheKey", async () => {
    const response = await status(createStatusEvent());
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return ready when file exists", async () => {
    mockCheckS3Cache.mockResolvedValue(true);

    const response = await status(createStatusEvent("a".repeat(64)));
    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("ready");
    expect(body.audioUrl).toContain(".wav");
  });

  it("should return processing when file not found", async () => {
    mockCheckS3Cache.mockResolvedValue(false);

    const response = await status(createStatusEvent("a".repeat(64)));
    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    const body = JSON.parse(response.body);
    expect(body.status).toBe("processing");
    expect(body.audioUrl).toBeNull();
  });

  it("should return 500 on error", async () => {
    mockCheckS3Cache.mockRejectedValue(new Error("S3 down"));

    const response = await status(createStatusEvent("a".repeat(64)));
    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});

