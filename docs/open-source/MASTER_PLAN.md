# Open Source Master Plan

**Goal:** Prepare HAK for public open source release.
**Branch:** `refactoring` | **Detailed plans:** `docs/open-source/`

## Methodology

> **We build a QUALITY SYSTEM, not just fix code.**
> Every item has two checkboxes:
> - 🔧 = Verification tool configured as a **DevBox hook**
> - ✅ = Hook passes, all issues resolved (green)
>
> **If it's not in DevBox, it doesn't exist.** Manual CLI checks don't count.
> Flow: find tool → add to DevBox → see it fail → fix → see it green.
>
>
> **NO FALLBACKS.** If a tool is missing or misconfigured, the hook must
> **FAIL HARD** — block the commit, print the error. Never skip, never
> degrade gracefully. The quality system itself must crash on its own
> configuration problems.
>
> **Config scope:** changes go into HAK's `devbox.yaml` only, never into
> the base DevBox config (`defaults.yaml`). Transfer to base later.
> **System deps:** tools requiring installation → [`SYSTEM_DEPENDENCIES.md`](./SYSTEM_DEPENDENCIES.md).

---

## 1. Security & Secrets — CRITICAL `docs/open-source/01-security.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook | Config |
|---|---|---|-------------|-------------|--------|
| S1 | [x] | BLOCKED | No secrets in code/history | `secret-detection` | `devbox.yaml:206`, tool: gitleaks — **NOT INSTALLED** |
| S2 | [x] | [x] | No vulnerable dependencies | `security-audit` | `devbox.yaml:204`, tool: `pnpm audit`, defaults: `auditLevel: moderate` |
| S3 | BLOCKED | [ ] | No hardcoded domains/IDs | NEW: `no-hardcoded-env` | needs new hook type in DevBox registry |
| S4 | BLOCKED | [ ] | No internal path references | NEW: `no-internal-refs` | needs new hook type in DevBox registry |
| S5 | [ ] | BLOCKED | IaC security (Terraform) | NEW: `run-tfsec` | tool: tfsec — **NOT INSTALLED** |
| S6 | [ ] | BLOCKED | Docker security (Hadolint) | NEW: `run-docker-lint` | tool: hadolint — **NOT INSTALLED** |
| S7 | [x] | [x] | License compatibility of all deps | `license-check` | `devbox.yaml:216-217`, mode: error, tool: license-checker |

### Manual gates
| # | ✅ | Gate |
|---|---|------|
| S8 | [x] | Remove internal docs (code-review, plans, reports) |
| S9 | BLOCKED | Run `gitleaks detect` on full git history — **needs gitleaks installed** |
| S10 | [ ] | Decide: clean initial commit vs. sanitized history |
| S11 | [x] | Remove `.agent-channel`, `.test-runner-state.json` — removed, in .gitignore |
| S12 | [ ] | Remove or sanitize `audits/` directory |
| S13 | [ ] | Remove or package `packages/vendor/eki-storybook` |

---

## 2. Internal Tooling Decoupling — HIGH `docs/open-source/02-decoupling.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook | Config |
|---|---|---|-------------|-------------|--------|
| D1 | BLOCKED | [ ] | ESLint config self-contained | NEW: `no-external-imports` | needs new hook type in DevBox registry |
| D2 | BLOCKED | [ ] | No paths outside repo | NEW: `no-internal-refs` | needs new hook type in DevBox registry |
| D3 | [x] | [x] | Build succeeds | `run-build` | `devbox.yaml:156-158`, cmd: `pnpm --filter @hak/frontend build` |
| D4 | [x] | [x] | All tests pass | `run-tests` | `devbox.yaml:153-154`, cmd: `node devbox test` |
| D5 | [x] | [x] | TypeScript compiles | `run-typecheck` | `devbox.yaml:147-148`, cmd: `pnpm -r exec tsc --noEmit` |

### Manual gates
| # | ✅ | Gate |
|---|---|------|
| D6 | [ ] | Replace `devbox` wrapper → `husky` + `lint-staged` |
| D7 | [ ] | Replace `.githooks/` → husky |
| D8 | [ ] | Remove `defaults.yaml`, `babel.config.js` if unused |
| D9 | [ ] | Remove `packages/vabamorf-api/package-lock.json` |
| D10 | [ ] | Update Dockerfiles to use pnpm |
| D11 | [ ] | Verify clean clone: `pnpm install && pnpm test && pnpm build` |

---

## 3. Code Quality — HIGH `docs/open-source/03-code-quality.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook | Config |
|---|---|---|-------------|-------------|--------|
| Q1 | [x] | [x] | Zero `any` types | `no-any` | `devbox.yaml:212`, `defaults.yaml:151-152` mode: error |
| Q2 | [x] | [x] | All Promises handled | `no-floating-promises` | `devbox.yaml:214`, `defaults.yaml:154-155` mode: error |
| Q3 | [x] | [x] | Consistent import order | `import-order` | `devbox.yaml:210`, `defaults.yaml:148-149` mode: error |
| Q4 | [x] | [x] | No `console.log` in production | `no-console` | `devbox.yaml:93-113`, `defaults.yaml:157-160` mode: error |
| Q5 | [x] | [x] | ESLint zero warnings | `run-lint` | `devbox.yaml:140-145`, cmd: `pnpm lint` |
| Q6 | [x] | [x] | No copy-paste (≤5%) | `jscpd` | `devbox.yaml:162-168`, `defaults.yaml:137-140` threshold: 5% |
| Q7 | [x] | [x] | Source files ≤400 lines | `source-size` | `devbox.yaml:170-202`, `defaults.yaml:91-93` max: 400 |
| Q8 | [x] | [x] | Strict TypeScript | `run-typecheck` | `devbox.yaml:147-148`, cmd: `pnpm -r exec tsc --noEmit` |
| Q9 | BLOCKED | [ ] | No dead exports | `dead-code` | mode: off + not in pre-commit stage — needs base config change |
| Q10 | BLOCKED | [ ] | No circular deps | `circular-deps` | mode: off + not in pre-commit stage — needs base config change |

---

## 4. Testing & Coverage — HIGH `docs/open-source/04-testing.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook | Config |
|---|---|---|-------------|-------------|--------|
| T1 | [x] | [x] | All tests pass | `run-tests` | `devbox.yaml:153-154`, cmd: `node devbox test` |
| T2 | [x] | BLOCKED | Coverage ≥90% lines, ≥85% branches | `test-coverage` | `devbox.yaml:150-151` — not in pre-commit stage |
| T3 | [x] | [x] | TDD enforced (new code needs tests) | `test-required` | `devbox.yaml:118-136`, tdd: true |
| T4 | [x] | [x] | Unused deps detected | `dependency-check` | `devbox.yaml:208`, `defaults.yaml:143-146` mode: error |
| T5 | BLOCKED | [ ] | E2E tests (Playwright) | NEW: `run-e2e` | needs new hook in DevBox registry |
| T6 | [ ] | [ ] | Property-based tests | (in `run-tests`) | add fast-check to existing tests |
| T7 | BLOCKED | [ ] | Mutation testing (≥80%) | NEW: `run-mutation` | needs new hook in DevBox registry |

---

## 5. Documentation — MEDIUM `docs/open-source/05-documentation.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook | Config |
|---|---|---|-------------|-------------|--------|
| O1 | [x] | [x] | Markdown ≤200 lines | `markdown-size` | `devbox.yaml:54-76`, max_lines: 200 |
| O2 | [x] | [x] | No broken links in docs | `broken-links` | `devbox.yaml:88-91`, `defaults.yaml:100-102` |
| O3 | [x] | [x] | English-only code | `language-check` | `devbox.yaml:78-86`, `defaults.yaml:95-98` |
| O4 | [x] | [x] | Docs have metrics | `metrics-required` | `devbox.yaml:138`, `defaults.yaml:113-114` |

### Manual gates
| # | ✅ | Gate |
|---|---|------|
| O5 | [ ] | Rewrite `README.md` for OSS audience |
| O6 | [ ] | Create `docs/ARCHITECTURE.md` with Mermaid diagrams |
| O7 | [ ] | Create ADRs in `docs/adr/` |
| O8 | [ ] | Create `docs/DEPLOYMENT.md` and `docs/API.md` |
| O9 | [ ] | Translate Russian-language docs → English |
| O10 | [ ] | Add "Built with AI" section to README |

---

## 6. CI/CD & DevEx — MEDIUM `docs/open-source/06-cicd.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook / CI | Config |
|---|---|---|-------------|------------------|--------|
| C1 | [x] | [ ] | Prettier formatting | `prettier-check` | `devbox.yaml:115-116` mode: off — enable before launch |
| C2 | BLOCKED | [ ] | CodeQL security scanning | GitHub Actions | needs `.github/workflows/codeql.yml` |
| C3 | BLOCKED | [ ] | Docker image scanning | NEW: CI `trivy` | needs CI workflow step |
| C4 | BLOCKED | [ ] | Bundle size budget | NEW: `bundle-size` | needs new hook in DevBox registry |
| C5 | BLOCKED | [ ] | Lighthouse ≥90 | NEW: `run-lighthouse` | needs new hook in DevBox registry |

### Manual gates
| # | ✅ | Gate |
|---|---|------|
| C6 | [ ] | Fix all 16 npm vulnerabilities |
| C7 | [ ] | Add PR template, verify issue templates |
| C8 | [ ] | Define semver + automated release workflow |
| C9 | [ ] | Parameterize Terraform (no hardcoded env values) |
| C10 | [ ] | Create `docker-compose.yml` for local dev |
| C11 | [ ] | Add `.editorconfig`, VS Code settings |

---

## 7. Launch Gate — FINAL `docs/open-source/08-launch-checklist.md`

| # | ✅ | Gate |
|---|---|------|
| L1 | [ ] | All DevBox hooks pass on commit |
| L2 | [ ] | `gitleaks detect` on full history clean |
| L3 | [ ] | MIT license verified with stakeholders |
| L4 | [ ] | License headers in all source files |
| L5 | [ ] | `NOTICE` file with third-party deps |
| L6 | [ ] | Branch protection on `main` |
| L7 | [ ] | GitHub Discussions enabled |
| L8 | [ ] | Press release / blog post ready |
| L9 | [ ] | Code of Conduct published |
