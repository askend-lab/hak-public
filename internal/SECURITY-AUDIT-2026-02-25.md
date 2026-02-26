# Security Audit — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | All API endpoints are public — no authentication | CRITICAL | Open — pending client decision |
| 2 | No per-path WAF limit on `/api/status/*` | MEDIUM | Open |
| 3 | CloudTrail bucket lacks MFA Delete | MEDIUM | Open |
| 4 | Merlin ECR mutable `:latest` tags | MEDIUM | Open |
| 5 | Branch protection insufficient | MEDIUM | Open |
| 6 | Fargate worker has public IP | HIGH | Accepted |
| 7 | Audio S3 bucket publicly readable | HIGH | Accepted |
| 8 | Tokens in response body | MEDIUM | Accepted |
| 9 | Access/ID cookies not HttpOnly | LOW | Accepted |
| 10 | Broad CSP `connect-src` wildcards | LOW | Accepted |

---

## Open — requires action

### 1. Public API Endpoints — No Authentication [CRITICAL]

`/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` — all open to the internet without authentication. Anyone can generate speech, enumerate cache keys, and use morphological analysis. Auth infrastructure exists (Cognito + TARA + JWT) but is not applied to these endpoints. Risks: cost exhaustion via bot attacks, denial of service, resource abuse by third parties. WAF rate limits are bypassable with proxy pools. Detailed analysis in `PROPOSAL-Auth-Public-Endpoints.md`. Pending client decision.

### 2. No Per-Path WAF Limit on `/api/status/*` [MEDIUM]

`infra/waf.tf` — Only general rate limit applies. Allows cache key enumeration via polling.

### 3. CloudTrail Bucket Lacks MFA Delete [MEDIUM]

`infra/cloudtrail.tf` — No MFA Delete or Object Lock. Compromised admin could delete audit logs.

### 4. Merlin ECR Mutable Tags [MEDIUM]

`infra/merlin/main.tf:131` — Merlin uses `MUTABLE` + `:latest`. Compromised CI could overwrite images. Vabamorf already uses `IMMUTABLE` + SHA tags.

### 5. Branch Protection Insufficient [MEDIUM]

Only "Build" is a required status check. Terraform-only PRs auto-merge before "Lint, Typecheck, Test" completes.

---

## Accepted — documented, no action

### 6. Fargate Worker Public IP [HIGH]

`infra/merlin/main.tf:353-357` — Worker has public IP in default VPC. No ingress rules. Egress port 443 only. No private subnets available without NAT ($32/month).

### 7. Audio S3 Bucket Public Read [HIGH]

`infra/merlin/main.tf:97-123` — `Principal = "*"` on `s3:GetObject`. Non-sensitive educational audio. SHA-256 hash-keyed URLs. CORS restricted to app domains.

### 8. Tokens in Response Body [MEDIUM]

`packages/auth/src/handler.ts:254-258` — Frontend needs JS access for Authorization header. CSRF + short expiry (1h) + SameSite=Lax.

### 9. Non-HttpOnly Access/ID Cookies [LOW]

`packages/auth/src/cookies.ts` — Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### 10. Broad CSP `connect-src` Wildcards [LOW]

`infra/cloudfront.tf` — `*.amazonaws.com` for S3 audio + Cognito. `*.askend-lab.com` for API subdomains.
