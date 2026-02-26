# Security Audit — HAK Platform

**Date:** 2026-02-25 | **Scope:** Full system | **Auditor:** Kate (AI)

| ID | Finding | Severity | Status |
|------|---------|----------|--------|
| SEC-01 | All API endpoints are public — no authentication | CRITICAL | Open — pending client decision |
| SEC-02 | No per-path WAF limit on `/api/status/*` | MEDIUM | ✅ Fixed |
| SEC-03 | CloudTrail bucket lacks MFA Delete / Object Lock | MEDIUM | ✅ Fixed |
| SEC-04 | Merlin ECR mutable `:latest` tags | MEDIUM | ✅ Fixed |
| SEC-05 | Branch protection insufficient | MEDIUM | ✅ Fixed |
| SEC-06 | Fargate worker has public IP | HIGH | Accepted |
| SEC-07 | Audio S3 bucket publicly readable | HIGH | Accepted |
| SEC-08 | Tokens in response body | MEDIUM | Accepted |
| SEC-09 | Access/ID cookies not HttpOnly | LOW | Accepted |
| SEC-10 | Broad CSP `connect-src` wildcards | LOW | Accepted |

---

## Open — requires action

### SEC-01: Public API Endpoints — No Authentication [CRITICAL]

`/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` — all open to the internet without authentication. Anyone can generate speech, enumerate cache keys, and use morphological analysis. Auth infrastructure exists (Cognito + TARA + JWT) but is not applied to these endpoints. Risks: cost exhaustion via bot attacks, denial of service, resource abuse by third parties. WAF rate limits are bypassable with proxy pools. Detailed analysis in `PROPOSAL-Auth-Public-Endpoints.md`. Pending client decision.

---

## Accepted — documented, no action

### SEC-06: Fargate Worker Public IP [HIGH]

`infra/merlin/main.tf:353-357` — Worker has public IP in default VPC. No ingress rules. Egress port 443 only. No private subnets available without NAT ($32/month).

### SEC-07: Audio S3 Bucket Public Read [HIGH]

`infra/merlin/main.tf:97-123` — `Principal = "*"` on `s3:GetObject`. Non-sensitive educational audio. SHA-256 hash-keyed URLs. CORS restricted to app domains.

### SEC-08: Tokens in Response Body [MEDIUM]

`packages/auth/src/handler.ts:254-258` — Frontend needs JS access for Authorization header. CSRF + short expiry (1h) + SameSite=Lax.

### SEC-09: Non-HttpOnly Access/ID Cookies [LOW]

`packages/auth/src/cookies.ts` — Frontend reads tokens for Authorization header. Refresh token IS HttpOnly. Short expiry (1h), CSP, SameSite=Lax.

### SEC-10: Broad CSP `connect-src` Wildcards [LOW]

`infra/cloudfront.tf` — `*.amazonaws.com` for S3 audio + Cognito. `*.askend-lab.com` for API subdomains.
