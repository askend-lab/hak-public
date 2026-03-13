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
 * SEC-01: All data/compute endpoints require JWT auth (Cognito).
 * Only /health remains public (monitoring).
 *
 * History: PR #592 incorrectly added auth and broke the stack (PRs #603–#608).
 * PR #755 (SEC-01) adds auth properly with JWT Authorizer on HTTP API v2.
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

describe("serverless.yml — SEC-01 auth configuration", () => {
  let config: ServerlessConfig;

  beforeAll(() => {
    config = loadServerlessConfig();
  });

  it("should define a Cognito JWT authorizer", () => {
    const authorizers = config.provider.httpApi?.authorizers;
    expect(authorizers).toBeDefined();
    expect(authorizers?.cognitoAuthorizer).toBeDefined();
  });

  it("should have authorizer on POST /synthesize route", () => {
    const fn = config.functions.synthesize;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.path).toBe("/synthesize");
    expect(httpEvent?.httpApi?.method).toBe("POST");
    expect(httpEvent?.httpApi?.authorizer).toBeDefined();
  });

  it("should NOT have authorizer on GET /status/{cacheKey} route (cached audio is public)", () => {
    const fn = config.functions.status;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.authorizer).toBeUndefined();
  });

  it("should NOT have authorizer on GET /health route", () => {
    const fn = config.functions.health;
    expect(fn).toBeDefined();

    const httpEvent = fn?.events?.find((e) => e.httpApi);
    expect(httpEvent).toBeDefined();
    expect(httpEvent?.httpApi?.authorizer).toBeUndefined();
  });

  it("should require auth on all routes except /health and /status/{cacheKey}", () => {
    const publicPaths = ["/health", "/status/{cacheKey}"];
    for (const [_name, fn] of Object.entries(config.functions)) {
      for (const event of fn.events ?? []) {
        const isPublic = publicPaths.includes(event.httpApi?.path ?? "");
        const hasAuth = Boolean(event.httpApi?.authorizer);
        if (isPublic) { expect(hasAuth).toBe(false); }
        else if (event.httpApi) { expect(hasAuth).toBe(true); }
      }
    }
  });

  it("should not have AuthorizationType NONE override (removed in SEC-01)", () => {
    const resources = config.resources?.Resources;
    const synthRoute = resources?.["HttpApiRoutePostSynthesize"];
    expect(synthRoute).toBeUndefined();
  });

  it("should include Authorization in CORS allowedHeaders", () => {
    const headers = config.provider.httpApi?.cors as { allowedHeaders?: string[] } | undefined;
    expect(headers?.allowedHeaders).toContain("Authorization");
  });
});

describe("infra/locals.tf — CloudFront auth flags match serverless auth config", () => {
  interface ApiRoute {
    path: string;
    auth: boolean;
  }

  let routes: ApiRoute[];

  beforeAll(() => {
    const content = fs.readFileSync(path.resolve(__dirname, "../../../infra/locals.tf"), "utf-8");
    const block = content.match(/api_routes\s*=\s*\[([\s\S]*?)\]/);
    expect(block).not.toBeNull();
    const routeBlock = (block ?? [])[1] ?? "";
    const matches = [...routeBlock.matchAll(/path\s*=\s*"([^"]+)".*?auth\s*=\s*(true|false)/g)];
    routes = matches.map((m) => ({ path: m[1] ?? "", auth: m[2] === "true" }));
  });

  it("should have auth=false for /api/status/* (public cached audio)", () => {
    const statusRoute = routes.find((r) => r.path.includes("status"));
    expect(statusRoute).toBeDefined();
    expect(statusRoute?.auth).toBe(false);
  });

  it("should have auth=true for /api/synthesize (requires login)", () => {
    const synthRoute = routes.find((r) => r.path.includes("synthesize"));
    expect(synthRoute).toBeDefined();
    expect(synthRoute?.auth).toBe(true);
  });

  it("should have auth=false for /api/health (monitoring)", () => {
    const healthRoute = routes.find((r) => r.path.includes("health"));
    expect(healthRoute).toBeDefined();
    expect(healthRoute?.auth).toBe(false);
  });
});
