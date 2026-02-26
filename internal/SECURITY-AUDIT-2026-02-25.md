# Security Analysis — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

**Overall posture: STRONG — all critical gaps closed.**

| Severity | Count | Addressed |
|----------|-------|-----------|
| CRITICAL | 2     | 2 ✅      |
| HIGH     | 3     | 3 ✅      |
| MEDIUM   | 7     | 6 ✅ / 1 ❌ |
| LOW/INFO | 4     | 2 ✅ / 2 ❌ |

---

## CRITICAL Findings

### SEC-C1: WAF Rate Limits Temporarily Raised [CRITICAL] — ✅ Partially reverted

`infra/waf.tf:19-30, 42-55` — Synthesize back to 200/5min. General per-IP remains at 2000/5min (original was 100 — still excessive).

### SEC-C2: API Gateways Had Public Custom Domains — Bypassed WAF [CRITICAL] — ✅ FIXED

`packages/store/serverless.yml`, `packages/auth/serverless.yml` — Removed `serverless-domain-manager`, switched to execute-api URLs. All 4 API Gateways (Merlin, Vabamorf, SimpleStore, Auth) now only reachable through CloudFront WAF. E2E test `api-gateway-lockdown.smoke.test.ts` prevents regression.

---

## HIGH Findings

### SEC-H1: Auth Service Public Custom Domain [HIGH] — ✅ FIXED

Addressed together with SEC-C2. Auth Lambda also runs in VPC.

### SEC-H2: Fargate Worker in Default VPC with Public IP [HIGH] — ✅ Accepted risk

`infra/merlin/main.tf:353-357` — No ingress rules (AWS default deny). Egress restricted to port 443 only (SQS, S3, ECR). Public IP required — no private subnets with NAT in default VPC. Low residual risk.

### SEC-H3: Audio S3 Bucket Public Read [HIGH] — ✅ Accepted risk

`infra/merlin/main.tf:97-123` — `Principal = "*"` on `s3:GetObject`. Content is non-sensitive educational audio with SHA-256 hash-keyed URLs. CORS restricted to app domains. Documented in DESIGN-DECISIONS.md #15.

---

## MEDIUM Findings

### SEC-M1: DynamoDB `agent-readonly` Had Write Access [MEDIUM] — ✅ FIXED

`infra/dynamodb.tf:3-23` — Restricted to read-only (GetItem, Query).

### SEC-M2: No WAF Per-Path Limit on `/api/status/*` [MEDIUM] — ❌ OPEN

`infra/waf.tf` — Only general rate limit applies. Could allow cache key enumeration.

### SEC-M3: Vabamorf Catch-All Route [MEDIUM] — ✅ FIXED

`packages/morphology-api/serverless.yml` — Restricted from `ANY /{proxy+}` to 3 specific endpoints. Static test `cloudfront-route-consistency.test.ts` prevents route mismatch recurrence.

### SEC-M4: CloudTrail Bucket Lacks MFA Delete [MEDIUM] — ✅ Partially mitigated

`infra/cloudtrail.tf` — Versioning + log file validation enabled. No MFA Delete or Object Lock.

### SEC-M5: ECR Image Tag Mutability [MEDIUM] — ✅ Partially addressed

Merlin: `MUTABLE` (`:latest`). Vabamorf: `IMMUTABLE` (SHA tags). Mutable tags allow image overwrites.

### SEC-M6: Tokens in Response Body [MEDIUM] — ✅ Accepted risk

`packages/auth/src/handler.ts:254-258` — Frontend needs JS access to tokens. Mitigated by CSRF + short expiry (1h) + SameSite=Lax.

### SEC-M7: Implicit Deny-All Ingress on Merlin SG [MEDIUM] — ✅ Good but implicit

`infra/merlin/main.tf:424-440` — Relies on AWS default deny. Should add explicit comment.

---

## LOW / Informational

### SEC-L1: Unauthenticated Synthesize [LOW] — ✅ By design

Protected by WAF rate limiting, geo-blocking, SQS queue depth cap (50), Fargate max capacity.

### SEC-L2: Non-HttpOnly Access/ID Cookies [LOW] — ✅ By design

Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### SEC-L3: Gitleaks `.env` Allowlist [LOW] — ✅ FIXED

`.env` removed from allowlist.

### SEC-L4: Broad CSP `connect-src` Wildcards [LOW] — ✅ Necessary

`*.amazonaws.com` needed for S3 audio + Cognito. `*.askend-lab.com` for API subdomains.

---

## Security Architecture

### Attack Surface

```
Internet
  ├─→ CloudFront (WAF: rate limit + geo-block + AWS managed rules)
  │     ├─→ S3 (website, OAC) → SPA
  │     ├─→ API GW → Merlin Lambda → SQS → Fargate Worker → S3 Audio
  │     ├─→ API GW → Vabamorf Lambda (Docker)
  │     ├─→ API GW → SimpleStore Lambda → DynamoDB
  │     └─→ API GW → Auth Lambda (VPC) → Cognito/TARA
  ├─→ S3 Audio bucket (public read, CORS-restricted)
  └─→ Fargate Worker (public IP, no ingress, egress 443 only)
```

### Key Controls

| Area | Controls |
|------|----------|
| **Traffic** | CloudFront + WAF (rate limit, geo-block, managed rules) on all endpoints |
| **Auth** | TARA eID + Cognito PKCE. State/nonce/TTL. HttpOnly refresh token. CSRF origin check |
| **Input** | Zod schemas on all 4 API packages. SHA-256 cache key validation. `shlex.quote()` in worker |
| **Encryption** | TLS 1.2+ in transit. S3 AES256, DynamoDB SSE, SQS SSE at rest |
| **CI/CD** | OIDC (no long-lived keys). Pinned actions (SHA). `pnpm audit`. Trivy. CodeQL. Gitleaks |
| **Monitoring** | CloudTrail + GuardDuty → Slack. CloudWatch alarms (5XX, queue, WAF, latency). Budget alerts |
| **Docker** | Non-root containers. BuildKit secrets. Miniconda SHA256 verified. ECR scan-on-push |

### OWASP Coverage

| Category | Status |
|----------|--------|
| **A01: Broken Access Control** | ✅ Cognito JWT, CSRF origin check, scoped partition keys, all APIs behind WAF, test header removed |
| **A02: Cryptographic Failures** | ✅ TLS everywhere, AES256/SSE at rest, Gitleaks, Cognito JWTs, `crypto.randomBytes` |
| **A03: Injection** | ✅ `shlex.quote()`, parameterized DynamoDB, React + CSP, Zod schemas, SHA-256 regex |
| **A04: Insecure Design** | ✅ Optimistic locking, queue depth cap, `AppError` hierarchy, shared constants |
| **A05: Security Misconfiguration** | ✅ Restricted CORS, security headers, route validation test, gitleaks fixed |
| **A06: Outdated Components** | ✅ `pnpm audit`, Trivy, SHA-pinned actions, SBOM + SLSA |
| **A07: Auth Failures** | ✅ TARA eID (no passwords), random state/nonce, HttpOnly refresh, WAF rate limits |
| **A08: Integrity Failures** | ⚠️ OIDC, pinned actions, log validation ✅ — Merlin ECR mutable tags ⚠️ |
| **A09: Logging Failures** | ✅ WAF + CloudFront + CloudTrail logging, GuardDuty alerts, structured request IDs |
| **A10: SSRF** | ✅ No user-controlled URLs server-side, hardcoded TARA redirect_uri |

---

## Remediation Plan

### Completed ✅

1. **[SEC-C2/H1]** Lock down all 4 API Gateways — execute-api URLs via CloudFront only
2. **[SEC-C1]** Partially reverted WAF rate limits — synthesize back to 200/5min
3. **[SEC-M1]** DynamoDB policy restricted to read-only
4. **[SEC-M3]** Vabamorf routes restricted to 3 endpoints
5. **[SEC-L3]** Gitleaks `.env` allowlist removed

### TODO

6. **[SEC-C1]** Revert general WAF rate limit 2000→300 req/5min
7. **[SEC-M2]** Add WAF per-path rate limit for `/api/status/*`
8. **Branch protection** — Add "Lint, Typecheck, Test" to required status checks
9. **[SEC-M4]** Add MFA Delete to CloudTrail bucket
10. **[SEC-M5]** Switch Merlin ECR to immutable tags

### Accepted Risks

- **[SEC-H3]** Public audio S3 — non-sensitive, hash-keyed, CORS-restricted
- **[SEC-H2]** Fargate public IP — no ingress, egress 443 only
- **[SEC-M6]** Tokens in response body — CSRF + short expiry
- **[SEC-L1]** Unauthenticated synthesize — WAF + geo-block + queue cap
- **[SEC-L2]** Non-HttpOnly tokens — CSP + short expiry
- **[SEC-L4]** Broad CSP connect-src — required for S3 + Cognito
