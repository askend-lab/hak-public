# HAK Security Audit — February 2026

**Scope:** Full codebase + infrastructure | **Date:** 2026-02-15  
**Status:** All actionable findings resolved | **Dependencies:** 0 known CVEs

## Executive Summary

Solid foundation: in-memory tokens, httpOnly cookies, PKCE, WAF, CSP, S3 access blocks, least-privilege IAM. All critical and high findings have been remediated. Several items initially flagged are intentional design decisions (see "By Design" section below).

## Resolved Findings

### CRITICAL — all fixed ✅

**C1. Tokens in redirect URL** — access_token and id_token were passed as URL query params in 302 redirect. **Fixed:** tokens now set as Secure cookies; URL carries only `?auth=success` signal.

**C3. No text length validation** — merlin-api accepted unlimited text. **Fixed:** enforced `TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH` (1000 chars), speed (0.5–2.0) and pitch (−10 to 10) range validation, plus 10KB body size limit.

**C4. User-supplied redirect_uri** — client could send arbitrary redirect_uri to Cognito token endpoint. **Fixed:** redirect_uri hardcoded server-side; client no longer sends it.

### HIGH — all actionable items fixed ✅

**H1. Broad cookie domain** — refresh cookie scoped to `.askend-lab.com`. **Fixed:** narrowed to exact frontend hostname (e.g., `.hak-dev.askend-lab.com`).

**H2. CORS wildcard fallback** — `CORS_HEADERS` contained hardcoded `*` origin. **Fixed:** origin always set dynamically via `getCorsOrigin()`.

**H3. SimpleStore — no throttling** — PAY_PER_REQUEST DynamoDB with no API throttle. **Fixed:** added 10 req/s burst 20.

**H4. Data enumeration** — shared content queryable with predictable keys. **Mitigated:** throttling added (H3); further pagination limits can be added if needed.

**H5. CI audit `continue-on-error`** — build never failed on CVEs. **Fixed:** removed `continue-on-error`.

### MEDIUM — resolved ✅

**M1.** State cookie missing `Domain=` — **Fixed:** added Domain attribute consistent with other cookies.  
**M2.** No CSRF tokens on POST endpoints — **Accepted:** SameSite=Lax provides sufficient protection for our threat model.  
**M3.** `console.error(error)` may leak stack traces to CloudWatch — **Accepted:** CloudWatch is access-controlled; low risk.  
**M5.** Cognito filter string interpolation — **Fixed:** personal code validated against `^[A-Z]{2}\d{11}$` before use.  
**M6.** No application-level body size limits — **Fixed:** 10KB `MAX_BODY_SIZE` in merlin-api.  
**M7.** CloudFront logs capture URL params with tokens — **Resolved:** tokens no longer in URL (C1 fix).  
**M8.** WAF rate too generous — **Fixed:** reduced from 300/5min to 100/5min (AWS minimum). merlin-api: 2/s burst 4. SimpleStore: 10/s burst 20.

## By Design (not vulnerabilities)

These items were initially flagged but are **intentional architectural decisions**, documented in the project README under "Security Considerations":

**Merlin API and Vabamorf API are public, unauthenticated endpoints.** They serve the core learning experience and must be accessible without login. Protection is via API Gateway throttling and AWS WAF rate limiting only. No authentication is needed or planned.

**S3 audio storage is publicly readable.** Synthesized audio files are served directly via CloudFront/S3. Content is non-sensitive educational material accessed by content-hash URL. There is no authorization layer by design.

**Serverless Framework v3 (EOL).** We use v3 intentionally. v4 requires a commercial license that is not justified at current scale. We will migrate to v4 (or CDK/SAM) when the project transitions to open source and qualifies for the free tier. This is a cost decision, not an oversight.

## Positive Findings

In-memory token storage (XSS-safe) · httpOnly Secure SameSite=Lax refresh cookie · PKCE · State+nonce+TTL validation · S3 4-way public access block · CloudFront OAC · WAF+managed rules · CSP enforced · TLS 1.2 minimum · HSTS preload · Least-privilege IAM · No eval/dangerouslySetInnerHTML · No hardcoded secrets (SSM/SecretsManager) · Trivy Docker scanning · 0 CVEs · PITR on DynamoDB · VPC isolation for tara-auth · GuardDuty + CloudTrail

See `internal/SECURITY-AUDIT-2026-02-DETAILS.md` for full technical details.
