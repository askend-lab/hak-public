# Security Audit Report — HAK Platform

**Date:** 2026-02-25
**Scope:** Full system — infrastructure, APIs, authentication, CI/CD, Docker, frontend, data layer
**Auditor:** Kate (AI)
**Previous audits:** `SECURITY-AUDIT-2026-02-16.md` (Sam), `internal/SECURITY-AUDIT-2026-02.md` (Sam)

---

## Executive Summary

HAK is an Estonian language learning platform running on AWS with a serverless backend (Lambda, API Gateway, ECS Fargate) and a React SPA frontend served via CloudFront. This audit covers the entire system as of 2026-02-25, including changes made during the security incident response on 2026-02-24.

**Overall posture: STRONG with specific gaps.**

The system has mature security controls: WAF, CloudTrail, GuardDuty, OIDC CI/CD auth, pinned actions, input validation, CSRF protection, and non-root containers. However, this audit identified **5 critical/high findings**, **7 medium findings**, and **4 low/informational items**. Several findings relate to the 2026-02-24 incident where API Gateways were exposed to the public internet.

| Severity | Count | Currently Addressed |
|----------|-------|---------------------|
| CRITICAL | 2     | 1 ✅ / 1 ⚠️        |
| HIGH     | 3     | 2 ✅ / 1 ❌        |
| MEDIUM   | 7     | 3 ✅ / 4 ❌        |
| LOW/INFO | 4     | 1 ✅ / 3 ❌        |

---

## CRITICAL Findings

### SEC-C1: WAF Rate Limits Temporarily Raised — NOT Reverted [CRITICAL]

**File:** `infra/waf.tf:19-30, 42-55`
**Status:** ⚠️ OPEN — must revert immediately after mass generation completes

WAF rate limits were temporarily raised on 2026-02-24 for mass TTS generation:
- General per-IP: 100 → **2000** req/5min (20× increase)
- Synthesize per-path: 20 → **500** req/5min (25× increase)

With these limits, an attacker could:
- Send 2000 requests/5min to any endpoint (DDoS amplification)
- Queue 500 synthesis jobs/5min per IP (Fargate cost attack — each job uses ~5s of compute)
- At 500 synth/5min × multiple IPs = potentially thousands of Fargate tasks, each costing money

**Risk:** Cost explosion and service degradation. A single attacker could trigger hundreds of dollars in Fargate costs per hour.

**Remediation:** Revert to original values (100/5min general, 20/5min synthesize) immediately after generation completes. Consider adding a CI/CD check that prevents merging TEMP-commented rate limit changes without a corresponding revert PR.

### SEC-C2: SimpleStore API Gateway Has Public Custom Domain — Bypasses WAF [CRITICAL]

**File:** `infra/api-gateway.tf:10-21`, `packages/store/serverless.yml:24-32`
**Status:** ❌ OPEN

While PR #701 locked down Merlin and Vabamorf API Gateways (removed custom domains, switched CloudFront origins to execute-api URLs), **SimpleStore still has a public custom domain** (`hak-api-dev.askend-lab.com` / `hak-api.askend-lab.com`) configured in both Terraform (`api-gateway.tf`) and Serverless (`serverless-domain-manager` plugin in `store/serverless.yml`).

This means:
- SimpleStore API is directly accessible from the internet at `hak-api-{env}.askend-lab.com`
- All WAF rules (rate limiting, geo-blocking, managed rules) are **bypassed**
- Authenticated endpoints (`/save`, `/get`, `/delete`, `/query`) still require Cognito JWT, but unauthenticated endpoints (`/get-shared`, `/get-public`, `/health`) are completely unprotected
- An attacker could enumerate all shared/public content without rate limits

The CloudFront origin for SimpleStore in `cloudfront.tf:98-108` uses the custom domain name, not the execute-api URL — this is the same pattern that was just fixed for Merlin and Vabamorf.

**Remediation:**
1. Remove `serverless-domain-manager` plugin from `store/serverless.yml`
2. Add `data "aws_cloudformation_stack" "simplestore_api"` to `locals.tf`
3. Update CloudFront origin to use the execute-api URL
4. Remove `api-gateway.tf` (or remove the custom domain resource)
5. Add cleanup for `hak-api-{env}.askend-lab.com` in the deploy workflow
6. Add SimpleStore to the `api-gateway-lockdown.smoke.test.ts` E2E test

---

## HIGH Findings

### SEC-H1: Auth Service Has Public Custom Domain via serverless-domain-manager [HIGH]

**File:** `packages/auth/serverless.yml:8, 19-31`
**Status:** ❌ OPEN

The auth service (`tara-auth`) uses `serverless-domain-manager` with the same custom domain as SimpleStore (`hak-api-{env}.askend-lab.com`, basePath: `auth`). This means TARA authentication endpoints are also directly accessible, bypassing CloudFront WAF:
- `/auth/tara/start` — initiates TARA login
- `/auth/tara/callback` — handles OAuth callback
- `/auth/tara/refresh` — token refresh (has CSRF check, but no rate limit without WAF)
- `/auth/tara/exchange-code` — Cognito code exchange

Direct access enables:
- Rate-unlimited brute-force on token refresh
- Enumeration attacks on the auth flow
- Bypassing any future WAF rules targeting auth endpoints

**Note:** The auth Lambda runs in a VPC (`vpc` config in serverless.yml), which adds a network layer, but the API Gateway endpoint itself is publicly accessible.

**Remediation:** Same pattern as SEC-C2 — remove custom domain, route through CloudFront with execute-api URL.

### SEC-H2: Fargate Worker Runs in Default VPC with Public IP [HIGH]

**File:** `infra/merlin/main.tf:353-357`
**Status:** ❌ OPEN (documented as TODO)

The Merlin ECS worker runs in the default VPC with `assign_public_ip = true`. The security group restricts egress to HTTPS (port 443) only, which is good. However:
- The task has a public IP address, making it a potential target
- Default VPC subnets are public — no NAT gateway isolation
- If the container is compromised (e.g., via a malicious TTS input exploiting Merlin), the attacker has a public IP to use as a pivot point

The code has a TODO: `# TODO: Move to private subnets + NAT gateway to eliminate public IP requirement`

**Remediation:** Move to private subnets with NAT gateway. This eliminates the public IP while still allowing outbound HTTPS to AWS services.

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

**File:** `infra/dynamodb.tf:3-26`
**Status:** ❌ OPEN

An IAM user policy named `hak-dynamodb-{env}-access` grants **full CRUD** (GetItem, PutItem, UpdateItem, DeleteItem, Query) to a user named `agent-readonly`. The name suggests read-only intent, but the policy grants write access.

**Remediation:** Either rename the user or restrict the policy to read-only operations.

### SEC-M2: No WAF Protection on `/api/status/*` Path [MEDIUM]

**File:** `infra/waf.tf`
**Status:** ❌ OPEN

WAF has per-path rate limiting only for `/api/synthesize`. The `/api/status/*` endpoint has no per-path rate limit — only the general 100 req/5min limit. An attacker could:
- Poll `/api/status/{key}` at high rates to enumerate valid cache keys
- Use status polling to determine when specific content was synthesized

**Remediation:** Add a per-path rate limit for `/api/status/*`, similar to the synthesize rule.

### SEC-M3: Morphology API Catch-All Route Accepts ANY Method [MEDIUM]

**File:** `packages/morphology-api/serverless.yml:53-59`
**Status:** ❌ OPEN

The Vabamorf API uses `method: ANY` with `path: /{proxy+}` — a catch-all route that forwards all HTTP methods and paths to the Lambda function. This means:
- PUT, DELETE, PATCH methods are accepted (even if the application doesn't handle them)
- Any path is forwarded (e.g., `/admin`, `/debug`)
- Increases attack surface unnecessarily

**Remediation:** Restrict to specific paths and methods (`POST /analyze`, `POST /variants`, `GET /health`).

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

**File:** `.gitleaks.toml:7`
**Status:** ❌ OPEN

The gitleaks configuration allowlists `.env` paths:
```toml
paths = [
    '''test/fixtures''',
    '''.env''',
    ...
]
```

This means secrets in `.env` files won't be detected by gitleaks scanning. While `.env` is in `.gitignore`, accidental commits could leak secrets.

**Remediation:** Remove `.env` from the allowlist. If test fixtures need env-like files, allowlist only the specific test fixture paths.

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

2. **API Gateway Lockdown (Merlin + Vabamorf):** As of PR #701, these APIs use execute-api URLs — no public DNS. Only reachable through CloudFront.

3. **Authentication:** TARA (Estonian eID) + Cognito with PKCE. State/nonce/TTL validation. HttpOnly refresh cookies. CSRF origin validation on POST endpoints.

4. **Input Validation:** Zod schemas on all API inputs. Cache keys validated as SHA-256 hex. Text length limits. Speed/pitch range validation. Worker-side re-validation.

5. **Shell Injection Prevention:** Python worker uses `shlex.quote()` for all command arguments. No `shell=True` in subprocess calls.

6. **CI/CD Security:** OIDC federation (no long-lived AWS keys). Pinned GitHub Actions (SHA). `pnpm audit`. Trivy Docker scanning. SBOM + SLSA provenance. CodeQL analysis.

7. **Monitoring:** CloudTrail (multi-region, log validation). GuardDuty (threat detection → Slack). CloudWatch alarms (5XX errors, queue depth, WAF blocks, high latency). Budget alerts (70%/90%/100%).

8. **Infrastructure:** S3 encryption (AES256). TLS 1.2 minimum everywhere. CloudFront access logging. DynamoDB PITR enabled.

9. **Docker:** Merlin worker runs as non-root (uid 1001). Vabamorf runs as non-root (`appuser`). BuildKit secrets for AWS credentials during build. Miniconda SHA256 verified.

10. **E2E Security Test:** `api-gateway-lockdown.smoke.test.ts` verifies Merlin/Vabamorf are not publicly accessible on every deploy.

### Attack Surface Map

```
Internet
  │
  ├─→ CloudFront (WAF: rate limit + geo-block + AWS managed rules)
  │     ├─→ S3 (website bucket, OAC) → SPA
  │     ├─→ API GW (execute-api) → Merlin Lambda → SQS → Fargate Worker → S3 Audio
  │     ├─→ API GW (execute-api) → Vabamorf Lambda (Docker)
  │     └─→ API GW (custom domain!) → SimpleStore Lambda → DynamoDB  ← ⚠️ SEC-C2
  │
  ├─→ hak-api-{env}.askend-lab.com → SimpleStore API GW (direct, NO WAF) ← ⚠️ SEC-C2
  │     └─→ /auth/* → TARA Auth Lambda → Cognito/TARA ← ⚠️ SEC-H1
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

**Root cause:** PR #698 reverted from execute-api URLs back to custom domain names for CloudFront origins. The revert was done to fix a CloudFront 403 error (which was actually caused by using `HttpApiUrl` instead of `ApiEndpoint` — the former includes a stage path that's invalid as a hostname).

**Lesson learned:** The E2E test `api-gateway-lockdown.smoke.test.ts` now prevents regression. However, **SimpleStore still has the same vulnerability** (SEC-C2).

---

## Prioritized Remediation Plan

### Immediate (this week)

1. **[SEC-C1] Revert WAF rate limits** — Change 2000→100 (general) and 500→20 (synthesize) after mass generation completes
2. **[SEC-C2] Lock down SimpleStore API Gateway** — Remove custom domain, use execute-api URL in CloudFront origin, add to E2E test
3. **[SEC-H1] Lock down Auth API Gateway** — Same as SimpleStore

### Short-term (next 2 weeks)

4. **[SEC-M1] Fix DynamoDB policy** — Either rename user or restrict to read-only
5. **[SEC-M2] Add WAF rate limit for /api/status/** — Prevent enumeration attacks
6. **[SEC-M3] Restrict Vabamorf routes** — Replace catch-all with specific paths/methods
7. **[SEC-L3] Fix gitleaks allowlist** — Remove `.env` from allowed paths

### Medium-term (next month)

8. **[SEC-H2] Move Fargate to private subnets** — Eliminate public IP, add NAT gateway
9. **[SEC-M4] Add MFA Delete to CloudTrail bucket** — Protect audit logs
10. **[SEC-M5] Switch Merlin ECR to immutable tags** — Improve image provenance
11. **Branch protection** — Add "Lint, Typecheck, Test" to required status checks

### Accepted Risks (documented, no action needed)

- **[SEC-H3]** Public S3 audio bucket — content is non-sensitive, hash-keyed, CORS-restricted
- **[SEC-M6]** Tokens in response body — frontend needs JS access, mitigated by CSRF + short expiry
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
- `packages/store/serverless.yml` — SimpleStore (has custom domain ⚠️)
- `packages/auth/serverless.yml` — Auth (has custom domain ⚠️)

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
- `packages/api-client/test/smoke/cloudfront-routing.smoke.test.ts` — Verifies CloudFront API routing returns JSON

---

*End of audit. Next review recommended after remediation of CRITICAL and HIGH findings.*
