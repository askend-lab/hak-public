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

## Security & Secrets — CRITICAL `docs/open-source/01-security.md`

| 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|-------------|-------------|
| [x] | [ ] | No secrets in code/history | `secret-detection` (gitleaks) |
| [x] | [ ] | No vulnerable dependencies | `security-audit` (pnpm audit) |
| [ ] | [ ] | No hardcoded domains/IDs (askend-lab, AWS IDs, Cognito) | NEW: `no-hardcoded-env` |
| [ ] | [ ] | No internal path references (devbox, boxer, agent) | NEW: `no-internal-refs` |
| [ ] | [ ] | IaC security (Terraform) | NEW: `run-tfsec` |
| [ ] | [ ] | Docker security (Hadolint) | NEW: `run-docker-lint` |
| [x] | [ ] | License compatibility of all deps | `license-check` |

### Manual gates (one-time, not hookable)
- [x] Remove internal docs (code-review, migration plans, old reports) — done
- [ ] Run `gitleaks detect` on full git history, purge if needed
- [ ] Decide: clean initial commit vs. sanitized history
- [ ] Remove `.agent-channel`, `.test-runner-state.json`
- [ ] Remove or sanitize `audits/` directory
- [ ] Remove or package `packages/vendor/eki-storybook`

---

## Internal Tooling Decoupling — HIGH `docs/open-source/02-decoupling.md`

| 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|-------------|-------------|
| [ ] | [ ] | ESLint config self-contained (no external imports) | NEW: `no-external-imports` |
| [ ] | [ ] | No references to paths outside repo | NEW: `no-internal-refs` |
| [x] | [x] | Build succeeds | `run-build` |
| [x] | [x] | All tests pass | `run-tests` |
| [x] | [x] | TypeScript compiles | `run-typecheck` |

### Manual gates (one-time pre-launch)
- [ ] Replace `devbox` wrapper → `husky` + `lint-staged` + pnpm scripts
- [ ] Replace `.githooks/` → husky
- [ ] Remove `defaults.yaml`, `babel.config.js` if unused
- [ ] Remove `packages/vabamorf-api/package-lock.json` (use pnpm)
- [ ] Update Dockerfiles to use pnpm
- [ ] Verify `pnpm install && pnpm test && pnpm build` from clean clone

---

## Code Quality — HIGH `docs/open-source/03-code-quality.md`

| 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|-------------|-------------|
| [x] | [x] | Zero `any` types | `no-any` |
| [x] | [x] | All Promises handled | `no-floating-promises` |
| [x] | [x] | Consistent import order | `import-order` |
| [x] | [ ] | No `console.log` in production | `no-console` |
| [x] | [ ] | ESLint zero warnings | `run-lint` |
| [x] | [x] | No copy-paste (≤5%) | `jscpd` |
| [x] | [x] | Source files ≤400 lines | `source-size` |
| [x] | [x] | Strict TypeScript | `run-typecheck` |
| [ ] | [ ] | No dead exports | NEW: `dead-code` (ts-prune) |
| [ ] | [ ] | No circular dependencies | NEW: `circular-deps` (madge) |

---

## Testing & Coverage — HIGH `docs/open-source/04-testing.md`

| 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|-------------|-------------|
| [x] | [x] | All tests pass | `run-tests` |
| [x] | [ ] | Coverage ≥90% lines, ≥85% branches | `test-coverage` |
| [x] | [x] | TDD enforced (new code needs tests) | `test-required` |
| [x] | [x] | Unused deps detected | `dependency-check` |

### Stretch goals (nice-to-have)
- [ ] 🔧 / [ ] ✅ Property-based tests (`fast-check`) — integration tests
- [ ] 🔧 / [ ] ✅ E2E tests (Playwright) — `run-e2e` hook
- [ ] 🔧 / [ ] ✅ Mutation testing (`stryker`) — `run-mutation` hook

---

## Documentation — MEDIUM `docs/open-source/05-documentation.md`

| 🔧 | ✅ | Requirement | DevBox Hook |
|---|---|-------------|-------------|
| [x] | [x] | Markdown ≤200 lines | `markdown-size` |
| [x] | [x] | No broken links in docs | `broken-links` |
| [x] | [ ] | English-only code | `language-check` |
| [x] | [x] | Docs have metrics | `metrics-required` |

### Manual gates
- [ ] Rewrite `README.md` for OSS audience (screenshots, quick start)
- [ ] Create `docs/ARCHITECTURE.md` with Mermaid diagrams
- [ ] Create ADRs in `docs/adr/`
- [ ] Create `docs/DEPLOYMENT.md` and `docs/API.md`
- [ ] Translate Russian-language docs → English
- [ ] Add "Built with AI" section to README

---

## CI/CD & DevEx — MEDIUM `docs/open-source/06-cicd.md`

| 🔧 | ✅ | Requirement | DevBox Hook / CI |
|---|---|-------------|------------------|
| [ ] | [ ] | Prettier formatting | `prettier-check` (disabled, enable at launch) |
| [ ] | [ ] | CodeQL security scanning | GitHub Actions |
| [ ] | [ ] | Docker image scanning | NEW: CI `trivy` step |
| [ ] | [ ] | Bundle size budget | NEW: `bundle-size` hook |
| [ ] | [ ] | Lighthouse ≥90 | NEW: `run-lighthouse` hook |

### Manual gates
- [ ] Fix all 16 npm vulnerabilities
- [ ] Add PR template, verify issue templates
- [ ] Define semver + automated release workflow
- [ ] Parameterize Terraform (no hardcoded env values)
- [ ] Create `docker-compose.yml` for local dev
- [ ] Add `.editorconfig`, VS Code settings

---

## Launch Gate — FINAL `docs/open-source/08-launch-checklist.md`

**All hooks must be green. All manual gates must be checked.**

| Gate | Status |
|------|--------|
| All DevBox hooks pass on commit | [ ] |
| `gitleaks detect` on full history clean | [ ] |
| MIT license verified with stakeholders | [ ] |
| License headers in all source files | [ ] |
| `NOTICE` file with third-party deps | [ ] |
| Branch protection on `main` | [ ] |
| GitHub Discussions enabled | [ ] |
| Press release / blog post ready | [ ] |
| Code of Conduct published | [ ] |
