# Security Analysis — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

**Overall posture: STRONG.**

## Summary

All traffic goes through CloudFront + WAF. All 4 API Gateways locked behind CloudFront (no public DNS). Authentication via TARA eID + Cognito with PKCE. Input validation (Zod) on all APIs. Encryption in transit (TLS 1.2+) and at rest (AES256/SSE). CI/CD uses OIDC — no long-lived credentials.

**What needs attention:**
- WAF general rate limit is 20× too high (2000 vs 300 req/5min) — **critical**
- No per-path rate limit on `/api/status/*` — enumeration risk
- CloudTrail bucket has no MFA Delete — admin compromise risk
- Merlin ECR uses mutable `:latest` tags — supply chain risk
- Branch protection only checks "Build" — broken code can merge before full tests run

**Accepted design trade-offs:** Fargate public IP (no ingress, egress 443 only), public audio S3 (non-sensitive content, CORS-restricted), tokens in response body (frontend needs JS access), unauthenticated synthesize (rate-limited + geo-blocked).

---

## Open Issues

### WAF General Rate Limit Too High [CRITICAL]

`infra/waf.tf:42-55` — General per-IP limit is 2000 req/5min (was temporarily raised). Should be 300 req/5min for production.

### No WAF Per-Path Limit on `/api/status/*` [MEDIUM]

`infra/waf.tf` — Only general rate limit applies. Could allow cache key enumeration via polling.

### CloudTrail Bucket Lacks MFA Delete [MEDIUM]

`infra/cloudtrail.tf` — Versioning + log file validation enabled, but no MFA Delete or Object Lock. Compromised admin could delete audit logs.

### Merlin ECR Mutable Tags [MEDIUM]

`infra/merlin/main.tf:131` — Merlin uses `MUTABLE` + `:latest`. Vabamorf uses `IMMUTABLE` + SHA tags. Mutable tags allow image overwrites from compromised CI.

### Branch Protection Insufficient [MEDIUM]

Only "Build" is a required status check. Terraform-only PRs can auto-merge before "Lint, Typecheck, Test" completes.

---

## Accepted Risks

### Fargate Worker Public IP [HIGH]

`infra/merlin/main.tf:353-357` — No ingress rules (AWS default deny). Egress port 443 only. Public IP required — no private subnets with NAT in default VPC. Low residual risk.

### Audio S3 Bucket Public Read [HIGH]

`infra/merlin/main.tf:97-123` — `Principal = "*"` on `s3:GetObject`. Content is non-sensitive educational audio, SHA-256 hash-keyed URLs, CORS restricted to app domains. Documented in DESIGN-DECISIONS.md #15.

### Tokens in Response Body [MEDIUM]

`packages/auth/src/handler.ts:254-258` — Frontend needs JS access for Authorization header. Mitigated by CSRF + short expiry (1h) + SameSite=Lax.

### Unauthenticated Synthesize [LOW]

WAF rate limiting + geo-blocking + SQS queue depth cap (50) + Fargate max capacity.

### Non-HttpOnly Access/ID Cookies [LOW]

Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### Broad CSP `connect-src` Wildcards [LOW]

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
