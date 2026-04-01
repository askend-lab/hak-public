// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import * as fs from "fs";
import * as path from "path";

/**
 * SEC-01: CloudFront auth flags must match API auth configuration.
 * /synthesize requires auth, /status and /health are public.
 *
 * History: PR #592 incorrectly added auth and broke the stack (PRs #603–#608).
 * PR #755 (SEC-01) adds auth properly with JWT Authorizer on HTTP API v2.
 * Note: serverless.yml was removed — Lambda deploys use direct AWS CLI.
 * Auth config lives in the existing CloudFormation stacks managed by API Gateway.
 */

describe("infra/locals.tf — CloudFront auth flags match API auth config", () => {
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
