// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  APIGatewayProxyEvent,
  APIGatewayEventRequestContext,
} from "aws-lambda";

import { analyzeHandler, variantsHandler, healthHandler } from "../src/handler";
import * as vmetajson from "../src/vmetajson";

jest.mock("../src/vmetajson");

const mockAnalyze = vmetajson.analyze as jest.MockedFunction<
  typeof vmetajson.analyze
>;
const mockIsInitialized = vmetajson.isInitialized as jest.MockedFunction<
  typeof vmetajson.isInitialized
>;
const mockInitVmetajson = vmetajson.initVmetajson as jest.MockedFunction<
  typeof vmetajson.initVmetajson
>;

function createEvent(body: object | null): APIGatewayProxyEvent {
  return {
    body: body ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/analyze",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayEventRequestContext,
    resource: "",
  };
}

describe("analyzeHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInitialized.mockReturnValue(true);
  });

  it("should return 400 if body is missing", async () => {
    const event = createEvent(null);
    event.body = null;

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe("Missing request body");
  });

  it("should return 400 if text field is missing", async () => {
    const event = createEvent({});

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain("Missing 'text' field");
  });

  it("should return 400 if text is empty", async () => {
    const event = createEvent({ text: "   " });

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain("non-empty string");
  });

  it("should return 400 if text is too long", async () => {
    const event = createEvent({ text: "a".repeat(10001) });

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain("too long");
  });

  it("should return 400 for invalid JSON", async () => {
    const event = createEvent(null);
    event.body = "not valid json";

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe("Invalid JSON");
  });

  it("should return stressed text on success", async () => {
    mockAnalyze.mockResolvedValue({
      annotations: {
        tokens: [
          {
            features: {
              token: "mees",
              mrf: [{ stem: "m<ees", ending: "0" }],
            },
          },
        ],
      },
    });

    const event = createEvent({ text: "mees" });

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.stressedText).toBe("m<ees");
    expect(body.originalText).toBe("mees");
  });

  it("should initialize vmetajson if not initialized", async () => {
    mockIsInitialized.mockReturnValue(false);
    mockAnalyze.mockResolvedValue({ annotations: { tokens: [] } });

    const event = createEvent({ text: "test" });
    await analyzeHandler(event);

    expect(mockInitVmetajson).toHaveBeenCalled();
  });

  it("should return 500 on processing error", async () => {
    mockAnalyze.mockRejectedValue(new Error("vmetajson crashed"));

    const event = createEvent({ text: "test" });

    const result = await analyzeHandler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toContain("Processing error");
  });
});

describe("variantsHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInitialized.mockReturnValue(true);
  });

  it("should return 400 if word field is missing", async () => {
    const event = createEvent({});

    const result = await variantsHandler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain("Missing 'word' field");
  });

  it("should return variants on success", async () => {
    mockAnalyze.mockResolvedValue({
      annotations: {
        tokens: [
          {
            features: {
              token: "noormees",
              mrf: [
                {
                  stem: "n<oor_m<ees",
                  ending: "0",
                  pos: "S",
                  lemma: "noormees",
                  fs: "sg n",
                },
              ],
            },
          },
        ],
      },
    });

    const event = createEvent({ word: "noormees" });

    const result = await variantsHandler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.word).toBe("noormees");
    expect(body.variants).toHaveLength(1);
    expect(body.variants[0].text).toBe("n<oor_m<ees");
  });

  it("should return 200 with empty variants when word not found", async () => {
    mockAnalyze.mockResolvedValue({ annotations: { tokens: [] } });

    const event = createEvent({ word: "xyz" });

    const result = await variantsHandler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.word).toBe("xyz");
    expect(body.variants).toHaveLength(0);
  });
});

describe("healthHandler", () => {
  it("should return ok status", () => {
    const result = healthHandler();

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
  });
});
