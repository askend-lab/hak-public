# Security Analysis — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

## Summary

**Overall posture: STRONG.** All traffic through CloudFront + WAF. All 4 API Gateways locked behind CloudFront. Auth via TARA eID + Cognito PKCE. Zod validation on all APIs. TLS 1.2+ in transit, AES256/SSE at rest. CI/CD on OIDC — no long-lived credentials.

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | WAF general rate limit 20× too high | CRITICAL | Open |
| 2 | No per-path WAF limit on `/api/status/*` | MEDIUM | Open |
| 3 | CloudTrail bucket lacks MFA Delete | MEDIUM | Open |
| 4 | Merlin ECR mutable `:latest` tags | MEDIUM | Open |
| 5 | Branch protection insufficient | MEDIUM | Open |
| 6 | Fargate worker has public IP | HIGH | Accepted |
| 7 | Audio S3 bucket is publicly readable | HIGH | Accepted |
| 8 | Tokens returned in response body | MEDIUM | Accepted |
| 9 | Synthesize endpoint unauthenticated | LOW | Accepted |
| 10 | Access/ID cookies not HttpOnly | LOW | Accepted |
| 11 | Broad CSP `connect-src` wildcards | LOW | Accepted |

---

## Findings

### 1. WAF General Rate Limit Too High [CRITICAL]

`infra/waf.tf:42-55` — General per-IP limit is 2000 req/5min (temporarily raised, never reverted). Should be 300 req/5min for production.

### 2. No Per-Path WAF Limit on `/api/status/*` [MEDIUM]

`infra/waf.tf` — Only general rate limit applies. Could allow cache key enumeration via polling.

### 3. CloudTrail Bucket Lacks MFA Delete [MEDIUM]

`infra/cloudtrail.tf` — Versioning + log file validation enabled, but no MFA Delete or Object Lock. Compromised admin could delete audit logs.

### 4. Merlin ECR Mutable Tags [MEDIUM]

`infra/merlin/main.tf:131` — Merlin uses `MUTABLE` + `:latest`. Vabamorf uses `IMMUTABLE` + SHA tags. Mutable tags allow image overwrites from compromised CI.

### 5. Branch Protection Insufficient [MEDIUM]

Only "Build" is a required status check. Terraform-only PRs can auto-merge before "Lint, Typecheck, Test" completes.

### 6. Fargate Worker Public IP [HIGH — accepted]

`infra/merlin/main.tf:353-357` — No ingress rules (AWS default deny). Egress port 443 only. Public IP required — no private subnets with NAT in default VPC. Low residual risk.

### 7. Audio S3 Bucket Public Read [HIGH — accepted]

`infra/merlin/main.tf:97-123` — `Principal = "*"` on `s3:GetObject`. Non-sensitive educational audio, SHA-256 hash-keyed URLs, CORS restricted. Documented in DESIGN-DECISIONS.md #15.

### 8. Tokens in Response Body [MEDIUM — accepted]

`packages/auth/src/handler.ts:254-258` — Frontend needs JS access for Authorization header. Mitigated by CSRF + short expiry (1h) + SameSite=Lax.

### 9. Unauthenticated Synthesize [LOW — accepted]

WAF rate limiting + geo-blocking + SQS queue depth cap (50) + Fargate max capacity.

### 10. Non-HttpOnly Access/ID Cookies [LOW — accepted]

Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### 11. Broad CSP `connect-src` Wildcards [LOW — accepted]

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
| **A01: Broken Access Control** | ✅ Cognito JWT, CSRF origin check, scoped partition keys, all APIs behind WAF |
| **A02: Cryptographic Failures** | ✅ TLS everywhere, AES256/SSE at rest, Gitleaks, Cognito JWTs, `crypto.randomBytes` |
| **A03: Injection** | ✅ `shlex.quote()`, parameterized DynamoDB, React + CSP, Zod schemas, SHA-256 regex |
| **A04: Insecure Design** | ✅ Optimistic locking, queue depth cap, `AppError` hierarchy, shared constants |
| **A05: Security Misconfiguration** | ⚠️ CORS restricted, security headers ✅ — branch protection insufficient ⚠️ |
| **A06: Outdated Components** | ✅ `pnpm audit`, Trivy, SHA-pinned actions, SBOM + SLSA |
| **A07: Auth Failures** | ✅ TARA eID (no passwords), random state/nonce, HttpOnly refresh, WAF rate limits |
| **A08: Integrity Failures** | ⚠️ OIDC, pinned actions, log validation ✅ — Merlin ECR mutable tags ⚠️ |
| **A09: Logging Failures** | ✅ WAF + CloudFront + CloudTrail logging, GuardDuty alerts, structured request IDs |
| **A10: SSRF** | ✅ No user-controlled URLs server-side, hardcoded TARA redirect_uri |
