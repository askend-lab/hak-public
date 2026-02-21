// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// Custom YAML schema that handles CloudFormation intrinsic function tags (!Sub, !Ref, etc.)
const CF_TAGS = ["!Sub", "!Ref", "!GetAtt", "!Join", "!Select", "!If", "!Not", "!Equals"];
const cfSchema = yaml.DEFAULT_SCHEMA.extend(
  CF_TAGS.map(
    (tag) =>
      new yaml.Type(tag, {
        kind: "scalar",
        construct: (data: string) => data,
      }),
  ),
);

/**
 * Regression tests for serverless.yml configuration.
 *
 * These tests prevent accidental re-introduction of API Gateway authorizers
 * on merlin-api endpoints. Audio synthesis is a public feature — no auth required.
 *
 * Background: PR #592 (security audit) incorrectly added a Cognito JWT authorizer
 * to /synthesize and /warmup. This broke the frontend (403 Unauthorized) and
 * corrupted the CloudFormation stack (PRs #603–#608 to fix).
 */

interface ServerlessRoute {
  path: string;
  method: string;
  authorizer?: unknown;
}

interface ServerlessFunction {
  handler: string;
  timeout?: number;
  environment?: Record<string, string>;
  events?: Array<{ httpApi?: ServerlessRoute }>;
}

interface ServerlessConfig {
  service: string;
  provider: {
    httpApi?: {
      cors?: unknown;
      throttle?: unknown;
      authorizers?: Record<string, unknown>;
    };
  };
  functions: Record<string, ServerlessFunction>;
  resources?: {
    Resources?: Record<string, { Type: string; Properties?: Record<string, unknown> }>;
    Outputs?: Record<string, unknown>;
  };
}

const SERVERLESS_PATH = path.resolve(__dirname, "../serverless.yml");

function loadServerlessConfig(): ServerlessConfig {
  const content = fs.readFileSync(SERVERLESS_PATH, "utf-8");
  return yaml.load(content, { schema: cfSchema }) as ServerlessConfig;
}

describe("serverless.yml — public endpoint guarantees", () => {
  let config: ServerlessConfig;

  beforeAll(() => {
    config = loadServerlessConfig();
  });

  it("should not define any authorizers in httpApi", () => {
    const authorizers = config.provider.httpApi?.authorizers;
    expect(authorizers).toBeUndefined();
  });

  it("should not have authorizer on POST /synthesize route", () => {
    const fn = config.functions.synthesize;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.path).toBe("/synthesize");
    expect(httpEvent?.httpApi?.method).toBe("POST");
    expect(httpEvent?.httpApi?.authorizer).toBeUndefined();
  });

  it("should not have authorizer on GET /status/{cacheKey} route", () => {
    const fn = config.functions.status;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.authorizer).toBeUndefined();
  });

  it("should not have authorizer on GET /health route", () => {
    const fn = config.functions.health;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.authorizer).toBeUndefined();
  });

  it("should not have authorizer on any route", () => {
    for (const [name, fn] of Object.entries(config.functions)) {
      for (const event of fn.events ?? []) {
        expect(
          event.httpApi?.authorizer,
        ).toBeUndefined();
        if (event.httpApi?.authorizer) {
          throw new Error(
            `Function "${name}" route ${event.httpApi.method} ${event.httpApi.path} ` +
              `has an authorizer. All merlin-api endpoints must be public.`,
          );
        }
      }
    }
  });

  it("should have explicit AuthorizationType NONE override for synthesize route", () => {
    const resources = config.resources?.Resources;
    expect(resources).toBeDefined();

    const synthRoute = resources?.["HttpApiRoutePostSynthesize"];
    expect(synthRoute).toBeDefined();
    expect(synthRoute?.Properties?.AuthorizationType).toBe("NONE");
  });

  it("should not include Authorization in CORS allowedHeaders", () => {
    const headers = config.provider.httpApi?.cors as { allowedHeaders?: string[] } | undefined;
    if (headers?.allowedHeaders) {
      expect(headers.allowedHeaders).not.toContain("Authorization");
    }
  });
});
