# Security Audit — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

| # | Finding | Severity | Status | File |
|---|---------|----------|--------|------|
| 1 | WAF general rate limit 20× too high | CRITICAL | Open | `infra/waf.tf` |
| 2 | No per-path WAF limit on `/api/status/*` | MEDIUM | Open | `infra/waf.tf` |
| 3 | CloudTrail bucket lacks MFA Delete | MEDIUM | Open | `infra/cloudtrail.tf` |
| 4 | Merlin ECR mutable `:latest` tags | MEDIUM | Open | `infra/merlin/main.tf` |
| 5 | Branch protection insufficient | MEDIUM | Open | GitHub settings |
| 6 | Fargate worker has public IP | HIGH | Accepted | `infra/merlin/main.tf` |
| 7 | Audio S3 bucket publicly readable | HIGH | Accepted | `infra/merlin/main.tf` |
| 8 | Tokens in response body | MEDIUM | Accepted | `packages/auth/src/handler.ts` |
| 9 | Synthesize endpoint unauthenticated | LOW | Accepted | `packages/tts-api/serverless.yml` |
| 10 | Access/ID cookies not HttpOnly | LOW | Accepted | `packages/auth/src/cookies.ts` |
| 11 | Broad CSP `connect-src` wildcards | LOW | Accepted | `infra/cloudfront.tf` |

---

## Open — requires action

### 1. WAF General Rate Limit Too High [CRITICAL]

`infra/waf.tf:42-55` — General per-IP limit is 2000 req/5min (temporarily raised, never reverted). Should be 300 req/5min.

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

### 9. Unauthenticated Synthesize [LOW]

`packages/tts-api/serverless.yml` — WAF rate limit + geo-blocking + SQS queue depth cap (50) + Fargate max capacity.

### 10. Non-HttpOnly Access/ID Cookies [LOW]

`packages/auth/src/cookies.ts` — Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### 11. Broad CSP `connect-src` Wildcards [LOW]

`infra/cloudfront.tf` — `*.amazonaws.com` for S3 audio + Cognito. `*.askend-lab.com` for API subdomains.
