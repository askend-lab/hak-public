// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * CloudFront ↔ API Gateway Route Consistency Test
 *
 * Validates that every CloudFront api_route in infra/locals.tf has a matching
 * known API route in the corresponding service — AFTER applying the CloudFront
 * rewrite function that strips /api/ or /auth/ prefix.
 *
 * This test prevents the recurring bug where CloudFront routes don't match
 * actual API Gateway paths, causing 404 → CloudFront serves index.html.
 *
 * Note: serverless.yml was removed — Lambda deploys use direct AWS CLI.
 * Routes are now validated against known API routes defined in CloudFormation stacks.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");

// Known API routes per origin (match CloudFormation stack definitions)
const KNOWN_ROUTES_BY_ORIGIN: Record<string, string[]> = {
  "vabamorf-api": ["/analyze", "/variants", "/health"],
  "merlin-api": ["/synthesize", "/status/{cacheKey}", "/health"],
  "simplestore-api": ["/save", "/get", "/delete", "/query", "/get-shared", "/get-public"],
  "auth-api": [
    "/tara/start",
    "/tara/callback",
    "/tara/refresh",
    "/tara/health",
    "/tara/exchange-code",
  ],
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
 * Apply CloudFront rewrite: strip /api/ or /auth/ prefix
 * Mirrors the CloudFront Function in infra/cloudfront.tf
 */
function applyRewrite(cfPath: string): string {
  if (cfPath.startsWith("/api/")) {
    return cfPath.substring(4); // /api/analyze → /analyze
  }
  if (cfPath.startsWith("/authtara/")) {
    return "/tara/" + cfPath.substring(10); // /authtara/callback → /tara/callback
  }
  if (cfPath.startsWith("/auth/")) {
    return cfPath.substring(5); // /auth/tara/start → /tara/start
  }
  return cfPath;
}

/**
 * Check if a known route matches a rewritten CloudFront path.
 * Handles wildcards: CloudFront /api/status/* → /status/* matches /status/{cacheKey}
 */
function routeMatches(rewrittenPath: string, knownRoute: string): boolean {
  if (rewrittenPath === knownRoute) {
    return true;
  }

  // Wildcard: /status/* should match /status/{cacheKey}
  if (rewrittenPath.endsWith("/*")) {
    const prefix = rewrittenPath.slice(0, -1); // /status/
    if (knownRoute.startsWith(prefix)) {
      return true;
    }
  }

  // Wildcard on known route side: /store/* matches /store/{key}
  if (knownRoute.endsWith("/*")) {
    const prefix = knownRoute.slice(0, -1);
    if (rewrittenPath.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

describe("CloudFront ↔ API Gateway route consistency", () => {
  const cfRoutes = parseCloudFrontRoutes();

  it("should find CloudFront routes in locals.tf", () => {
    expect(cfRoutes.length).toBeGreaterThan(0);
  });

  it("should have known routes for every origin referenced by CloudFront", () => {
    const origins = new Set(cfRoutes.map((r) => r.origin));
    for (const origin of origins) {
      expect(KNOWN_ROUTES_BY_ORIGIN[origin]).toBeDefined();
    }
  });

  describe("every rewritten CloudFront route must match a known API route", () => {
    for (const route of cfRoutes) {
      if (!route.rewrite) {
        continue;
      }

      const rewritten = applyRewrite(route.path);

      it(`${route.path} → ${rewritten} exists in ${route.origin}`, () => {
        const knownRoutes = KNOWN_ROUTES_BY_ORIGIN[route.origin];
        expect(knownRoutes).toBeDefined();

        const hasMatch = knownRoutes.some((kr) => routeMatches(rewritten, kr));
        if (!hasMatch) {
          throw new Error(
            `CloudFront route "${route.path}" rewrites to "${rewritten}" but no matching route found for origin ${route.origin}.\n` +
              `Known routes: ${knownRoutes.join(", ")}\n\n` +
              `If you added a new API route, update KNOWN_ROUTES_BY_ORIGIN in this test.`,
          );
        }
      });
    }
  });
});
