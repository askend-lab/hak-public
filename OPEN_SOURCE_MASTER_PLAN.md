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

---

## 1. Security & Secrets — CRITICAL `docs/open-source/01-security.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|---|-------------|-------------|
| S1 | [x] | [ ] | No secrets in code/history | `secret-detection` (gitleaks) |
| S2 | [x] | [ ] | No vulnerable dependencies | `security-audit` (pnpm audit) |
| S3 | [ ] | [ ] | No hardcoded domains/IDs | NEW: `no-hardcoded-env` |
| S4 | [ ] | [ ] | No internal path references | NEW: `no-internal-refs` |
| S5 | [ ] | [ ] | IaC security (Terraform) | NEW: `run-tfsec` |
| S6 | [ ] | [ ] | Docker security (Hadolint) | NEW: `run-docker-lint` |
| S7 | [x] | [ ] | License compatibility of all deps | `license-check` |

### Manual gates
| # | ✅ | Gate |
|---|---|------|
| S8 | [x] | Remove internal docs (code-review, plans, reports) |
| S9 | [ ] | Run `gitleaks detect` on full git history, purge if needed |
| S10 | [ ] | Decide: clean initial commit vs. sanitized history |
| S11 | [ ] | Remove `.agent-channel`, `.test-runner-state.json` |
| S12 | [ ] | Remove or sanitize `audits/` directory |
| S13 | [ ] | Remove or package `packages/vendor/eki-storybook` |

---

## 2. Internal Tooling Decoupling — HIGH `docs/open-source/02-decoupling.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|---|-------------|-------------|
| D1 | [ ] | [ ] | ESLint config self-contained | NEW: `no-external-imports` |
| D2 | [ ] | [ ] | No paths outside repo | NEW: `no-internal-refs` |
| D3 | [x] | [x] | Build succeeds | `run-build` |
| D4 | [x] | [x] | All tests pass | `run-tests` |
| D5 | [x] | [x] | TypeScript compiles | `run-typecheck` |

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

| # | 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|---|-------------|-------------|
| Q1 | [x] | [x] | Zero `any` types | `no-any` |
| Q2 | [x] | [x] | All Promises handled | `no-floating-promises` |
| Q3 | [x] | [x] | Consistent import order | `import-order` |
| Q4 | [x] | [ ] | No `console.log` in production | `no-console` |
| Q5 | [x] | [ ] | ESLint zero warnings | `run-lint` |
| Q6 | [x] | [x] | No copy-paste (≤5%) | `jscpd` |
| Q7 | [x] | [x] | Source files ≤400 lines | `source-size` |
| Q8 | [x] | [x] | Strict TypeScript | `run-typecheck` |
| Q9 | [ ] | [ ] | No dead exports | NEW: `dead-code` (ts-prune) |
| Q10 | [ ] | [ ] | No circular dependencies | NEW: `circular-deps` (madge) |

---

## 4. Testing & Coverage — HIGH `docs/open-source/04-testing.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|---|-------------|-------------|
| T1 | [x] | [x] | All tests pass | `run-tests` |
| T2 | [x] | [ ] | Coverage ≥90% lines, ≥85% branches | `test-coverage` |
| T3 | [x] | [x] | TDD enforced (new code needs tests) | `test-required` |
| T4 | [x] | [x] | Unused deps detected | `dependency-check` |
| T5 | [ ] | [ ] | E2E tests (Playwright) | NEW: `run-e2e` |
| T6 | [ ] | [ ] | Property-based tests | (in `run-tests`) fast-check |
| T7 | [ ] | [ ] | Mutation testing (≥80%) | NEW: `run-mutation` stryker |

---

## 5. Documentation — MEDIUM `docs/open-source/05-documentation.md`

| # | 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|---|-------------|-------------|
| O1 | [x] | [x] | Markdown ≤200 lines | `markdown-size` |
| O2 | [x] | [x] | No broken links in docs | `broken-links` |
| O3 | [x] | [ ] | English-only code | `language-check` |
| O4 | [x] | [x] | Docs have metrics | `metrics-required` |

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

| # | 🔧 | ✅ | Requirement | DevBox Hook / CI |
|---|---|---|-------------|------------------|
| C1 | [ ] | [ ] | Prettier formatting | `prettier-check` (disabled) |
| C2 | [ ] | [ ] | CodeQL security scanning | GitHub Actions |
| C3 | [ ] | [ ] | Docker image scanning | NEW: CI `trivy` step |
| C4 | [ ] | [ ] | Bundle size budget | NEW: `bundle-size` |
| C5 | [ ] | [ ] | Lighthouse ≥90 | NEW: `run-lighthouse` |

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
