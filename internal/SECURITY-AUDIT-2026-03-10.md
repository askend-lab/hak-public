# Security Audit — HAK Platform

**Date:** 2026-03-10 | **Scope:** Full system | **Auditor:** Kate (AI)
**Previous audit:** 2026-02-26 | **Method:** Code review + infrastructure analysis + dependency audit

---

## Executive Summary

0 CRITICAL findings (previous SEC-01 resolved). 2 new MEDIUM findings. 3 previously accepted risks unchanged. Significant security improvements since last audit: JWT authentication enforced on all API endpoints, per-user WAF rate limits deployed, in-memory token storage on frontend, PKCE auth flow added. Dependency vulnerabilities increased (24 total, mostly transitive devDeps).

---

## Changes Since Last Audit (2026-02-26)

| Change | Impact |
|--------|--------|
| **SEC-01 RESOLVED**: All API endpoints now require Cognito JWT auth | CRITICAL → Closed |
| Per-user WAF rate limits (Rules 5-7) deployed | New defense layer |
| Frontend tokens moved to in-memory storage (not localStorage) | XSS token theft mitigated |
| PKCE code exchange flow added (`/tara/exchange-code`) | Auth hardened |
| Trivy container scan now `continue-on-error: true` | Regression (see SEC-11) |
| 24 npm dependency vulnerabilities (was ~6 in Feb audit) | Degraded (see SEC-12) |

---

## Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| SEC-06 | Fargate worker has public IP | MEDIUM | Accepted (unchanged) |
| SEC-07 | Audio S3 bucket publicly readable | MEDIUM | Accepted (unchanged) |
| SEC-08 | Tokens in response body | MEDIUM | Accepted (unchanged) |
| SEC-09 | Non-HttpOnly access/id cookies | LOW | Accepted (unchanged) |
| SEC-10 | Broad CSP `connect-src` wildcards | LOW | Accepted (unchanged) |
| SEC-11 | Trivy container scan non-blocking | MEDIUM | **New** |
| SEC-12 | 24 npm dependency vulnerabilities | MEDIUM | **New** |
| SEC-13 | `voice` parameter not validated against allowlist | LOW | **New** |
| SEC-14 | No Dependabot / automated dependency updates | LOW | **New** |
| SEC-15 | `pickle.load` without integrity verification | LOW | Accepted (external code) |
| SEC-16 | `shell=True` in merlin `generate.py` | LOW | Accepted (external code) |
| SEC-17 | Store `/get-shared` endpoint has no auth | LOW | By design |

**Resolved since last audit:** SEC-01 (public API endpoints — now require JWT auth).

---

## SEC-11: Trivy Container Scan Non-Blocking [MEDIUM — New]

**Location:** `.github/workflows/build.yml:257` — `continue-on-error: true`

The Trivy container image scan for `vabamorf-api` is set to `continue-on-error: true`. This means HIGH/CRITICAL vulnerabilities in the Docker image will not block the build or deployment pipeline.

**Risk:** A container image with known critical vulnerabilities could be pushed to ECR and deployed to production without any gate.

**Recommendation:** Remove `continue-on-error: true` or add a separate blocking gate that fails the build on CRITICAL severity while allowing HIGH as warnings.

---

## SEC-12: npm Dependency Vulnerabilities [MEDIUM — New]

**Location:** `pnpm-lock.yaml` — transitive dependencies

`pnpm audit` reports 24 vulnerabilities:
- **1 critical**: `basic-ftp` path traversal (transitive via serverless)
- **20 high**: `minimatch` ReDoS (8x, via babel-jest/nx/eslint), `underscore` recursion, `rollup` path traversal, `immutable` prototype pollution
- **2 moderate**: (ignored by CI config)
- **1 low**: `fast-xml-parser` stack overflow (via `@aws-sdk`)

**Production impact:** The `fast-xml-parser` vulnerability is the only one in production dependencies (via AWS SDK). All others are in devDependencies (babel-jest, nx, eslint, serverless, rollup). The `basic-ftp` critical is via `serverless` CLI (dev tool, not deployed).

**CI behavior:** `pnpm audit --audit-level=high --ignore-unfixable` runs in CI. Currently passes because unfixable transitive deps are ignored. This is appropriate but should be monitored.

**Recommendation:** Update `serverless` to latest v3 patch (fixes `basic-ftp`). Monitor `fast-xml-parser` for AWS SDK update. Consider `pnpm audit --prod` in CI for stricter production-only checks.

---

## SEC-13: `voice` Parameter Not Validated Against Allowlist [LOW — New]

**Location:** `packages/tts-api/src/schemas.ts:16` — `voice: z.string().optional()`

The `voice` parameter accepts any string value. It is passed to the Merlin TTS worker via SQS and used as a directory name component in the synthesis pipeline. While the worker validates `cacheKey` (hex-only), `speed`, `pitch`, and `text` length, the `voice` value is passed unchecked to the file system.

**Mitigating factors:** The voice value is embedded in a `shlex.quote()`-protected command (worker.py:170), and Merlin will simply fail if the voice directory doesn't exist. No direct path traversal is possible.

**Recommendation:** Add a Zod `.regex()` or `.enum()` constraint to `voice` in `SynthesizeRequestSchema` to restrict to known voice IDs (e.g., `efm_l`, `efm_h`).

---

## SEC-14: No Dependabot / Automated Dependency Updates [LOW — New]

**Location:** `.github/` — no `dependabot.yml`

No Dependabot or Renovate configuration exists. Dependency vulnerability alerts rely on manual `pnpm audit` runs in CI.

**Recommendation:** Add `.github/dependabot.yml` with npm and GitHub Actions ecosystems. This is free, requires zero maintenance, and provides automated PRs for security fixes.

---

## SEC-15: `pickle.load` Without Integrity Verification [LOW — Accepted]

**Location:** `packages/tts-worker/merlin/run_merlin.py:99`

The Merlin ML model is loaded via `pickle.load()` without SHA-256 verification. Pickle deserialization can execute arbitrary code.

**Mitigating factors:** Model files are baked into the Docker image at build time (not downloaded at runtime). Image uses ECR immutable tags and scan-on-push. The file is in the `merlin/` external library directory — not our code to modify.

**Status:** Accepted. Risk is limited to supply chain attack on the Docker build. ECR scanning provides detection.

---

## SEC-16: `shell=True` in Merlin `generate.py` [LOW — Accepted]

**Location:** `packages/tts-worker/merlin/utils/generate.py:73`

External Merlin library code uses `subprocess.Popen(args, shell=True)`. Our own `worker.py` uses `shlex.quote()` for all arguments passed to subprocess.

**Status:** Accepted. External library code, excluded from Ruff linting. Our wrapper code is safe.

---

## SEC-17: Store `/get-shared` Has No Auth [LOW — By Design]

**Location:** `packages/store/serverless.yml:81-84` — no `authorizer` on `/get-shared` and `/get-public`

The `/get-shared` and `/get-public` endpoints allow unauthenticated GET requests. The handler code (`handler.ts:117-123`) restricts these to read-only access for items with type `shared`, `unlisted`, or `public`.

**Status:** By design. These endpoints serve publicly shareable content. Write operations (`/save`, `/delete`) require auth. CloudFront forwards these routes without `Authorization` header (`locals.tf:61-62`, `auth = false`).

---

## Security Controls — Positive Findings

### Authentication & Authorization

| Control | Status | Detail |
|---------|--------|--------|
| Cognito JWT on `/synthesize` | ✅ **New** | `serverless.yml` — `cognitoAuthorizer` on POST |
| Cognito JWT on `/status/{cacheKey}` | ✅ **New** | `serverless.yml` — `cognitoAuthorizer` on GET |
| Cognito JWT on `/analyze`, `/variants` | ✅ **New** | `serverless.yml` — `cognitoAuthorizer` on POST |
| Cognito JWT on `/save`, `/get`, `/delete`, `/query` | ✅ | `serverless.yml` — `COGNITO_USER_POOLS` authorizer |
| TARA eID (national ID) via OIDC | ✅ | State + nonce validation, JWKS verification |
| PKCE code exchange flow | ✅ **New** | `handler-helpers.ts` — `code_verifier` in token exchange |
| CSRF origin validation | ✅ | `middleware.ts:25-30` — strict origin check on refresh/exchange |
| State cookie (anti-replay) | ✅ | HttpOnly, Secure, SameSite=Lax, 10-min TTL, base64url |
| Refresh token cookie | ✅ | HttpOnly, Secure, SameSite=Lax, 30-day TTL |
| Frontend in-memory token storage | ✅ **New** | `storage.ts:23-24` — tokens not in localStorage |

### WAF Rules

| Rule | Priority | Detail |
|------|----------|--------|
| Per-IP rate limit | 1 | 2000 req/5min — general abuse protection |
| Per-IP synthesize limit | 2 | 200 req/5min for `/api/synthesize` |
| Geo-blocking synthesize | 3 | Baltic/Nordic region only |
| **Per-user synthesis limit** | **5** | **10 req/2min per Authorization header** ✅ **New** |
| **Per-user morphology limit** | **6** | **20 req/1min per Authorization header** ✅ **New** |
| **Per-user status limit** | **7** | **100 req/1min per Authorization header** ✅ **New** |
| AWS Managed Common Rules | 10 | SQLi, XSS, SSRF, path traversal |

All rate-based rules return HTTP 429 with JSON body `{"error":"RATE_LIMIT","message":"Too many requests"}`. WAF logging to CloudWatch (blocked/counted only, 90-day retention).

### Network & Transport

| Control | Status | Location |
|---------|--------|----------|
| HTTPS everywhere (redirect HTTP → HTTPS) | ✅ | `cloudfront.tf:164` |
| TLS 1.2 minimum on CloudFront | ✅ | `cloudfront.tf:214` — `TLSv1.2_2021` |
| HSTS with preload (1 year, include subdomains) | ✅ | `cloudfront.tf:11-16` |
| Origin connections HTTPS-only (TLSv1.2) | ✅ | `cloudfront.tf:89-106` — all 4 origins |
| WAF v2 on all CloudFront traffic | ✅ | `cloudfront.tf:73` |
| API Gateway not publicly accessible | ✅ | No custom domains — only via CloudFront |
| Orphaned custom domains auto-cleaned | ✅ | `deploy.yml:281-356` |

### Input Validation

| Control | Status | Detail |
|---------|--------|--------|
| Zod schemas on all API inputs | ✅ | `schemas.ts` — text length, speed/pitch ranges |
| `MAX_TEXT_LENGTH = 100` (backend + frontend) | ✅ | Zod `.max(100)` + Python `MAX_TEXT_LENGTH` |
| `cacheKey` regex validation (`^[a-f0-9]{64}$`) | ✅ | Both TypeScript and Python |
| Request body size limits | ✅ | tts-api: 10KB, auth: 4KB, store: 400KB |
| SQS queue depth cap (503 at 50 messages) | ✅ | `sqs.ts` — `QueueFullError` |
| Store whitelist character validation | ✅ | `a-z A-Z 0-9 . _ - : @` only |
| Worker double-validates all SQS messages | ✅ | `worker.py:91-125` — independent from API |
| `shlex.quote()` for subprocess arguments | ✅ | `worker.py:170` |

### Response Headers

| Header | Value |
|--------|-------|
| Content-Security-Policy | `default-src 'self'; script-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `no-referrer` |

### Audit & Monitoring

| Control | Status | Detail |
|---------|--------|--------|
| CloudTrail (multi-region, log validation) | ✅ | S3 bucket versioned, encrypted, 365-day retention |
| GuardDuty threat detection | ✅ | S3 data events, findings → SNS → Slack |
| CloudWatch alarms | ✅ | API errors, Lambda errors, DynamoDB throttling, SQS depth, WAF blocks, ECS capacity |
| Budget alerts | ✅ | 70%, 90%, 100% thresholds + forecast |
| CloudFront access logs | ✅ | Encrypted bucket, 90-day retention |
| WAF logging | ✅ | Blocked/counted to CloudWatch, 90-day retention |
| X-Ray tracing on all Lambdas | ✅ | All 4 services have `tracing.lambda: true` |
| Request correlation IDs | ✅ | CloudFront Function generates UUID per request |

### Supply Chain & CI/CD

| Control | Status | Detail |
|---------|--------|--------|
| GitHub Actions pinned to SHA | ✅ | All `uses:` reference commit hashes |
| CodeQL SAST (security-extended) | ✅ | On PR, push, weekly schedule |
| Trivy container scan | ⚠️ | Present but `continue-on-error: true` (SEC-11) |
| `pnpm audit` in CI (high severity gate) | ✅ | `build.yml:87-97` — blocks on HIGH (unfixable ignored) |
| ECR image scanning on push | ✅ | Both repos |
| ECR immutable tags | ✅ | Prevents image tag overwrite |
| ECR lifecycle policy | ✅ | Keep last 10 images |
| Branch protection + enforce_admins | ✅ | Required checks, no bypass |
| OIDC for GitHub Actions (no static keys) | ✅ | `role-to-assume` via `id-token: write` |
| Terraform state locking (DynamoDB) | ✅ | Stale lock detection in CI |
| Build artifacts encrypted (SSE AES256) | ✅ | `deploy.yml` — `--sse AES256` |
| Deployment state tracking | ✅ | `{env}.json` manifest in S3 |

### IAM & Access Control

| Control | Status | Detail |
|---------|--------|--------|
| ECS task role — least privilege | ✅ | SQS receive/delete, S3 put/get, CloudWatch logs only |
| Security group — zero ingress | ✅ | Egress port 443 only |
| S3 website bucket — private (OAC) | ✅ | CloudFront-only access via `SourceArn` condition |
| S3 CloudTrail bucket — all public access blocked | ✅ | 4-way public access block |
| S3 CF logs bucket — all public access blocked | ✅ | 4-way public access block |
| Lambda IAM — scoped per service | ✅ | Each service has minimal permissions |
| Auth Lambda in VPC (private subnets) | ✅ | `serverless.yml:50-55` — security group + private subnets |
| DynamoDB Point-in-Time Recovery | ✅ | `store/serverless.yml:128-129` |
| DynamoDB TTL enabled | ✅ | `store/serverless.yml:125-127` |
| Secrets in AWS Secrets Manager | ✅ | TARA client credentials loaded from ARN |
| Config in AWS SSM Parameter Store | ✅ | Cognito IDs, domain names, frontend URLs |

### Data Protection

| Control | Status | Detail |
|---------|--------|--------|
| S3 encryption (AES256) | ✅ | Website, CloudTrail, CF logs buckets |
| S3 versioning | ✅ | Website and CloudTrail buckets |
| CloudTrail log file validation | ✅ | `enable_log_file_validation = true` |
| SNS encryption (AWS managed KMS) | ✅ | Alert topics |
| SQS dead letter queue | ✅ | 14-day retention for failed messages |
| Log retention policies | ✅ | CloudWatch 30-90 days, CloudTrail 365 days |
| `.env` files in `.gitignore` | ✅ | Root, frontend, store |
| No hardcoded secrets in codebase | ✅ | Verified — all secrets via SSM/Secrets Manager |

---

## Recommendations

1. **SEC-11** — Make Trivy scan blocking for CRITICAL vulnerabilities. Change `continue-on-error: true` to `false`, or add a second step that fails on CRITICAL only.

2. **SEC-12** — Update `serverless` to latest v3 patch to resolve `basic-ftp` critical. Monitor `fast-xml-parser` for AWS SDK update.

3. **SEC-13** — Add voice parameter validation: `z.string().regex(/^[a-z0-9_]{2,20}$/).optional()` or use `.enum()` with known voices.

4. **SEC-14** — Add `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: npm
       directory: "/"
       schedule: { interval: weekly }
       open-pull-requests-limit: 5
     - package-ecosystem: github-actions
       directory: "/"
       schedule: { interval: weekly }
   ```

5. **DynamoDB encryption** — SimpleStore table uses default AWS encryption. Consider explicit CMK if storing sensitive user data in future.

6. **Container Insights** — ECS cluster has `containerInsights = enabled` ✅. Consider adding Fargate runtime monitoring when AWS makes it available for Spot.

---

## Audit Scope

### Files Reviewed

**Infrastructure (Terraform):**
- `infra/waf.tf` — WAF rules, rate limits, logging
- `infra/cloudfront.tf` — CDN, TLS, security headers, CSP
- `infra/cloudtrail.tf` — Audit logging
- `infra/guardduty.tf` — Threat detection
- `infra/website.tf` — S3 buckets, access controls
- `infra/merlin/main.tf` — ECS, IAM, SQS, security groups
- `infra/locals.tf` — API route definitions, auth config

**Backend Services:**
- `packages/auth/src/handler.ts` — Auth handlers
- `packages/auth/src/cookies.ts` — Cookie security
- `packages/auth/src/middleware.ts` — CSRF, CORS
- `packages/auth/src/tara-client.ts` — TARA OIDC, JWKS
- `packages/auth/serverless.yml` — Auth deployment config
- `packages/tts-api/src/handler.ts` — TTS API handlers
- `packages/tts-api/src/schemas.ts` — Zod validation
- `packages/tts-api/src/env.ts` — Environment validation
- `packages/tts-api/serverless.yml` — TTS deployment + auth
- `packages/morphology-api/src/handler.ts` — Morphology handlers
- `packages/morphology-api/serverless.yml` — Morphology deployment + auth
- `packages/store/src/lambda/handler.ts` — Store handlers
- `packages/store/serverless.yml` — Store deployment + auth

**Frontend:**
- `packages/frontend/src/features/auth/services/storage.ts` — Token storage
- `packages/frontend/src/features/auth/services/context.tsx` — Auth flow

**Worker:**
- `packages/tts-worker/worker.py` — SQS worker, subprocess handling
- `packages/tts-worker/merlin/run_merlin.py` — ML model loading

**CI/CD:**
- `.github/workflows/build.yml` — Build pipeline, audit, Trivy
- `.github/workflows/deploy.yml` — Deployment pipeline
- `.github/workflows/terraform.yml` — Infrastructure pipeline
- `.github/workflows/codeql.yml` — SAST analysis

**Configuration:**
- `.env.example` — No secrets
- `.gitignore` — `.env` excluded

### Tools Used

- `pnpm audit` — dependency vulnerability scan
- `grep` — codebase search for secrets, shell=True, pickle, etc.
- Manual code review of all security-sensitive files
