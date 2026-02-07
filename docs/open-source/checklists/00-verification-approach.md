# Verification Approach

> **Principle**: Before fixing anything, define HOW we verify each requirement.
> Every standard must have a measurable, repeatable verification method.
> If we can't verify it, we can't claim compliance.

## DevBox is our Verification Engine

All checks run on **pre-commit** via DevBox hooks. Every developer gets instant feedback
before code leaves their machine. No bad code ever enters the repository.

**DevBox Architecture**:
- `devbox.yaml` → project config (extends `defaults.yaml`)
- **Stages**: `pre-commit` → `commit-msg` → `pre-push` → `pr-check` → `ci-cd`
- **24 hooks available**, each with `mode: error | warning | off`
- Hooks run on staged files only (fast) or full repo (thorough)
- Test runner executes all test modules with coverage thresholds

## Currently Active Hooks (pre-commit)

| Hook | What it Checks | Mode |
|------|---------------|------|
| `markdown-size` | Markdown files ≤ 200 lines | error |
| `source-size` | Source files ≤ 400 lines | error |
| `language-check` | English-only code | warning |
| `jscpd` | Copy-paste detection ≤ 5% | error |
| `run-lint` | ESLint (all rules) | warning |
| `run-tests` | Full test suite + coverage | error |
| `run-typecheck` | `tsc --noEmit` strict mode | error |
| `dependency-check` | Unused/missing dependencies | error |
| `security-audit` | `pnpm audit` vulnerabilities | error |
| `secret-detection` | gitleaks secret scanning | error |

## Currently Active Hooks (commit-msg)

| Hook | What it Checks | Mode |
|------|---------------|------|
| `test-required` | TDD: new code must have tests | error |

## Available but Not Yet Configured

| Hook | What it Checks | Needed For |
|------|---------------|------------|
| `no-any` | Zero `any` types | Google TS Guide, NASA Rule 9 |
| `no-floating-promises` | All Promises handled | NASA Rule 7 |
| `import-order` | Consistent imports | Google TS Guide |
| `prettier-check` | Code formatting | Consistency |
| `no-console` | No `console.log` in source | Node.js Best Practices |
| `run-build` | Frontend build succeeds | Build verification |
| `test-coverage` | Coverage thresholds met | Testing standards |
| `eslint-batch` | Batch ESLint on staged files | Performance |
| `broken-links` | Dead links in docs | Documentation |
| `metrics-required` | Docs have metrics | Documentation |
| `package-json-validation` | Valid package.json | Consistency |

## Standard → DevBox Hook Mapping

### Security Standards (OWASP, CWE, NIST)

| Requirement | DevBox Hook | Config Key |
|-------------|------------|------------|
| No secrets in code | `secret-detection` ✅ | gitleaks rules |
| No vulnerable deps | `security-audit` ✅ | `auditLevel: high` |
| No `eval()`/injection | `run-lint` ✅ | ESLint `no-eval` rule |
| Input validation | `run-tests` ✅ | Tests verify validation |
| Auth enforcement | `run-tests` ✅ | Tests verify auth |
| CORS hardening | `run-tests` ✅ | Tests verify headers |
| Docker security | **NEW**: `run-docker-lint` | `hadolint` command |
| IaC security | **NEW**: `run-tfsec` | `tfsec infra/` command |

### Code Quality (NASA, Google TS, Clean Code)

| Requirement | DevBox Hook | Config Key |
|-------------|------------|------------|
| Strict TypeScript | `run-typecheck` ✅ | `tsc --noEmit` |
| No `any` types | `no-any` (enable) | mode: error |
| No floating Promises | `no-floating-promises` (enable) | mode: error |
| No `console.log` | `no-console` (enable) | mode: error |
| Complexity ≤ 8 | `run-lint` ✅ | ESLint `complexity` rule |
| Functions ≤ 50 lines | `source-size` ✅ | max_lines: 400 |
| No copy-paste | `jscpd` ✅ | threshold: 5% |
| Import ordering | `import-order` (enable) | mode: error |
| Formatting | `prettier-check` (enable) | mode: error |
| No unused deps | `dependency-check` ✅ | mode: error |
| No dead exports | **NEW**: `dead-code` | `ts-prune` command |
| No circular deps | **NEW**: `circular-deps` | `madge --circular` |

### Testing (ISTQB, TDD, BDD)

| Requirement | DevBox Hook | Config Key |
|-------------|------------|------------|
| Coverage ≥ 90% | `run-tests` ✅ | Jest thresholds |
| TDD enforced | `test-required` ✅ | tdd: true |
| All tests pass | `run-tests` ✅ | exit code 0 |
| Build succeeds | `run-build` (enable) | mode: error |

### Accessibility (WCAG, EN 301 549)

| Requirement | DevBox Hook | Config Key |
|-------------|------------|------------|
| axe-core passes | `run-tests` ✅ | Playwright + axe in test suite |
| Lighthouse ≥ 90 | **NEW**: `run-lighthouse` | `lhci autorun` |

### Documentation (Standard for Public Code)

| Requirement | DevBox Hook | Config Key |
|-------------|------------|------------|
| Docs ≤ 200 lines | `markdown-size` ✅ | max_lines: 200 |
| No broken links | `broken-links` (enable) | mode: error |
| English language | `language-check` ✅ | warning → error |
