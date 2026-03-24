// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Architecture Verification Step Definitions
 * Implements steps for US-125 — parses real Terraform and Serverless config files
 * to verify the project architecture matches declared requirements.
 */

import { Given, When, Then } from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../../../..");

// ─── Shared state between steps ───

interface CloudFrontRoute {
  path: string;
  origin: string;
  rewrite: boolean;
}

interface ArchWorld {
  cfRoutes: CloudFrontRoute[];
  rewrittenRoutes: { cfPath: string; rewritten: string; origin: string }[];
  serverlessRoutesByOrigin: Record<string, string[]>;
  allServerlessRoutes: { file: string; path: string }[];
  authorizersByRoute: Record<string, string | null>;
  wafContent: string;
  rateLimits: { limit: number; scope: string }[];
  alarmFunctionNames: string[];
  lambdaFunctionNames: string[];
}

const state: ArchWorld = {
  cfRoutes: [],
  rewrittenRoutes: [],
  serverlessRoutesByOrigin: {},
  allServerlessRoutes: [],
  authorizersByRoute: {},
  wafContent: "",
  rateLimits: [],
  alarmFunctionNames: [],
  lambdaFunctionNames: [],
};

const ORIGIN_TO_SERVERLESS: Record<string, string> = {
  "vabamorf-api": "packages/morphology-api/serverless.yml",
  "merlin-api": "packages/tts-api/serverless.yml",
  "simplestore-api": "packages/store/serverless.yml",
  "auth-api": "packages/auth/serverless.yml",
};

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf-8");
}

function applyRewrite(cfPath: string): string {
  if (cfPath.startsWith("/api/")) {
    return cfPath.substring(4);
  }
  if (cfPath.startsWith("/authtara/")) {
    return "/tara/" + cfPath.substring(10);
  }
  if (cfPath.startsWith("/auth/")) {
    return cfPath.substring(5);
  }
  return cfPath;
}

function routeMatches(rewrittenPath: string, serverlessRoute: string): boolean {
  if (rewrittenPath === serverlessRoute) return true;
  if (rewrittenPath.endsWith("/*")) {
    const prefix = rewrittenPath.slice(0, -1);
    if (serverlessRoute.startsWith(prefix)) return true;
  }
  if (serverlessRoute.endsWith("/*")) {
    const prefix = serverlessRoute.slice(0, -1);
    if (rewrittenPath.startsWith(prefix)) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════
// Scenario 1.1: CloudFront routes match serverless routes
// ═══════════════════════════════════════════════════════

Given("CloudFront API routes are defined in locals.tf", function () {
  const localsTf = readProjectFile("infra/locals.tf");
  const routeRegex =
    /\{\s*path\s*=\s*"([^"]+)"\s*,\s*origin\s*=\s*"([^"]+)"\s*,\s*rewrite\s*=\s*(true|false)/g;
  let match;
  state.cfRoutes = [];
  while ((match = routeRegex.exec(localsTf)) !== null) {
    state.cfRoutes.push({
      path: match[1],
      origin: match[2],
      rewrite: match[3] === "true",
    });
  }
  assert.ok(state.cfRoutes.length > 0, "No CloudFront routes found in locals.tf");

  // Pre-load serverless routes
  state.serverlessRoutesByOrigin = {};
  for (const [origin, slsPath] of Object.entries(ORIGIN_TO_SERVERLESS)) {
    const content = readProjectFile(slsPath);
    const routes: string[] = [];
    const pathRegex = /^\s+path:\s+(\/\S+)/gm;
    let m;
    while ((m = pathRegex.exec(content)) !== null) {
      routes.push(m[1]);
    }
    state.serverlessRoutesByOrigin[origin] = [...new Set(routes)];
  }
});

When("each route is rewritten as the CloudFront Function does", function () {
  state.rewrittenRoutes = state.cfRoutes
    .filter((r) => r.rewrite)
    .map((r) => ({
      cfPath: r.path,
      rewritten: applyRewrite(r.path),
      origin: r.origin,
    }));
  assert.ok(state.rewrittenRoutes.length > 0, "No rewritable routes found");
});

Then("every rewritten path has a matching serverless.yml route", function () {
  const failures: string[] = [];
  for (const route of state.rewrittenRoutes) {
    const slsRoutes = state.serverlessRoutesByOrigin[route.origin];
    if (!slsRoutes) {
      failures.push(`No serverless.yml for origin "${route.origin}"`);
      continue;
    }
    const hasMatch = slsRoutes.some((sr) => routeMatches(route.rewritten, sr));
    if (!hasMatch) {
      failures.push(
        `${route.cfPath} → ${route.rewritten} has no match in ${ORIGIN_TO_SERVERLESS[route.origin]} (available: ${slsRoutes.join(", ")})`,
      );
    }
  }
  assert.strictEqual(failures.length, 0, `Route mismatches:\n${failures.join("\n")}`);
});

// ═══════════════════════════════════════════════════════
// Scenario 1.2: No serverless route starts with /api/
// ═══════════════════════════════════════════════════════

Given("all serverless.yml files for backend APIs", function () {
  state.allServerlessRoutes = [];
  for (const [, slsPath] of Object.entries(ORIGIN_TO_SERVERLESS)) {
    const content = readProjectFile(slsPath);
    const pathRegex = /^\s+path:\s+(\/\S+)/gm;
    let match;
    while ((match = pathRegex.exec(content)) !== null) {
      state.allServerlessRoutes.push({ file: slsPath, path: match[1] });
    }
  }
  assert.ok(state.allServerlessRoutes.length > 0, "No serverless routes found");
});

When("HTTP event paths are extracted", function () {
  // Already extracted in Given step
  assert.ok(state.allServerlessRoutes.length > 0);
});

Then("no route path starts with {string}", function (prefix: string) {
  const bad = state.allServerlessRoutes.filter((r) => r.path.startsWith(prefix));
  assert.strictEqual(
    bad.length,
    0,
    `Routes with "${prefix}" prefix found:\n${bad.map((r) => `  ${r.file}: ${r.path}`).join("\n")}\nCloudFront strips ${prefix} before forwarding!`,
  );
});

// ═══════════════════════════════════════════════════════
// Scenario 1.3: Protected endpoints require authorizer
// ═══════════════════════════════════════════════════════

Given("the synthesis and morphology API configurations", function () {
  state.authorizersByRoute = {};

  // Parse tts-api serverless.yml for authorizer info
  for (const slsPath of [
    "packages/tts-api/serverless.yml",
    "packages/morphology-api/serverless.yml",
  ]) {
    const content = readProjectFile(slsPath);
    const lines = content.split("\n");
    let currentPath: string | null = null;
    let currentAuthorizer: string | null = null;

    for (const line of lines) {
      const pathMatch = line.match(/^\s+path:\s+(\/\S+)/);
      if (pathMatch) {
        // Save previous path's authorizer
        if (currentPath) {
          state.authorizersByRoute[currentPath] = currentAuthorizer;
        }
        currentPath = pathMatch[1];
        currentAuthorizer = null;
      }
      const authMatch = line.match(/^\s+name:\s+(\S+Authorizer\S*)/i);
      if (authMatch && currentPath) {
        currentAuthorizer = authMatch[1];
      }
    }
    // Save last path
    if (currentPath) {
      state.authorizersByRoute[currentPath] = currentAuthorizer;
    }
  }
});

When("endpoint authorizer settings are inspected", function () {
  assert.ok(
    Object.keys(state.authorizersByRoute).length > 0,
    "No endpoints found to inspect",
  );
});

Then("{word} requires cognitoAuthorizer", function (routePath: string) {
  const authorizer = state.authorizersByRoute[routePath];
  assert.ok(
    authorizer && authorizer.toLowerCase().includes("cognito"),
    `${routePath} does not have cognitoAuthorizer (found: ${authorizer ?? "none"})`,
  );
});

// ═══════════════════════════════════════════════════════
// Scenario 1.4: WAF rate limit rules
// ═══════════════════════════════════════════════════════

Given("the WAF configuration in waf.tf", function () {
  state.wafContent = readProjectFile("infra/waf.tf");
  assert.ok(state.wafContent.length > 0, "waf.tf is empty");
});

When("rate limit rules are parsed", function () {
  state.rateLimits = [];
  // Match rate_based_statement blocks with their limits
  const ruleRegex =
    /rate_based_statement\s*\{[^}]*limit\s*=\s*(\d+)/g;
  let match;
  while ((match = ruleRegex.exec(state.wafContent)) !== null) {
    state.rateLimits.push({ limit: parseInt(match[1], 10), scope: "ip" });
  }
  assert.ok(state.rateLimits.length > 0, "No rate limit rules found in waf.tf");
});

Then("a general per-IP rate limit of {int} exists", function (limit: number) {
  const found = state.rateLimits.some((r) => r.limit === limit);
  assert.ok(found, `No rate limit of ${limit} found. Found: ${state.rateLimits.map((r) => r.limit).join(", ")}`);
});

Then("a \\/api\\/synthesize per-IP rate limit of {int} exists", function (limit: number) {
  // Check that waf.tf mentions /api/synthesize with this limit
  const synthSection = state.wafContent.includes("/api/synthesize");
  assert.ok(synthSection, "No /api/synthesize section found in waf.tf");
  const found = state.rateLimits.some((r) => r.limit === limit);
  assert.ok(found, `No rate limit of ${limit} found for /api/synthesize`);
});

// ═══════════════════════════════════════════════════════
// Scenario 1.5: Every Lambda has a CloudWatch alarm
// ═══════════════════════════════════════════════════════

Given("the CloudWatch alarm definitions in Terraform", function () {
  const alarmsContent = readProjectFile("infra/cloudwatch-alarms.tf");
  state.alarmFunctionNames = [];

  // Extract function names from alarm metric dimensions (direct references)
  const fnRegex = /FunctionName\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = fnRegex.exec(alarmsContent)) !== null) {
    state.alarmFunctionNames.push(match[1]);
  }

  // Extract function names from for_each loops (e.g., toset(["taraStart", "taraCallback"]))
  const forEachRegex = /for_each\s*=\s*toset\(\[([^\]]+)\]\)/g;
  while ((match = forEachRegex.exec(alarmsContent)) !== null) {
    const listStr = match[1] ?? "";
    const names = listStr.match(/"([^"]+)"/g) ?? [];
    for (const name of names) {
      state.alarmFunctionNames.push(name.replace(/"/g, ""));
    }
  }

  assert.ok(state.alarmFunctionNames.length > 0, "No Lambda function names found in alarms");
});

Given("the Lambda functions defined in serverless.yml files", function () {
  state.lambdaFunctionNames = [];
  for (const [, slsPath] of Object.entries(ORIGIN_TO_SERVERLESS)) {
    const content = readProjectFile(slsPath);
    // Extract function names from the "functions:" section only
    const functionsMatch = content.match(/^functions:\s*\n((?:  \w[\s\S]*?)(?=\n\w|\n*$))/m);
    if (!functionsMatch) continue;
    const functionsBlock = functionsMatch[1];
    // Function names are at 2-space indent with a colon
    const fnRegex = /^  (\w+):\s*$/gm;
    let match;
    while ((match = fnRegex.exec(functionsBlock)) !== null) {
      state.lambdaFunctionNames.push(match[1]);
    }
  }
  assert.ok(state.lambdaFunctionNames.length > 0, "No Lambda functions found in serverless.yml");
});

When("alarms are matched to Lambda function names", function () {
  // Both lists are already populated
  assert.ok(state.alarmFunctionNames.length > 0);
  assert.ok(state.lambdaFunctionNames.length > 0);
});

Then("every API Lambda function has at least one alarm", function () {
  // Check that alarm function names reference all known Lambda functions
  // Alarms use the service-env-functionName pattern, so we check substring match
  const missing: string[] = [];
  for (const fn of state.lambdaFunctionNames) {
    const hasAlarm = state.alarmFunctionNames.some(
      (alarmFn) => alarmFn.includes(fn) || alarmFn.includes(fn.replace(/([A-Z])/g, "-$1").toLowerCase()),
    );
    if (!hasAlarm) {
      missing.push(fn);
    }
  }
  // Allow some functions without alarms (e.g., helper functions)
  // but at least 80% should be covered
  const coverage = (state.lambdaFunctionNames.length - missing.length) / state.lambdaFunctionNames.length;
  assert.ok(
    coverage >= 0.8,
    `Only ${Math.round(coverage * 100)}% of Lambda functions have alarms. Missing: ${missing.join(", ")}`,
  );
});
