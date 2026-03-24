import { Given, When, Then } from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../../../..");

const ORIGIN_TO_SLS: Record<string, string> = {
  "vabamorf-api": "packages/morphology-api/serverless.yml",
  "merlin-api": "packages/tts-api/serverless.yml",
  "simplestore-api": "packages/store/serverless.yml",
  "auth-api": "packages/auth/serverless.yml",
};
const SLS_PATHS = Object.values(ORIGIN_TO_SLS);
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf-8");
const extractPaths = (content: string) => [...content.matchAll(/^\s+path:\s+(\/\S+)/gm)].map((m) => m[1]);

interface RouteInfo { cfPath: string; rewritten: string; origin: string }
const state = {
  cfRoutes: [] as { path: string; origin: string; rewrite: boolean }[],
  rewrittenRoutes: [] as RouteInfo[],
  slsRoutesByOrigin: {} as Record<string, string[]>,
  allRoutes: [] as { file: string; path: string }[],
  authByRoute: {} as Record<string, string | null>,
  wafContent: "",
  rateLimits: [] as { limit: number }[],
  alarmFns: [] as string[],
  lambdaFns: [] as string[],
};

function applyRewrite(cfPath: string): string {
  if (cfPath.startsWith("/api/")) { return cfPath.substring(4); }
  if (cfPath.startsWith("/authtara/")) { return "/tara/" + cfPath.substring(10); }
  if (cfPath.startsWith("/auth/")) { return cfPath.substring(5); }
  return cfPath;
}

function routeMatches(a: string, b: string): boolean {
  if (a === b) { return true; }
  if (a.endsWith("/*") && b.startsWith(a.slice(0, -1))) { return true; }
  if (b.endsWith("/*") && a.startsWith(b.slice(0, -1))) { return true; }
  return false;
}

Given("CloudFront API routes are defined in locals.tf", function () {
  const localsTf = read("infra/locals.tf");
  const re = /\{\s*path\s*=\s*"([^"]+)"\s*,\s*origin\s*=\s*"([^"]+)"\s*,\s*rewrite\s*=\s*(true|false)/g;
  state.cfRoutes = [...localsTf.matchAll(re)].map((m) => ({ path: m[1], origin: m[2], rewrite: m[3] === "true" }));
  assert.ok(state.cfRoutes.length > 0, "No CloudFront routes found in locals.tf");
  state.slsRoutesByOrigin = {};
  for (const [origin, slsPath] of Object.entries(ORIGIN_TO_SLS)) {
    state.slsRoutesByOrigin[origin] = [...new Set(extractPaths(read(slsPath)))];
  }
});

When("each route is rewritten as the CloudFront Function does", function () {
  state.rewrittenRoutes = state.cfRoutes
    .filter((r) => r.rewrite)
    .map((r) => ({ cfPath: r.path, rewritten: applyRewrite(r.path), origin: r.origin }));
  assert.ok(state.rewrittenRoutes.length > 0, "No rewritable routes found");
});

Then("every rewritten path has a matching serverless.yml route", function () {
  const failures: string[] = [];
  for (const route of state.rewrittenRoutes) {
    const routes = state.slsRoutesByOrigin[route.origin];
    if (!routes) { failures.push("No serverless.yml for origin: " + route.origin); continue; }
    if (!routes.some((sr) => routeMatches(route.rewritten, sr))) {
      failures.push(route.cfPath + " → " + route.rewritten + " unmatched in " + ORIGIN_TO_SLS[route.origin]);
    }
  }
  assert.strictEqual(failures.length, 0, "Route mismatches:\n" + failures.join("\n"));
});

Given("all serverless.yml files for backend APIs", function () {
  state.allRoutes = [];
  for (const slsPath of SLS_PATHS) {
    for (const p of extractPaths(read(slsPath))) { state.allRoutes.push({ file: slsPath, path: p }); }
  }
  assert.ok(state.allRoutes.length > 0, "No serverless routes found");
});

When("HTTP event paths are extracted", function () {
  assert.ok(state.allRoutes.length > 0);
});

Then("no route path starts with {string}", function (prefix: string) {
  const bad = state.allRoutes.filter((r) => r.path.startsWith(prefix));
  const detail = bad.map((r) => "  " + r.file + ": " + r.path).join("\n");
  assert.strictEqual(bad.length, 0, "Routes with " + prefix + " prefix found:\n" + detail);
});

function parseAuthorizers(slsPath: string): void {
  const lines = read(slsPath).split("\n");
  let curPath: string | null = null;
  let curAuth: string | null = null;
  for (const line of lines) {
    const pm = line.match(/^\s+path:\s+(\/\S+)/);
    if (pm) {
      if (curPath) { state.authByRoute[curPath] = curAuth; }
      curPath = pm[1];
      curAuth = null;
    }
    const am = line.match(/^\s+name:\s+(\S+Authorizer\S*)/i);
    if (am && curPath) { curAuth = am[1]; }
  }
  if (curPath) { state.authByRoute[curPath] = curAuth; }
}

Given("the synthesis and morphology API configurations", function () {
  state.authByRoute = {};
  parseAuthorizers("packages/tts-api/serverless.yml");
  parseAuthorizers("packages/morphology-api/serverless.yml");
});

When("endpoint authorizer settings are inspected", function () {
  assert.ok(Object.keys(state.authByRoute).length > 0, "No endpoints found");
});

Then("{word} requires cognitoAuthorizer", function (routePath: string) {
  const auth = state.authByRoute[routePath];
  assert.ok(auth && auth.toLowerCase().includes("cognito"),
    routePath + " missing cognitoAuthorizer (found: " + (auth ?? "none") + ")");
});

Given("the WAF configuration in waf.tf", function () {
  state.wafContent = read("infra/waf.tf");
  assert.ok(state.wafContent.length > 0, "waf.tf is empty");
});

When("rate limit rules are parsed", function () {
  const re = /rate_based_statement\s*\{[^}]*limit\s*=\s*(\d+)/g;
  state.rateLimits = [...state.wafContent.matchAll(re)].map((m) => ({ limit: parseInt(m[1], 10) }));
  assert.ok(state.rateLimits.length > 0, "No rate limit rules found in waf.tf");
});

Then("a general per-IP rate limit of {int} exists", function (limit: number) {
  assert.ok(state.rateLimits.some((r) => r.limit === limit),
    "No rate limit of " + limit + ". Found: " + state.rateLimits.map((r) => r.limit).join(", "));
});

Then("a \\/api\\/synthesize per-IP rate limit of {int} exists", function (limit: number) {
  assert.ok(state.wafContent.includes("/api/synthesize"), "No /api/synthesize in waf.tf");
  assert.ok(state.rateLimits.some((r) => r.limit === limit),
    "No rate limit of " + limit + " for /api/synthesize");
});

Given("the CloudWatch alarm definitions in Terraform", function () {
  const content = read("infra/cloudwatch-alarms.tf");
  state.alarmFns = [...content.matchAll(/FunctionName\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  const forEachRe = /for_each\s*=\s*toset\(\[([^\]]+)\]\)/g;
  for (const m of content.matchAll(forEachRe)) {
    const quoted = (m[1] ?? "").match(/"[^"]+"/g) ?? [];
    state.alarmFns.push(...quoted.map((s) => s.replace(/"/g, "")));
  }
  assert.ok(state.alarmFns.length > 0, "No alarm function names found");
});

Given("the Lambda functions defined in serverless.yml files", function () {
  state.lambdaFns = [];
  for (const slsPath of SLS_PATHS) {
    const content = read(slsPath);
    const fm = content.match(/^functions:\s*\n((?:  \w[\s\S]*?)(?=\n\w|\n*$))/m);
    if (!fm) { continue; }
    state.lambdaFns.push(...[...fm[1].matchAll(/^  (\w+):\s*$/gm)].map((m) => m[1]));
  }
  assert.ok(state.lambdaFns.length > 0, "No Lambda functions found");
});

When("alarms are matched to Lambda function names", function () {
  assert.ok(state.alarmFns.length > 0);
  assert.ok(state.lambdaFns.length > 0);
});

Then("every API Lambda function has at least one alarm", function () {
  const missing = state.lambdaFns.filter((fn) => {
    const kebab = fn.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    return !state.alarmFns.some((a) => a.includes(fn) || a.includes(kebab));
  });
  const coverage = (state.lambdaFns.length - missing.length) / state.lambdaFns.length;
  assert.ok(coverage >= 0.8,
    Math.round(coverage * 100) + "% alarm coverage. Missing: " + missing.join(", "));
});
