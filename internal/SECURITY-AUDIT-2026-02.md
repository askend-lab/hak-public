# HAK Security Audit — February 2026

**Scope:** Full codebase + infrastructure | **Date:** 2026-02-15  
**Result:** 4 CRITICAL, 6 HIGH, 8 MEDIUM | **Dependencies:** 0 known CVEs

## Executive Summary

Solid foundation: in-memory tokens, httpOnly cookies, PKCE, WAF, CSP, S3 access blocks, least-privilege IAM. But 4 critical issues need immediate attention: **tokens in redirect URLs**, **unauthenticated TTS API**, **missing text validation**, **user-supplied redirect_uri**.

## CRITICAL

**C1. Tokens in redirect URL** — `tara-auth/handler.ts:216-218` passes access_token and id_token as URL query params in 302 redirect. Leaked via browser history, CloudFront logs (90d retention), Referer headers. **Fix:** exchange via httpOnly cookies or one-time server-side code.

**C2. Merlin API — zero authentication** — All 4 endpoints (`/synthesize`, `/status`, `/health`, `/warmup`) have no Cognito authorizer. Attacker can synthesize unlimited text, scale ECS via `/warmup` (cost attack), flood SQS queue. Only 5 req/s throttle. **Fix:** add Cognito auth to `/synthesize` and `/warmup`.

**C3. No text length validation in merlin-api** — `handler.ts:92` only checks `text !== ""`. `TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH=1000` exists in shared but is never imported. 10MB text → massive WAV generation. **Fix:** enforce length limit + validate speed/pitch ranges.

**C4. User-supplied redirect_uri** — `handler.ts:306` accepts `redirect_uri` from client JSON, forwards to Cognito `/oauth2/token`. If Cognito whitelist is misconfigured → open redirect + token theft. **Fix:** hardcode redirect_uri server-side.

## HIGH

**H1. Cookie domain `.askend-lab.com`** — `handler.ts:30-32` scopes refresh cookie to top-level domain. Any subdomain XSS → cookie theft. **Fix:** use exact hostname.

**H2. CORS fallback `*`** — `shared/lambda.ts:21` returns `*` when ALLOWED_ORIGIN unset. Combined with `Allow-Credentials: true` in tara-auth. **Fix:** throw error instead of fallback.

**H3. SimpleStore — no API throttling** — Unlike merlin-api (5/s) and vabamorf (20/s), SimpleStore has zero throttle. PAY_PER_REQUEST DynamoDB → cost attack. **Fix:** add throttle config.

**H4. Data enumeration** — `/query` with `type=shared` + predictable partition key `{app}|{tenant}|{env}|{type}` → enumerate all shared content. `/get-shared` has no auth. **Fix:** rate limit + pagination limits.

**H5. CI audit `continue-on-error: true`** — `build.yml:76` never fails build on HIGH CVEs. **Fix:** remove continue-on-error.

**H6. Serverless Framework v3 EOL** — All services. No security patches. **Fix:** migrate to v4 or CDK/SAM.

## MEDIUM

**M1.** State cookie missing `Domain=` (inconsistent with refresh cookie)  
**M2.** No CSRF tokens on POST endpoints (SameSite=Lax provides partial protection)  
**M3.** `console.error(error)` may leak stack traces, internal URLs to CloudWatch  
**M4.** S3 audio URLs direct + deterministic hash → content accessible without auth  
**M5.** Cognito filter string interpolation (`personalCode`) — no format validation  
**M6.** No application-level body size limits (API GW 10MB default)  
**M7.** CloudFront logs capture URL params (tokens from C1 stored 90 days)  
**M8.** WAF rate 300/5min may be too generous for auth/synthesis endpoints

## Positive Findings

In-memory token storage (XSS-safe) · httpOnly Secure SameSite=Lax refresh cookie · PKCE · State+nonce+TTL validation · S3 4-way public access block · CloudFront OAC · WAF+managed rules · CSP enforced · TLS 1.2 minimum · HSTS preload · Least-privilege IAM · No eval/dangerouslySetInnerHTML · No hardcoded secrets (SSM/SecretsManager) · Trivy Docker scanning · 0 CVEs · PITR on DynamoDB · VPC isolation for tara-auth · GuardDuty + CloudTrail

## Remediation Priority

| # | Finding | Effort | When |
|---|---------|--------|------|
| C1-C4 | Critical 4 items | Low-Med | Immediate |
| H1-H3,H5 | Cookie, CORS, throttle, CI | Low | Next sprint |
| H4,H6 | Enumeration, Serverless EOL | Med-High | Backlog |
| M1-M8 | Medium findings | Varies | Backlog |

See `internal/SECURITY-AUDIT-2026-02-DETAILS.md` for full technical details.
