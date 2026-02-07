# Phase 1: Security & Secrets

> CRITICAL — must be completed before any public repository access.

## 1. Secret & Sensitive Data Removal

### Hardcoded Values
- [ ] **Remove AWS Account ID** — `465168436856` hardcoded in `infra/merlin/main.tf`. Move to variable.
- [ ] **Remove hardcoded domains** — `askend-lab.com` in `auth/config.ts`, `DebugPage.tsx`, Terraform files. Use env vars.
- [ ] **Move Cognito IDs to env vars** — User Pool ID and Client ID in `auth/config.ts` → `VITE_COGNITO_*`.
- [ ] **Remove Terraform state bucket names** — `askend-lab-terraform-state` → variables with example values.
- [ ] **Make social links configurable** — `Footer.tsx` hardcodes Eesti Keele Instituut social media links.
- [ ] **Audit `.env.example`** — Must contain ALL required variables with placeholder values, not real ones.

### Internal References
- [ ] **Remove `devbox` script** — References `/home/alex/users/boxer/devbox/cli.js`.
- [ ] **Remove ESLint external import** — `eslint.config.mjs` imports from `../../boxer/devbox/`.
- [ ] **Remove `devbox.yaml`** — Or make it generic (no internal infrastructure refs).
- [ ] **Remove `.agent-channel`** — Internal Slack artifact.
- [ ] **Remove `.test-runner-state.json`** — Internal test runner state.
- [ ] **Remove `packages/vendor/eki-storybook`** — Either properly package or remove.
- [ ] **Audit `scripts/`** — May reference internal infrastructure.

### Documentation Cleanup
- [ ] **Remove `docs/code-review/`** — Internal code review documents (in Russian).
- [ ] **Remove `CODE_REVIEW_PLAN.md`** — Internal document.
- [ ] **Remove or sanitize `BACKLOG.md`** — Contains internal plans.
- [ ] **Remove `audits/`** — Internal audit documents with vulnerability details.
- [ ] **Remove `docs/tara-audit.txt`** and TARA integration docs.
- [ ] **Remove `docs/plans/`** — Internal migration plans.
- [ ] **Remove `coverage-report.txt`** — Generated file, add to `.gitignore`.

## 2. Authentication & Authorization
- [ ] **Audit token handling** — JWT storage method, refresh flow, validation on client and server.
- [ ] **Audit PKCE implementation** — Verify RFC 7636 compliance: verifier entropy, S256, state parameter.
- [ ] **Validate server-side JWT verification** — All Lambdas must verify signatures against Cognito JWKS.
- [ ] **Harden CORS** — No `Access-Control-Allow-Origin: *` in production.
- [ ] **Audit API Gateway auth** — All endpoints must have Cognito authorizer (except public ones).

## 3. Input Validation & Injection
- [ ] **Audit all Lambda inputs** — Every `event.body`, query params, path params must be validated.
- [ ] **Audit DynamoDB injection** — Verify user-controlled keys can't inject.
- [ ] **Add Content Security Policy** — CSP headers in CloudFront.
- [ ] **Add rate limiting** — API Gateway throttling or WAF rules.

## 4. Infrastructure Security
- [ ] **Enable AWS WAF** for API Gateway and CloudFront.
- [ ] **Audit IAM roles** — Least privilege, no `*` resource ARNs.
- [ ] **Audit S3 bucket policies** — No unintended public access.
- [ ] **Audit Docker images** — Run `trivy` on vabamorf-api and merlin-worker images.

## 5. Secret Scanning
- [ ] **Run gitleaks on full history** — All 830+ commits.
- [ ] **Expand `.gitleaks.toml`** — Add rules for AWS keys, JWT secrets, generic API keys.
- [ ] **Enable GitHub secret scanning** on the repository.
- [ ] **Add pre-commit gitleaks hook** — Prevent future secret commits.

## 6. Git History Hygiene
- [ ] **Scan entire history for secrets** — `gitleaks detect` + `truffleHog`.
- [ ] **Purge any found secrets** — `git filter-repo` if needed.
- [ ] **Consider clean initial commit** — If history is too dirty for public consumption.
- [ ] **Remove internal references from commit messages** — No Slack IDs, ticket numbers, personal names.
- [ ] **Add commitlint** — Enforce Conventional Commits format.
