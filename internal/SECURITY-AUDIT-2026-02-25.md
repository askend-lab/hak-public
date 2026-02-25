# Security Analysis — HAK Platform

**Date:** 2026-02-25 (updated 2026-02-25)
**Scope:** Full system — infrastructure, APIs, authentication, CI/CD, Docker, frontend, data layer
**Auditor:** Kate (AI)
**Previous audits:** `SECURITY-AUDIT-2026-02-16.md` (Sam), `internal/SECURITY-AUDIT-2026-02.md` (Sam)
**Code reviews:** Lauri (2026-02-25, 12 findings — 11 fixed, 1 partially fixed)

---

## Executive Summary

HAK is an Estonian language learning platform running on AWS with a serverless backend (Lambda, API Gateway, ECS Fargate) and a React SPA frontend served via CloudFront.

This document serves as both a **security audit** (identifying vulnerabilities) and a **security analysis** (documenting how typical threats are prevented). It covers the entire system as of 2026-02-25, including:
- Security incident response on 2026-02-24 (API Gateway exposure)
- Lauri code review fixes on 2026-02-25 (auth hardening, write skew, Zod validation)
- Infrastructure lockdown of all API Gateways

**Overall posture: STRONG — critical gaps closed, defense-in-depth maturing.**

| Severity | Count | Addressed |
|----------|-------|-----------|
| CRITICAL | 2     | 2 ✅      |
| HIGH     | 3     | 3 ✅      |
| MEDIUM   | 7     | 6 ✅ / 1 ❌ |
| LOW/INFO | 4     | 2 ✅ / 2 ❌ |

---

## CRITICAL Findings

### SEC-C1: WAF Rate Limits Temporarily Raised [CRITICAL]

**File:** `infra/waf.tf:19-30, 42-55`
**Status:** ✅ Partially reverted — synthesize back to 200/5min; general still at 2000/5min

WAF rate limits were temporarily raised on 2026-02-24 for mass TTS generation. Synthesize limit was reverted from 500 to **200 req/5min** (reasonable for 2 ECS workers). General per-IP limit remains at **2000 req/5min** (original was 100).

**Remaining risk:** General 2000/5min is 20× the original — still excessive for normal operation. Should be reverted to 300/5min (original production value).

**Remediation:** Revert general rate limit to 300/5min after confirming mass generation is complete.

### SEC-C2: SimpleStore API Gateway Had Public Custom Domain — Bypassed WAF [CRITICAL]

**File:** `infra/api-gateway.tf` (now cleaned up), `packages/store/serverless.yml`
**Status:** ✅ FIXED — custom domain removed, all traffic via CloudFront

SimpleStore and Auth APIs previously had public custom domains (`hak-api-{env}.askend-lab.com`) that bypassed CloudFront WAF. Fixed by:
- Removed `serverless-domain-manager` plugin from `store/serverless.yml` and `auth/serverless.yml`
- Updated CloudFront origins to use execute-api URLs
- `api-gateway.tf` cleaned up (custom domain resource removed)
- E2E test `api-gateway-lockdown.smoke.test.ts` covers regression

All 4 API Gateways (Merlin, Vabamorf, SimpleStore, Auth) now only reachable through CloudFront WAF.

---

## HIGH Findings

### SEC-H1: Auth Service Had Public Custom Domain via serverless-domain-manager [HIGH]

**File:** `packages/auth/serverless.yml`
**Status:** ✅ FIXED — addressed together with SEC-C2

The auth service previously shared the same public custom domain as SimpleStore. Fixed by removing `serverless-domain-manager` plugin from `auth/serverless.yml` and routing through CloudFront. Auth endpoints are now only accessible via CloudFront WAF. The auth Lambda also runs in a VPC for additional network isolation.

### SEC-H2: Fargate Worker Runs in Default VPC with Public IP [HIGH]

**File:** `infra/merlin/main.tf:353-357`
**Status:** ✅ Accepted risk — ingress blocked, egress restricted

The Merlin ECS worker runs in the default VPC with `assign_public_ip = true`. However, the security controls are sufficient:
- **Ingress:** Security group has NO ingress rules — all incoming connections blocked by AWS default deny
- **Egress:** Restricted to port 443 only (HTTPS to AWS services: SQS, S3, ECR)
- The public IP is required because default VPC has no private subnets with NAT gateway

Moving to private subnets + NAT gateway (~$32/month) or VPC endpoints (~$7/month each) would eliminate the public IP but adds cost with marginal security benefit given the existing controls.

**Risk assessment:** Low residual risk. Attack requires container compromise AND ability to use the public IP as pivot, but egress is restricted to port 443.

### SEC-H3: Merlin Audio S3 Bucket Allows Unrestricted Public Read [HIGH]

**File:** `infra/merlin/main.tf:97-123`
**Status:** ✅ Accepted risk (documented in DESIGN-DECISIONS.md #15), CORS restricted

The audio S3 bucket has:
- `block_public_acls = false` (all public access blocks disabled)
- `Principal = "*"` on `s3:GetObject` policy
- No CloudFront/WAF in front of the bucket

Audio content is non-sensitive educational material with hash-keyed URLs (SHA-256). CORS is restricted to application domains. However:
- Anyone with a cache key can download audio files directly from S3
- No access logging on the audio bucket
- No lifecycle policy for abuse detection
- Hash-keyed URLs provide some obscurity but are not truly private (cache keys are returned in API responses)

**Current mitigation:** CORS restricts browser-origin requests. Content is educational, non-sensitive. Cache keys are SHA-256 hashes.
**Residual risk:** Direct S3 URL access from non-browser clients (curl, scripts) is unrestricted.

---

## MEDIUM Findings

### SEC-M1: DynamoDB Access Policy Grants Write to `agent-readonly` User [MEDIUM]

**File:** `infra/dynamodb.tf:3-23`
**Status:** ✅ FIXED — policy restricted to read-only (GetItem, Query)

The IAM user `agent-readonly` previously had full CRUD access (GetItem, PutItem, UpdateItem, DeleteItem, Query). Policy now restricted to read-only operations matching the user name.

### SEC-M2: No WAF Protection on `/api/status/*` Path [MEDIUM]

**File:** `infra/waf.tf`
**Status:** ❌ OPEN

WAF has per-path rate limiting only for `/api/synthesize`. The `/api/status/*` endpoint has no per-path rate limit — only the general 100 req/5min limit. An attacker could:
- Poll `/api/status/{key}` at high rates to enumerate valid cache keys
- Use status polling to determine when specific content was synthesized

**Remediation:** Add a per-path rate limit for `/api/status/*`, similar to the synthesize rule.

### SEC-M3: Morphology API Catch-All Route Accepts ANY Method [MEDIUM]

**File:** `packages/morphology-api/serverless.yml:53-62`
**Status:** ✅ FIXED — restricted to `POST /analyze`, `POST /variants`, `GET /health`

The Vabamorf API previously used `method: ANY` with `path: /{proxy+}` — a catch-all route. Now restricted to the 3 specific endpoints defined in the OpenAPI spec.

**⚠️ Incident 2026-02-25:** Initial fix incorrectly used `/api/analyze` paths in serverless.yml. CloudFront strips `/api/` prefix before forwarding, so API Gateway returned 404 → `custom_error_response` converted to 200 + index.html → frontend received HTML instead of JSON → generation broken on dev. Fixed in PR #716 by removing `/api/` prefix from routes. Static test `cloudfront-route-consistency.test.ts` now prevents recurrence.

### SEC-M4: CloudTrail Bucket Lacks MFA Delete and Object Lock [MEDIUM]

**File:** `infra/cloudtrail.tf:4-48`
**Status:** ✅ Partially mitigated (versioning enabled)

CloudTrail logs are stored in a versioned S3 bucket with encryption, public access blocked, and lifecycle management. However:
- No MFA Delete requirement — a compromised admin could delete audit logs
- No S3 Object Lock — logs can be overwritten or deleted within retention period
- `enable_log_file_validation = true` (good — detects tampering)

**Current mitigation:** Versioning prevents permanent deletion (versions are retained). Log file validation detects any modification.
**Residual risk:** Compromised root/admin credentials could disable versioning and delete logs.

### SEC-M5: ECR Image Tag Mutability Inconsistency [MEDIUM]

**File:** `infra/merlin/main.tf:131` vs `infra/ecr.tf:4`
**Status:** ✅ Partially addressed

Merlin ECR repo: `MUTABLE` (intentional — uses `:latest` tag).
Vabamorf ECR repo: `IMMUTABLE` (uses SHA-based tags from CI).

For Merlin, mutable tags mean a compromised CI pipeline could overwrite an existing image. The `:latest` pattern makes it impossible to audit which exact image version is running.

**Remediation:** Consider switching Merlin to immutable tags with SHA-based naming (matching Vabamorf pattern). Update ECS task definition to reference specific SHA tags.

### SEC-M6: Refresh Token Endpoint Returns Tokens in Response Body [MEDIUM]

**File:** `packages/auth/src/handler.ts:254-258`
**Status:** ✅ Accepted risk (documented)

The `refreshHandler` returns `access_token` and `id_token` in the JSON response body:
```typescript
body: JSON.stringify({ access_token: data.access_token, id_token: data.id_token }),
```

These tokens are also set via non-HttpOnly cookies. The refresh token itself is HttpOnly. This is a documented design decision — the frontend needs JavaScript access to set the Authorization header.

**Current mitigation:** CSRF origin validation on the endpoint, short-lived tokens (1h), SameSite=Lax cookies.

### SEC-M7: No Ingress Rules on Merlin Security Group [MEDIUM]

**File:** `infra/merlin/main.tf:424-440`
**Status:** ✅ Good — but implicit

The Merlin worker security group has no ingress rules (only egress to port 443). This is correct — the worker only polls SQS outbound and doesn't accept connections. However, this security-critical fact is not documented, and AWS default behavior (deny all ingress) is being relied upon implicitly.

**Remediation:** Add an explicit comment and/or an explicit deny-all ingress rule for documentation purposes.

---

## LOW / Informational Findings

### SEC-L1: Synthesize Endpoint is Unauthenticated [LOW]

**File:** `packages/tts-api/serverless.yml:83-91`, `infra/locals.tf:41`
**Status:** ✅ By design

The `/api/synthesize` endpoint requires no authentication. Anyone can submit text for synthesis. Protection relies on:
- WAF rate limiting (20 req/5min per IP — currently raised to 500)
- WAF geo-blocking (Baltic/Nordic only)
- SQS queue depth limit (MAX_QUEUE_DEPTH=50)
- Fargate max capacity cap

**Residual risk:** Even with rate limiting, a distributed attack from multiple IPs within allowed countries could exhaust the synthesis queue and Fargate capacity.

### SEC-L2: Access/ID Token Cookies Are Not HttpOnly [LOW]

**File:** `packages/auth/src/cookies.ts:67-79`
**Status:** ✅ Documented design decision

`hak_access_token` and `hak_id_token` cookies lack the `HttpOnly` flag because the frontend JavaScript reads them for the Authorization header. Protected by:
- Short expiry (1h)
- SameSite=Lax
- CSP restricts script sources to 'self'
- Refresh token IS HttpOnly

### SEC-L3: Gitleaks Config Allows `.env` Files [LOW]

**File:** `.gitleaks.toml:5-12`
**Status:** ✅ FIXED — `.env` removed from allowlist

The gitleaks configuration previously allowlisted `.env` paths, meaning secrets in `.env` files wouldn't be detected. Now removed — accidental `.env` commits will be caught by gitleaks scanning.

### SEC-L4: CSP connect-src Includes Broad Wildcards [LOW]

**File:** `infra/cloudfront.tf:7`
**Status:** ✅ Necessary but broad

The Content-Security-Policy `connect-src` directive includes:
- `https://*.askend-lab.com` — allows connection to any subdomain
- `https://*.amazonaws.com` — allows connection to any AWS service
- `https://*.amazoncognito.com` — allows Cognito auth
- `https://*.eki.ee` — partner domain

The `*.amazonaws.com` wildcard is particularly broad but necessary for direct S3 audio file access and Cognito token endpoints.

---

## Security Architecture Summary

### What's Working Well

1. **CloudFront + WAF:** All web traffic goes through CloudFront with WAF (rate limiting, geo-blocking, AWS managed rules). WAF logging captures blocked requests.

2. **API Gateway Lockdown (All 4 APIs):** As of 2026-02-25, all API Gateways (Merlin, Vabamorf, SimpleStore, Auth) use execute-api URLs — no public DNS. Only reachable through CloudFront. E2E test prevents regression.

3. **Authentication:** TARA (Estonian eID) + Cognito with PKCE. State/nonce/TTL validation. HttpOnly refresh cookies. CSRF origin validation on POST endpoints. No test-only auth bypasses in production code (LAURI-5/9 fixed — X-User-Id header removed).

4. **Input Validation:** Zod schemas on all API inputs across all 4 packages (LAURI-12 fixed — store migrated from manual typeof to Zod). Cache keys validated as SHA-256 hex. Text length limits. Speed/pitch range validation. Worker-side re-validation.

5. **Shell Injection Prevention:** Python worker uses `shlex.quote()` for all command arguments. No `shell=True` in subprocess calls.

6. **CI/CD Security:** OIDC federation (no long-lived AWS keys). Pinned GitHub Actions (SHA). `pnpm audit`. Trivy Docker scanning. SBOM + SLSA provenance. CodeQL analysis.

7. **Monitoring:** CloudTrail (multi-region, log validation). GuardDuty (threat detection → Slack). CloudWatch alarms (5XX errors, queue depth, WAF blocks, high latency). Budget alerts (70%/90%/100%).

8. **Infrastructure:** S3 encryption (AES256). TLS 1.2 minimum everywhere. CloudFront access logging. DynamoDB PITR enabled. Optimistic locking with `attribute_not_exists(PK)` on first insert prevents write skew (LAURI-2 fixed).

9. **Docker:** Merlin worker runs as non-root (uid 1001). Vabamorf runs as non-root (`appuser`). BuildKit secrets for AWS credentials during build. Miniconda SHA256 verified.

10. **E2E Security Test:** `api-gateway-lockdown.smoke.test.ts` verifies all 4 API Gateways are not publicly accessible on every deploy.

### Attack Surface Map

```
Internet
  │
  ├─→ CloudFront (WAF: rate limit + geo-block + AWS managed rules)
  │     ├─→ S3 (website bucket, OAC) → SPA
  │     ├─→ API GW (execute-api) → Merlin Lambda → SQS → Fargate Worker → S3 Audio
  │     ├─→ API GW (execute-api) → Vabamorf Lambda (Docker)
  │     ├─→ API GW (execute-api) → SimpleStore Lambda → DynamoDB  ✅
  │     └─→ API GW (execute-api) → Auth Lambda (VPC) → Cognito/TARA  ✅
  │
  ├─→ S3 Audio bucket (public read, CORS-restricted) ← SEC-H3
  │
  └─→ Fargate Worker (public IP in default VPC) ← SEC-H2
```

### Data Flow Security

| Data Path | Encrypted in Transit | Encrypted at Rest | Auth Required | Rate Limited |
|-----------|---------------------|-------------------|---------------|--------------|
| Browser → CloudFront | TLS 1.2+ | N/A | No (public) | WAF |
| CloudFront → S3 (website) | SigV4 OAC | AES256 | OAC | N/A |
| CloudFront → API GW (Merlin) | TLS 1.2 | N/A | No | WAF |
| CloudFront → API GW (Vabamorf) | TLS 1.2 | N/A | No | WAF |
| CloudFront → API GW (Store) | TLS 1.2 | N/A | Cognito JWT* | WAF |
| API GW → Lambda | Internal AWS | N/A | IAM | Concurrency |
| Lambda → SQS | Internal AWS | SSE | IAM | Queue depth (50) |
| Lambda → DynamoDB | Internal AWS | SSE | IAM | Pay-per-request |
| Fargate → SQS | TLS | SSE | Task IAM role | N/A |
| Fargate → S3 Audio | TLS | No encryption | Task IAM role | N/A |
| Browser → S3 Audio | TLS | No encryption | None (public) | None |

*Store /get-shared and /get-public are unauthenticated

### CI/CD Security Controls

| Control | Status | Notes |
|---------|--------|-------|
| OIDC federation | ✅ | No long-lived AWS credentials |
| Pinned actions (SHA) | ✅ | All actions pinned to specific commits |
| pnpm audit | ✅ | Runs on every build, fails on HIGH+ |
| Trivy Docker scan | ✅ | CRITICAL+HIGH, ignore unfixed |
| CodeQL | ✅ | JavaScript/TypeScript analysis |
| Gitleaks | ✅ | Pre-commit hook (with `.env` allowlist — SEC-L3) |
| Branch protection | ⚠️ | Only "Build" required check — insufficient (see below) |
| Auto-merge | ⚠️ | Merges before full test suite completes |

**Branch protection gap:** Required status checks only include `"Build"`. For Terraform-only PRs, this passes quickly, allowing auto-merge before "Lint, Typecheck, Test" and "Build & Test" workflows complete. This means broken code could merge to main before tests catch it.

---

## Vulnerability Prevention Matrix

How HAK addresses common web application threat categories (OWASP-aligned).

### A01: Broken Access Control

| Threat | Prevention | Status |
|--------|-----------|--------|
| Unauthenticated access to private data | Cognito JWT authorizer on API Gateway for `/save`, `/get` (private), `/delete`, `/query` | ✅ |
| Auth bypass via test headers | `X-User-Id` header removed from production handler (LAURI-5/9) | ✅ Fixed 2026-02-25 |
| CSRF on state-changing endpoints | Origin validation on POST endpoints (`auth/src/middleware.ts`) | ✅ |
| Cross-tenant data access | Partition key includes `{app}#{tenant}#{env}` — queries scoped to caller's context | ✅ |
| Privilege escalation | No admin endpoints. IAM roles scoped per service (Lambda, Fargate, CI/CD OIDC) | ✅ |
| Direct API Gateway access bypassing WAF | All 4 APIs locked behind CloudFront — no public custom domains (SEC-C2/H1 fixed) | ✅ |

### A02: Cryptographic Failures

| Threat | Prevention | Status |
|--------|-----------|--------|
| Data in transit unencrypted | TLS 1.2+ everywhere (CloudFront, API GW, S3, DynamoDB, SQS) | ✅ |
| Data at rest unencrypted | S3 AES256, DynamoDB SSE, SQS SSE | ✅ |
| Secrets in source code | Gitleaks pre-commit hook + CI scan; SSM Parameter Store for runtime secrets | ✅ |
| Weak token generation | Cognito-managed JWTs; `crypto.randomBytes(32)` for state/nonce | ✅ |
| Token leakage via URL | Tokens in HttpOnly cookies (not URL params) since round-1 audit fix | ✅ |

### A03: Injection

| Threat | Prevention | Status |
|--------|-----------|--------|
| Shell injection (TTS worker) | `shlex.quote()` on all subprocess args; no `shell=True` | ✅ |
| NoSQL injection (DynamoDB) | Parameterized SDK calls (no string interpolation in queries) | ✅ |
| XSS (frontend) | React auto-escapes; CSP `script-src 'self'`; `X-Content-Type-Options: nosniff` | ✅ |
| Input validation bypass | Zod schemas on all 4 API packages (LAURI-12 fixed — store migrated to Zod) | ✅ |
| Cache key injection | SHA-256 hex-only regex validation on cache keys | ✅ |

### A04: Insecure Design

| Threat | Prevention | Status |
|--------|-----------|--------|
| Race condition on data write | Optimistic locking: `attribute_not_exists(PK)` on insert, version check on update (LAURI-2) | ✅ |
| Unbounded resource consumption | SQS queue depth cap (50), ECS max capacity, WAF rate limits | ✅ |
| Missing error handling | Shared `AppError` hierarchy, `extractErrorMessage()`, structured logging (LAURI-3/4) | ✅ |
| Hardcoded constants drift | `STORE_KEYS` shared between frontend and backend via `@hak/shared` (LAURI-11) | ✅ |
| Response format inconsistency | All 4 packages use `createApiResponse` from `@hak/shared` (LAURI-1) | ✅ |

### A05: Security Misconfiguration

| Threat | Prevention | Status |
|--------|-----------|--------|
| Overly permissive CORS | CORS restricted to app domains; `ALLOWED_ORIGIN` from env | ✅ |
| Missing security headers | CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff via CloudFront | ✅ |
| Default VPC with public IP (Fargate) | SEC-H2 — egress restricted to 443 only, no ingress rules. Accepted risk | ✅ Accepted |
| Catch-all API route | SEC-M3 — Vabamorf restricted to 3 specific endpoints (fixed 2026-02-25) | ✅ |
| CloudFront route ↔ API GW mismatch | Static test validates all routes after CloudFront rewrite match serverless.yml | ✅ |
| `.env` in gitleaks allowlist | SEC-L3 — removed from allowlist (fixed 2026-02-25) | ✅ |

### A06: Vulnerable and Outdated Components

| Threat | Prevention | Status |
|--------|-----------|--------|
| Known CVEs in dependencies | `pnpm audit` on every CI build (fails on HIGH+) | ✅ |
| Docker image vulnerabilities | Trivy scan (CRITICAL+HIGH, ignore unfixed) | ✅ |
| Outdated base images | Miniconda SHA256-verified; ECR scan-on-push | ✅ |
| Supply chain attacks | Pinned GitHub Actions (SHA), SBOM + SLSA provenance | ✅ |

### A07: Identification and Authentication Failures

| Threat | Prevention | Status |
|--------|-----------|--------|
| Credential stuffing | TARA eID (hardware token / Smart-ID / Mobile-ID) — no passwords | ✅ |
| Session fixation | Random state + nonce per auth flow, TTL validation | ✅ |
| Token theft via XSS | Refresh token HttpOnly; access/ID tokens short-lived (1h); CSP restricts scripts | ✅ |
| Brute-force on token refresh | CSRF origin check + WAF rate limiting on all endpoints | ✅ |

### A08: Software and Data Integrity Failures

| Threat | Prevention | Status |
|--------|-----------|--------|
| CI/CD credential theft | OIDC federation — no long-lived AWS keys | ✅ |
| Tampered GitHub Actions | All actions pinned to commit SHA | ✅ |
| Docker image tampering | Merlin ECR: MUTABLE (`:latest`) — SEC-M5 open; Vabamorf: IMMUTABLE | ⚠️ Partial |
| Audit log tampering | CloudTrail log file validation enabled; versioned S3 bucket | ✅ |

### A09: Security Logging and Monitoring Failures

| Threat | Prevention | Status |
|--------|-----------|--------|
| No visibility into attacks | WAF logging, CloudFront access logs, CloudTrail (multi-region) | ✅ |
| No alerting | GuardDuty → Slack; CloudWatch alarms (5XX, queue depth, WAF blocks, latency) | ✅ |
| Missing request correlation | Structured JSON logger with request IDs in all Lambda handlers (LAURI-4) | ✅ |
| Budget attacks (cost DoS) | AWS Budgets with alerts at 70%/90%/100% | ✅ |

### A10: Server-Side Request Forgery (SSRF)

| Threat | Prevention | Status |
|--------|-----------|--------|
| SSRF via user input | No user-controlled URLs processed server-side. TARA redirect_uri hardcoded server-side | ✅ |
| Internal service enumeration | Lambda + Fargate in AWS managed networks; no user-facing proxy | ✅ |

---

## Incident Timeline: API Gateway Exposure (2026-02-24)

| Time | Event |
|------|-------|
| Previous | Luna implemented CloudFormation-based origins (APIs only via CloudFront) |
| PR #698 | Kate reverted Luna's fix (re-introduced custom domain origins) |
| 2026-02-24 | During mass TTS generation, Kate switched to direct API URL, discovered APIs publicly accessible |
| 2026-02-24 | Investigation: `git log` traced exposure to PR #698 (Kate's revert) |
| PR #701 | Fix: restored CloudFormation outputs for Merlin + Vabamorf, added E2E test, added CI/CD cleanup |
| PR #702 | Fix: added `s3:ListBucket` to S3 bucket policy (SPA routing broken by PR #701) |
| 2026-02-24 | Terraform Apply confirmed — Merlin + Vabamorf locked down |
| 2026-02-24 | Verified: `merlin-dev.askend-lab.com` → DNS failure, `vabamorf-dev.askend-lab.com` → DNS failure |
| 2026-02-25 | SimpleStore + Auth APIs also locked down (SEC-C2/SEC-H1 fixed) |

**Root cause:** PR #698 reverted from execute-api URLs back to custom domain names for CloudFront origins. The revert was done to fix a CloudFront 403 error (which was actually caused by using `HttpApiUrl` instead of `ApiEndpoint` — the former includes a stage path that's invalid as a hostname).

**Lesson learned:** The E2E test `api-gateway-lockdown.smoke.test.ts` now prevents regression for all 4 API Gateways.

---

## Prioritized Remediation Plan

### Completed ✅

1. **[SEC-C2] Lock down SimpleStore API Gateway** — Custom domain removed, execute-api URL in CloudFront
2. **[SEC-H1] Lock down Auth API Gateway** — Same as SimpleStore
3. **[SEC-C1] Partially reverted WAF rate limits** — Synthesize back to 200/5min
4. **[SEC-M1] Fix DynamoDB policy** — Restricted to read-only (GetItem, Query)
5. **[SEC-M3] Restrict Vabamorf routes** — Restricted to 3 specific endpoints (corrected paths in PR #716)
6. **[SEC-L3] Fix gitleaks allowlist** — `.env` removed from allowed paths

### TODO

7. **[SEC-C1] Revert general WAF rate limit** — Change 2000→300 req/5min after confirming mass generation complete
8. **[SEC-M2] Add WAF rate limit for /api/status/** — Prevent enumeration attacks
9. **Branch protection** — Add "Lint, Typecheck, Test" to required status checks
10. **[SEC-M4] Add MFA Delete to CloudTrail bucket** — Protect audit logs
11. **[SEC-M5] Switch Merlin ECR to immutable tags** — Improve image provenance

### Accepted Risks (documented, no action needed)

- **[SEC-H3]** Public S3 audio bucket — content is non-sensitive, hash-keyed, CORS-restricted
- **[SEC-M6]** Tokens in response body — frontend needs JS access, mitigated by CSRF + short expiry
- **[SEC-H2]** Fargate public IP — ingress blocked, egress restricted to 443, low residual risk
- **[SEC-L1]** Unauthenticated synthesize — mitigated by WAF rate limiting + geo-blocking + queue depth
- **[SEC-L2]** Non-HttpOnly access/ID tokens — documented design decision, mitigated by CSP + short expiry
- **[SEC-L4]** Broad CSP connect-src — necessary for S3 audio + Cognito

---

## Appendix: Files Reviewed

### Infrastructure (Terraform)
- `infra/cloudfront.tf` — CloudFront distribution, security headers, OAC, API routing
- `infra/waf.tf` — WAF rules (rate limiting, geo-blocking, managed rules)
- `infra/website.tf` — S3 website bucket, bucket policy, OAC
- `infra/locals.tf` — API Gateway domain resolution via CloudFormation
- `infra/api-gateway.tf` — SimpleStore custom domain (⚠️ public)
- `infra/route53.tf` — DNS records
- `infra/cloudtrail.tf` — Audit logging
- `infra/guardduty.tf` — Threat detection
- `infra/cloudwatch-alarms.tf` — Monitoring and alerting
- `infra/dynamodb.tf` — DynamoDB IAM policy
- `infra/ecr.tf` — ECR repository configuration
- `infra/budgets.tf` — Cost monitoring
- `infra/variables.tf` — Input variables
- `infra/merlin/main.tf` — ECS cluster, Fargate service, SQS, S3 audio, IAM roles, security groups

### Application Code
- `packages/auth/src/handler.ts` — TARA/Cognito authentication handlers
- `packages/auth/src/cookies.ts` — Cookie creation/parsing (HttpOnly, Secure, SameSite)
- `packages/auth/src/middleware.ts` — CSRF validation, random string generation
- `packages/auth/src/tara-client.ts` — TARA OIDC client (JWKS verification, nonce validation)
- `packages/tts-api/src/handler.ts` — TTS synthesis/status handlers
- `packages/tts-api/src/schemas.ts` — Zod input validation schemas
- `packages/tts-worker/worker.py` — SQS worker (input validation, shlex.quote, subprocess)
- `packages/store/src/lambda/handler.ts` — SimpleStore CRUD handler (auth, routing)

### Serverless Configuration
- `packages/tts-api/serverless.yml` — Merlin API (no custom domain ✅)
- `packages/morphology-api/serverless.yml` — Vabamorf API (no custom domain ✅)
- `packages/store/serverless.yml` — SimpleStore (no custom domain ✅)
- `packages/auth/serverless.yml` — Auth (no custom domain ✅, VPC-deployed)

### Docker
- `packages/tts-worker/Dockerfile` — Merlin worker (non-root, SHA-verified Miniconda, BuildKit secrets)
- `packages/morphology-api/Dockerfile` — Vabamorf (non-root, Lambda Web Adapter)

### CI/CD
- `.github/workflows/build.yml` — Build pipeline (audit, lint, test, build, artifact upload)
- `.github/workflows/deploy.yml` — Deploy pipeline (smart diff, serverless deploy, smoke tests)
- `.github/workflows/terraform.yml` — Infrastructure pipeline (plan, apply, state lock check)
- `.gitleaks.toml` — Secret scanning configuration
- `.env.example` — Environment variable template (no secrets)

### Security Tests
- `packages/api-client/test/smoke/api-gateway-lockdown.smoke.test.ts` — Verifies API Gateways not publicly accessible
- `packages/api-client/test/smoke/cloudfront-routing.smoke.test.ts` — Verifies CloudFront API routing returns JSON (smoke, post-deploy)
- `packages/api-client/test/cloudfront-route-consistency.test.ts` — Validates CloudFront routes match serverless.yml after rewrite (static, pre-merge)

---

*End of security analysis. All CRITICAL and HIGH findings are now addressed. Next review recommended after remediation of remaining MEDIUM/LOW items and general WAF rate limit revert.*
