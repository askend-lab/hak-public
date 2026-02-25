// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * CloudFront ↔ API Gateway Route Consistency Test
 *
 * Validates that every CloudFront api_route in infra/locals.tf has a matching
 * httpApi/http event path in the corresponding serverless.yml — AFTER applying
 * the CloudFront rewrite function that strips /api/ or /auth/ prefix.
 *
 * This test prevents the recurring bug where serverless.yml routes include
 * the /api/ prefix (e.g., /api/analyze) but CloudFront strips it before
 * forwarding, causing API Gateway to return 404 → CloudFront serves index.html.
 *
 * Runs in CI on every PR — catches the bug BEFORE merge and deploy.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");

// Origin name → serverless.yml path
const ORIGIN_TO_SERVERLESS: Record<string, string> = {
  "vabamorf-api": "packages/morphology-api/serverless.yml",
  "merlin-api": "packages/tts-api/serverless.yml",
  "simplestore-api": "packages/store/serverless.yml",
  "auth-api": "packages/auth/serverless.yml",
};

interface CloudFrontRoute {
  path: string;
  origin: string;
  rewrite: boolean;
}

/**
 * Parse api_routes from infra/locals.tf using regex
 * (HCL is not JSON, so we extract the route objects manually)
 */
function parseCloudFrontRoutes(): CloudFrontRoute[] {
  const localsTf = fs.readFileSync(
    path.join(ROOT, "infra/locals.tf"),
    "utf-8",
  );

  const routes: CloudFrontRoute[] = [];
  // Match each route object: { path = "...", origin = "...", rewrite = true/false, ... }
  const routeRegex =
    /\{\s*path\s*=\s*"([^"]+)"\s*,\s*origin\s*=\s*"([^"]+)"\s*,\s*rewrite\s*=\s*(true|false)/g;
  let match;
  while ((match = routeRegex.exec(localsTf)) !== null) {
    routes.push({
      path: match[1],
      origin: match[2],
      rewrite: match[3] === "true",
    });
  }
  return routes;
}

/**
 * Parse httpApi/http event paths from a serverless.yml file using regex.
 * Matches lines like:  path: /analyze  or  path: /status/{cacheKey}
 */
function parseServerlessRoutes(serverlessPath: string): string[] {
  const content = fs.readFileSync(
    path.join(ROOT, serverlessPath),
    "utf-8",
  );

  const routes: string[] = [];
  const pathRegex = /^\s+path:\s+(\/\S+)/gm;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    routes.push(match[1]);
  }
  // Deduplicate (e.g., /tara/refresh appears twice for POST + OPTIONS)
  return [...new Set(routes)];
}

/**
 * Apply CloudFront rewrite: strip /api/ or /auth/ prefix
 * Mirrors the CloudFront Function in infra/cloudfront.tf
 */
function applyRewrite(cfPath: string): string {
  if (cfPath.startsWith("/api/")) {
    return cfPath.substring(4); // /api/analyze → /analyze
  }
  if (cfPath.startsWith("/auth/")) {
    return cfPath.substring(5); // /auth/tara/start → /tara/start
  }
  return cfPath;
}

/**
 * Check if a serverless route matches a rewritten CloudFront path.
 * Handles wildcards: CloudFront /api/status/* → /status/* matches /status/{cacheKey}
 */
function routeMatches(rewrittenPath: string, serverlessRoute: string): boolean {
  // Exact match
  if (rewrittenPath === serverlessRoute) {
    return true;
  }

  // Wildcard: /status/* should match /status/{cacheKey}
  if (rewrittenPath.endsWith("/*")) {
    const prefix = rewrittenPath.slice(0, -1); // /status/
    if (serverlessRoute.startsWith(prefix)) {
      return true;
    }
  }

  // Wildcard on serverless side: /tara/* matches /tara/start
  if (serverlessRoute.endsWith("/*")) {
    const prefix = serverlessRoute.slice(0, -1);
    if (rewrittenPath.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

describe("CloudFront ↔ API Gateway route consistency", () => {
  const cfRoutes = parseCloudFrontRoutes();
  const serverlessRoutesByOrigin: Record<string, string[]> = {};

  // Pre-load all serverless routes
  for (const [origin, slsPath] of Object.entries(ORIGIN_TO_SERVERLESS)) {
    serverlessRoutesByOrigin[origin] = parseServerlessRoutes(slsPath);
  }

  it("should find CloudFront routes in locals.tf", () => {
    expect(cfRoutes.length).toBeGreaterThan(0);
  });

  it("should find serverless routes for every origin", () => {
    for (const [, routes] of Object.entries(serverlessRoutesByOrigin)) {
      expect(routes.length).toBeGreaterThan(0);
    }
  });

  describe("every rewritten CloudFront route must match a serverless.yml route", () => {
    for (const route of cfRoutes) {
      if (!route.rewrite) {
        continue;
      }

      const rewritten = applyRewrite(route.path);
      const slsPath = ORIGIN_TO_SERVERLESS[route.origin];

      it(`${route.path} → ${rewritten} exists in ${slsPath}`, () => {
        const slsRoutes = serverlessRoutesByOrigin[route.origin];
        expect(slsRoutes).toBeDefined();

        const hasMatch = slsRoutes.some((sr) => routeMatches(rewritten, sr));
        if (!hasMatch) {
          throw new Error(
            `CloudFront route "${route.path}" rewrites to "${rewritten}" but no matching route found in ${slsPath}.\n` +
              `Available routes: ${slsRoutes.join(", ")}\n\n` +
              `💡 CloudFront strips /api/ prefix before forwarding.\n` +
              `   Routes in serverless.yml must NOT include /api/ prefix.\n` +
              `   Example: use "/analyze" not "/api/analyze"`,
          );
        }
      });
    }
  });

  describe("no serverless.yml route should start with /api/", () => {
    for (const [origin, slsPath] of Object.entries(ORIGIN_TO_SERVERLESS)) {
      const routes = serverlessRoutesByOrigin[origin];
      for (const route of routes) {
        it(`${slsPath}: "${route}" must not start with /api/`, () => {
          expect(route).not.toMatch(/^\/api\//);
        });
      }
    }
  });
});
