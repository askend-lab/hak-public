# Open Source Master Plan

**Goal:** Prepare HAK for public open source release.
**Branch:** `refactoring`
**Detailed plans:** `docs/open-source/` (8 phase documents + checklists + standards)

---

## Current State (2026-02-08)

| Metric                   | Value                     | Target      |
| ------------------------ | ------------------------- | ----------- |
| Test files               | 105 frontend + backend    | All passing |
| Frontend line coverage   | ~94%                      | 90%+        |
| Frontend branch coverage | ~83%                      | 85%+        |
| Backend coverage         | 87–100% per package       | 90%+        |
| npm vulnerabilities      | 16 (3 low, 4 mod, 9 high) | 0           |
| eslint-disable in source | 9 files                   | 0           |
| console.log in prod code | ~5 files                  | 0           |
| LICENSE                  | MIT ✅                    | —           |
| CONTRIBUTING.md          | ✅                        | —           |
| SECURITY.md              | ✅                        | —           |
| .env.example             | ✅                        | —           |
| dependabot.yml           | ✅                        | —           |

---

## Phase 1: Security & Secrets — CRITICAL

> Details: `docs/open-source/01-security.md`

### Secret & Sensitive Data Removal

- [ ] Remove hardcoded AWS Account ID from `infra/merlin/main.tf`
- [ ] Remove hardcoded `askend-lab.com` domains → env vars
- [ ] Move Cognito IDs to `VITE_COGNITO_*` env vars
- [ ] Remove Terraform state bucket names → variables
- [ ] Make Footer social links configurable
- [ ] Audit `.env.example` for completeness

### Internal References

- [ ] Remove `devbox` script (references internal path)
- [ ] Make ESLint config self-contained (imports from `../../boxer/devbox/`)
- [ ] Remove or genericize `devbox.yaml`
- [ ] Remove `.agent-channel`
- [ ] Remove `packages/vendor/eki-storybook` or properly package it
- [ ] Audit `scripts/` for internal references

### Documentation Cleanup

- [x] Remove `docs/code-review/` — deleted
- [x] Remove `CODE_REVIEW_PLAN.md` — deleted
- [x] Remove `docs/plans/` (migration plans) — deleted (kept TARA)
- [x] Remove `coverage-report.txt` — deleted
- [ ] Remove or sanitize `audits/` (internal vulnerability details)
- [ ] Sanitize `BACKLOG.md` (remove internal references)

### Auth & Security Hardening

- [ ] Audit token handling (JWT storage, refresh, validation)
- [ ] Audit PKCE implementation (RFC 7636)
- [ ] Validate server-side JWT verification in all Lambdas
- [ ] Harden CORS (no wildcard in production)
- [ ] Audit API Gateway auth (Cognito authorizer)
- [ ] Audit all Lambda inputs (validation)
- [ ] Add Content Security Policy headers
- [ ] Add rate limiting (API Gateway / WAF)

### Git History

- [ ] Run `gitleaks detect` on full history
- [ ] Purge any secrets found
- [ ] Decide: clean initial commit vs. sanitized history
- [ ] Add commitlint for Conventional Commits

---

## Phase 2: Internal Tooling Decoupling — HIGH

> Details: `docs/open-source/02-decoupling.md`

### DevBox Removal

- [ ] Replace `devbox` wrapper → standard pnpm scripts
- [ ] Replace `devbox.yaml` → Jest/Vitest config in `package.json`
- [ ] Make ESLint config standalone (inline all rules)
- [ ] Replace `.githooks/` → `husky` + `lint-staged`
- [ ] Remove `defaults.yaml`
- [ ] Remove `babel.config.js` if unused

### Build System

- [ ] Remove `packages/vabamorf-api/package-lock.json` (use pnpm)
- [ ] Update Dockerfiles to use pnpm
- [ ] Verify `pnpm install && pnpm test && pnpm build` from clean clone

---

## Phase 3: Code Quality — HIGH

> Details: `docs/open-source/03-code-quality.md`, `docs/open-source/04-testing.md`

### TypeScript Strictness

- [ ] Enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`
- [ ] Eliminate all `eslint-disable` directives in source (9 remaining)
- [ ] Maintain zero `any` types
- [ ] Enforce explicit return types on exports

### Code Cleanup

- [ ] Remove debug `console.log` from production code (~5 files)
- [ ] Audit error handling (no silent catch swallowing)
- [ ] Unify response helpers across packages → `@hak/shared`
- [ ] Run `ts-prune` for dead code
- [ ] Audit `as` type assertions → type guards

### Testing

- [ ] Raise all coverage thresholds to 90%+ lines, 85%+ branches
- [ ] Frontend branch coverage: 83% → 85%+
- [ ] Add coverage badges to README
- [ ] Fix or remove broken cucumber BDD tests

---

## Phase 4: Documentation — MEDIUM

> Details: `docs/open-source/05-documentation.md`

- [ ] Rewrite `README.md` for OSS audience (screenshots, quick start, architecture)
- [ ] Create `docs/ARCHITECTURE.md` with C4/Mermaid diagrams
- [ ] Create Architecture Decision Records (`docs/adr/`)
- [ ] Create `docs/DEPLOYMENT.md` (AWS setup from scratch)
- [ ] Create `docs/API.md` (all Lambda endpoints)
- [ ] JSDoc on all exported functions
- [ ] Remove or translate Russian-language documents → English
- [ ] Add "Built with AI" section to README

---

## Phase 5: CI/CD & DevEx — MEDIUM

> Details: `docs/open-source/06-cicd.md`, `docs/open-source/07-infra-devex.md`

### CI/CD

- [ ] Add coverage enforcement to CI
- [ ] Add bundle size check
- [ ] Fix all 16 npm vulnerabilities
- [ ] Add license audit (`license-checker`)
- [ ] Add secret scanning to CI (`gitleaks`)
- [ ] Add Docker image scanning (`trivy`)
- [ ] Add PR template
- [ ] Add CodeQL analysis
- [ ] Define versioning strategy (semver + automated releases)

### Infrastructure

- [ ] Parameterize all env-specific values in Terraform
- [ ] Add `infra/README.md`
- [ ] Add Terraform validation to CI
- [ ] Tag all AWS resources

### Developer Experience

- [ ] Create `docker-compose.yml` for local dev
- [ ] Add local DynamoDB + S3 (localstack)
- [ ] Create `docs/GETTING_STARTED.md`
- [ ] Add `.editorconfig`
- [ ] Add VS Code settings (`.vscode/`)

---

## Phase 6: Launch — HIGH

> Details: `docs/open-source/08-launch-checklist.md`

### Quality Gates (all must pass)

- [ ] `pnpm lint` — zero warnings/errors
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm test` — all pass, coverage 90%+
- [ ] `pnpm audit` — zero high/critical
- [ ] `gitleaks detect` — zero findings
- [ ] Lighthouse 90+ all categories

### Licensing & Compliance

- [ ] Verify MIT license with stakeholders
- [ ] Add license headers to all source files
- [ ] Add `NOTICE` file (third-party deps)
- [ ] Verify Estonian government IP requirements

### Repository Setup

- [ ] Branch protection on `main`
- [ ] Enable GitHub Discussions
- [ ] Add topics/tags for discoverability
- [ ] Social preview image
- [ ] "Good First Issue" pinned issues

### Launch Communication

- [ ] Press release / blog post
- [ ] Community guidelines (Code of Conduct)
- [ ] Public roadmap

**Usage:** Work top to bottom. Mark `[x]` when done. Phase 1 must complete before any public access. Phase 6 is the final gate.
