# Security Audit — HAK Platform

**Date:** 2026-02-26 | **Scope:** Full system | **Auditor:** Kate (AI)
**Previous audit:** 2026-02-25 | **Method:** Code review + infrastructure analysis

---

## Executive Summary

1 CRITICAL open finding (public API endpoints, pending client decision). 5 accepted risks with compensating controls. No new vulnerabilities discovered since last audit. 4 findings from the previous audit have been resolved.

---

## Findings


| ID     | Finding                                          | Severity | Status                         |
| ------ | ------------------------------------------------ | -------- | ------------------------------ |
| SEC-01 | All API endpoints are public — no authentication | CRITICAL | Open — pending client decision |
| SEC-06 | Fargate worker has public IP                     | MEDIUM   | Accepted                       |
| SEC-07 | Audio S3 bucket publicly readable                | MEDIUM   | Accepted                       |
| SEC-08 | Tokens in response body                          | MEDIUM   | Accepted                       |
| SEC-09 | Access/ID cookies not HttpOnly                   | LOW      | Accepted                       |
| SEC-10 | Broad CSP `connect-src` wildcards                | LOW      | Accepted                       |


**Previously resolved:** SEC-02 WAF per-path rate limit, SEC-03 CloudTrail Object Lock, SEC-04 ECR immutable tags, SEC-05 branch protection (`enforce_admins` enabled — admins can no longer bypass required checks).

---

## SEC-01: Public API Endpoints — No Authentication [CRITICAL]

**Location:** `infra/locals.tf:53-56` — API route definitions

`/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` accept unauthenticated requests. Auth infrastructure exists (Cognito + TARA eID + JWT) but is not enforced on these endpoints.

**Risk:** Cost exhaustion via bot-driven synthesis, cache key enumeration, resource abuse. WAF rate limits mitigate but are bypassable with proxy pools.

**Compensating controls:** WAF rate limit (2000 req/5min per IP), synthesize-specific limit (200 req/5min), geo-blocking (Baltic/Nordic only for `/synthesize`).

**Status:** Pending client decision. Detailed analysis in `PROPOSAL-Auth-Public-Endpoints.md`.

---

## SEC-06: Fargate Worker Public IP [MEDIUM — Accepted]

**Location:** `infra/merlin/main.tf:359` — `assign_public_ip = true`

Worker runs in default VPC with public IP. Private subnets require NAT gateway ($32/month).

**Compensating controls:** Security group has zero ingress rules (no inbound traffic accepted). Egress restricted to port 443 only (AWS services: ECR, S3, SQS, CloudWatch). Worker only polls SQS outbound.

---

## SEC-07: Audio S3 Bucket Public Read [MEDIUM — Accepted]

**Location:** `infra/merlin/main.tf:109-126` — `Principal = "*"` on `s3:GetObject`

Audio bucket allows unauthenticated reads.

**Compensating controls:** Non-sensitive educational audio content. URLs are SHA-256 hash-keyed (unguessable). CORS restricted to `hak-dev.askend-lab.com` and `hak.askend-lab.com`. Cache prefix expires after 30 days.

---

## SEC-08: Tokens in Response Body [MEDIUM — Accepted]

**Location:** `packages/auth/src/handler.ts:149-153`

Access and ID tokens are included in the authentication response body.

**Compensating controls:** CSRF protection via state cookie (HttpOnly, 10-min TTL). Short token expiry (1 hour). SameSite=Lax on all cookies. Refresh token is HttpOnly — never exposed to JavaScript.

---

## SEC-09: Non-HttpOnly Access/ID Cookies [LOW — Accepted]

**Location:** `packages/auth/src/cookies.ts:67-78`

`hak_access_token` and `hak_id_token` cookies are not HttpOnly.

**By design:** Frontend reads these for the `Authorization` header. Refresh token IS HttpOnly. Short expiry (1 hour). CSP blocks inline scripts and `unsafe-eval`. SameSite=Lax prevents CSRF.

---

## SEC-10: Broad CSP `connect-src` Wildcards [LOW — Accepted]

**Location:** `infra/cloudfront.tf:7`

CSP allows `*.amazonaws.com` (S3 audio + Cognito) and `*.askend-lab.com` (API subdomains).

**Rationale:** Multiple AWS service endpoints (S3, Cognito, Sentry) require broad patterns. Per-endpoint CSP would break on infrastructure changes. `*.eki.ee` needed for partner API integration.

---

## Security Controls — Positive Findings

### Network & Transport


| Control                                        | Status | Location                |
| ---------------------------------------------- | ------ | ----------------------- |
| HTTPS everywhere (redirect HTTP → HTTPS)       | ✅      | `cloudfront.tf:155-176` |
| TLS 1.2 minimum on CloudFront                  | ✅      | `cloudfront.tf:205`     |
| HSTS with preload (1 year, include subdomains) | ✅      | `cloudfront.tf:11-16`   |
| Origin connections HTTPS-only (TLSv1.2)        | ✅      | `cloudfront.tf:83-97`   |
| WAF v2 on all CloudFront traffic               | ✅      | `cloudfront.tf:64`      |


### WAF Rules


| Rule                     | Priority | Detail                                                         |
| ------------------------ | -------- | -------------------------------------------------------------- |
| Per-IP rate limit        | 1        | 2000 req/5min — general abuse protection                       |
| Synthesize rate limit    | 2        | 200 req/5min per IP for `/api/synthesize`                      |
| Geo-blocking synthesize  | 3        | Baltic/Nordic region only (EE, LV, LT, FI, SE, DE, PL, NO, DK) |
| AWS Managed Common Rules | 10       | SQLi, XSS, SSRF, path traversal protection                     |


WAF logging enabled — blocked/counted requests sent to CloudWatch (`aws-waf-logs-`*, 90-day retention).

### Authentication & Session


| Control                          | Status | Detail                                     |
| -------------------------------- | ------ | ------------------------------------------ |
| Cognito + TARA eID (national ID) | ✅      | PKCE flow with state cookie                |
| State cookie (CSRF protection)   | ✅      | HttpOnly, Secure, SameSite=Lax, 10-min TTL |
| Refresh token cookie             | ✅      | HttpOnly, Secure, SameSite=Lax, 30-day TTL |
| Access/ID tokens                 | ✅      | Secure, SameSite=Lax, 1-hour TTL           |
| Frontend token storage           | ✅      | In-memory only — no localStorage           |


### Response Headers


| Header                    | Value                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Content-Security-Policy   | `default-src 'self'; script-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload`                                                |
| X-Content-Type-Options    | `nosniff`                                                                                     |
| X-Frame-Options           | `DENY`                                                                                        |
| Referrer-Policy           | `no-referrer`                                                                                 |


### Audit & Monitoring


| Control                                   | Status | Detail                                                                               |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| CloudTrail (multi-region, log validation) | ✅      | `cloudtrail.tf` — S3 bucket versioned, encrypted, Object Lock enabled                |
| GuardDuty threat detection                | ✅      | `guardduty.tf` — S3 data events, findings → SNS → Slack                              |
| CloudWatch alarms                         | ✅      | API 5xx/4xx, Lambda errors, DynamoDB throttling, SQS depth, WAF blocks, ECS capacity |
| Budget alerts                             | ✅      | `budgets.tf` — 70%, 90%, 100% thresholds + forecast alerts                           |
| CloudFront access logs                    | ✅      | `website.tf:90-96` — dedicated encrypted bucket, 90-day retention                    |


### Supply Chain & CI/CD


| Control                              | Status | Detail                                                                                 |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| GitHub Actions pinned to SHA         | ✅      | All `uses:` reference commit hashes, not tags                                          |
| CodeQL SAST (security-extended)      | ✅      | `codeql.yml` — on PR, push, weekly schedule                                            |
| Trivy container scan (HIGH+CRITICAL) | ✅      | Both `build.yml` (vabamorf) and `build-merlin-worker.yml`                              |
| `pnpm audit` in CI                   | ✅      | `build.yml:78-88` — blocks on HIGH severity                                            |
| ECR image scanning on push           | ✅      | `ecr.tf:6-8`, `merlin/main.tf:136-138`                                                 |
| ECR immutable tags                   | ✅      | Both repos — prevents image tag overwrite                                              |
| ECR lifecycle policy                 | ✅      | Keep last 10 images per repo                                                           |
| Branch protection (required checks)  | ✅      | Build check required, `enforce_admins` enabled, auto-merge disabled for infra-only PRs |


### IAM & Access Control


| Control                                  | Status | Detail                                                                          |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| ECS task role — least privilege          | ✅      | `merlin/main.tf:246-278` — SQS receive/delete, S3 put/get, CloudWatch logs only |
| Security group — zero ingress            | ✅      | `merlin/main.tf:428-445` — egress port 443 only                                 |
| S3 website bucket — private (OAC)        | ✅      | `website.tf:34-41` — CloudFront-only access                                     |
| S3 CloudTrail bucket — private           | ✅      | `cloudtrail.tf:22-29` — all public access blocked                               |
| Terraform state — DynamoDB lock          | ✅      | `terraform.yml:147-162` — stale lock detection                                  |
| OIDC for GitHub Actions (no static keys) | ✅      | `role-to-assume` via `id-token: write`                                          |


### Data Protection


| Control                                       | Status | Detail                                                        |
| --------------------------------------------- | ------ | ------------------------------------------------------------- |
| S3 encryption (AES256)                        | ✅      | Website, CloudTrail, CloudFront logs buckets                  |
| S3 versioning                                 | ✅      | Website and CloudTrail buckets                                |
| CloudTrail Object Lock (GOVERNANCE, 365 days) | ✅      | Prevents audit log tampering                                  |
| SNS encryption (AWS managed KMS)              | ✅      | `cloudwatch-alarms.tf:11`                                     |
| SQS dead letter queue                         | ✅      | `merlin/main.tf:35-41` — 14-day retention for failed messages |
| Log retention policies                        | ✅      | CloudWatch 90 days, CloudTrail 365 days, CF logs 90 days      |


---

## Recommendations

1. **SEC-01 resolution** — Enforce JWT authentication on `/synthesize`, `/status/`*, `/analyze`, `/variants` once client approves. This is the only CRITICAL finding.
2. **Dependabot** — Enable GitHub Dependabot for automated dependency vulnerability alerts (free, zero configuration).
3. **DynamoDB encryption** — SimpleStore table uses default AWS encryption. Consider explicit CMK if storing sensitive user data in future.

