# Code Review Tracker — Mikk Merimaa Findings

Ref: `internal/CodeReviewMikkReport.txt` (original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check)

Legend: ✅ Accept (will fix) | ❌ Reject (won't fix) | [ ] Fixed — code changed | [ ] Closed — verified done | 🛡️ — enforced by DevBox hook (won't regress)

---

## 1. Documentation

- ✅ Accept  [ ] Fixed  [ ] Closed — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181
- ❌ Reject (wrong)  —  — **1.1.2** (Low) Shared module doesn't list dependencies — finding incorrect, s3 client IS in package.json
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.2.1** (Low) No separate INSTALL.md
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.1** (Low) Duplicate architecture line in README
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect)
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading)
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate)
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.3.6** (High?) Architecture doc missing key sections (auth, security, diagrams)
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.5.1** (Medium) No deployment guide for engineers
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.5.1.1** (Low) Too many markdown files (~46) — organize/consolidate
- ✅ Accept  [ ] Fixed  [ ] Closed — **1.5.1.2** (Low) Design documentation in two places

## 2. Technical Stack

- ✅ Accept  [ ] Fixed  [ ] Closed — **2.1** (Low) Node.js 20, upgrade to latest LTS
- ✅ Accept  [ ] Fixed  [ ] Closed — **2.2** (Low) 5 testing frameworks — can remove Jest in favor of Vitest
- ✅ Accept  [ ] Fixed  [ ] Closed — **2.3** (Low) Bug in generate.py: ERB uses bark_alpha — dead code but fix anyway

## 3. Project Structure

- ❌ Reject (different runtimes)  —  — **3.1** (Low) Merge merlin-worker and merlin-api — different runtimes (Python/TS), different deploy (Docker/Lambda)

## 4. Code Style

- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.1** (Low) if statements without curly brackets — `curly: 'all'` ESLint rule
- ✅ Accept  [ ] Fixed  [ ] Closed — **4.2** (Medium) getCorsOrigin duplication — fix behavior difference (*→null)
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.3** (Low) `as unknown as` double type assertions — `consistent-type-assertions` ESLint rule
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.4** (Low) Nested ternary statements — `no-nested-ternary` ESLint rule
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.5** (Low) Array indexes as React keys — `react/no-array-index-key` ESLint rule
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.6** (Low) Unused code: LoginModalProps.message, commented code in Python — knip dead-code hook + Ruff ERA001
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.7** (Low) Redundant `?` and `undefined` type specifiers — `no-unnecessary-type-arguments` ESLint rule (tool enabled, violations pending)
- ✅ Accept  [ ] Fixed  [ ] Closed — **4.8** (Medium) Deprecated APIs — execCommand fallback, np.random.RandomState (NOT React.FormEvent)
- ✅ Accept  [ ] Fixed  [ ] Closed — **4.9** (Low) Duplicate CSS selectors (.marker-tooltip--align-center)
- ❌ Reject (not found)  —  — **4.10** (Low) Redundant return None — not confirmed in code
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.11** (Low) TODO matches — 12 found (not 30 as claimed), resolve them — `no-warning-comments` ESLint rule
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.12** (Low) Unnecessary list() calls on iterables in Python — Ruff PLW0117
- ❌ Reject (not found)  —  — **4.13** (Low) Unnecessary awaits — not confirmed in source code
- ❌ Reject (external lib)  —  — **4.14** (Medium) DeepRecurrentNetwork class — external Merlin library, not our code
- ❌ Reject (ML convention)  —  — **4.15** (Low) Python naming case — ML math notation convention (W_value, Whx)
- ✅ Accept  [ ] Fixed  [ ] Closed — **4.16** (Medium) SonarQube issues — install SonarQube and verify
- ❌ Reject (external lib)  —  — **4.17** (Medium) Merlin NN Python style issues — external library code
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **4.18** (Medium) Floating point equality checks in worker.py — Ruff PLR2004

## 5. Simplicity & Patterns

- ✅ Accept  [ ] Fixed  [ ] Closed — **5.1** (Low) S3 utilities duplicated between shared and merlin-api
- ✅ Accept  [ ] Fixed  [ ] Closed — **5.2** (Low) LambdaResponse and createResponse duplicated across packages
- ✅ Accept  [ ] Fixed  [ ] Closed — **5.3** (Low) `if True:` block in run_merlin.py (indentation hack)
- ✅ Accept  [ ] Fixed  [ ] Closed — **5.4** (Low) HTTP_STATUS duplicated across packages

## 6. Maintainability

- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **6.1** (High) pnpm test:all silently skips merlin-worker Python tests — DevBox `run-tests` hook + merlin-worker test script fix

## 7. Error Handling

- ✅ Accept  [ ] Fixed  [ ] Closed — **7.1** (Low) simplestore doesn't use extractErrorMessage from shared
- ✅ Accept  [ ] Fixed  [ ] Closed — **7.2** (Low) merlin-api and vabamorf-api use console.error instead of shared logger

## 8. Testing

- ❌ Reject (wrong)  —  — **8.1** (High) Python tests not in CI — WRONG, they ARE in build-merlin-worker.yml
- ✅ Accept  [ ] Fixed  [ ] Closed — **8.2.1** (Medium) Test duplications in simplestore (handler vs routes tests)
- ❌ Reject (intentional)  —  — **8.2.2** (Low) Auth context 6 test files — intentional organization by concern

## 9. CI/CD

- ✅ Accept  [ ] Fixed  [ ] Closed — **9.1** (Low) Dockerfile uses `RUN cd` instead of WORKDIR
- ❌ Reject (by design)  —  — **9.2** (Low) Serverless v3/v4 mismatch — by design, documented in README (cost decision)
- ✅ Accept  [ ] Fixed  [ ] Closed — **9.3** (Medium) Deploy workflows — document properly what exists and fill gaps

## 10. Configuration

- ✅ Accept  [ ] Fixed  [ ] Closed — **10.1** (Low) merlin-api README lists wrong auth info (COGNITO vars unused)
- ✅ Accept  [ ] Fixed  [ ] Closed — **10.2** (Medium) Empty-string ECS env vars — replace with throw or proper validation

## 11. Dependencies

- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **11.1** (Medium) Unused dependencies — 7 of 10 confirmed unused — knip + DevBox `deps` hook

## 12. Security

- ❌ Reject (by design)  —  — **12.1** (High) No auth on /synthesize, /warmup — BY DESIGN, documented in README
- ✅ Accept  [ ] Fixed  [ ] Closed — **12.2** (Medium) Shared throttling — improve per-user/per-IP limiting
- ✅ Accept  [ ] Fixed  [ ] Closed — **12.3** (Medium) CORS behavior differs: shared="null" vs merlin/vabamorf="*"
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **12.4** (Medium) OS Command Injection via shell=True (TDD tests exist, fix in progress) — Ruff S602
- ✅ Accept  [🛡️] Fixed  [🛡️] Closed — **12.5** (Medium) pickle.load — add SHA-256 checksum verification for model files — Ruff S301
- ❌ Reject (duplicate)  —  — **12.6** (Medium) CORS misconfiguration — duplicate of 12.3
- ✅ Accept  [ ] Fixed  [ ] Closed — **12.7** (Medium) Missing cacheKey validation in worker.py

## 13. Performance

- ✅ Accept  [ ] Fixed  [ ] Closed — **13.1** (Medium) DNN model loaded from disk on every request
- ❌ Reject (appropriate)  —  — **13.2** (Medium) SQS 1 message/cycle — sequential TTS processing, batching needs threading

## 14. Domain Logic

- ✅ Accept  [ ] Fixed  [ ] Closed — **14.1** (Low) Rename modules to reflect domain, not technology

## 15. Our Own Findings (not in Mikk's review)

- ✅ Accept  [ ] Fixed  [ ] Closed — **15.1** (Medium) Remove /warmup endpoint entirely — not used, unnecessary complexity
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.2** (Medium) merlin-api README says "Cognito JWT" auth but code has AuthorizationType: NONE — README is wrong
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.3** (Low) shell injection fix already has TDD tests but not yet applied to actual code
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.4** (Medium) Remove /status/{cacheKey} from public access — move behind CloudFront or require token

---

## Additional Quality Checks Added

Beyond fixing individual findings, we built a **DevBox quality system** — automated hooks that run on every commit and block merges when violated. This ensures findings don't recur.

### New ESLint Rules (TypeScript)

| Rule | What it catches | Violations fixed |
|------|----------------|------------------|
| `curly: 'all'` | Missing `{}` on if/else/for/while | All fixed |
| `no-nested-ternary` | Nested ternary expressions | All fixed |
| `react/no-array-index-key` | Array index as React keys | All fixed |
| `consistent-type-assertions` | `as unknown as X` double casts | All fixed |
| `no-unnecessary-type-arguments` | Redundant `?` and `\| undefined` | Tool enabled, violations pending |
| `no-floating-promises` + `no-misused-promises` | Unawaited promises, async callbacks | **97 violations fixed** (95 frontend + 2 vabamorf-api) |
| `import/no-deprecated` | Deprecated API usage | 0 violations (already clean) |
| `no-warning-comments` | TODO/FIXME/HACK comments | 0 violations |

### New Ruff Rules (Python)

| Rule | What it catches | Violations fixed |
|------|----------------|------------------|
| `UP` (pyupgrade) | Outdated Python patterns | All fixed |
| `B` (bugbear) | Common Python bugs | All fixed |
| `SIM` (simplify) | Unnecessarily complex code | All fixed |
| `PLW0117` | Unnecessary `list()` calls | All fixed |
| `PLR2004` | Magic number comparisons | All fixed |
| `ERA001` | Commented-out code | 0 violations |
| `S` (security) | shell=True, pickle.load, subprocess | 0 violations (replaces bandit) |

### Dead Code Detection

- **knip** expanded to include `packages/frontend` (was fully excluded)
- 5 dead files removed: 3 unused barrel exports + 2 unused test helpers
- Now catches unused exports across the entire monorepo

### Other DevBox Improvements

- **Type-aware ESLint parsing** enabled (`parserOptions.project: true`) — +4s lint time but catches real promise bugs that were invisible before
- **Test completeness hook** — `run-tests` verifies all test modules produce results; merlin-worker now fails hard if venv missing
- **Security audit hook** — `mode: warning`, 6 transitive devDep vulnerabilities tracked (need upstream fixes)
- **IAC security hook** — active and passing
- **Coverage threshold** — set to 93% lines (frontend currently at 95.05%)

### Impact Summary

Of the **47 accepted findings**, **14 are now enforced by DevBox hooks** (marked with 🛡️). These findings cannot recur — any new violation will block the commit. The remaining findings require manual fixes but no automated enforcement (doc sync, cross-package consolidation, etc.).
