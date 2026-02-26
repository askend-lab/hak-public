# Security Audit Report — hak (Round 3)

**Date:** 2026-02-16
**Scope:** Full codebase — CI/CD, IAM, APIs, Docker, infrastructure, frontend
**Auditor:** Sam (AI)
**Previous audit:** `internal/SECURITY-AUDIT-2026-02.md` (2026-02-15, all findings resolved)

---

## Summary

This audit builds on the February 2026 round 1+2 audit. The project has **strong security foundations** and most issues from the previous audit are resolved. This round found **6 actionable findings** (all fixed) and **5 items confirmed as documented design decisions**.

| Severity | Count | Fixed |
|----------|-------|-------|
| HIGH     | 2 | 2 ✅ |
| MEDIUM   | 4 | 4 ✅ |
| By Design | 5 | — |

---

## Actionable Findings

### SEC-01: Merlin audio S3 bucket — CORS wildcard + no WAF coverage [HIGH]

**File:** `infra/merlin/main.tf:82-92`

The public S3 audio bucket is **by design** (see `internal/DESIGN-DECISIONS.md` #15 — content is non-sensitive, hash-keyed, and must be publicly accessible). However, two sub-issues are actionable:

**a) CORS `allowed_origins = ["*"]`** — Allows any website to make cross-origin requests to load audio. Should be restricted to application domains even though content is public, to prevent hotlinking abuse.

**b) No CloudFront/WAF in front of audio bucket** — Audio is served directly from S3, bypassing WAF. CloudFront was evaluated but **rejected**: the synthesis polling flow requires immediate availability after S3 `put_object`, and CloudFront's edge caching introduces latency on first request (cache miss → origin fetch). Direct S3 access is the correct pattern for real-time polling. Risk accepted — audio content is non-sensitive and hash-keyed.

**Fix applied:** CORS origins restricted to `["https://hak-dev.askend-lab.com", "https://hak.askend-lab.com"]`. ✅

### SEC-02: ECR Terraform code says IMMUTABLE but actual repo is MUTABLE [HIGH]

**File:** `infra/merlin/main.tf:128`

The Terraform code defines `image_tag_mutability = "IMMUTABLE"`, but the actual ECR repository is `MUTABLE` (verified via AWS CLI). This means:
- Terraform state has drifted from reality
- The CI workflow correctly pushes `:latest` (which requires MUTABLE)
- If `terraform apply` runs, it will try to set IMMUTABLE and **break** future `:latest` pushes

**Fix applied:** Changed to `image_tag_mutability = "MUTABLE"` in Terraform. ✅

### SEC-06: Terraform state lock force-unlock in CI [MEDIUM]

**File:** `.github/workflows/terraform.yml:147-165`

The Terraform Apply job auto-detects and force-unlocks stale state locks. While `max-parallel: 1` prevents concurrent matrix jobs, concurrent workflow runs from rapid commits could still conflict.

**Fix applied:** Replaced auto force-unlock with a check that fails the pipeline with manual unlock instructions. ✅

### SEC-07: Vabamorf-api Docker runs as root [MEDIUM]

**File:** `packages/vabamorf-api/Dockerfile`

No `USER` directive. For Lambda containers the blast radius is limited by Lambda's sandbox, but it's still a defense-in-depth gap.

**Fix applied:** Added `appuser` non-root user with `chown` on `/var/task`. ✅

### SEC-09: deploy.yml writes NPM_TOKEN unconditionally [MEDIUM]

**File:** `.github/workflows/deploy.yml:72-74`

Unlike `build.yml` (which checks `if [ -n "$NPM_TOKEN" ]`), `deploy.yml` writes the token unconditionally.

**Fix applied:** Added conditional `if [ -n "$NPM_TOKEN" ]` check matching `build.yml`. ✅

### SEC-13: Miniconda installer not checksum-verified [MEDIUM]

**File:** `packages/merlin-worker/Dockerfile:28`

Miniconda installer is downloaded over HTTPS but not SHA256-verified.

**Fix applied:** Added SHA256 checksum verification for both x86_64 and aarch64 installers. ✅

---

## Confirmed Design Decisions (not vulnerabilities)

These items were reviewed and are **intentional**, documented in `internal/DESIGN-DECISIONS.md`:

**Public S3 audio bucket** (#15) — Audio content is non-sensitive educational material, hash-keyed URLs. Public read is by design. (CORS wildcard is a separate actionable issue — see SEC-01.)

**access_token/id_token cookies not HttpOnly** — Frontend reads `document.cookie` for Authorization header. Refresh token IS HttpOnly. Short-lived tokens (1h), protected by CSP, CSRF validation, and SameSite=Lax. Documented in `internal/DESIGN-DECISIONS.md` #11.

**Auto-approve + auto-merge** — Private repository with single developer. Risk accepted. Would need revisiting if team grows or repo becomes public.

**Serverless Framework v3** (#26) — v4 requires commercial license. Migration to v4/SST/CDK planned for open-source transition. Cost decision, not oversight.

**refreshHandler returns tokens in body** — Consistent with `exchangeCodeHandler` pattern. Tokens are already accessible via non-HttpOnly cookies. The endpoint has CSRF origin validation. No additional exposure beyond existing design.

---

## Items from Previous Audit — Still Resolved ✅

All findings from `internal/SECURITY-AUDIT-2026-02.md` remain resolved:
- C1 (tokens in URL) → cookies ✅
- C3 (text validation) → MAX_TEXT_LENGTH + range validation ✅
- C4 (redirect_uri) → hardcoded server-side ✅
- H1–H10, M1–M14 → all resolved ✅
- D1/D2 (merlin_audio encryption/versioning) → accepted risk, unchanged

---

## Positive Security Controls

- **CI/CD:** Pinned Actions (SHA), OIDC federation, `pnpm audit`, Trivy scanning, SBOM + SLSA provenance
- **Infrastructure:** WAF + AWS managed rules, CloudTrail + log validation, GuardDuty + Slack alerts, CloudFront logging, S3 encryption (AES256), TLS 1.2 minimum
- **Application:** CSP, HSTS preload, X-Frame-Options: DENY, CSRF origin validation, API Gateway throttling, Cognito authorizer, input validation, cacheKey hex-only regex, `shlex.quote()`
- **Docker:** Merlin worker non-root (uid 1001), BuildKit secrets, ECR scan-on-push
- **Auth:** HttpOnly refresh cookie, state+nonce+TTL, PKCE, TARA ID token JWKS verification
