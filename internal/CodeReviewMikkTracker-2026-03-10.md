# Code Review Tracker — Re-verification 2026-03-10

Ref: `internal/CodeReviewMikkReport.txt` (Mikk original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check) | `internal/LauriCodeReview.txt` (Lauri original)

## Mikk Merimaa Findings

Legend: ✅ Accept (will fix) | ❌ Reject (won't fix) | [ ] Fixed — code changed | [ ] Closed — verified done | 🛡️ — enforced by DevBox hook (won't regress) | **[✅/❌] 03-10** — re-verified 2026-03-10 (✅ still holds, ❌ regressed)

---

## 1. Documentation

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181 — *03-10: React ^19.0.0 ✅, port 5181 ✅. Still holds.*
- ❌ Reject (wrong)  —  —  [✅] 03-10 — **1.1.2** (Low) Shared module doesn't list dependencies — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty — *03-10: morphology-api package.json has @hak/shared + zod. Still consistent.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.2.1** (Low) No separate INSTALL.md — *03-10: Quick Start section still present in README.md. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.1** (Low) Duplicate architecture line in README — *03-10: No duplication. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs — *03-10: ARCHITECTURE.md uses current names. Only `build-merlin-worker.yml` remains (actual filename). Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect) — *03-10: Still correct.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading) — *03-10: Still correct.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate) — *03-10: Still correct.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.3.6** (High?) Architecture doc missing key sections (auth, security, diagrams) — *03-10: All sections still present.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger — *03-10: OpenAPI specs still exist in docs/. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.5.1** (Medium) No deployment guide for engineers — *03-10: DEPLOYMENT.md still 84 lines. Still holds.*
- ❌ Reject (acceptable)  —  —  [✅] 03-10 — **1.5.1.1** (Low) Too many markdown files — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **1.5.1.2** (Low) Design documentation in two places — *03-10: Still no duplication.*

## 2. Technical Stack

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **2.1** (Low) Node.js 20, upgrade to latest LTS — *03-10: .nvmrc=22, all serverless nodejs22.x. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **2.2** (Low) 5 testing frameworks — *03-10: shared/store/frontend use vitest, backend uses jest. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **2.3** (Low) Bug in generate.py: ERB now uses erb_alpha — *03-10: erb_alpha at line 187. Still correct.*

## 3. Project Structure

- ❌ Reject (different runtimes)  —  —  [✅] 03-10 — **3.1** (Low) Merge merlin-worker and merlin-api — *03-10: Rejection still valid.*

## 4. Code Style

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.1** (Low) if statements without curly brackets — *03-10: curly rule at eslint.base.config.mjs:61. Still enforced.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **4.2** (Medium) getCorsOrigin unified — *03-10: getCorsOrigin in shared/src/lambda.ts, returns "null" when unset. All packages use it. Still holds.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.3** (Low) `as unknown as` double type assertions — *03-10: Rule at eslint.base.config.mjs:211. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.4** (Low) Nested ternary statements — *03-10: Rule at :62. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.5** (Low) Array indexes as React keys — *03-10: Rule at :381. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.6** (Low) Unused code — *03-10: Ruff ERA001 + knip dead-code hook active. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.7** (Low) Redundant `?` and `undefined` type specifiers — *03-10: Rule at :212. Still enforced.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **4.8** (Medium) Deprecated APIs — *03-10: No execCommand in codebase. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **4.9** (Low) Duplicate CSS selectors — *03-10: Still no duplication.*
- ❌ Reject (not found)  —  —  [✅] 03-10 — **4.10** (Low) Redundant return None — *03-10: Rejection still valid.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.11** (Low) TODO matches — *03-10: Rule at :59 as warn. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.12** (Low) Unnecessary list() calls in Python — *03-10: Ruff PLW in ruff.toml. Still enforced.*
- ❌ Reject (not found)  —  —  [✅] 03-10 — **4.13** (Low) Unnecessary awaits — *03-10: Rejection still valid.*
- ❌ Reject (external lib)  —  —  [✅] 03-10 — **4.14** (Medium) DeepRecurrentNetwork class — *03-10: Rejection still valid.*
- ❌ Reject (ML convention)  —  —  [✅] 03-10 — **4.15** (Low) Python naming case — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **4.16** (Medium) SonarQube issues — *03-10: 30+ rules active, lint clean. Still holds.*
- ❌ Reject (external lib)  —  —  [✅] 03-10 — **4.17** (Medium) Merlin NN Python style issues — *03-10: Rejection still valid.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **4.18** (Medium) Floating point equality — *03-10: Ruff PLR2004 in ruff.toml. Still enforced.*

## 5. Simplicity & Patterns

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **5.1** (Low) S3 utilities duplicated — *03-10: tts-api/src/s3.ts imports from @hak/shared. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **5.2** (Low) LambdaResponse duplicated — *03-10: All packages import from @hak/shared. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **5.3** (Low) Removed `if True:` hack — *03-10: No `if True:` in tts-worker/*.py. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **5.4** (Low) HTTP_STATUS duplicated — *03-10: All packages import from @hak/shared. Still holds.*

## 6. Maintainability

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **6.1** (High) pnpm test:all silently skips Python tests — *03-10: tts-worker in devbox.yaml as pytest module. Still enforced.*

## 7. Error Handling

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **7.1** (Low) simplestore uses extractErrorMessage — *03-10: store/src/core/store.ts:8 imports from @hak/shared. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **7.2** (Low) APIs use shared logger — *03-10: tts-api imports logger from @hak/shared. Still holds.*

## 8. Testing

- ❌ Reject (wrong)  —  —  [✅] 03-10 — **8.1** (High) Python tests not in CI — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **8.2.1** (Medium) Test duplications in simplestore — *03-10: Store tests organized by concern. Still holds.*
- ❌ Reject (intentional)  —  —  [✅] 03-10 — **8.2.2** (Low) Auth context 6 test files — *03-10: Rejection still valid.*

## 9. CI/CD

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **9.1** (Low) Dockerfile uses WORKDIR — *03-10: WORKDIR at lines 19, 66, 69. No RUN cd. Still holds.*
- ❌ Reject (by design)  —  —  [✅] 03-10 — **9.2** (Low) Serverless v3/v4 mismatch — *03-10: All serverless.yml have frameworkVersion: '3'. Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **9.3** (Medium) Deploy workflows — *03-10: ARCHITECTURE.md CI/CD section present. Still holds.*

## 10. Configuration

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **10.1** (Low) README auth info — *03-10: tts-api/README.md endpoint table present. No stale COGNITO refs. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **10.2** (Medium) Empty-string ECS env vars — *03-10: env.ts throws on missing SQS_QUEUE_URL, S3_BUCKET, ECS_CLUSTER, ECS_SERVICE. Still holds.*

## 11. Dependencies

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **11.1** (Medium) Unused dependencies — *03-10: knip.json + DevBox dead-code hook active. Still enforced.*

## 12. Security

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **12.1** (High) No auth on /synthesize, /warmup — *03-10: All endpoints require cognitoAuthorizer in serverless.yml (tts-api + morphology-api). /warmup removed. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **12.2** (Medium) Shared throttling — *03-10: Per-user WAF rate limits in infra/waf.tf. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **12.3** (Medium) CORS behavior unified — *03-10: Same as 4.2. Still holds.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed  [⚠️] 03-10 — **12.4** (Medium) OS Command Injection via shell=True — *03-10: generate.py:73 still has shell=True. Same status — external merlin/ lib excluded from ruff.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed  [⚠️] 03-10 — **12.5** (Medium) pickle.load — *03-10: run_merlin.py:99 still uses pickle.load. _model_cache added (13.1) but no checksum. Same status.*
- ❌ Reject (duplicate)  —  —  [✅] 03-10 — **12.6** (Medium) CORS misconfiguration — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **12.7** (Medium) cacheKey validation in worker.py — *03-10: VALID_CACHE_KEY at worker.py:79, match at :116. Still holds.*

## 13. Performance

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **13.1** (Medium) DNN model cached — *03-10: _model_cache at run_merlin.py:91, cache check at :96-97. Still holds.*
- ❌ Reject (appropriate)  —  —  [✅] 03-10 — **13.2** (Medium) SQS 1 message/cycle — *03-10: Rejection still valid.*

## 14. Domain Logic

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **14.1** (Low) Rename modules — *03-10: All 11 packages present: api-client, audio-api, auth, frontend, gherkin-parser, morphology-api, shared, specifications, store, tts-api, tts-worker. Still holds.*

## 15. Our Own Findings (not in Mikk's review)

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **15.1** (Medium) Removed /warmup — *03-10: No warmup in tts-api/src/ or serverless.yml. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **15.2** (Medium) README auth mismatch — *03-10: tts-api/README.md endpoint table correct. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **15.3** (Low) Shell injection fix in run_merlin.py — *03-10: Our code uses subprocess.run with arg lists. generate.py:73 shell=True is in external merlin/ lib. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **15.4** (Medium) /status requires auth — *03-10: cognitoAuthorizer in tts-api/serverless.yml for all endpoints. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **15.5** (Medium) MAX_TEXT_LENGTH = 100 — *03-10: schemas.ts + worker.py both have 100. Still holds.*

---

## Additional Quality Checks Added

Beyond fixing individual findings, we built a **DevBox quality system** — automated hooks that run on every commit and block merges when violated. This ensures findings don't recur.

### New ESLint Rules (TypeScript)

Previously enabled (before QS-1):

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

Enabled in QS-1 migration (PR #661) — 30+ rules previously only applied to .js now active on .ts/.tsx:

| Rule | What it catches | Violations fixed |
|------|----------------|------------------|
| `eslint-comments/require-description` | Undescribed eslint-disable comments | 8 fixed |
| `require-atomic-updates` | Unsafe ref/flag assignments after await | 4 eslint-disable |
| `max-depth` | Deeply nested blocks | 3 eslint-disable |
| `security/detect-non-literal-regexp` | Dynamic regex injection | 1 eslint-disable |
| `no-alert` | Browser alert() calls | 2 replaced with logger |
| `sonarjs/no-identical-functions` | Duplicate function bodies | 1 eslint-disable |
| `no-return-assign` | Assignment in return statement | 1 fixed |
| `no-promise-executor-return` | Promise executor returning value | 6 fixed (wrapped setTimeout) |
| `promise/always-return` | Missing return in .then() | 2 eslint-disable |
| `promise/param-names` | Non-standard resolve/reject names | 1 fixed |
| `no-await-in-loop` | Await inside loops | 11 eslint-disable (sequential processing) |
| `no-console` | Console statements in src | 10 replaced with logger, 4 files eslint-disable |
| `no-param-reassign` | Parameter mutation | 2 files eslint-disable (parser, AWS triggers), 6 line-level |
| `sonarjs/no-duplicate-string` | Repeated string literals (threshold 4) | 2 extracted to constants |
| `max-statements` | Functions with too many statements (20, hooks/TSX: 30) | 8 eslint-disable |
| `max-lines-per-function` | Long functions (150, hooks/TSX: 250) | Covered by thresholds + overrides |
| `max-lines` | Long files (400) | Generated files excluded |
| `complexity` | Cyclomatic complexity (15, TSX: 30) | 1 eslint-disable |
| `sonarjs/cognitive-complexity` | Cognitive complexity (20) | Covered by threshold |
| `max-nested-callbacks` | Nested callbacks (5) | Covered by threshold |
| `max-params` | Function parameters (5) | Covered by threshold |
| `max-classes-per-file` | Classes per file (3) | Covered by threshold |

**Zero rules remain disabled** for production .ts/.tsx code. Test/generated/BDD files have appropriate overrides.

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

---

## Quality System Improvements (SonarQube Audit, 2026-02-22)

Local SonarQube scan found **6 code smells + 9 security hotspots**. Root cause: ESLint rules not applied to TypeScript files. Action items:

### ESLint Config Gap (Critical)

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-1** (Critical) eslint.base.config.mjs TS rules — *03-10: 30+ rules spread into TS/TSX blocks. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-2** (Critical) sonarjs on .ts — *03-10: Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-3** (Critical) regexp rules on .ts — *03-10: Still enforced.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-4** (Critical) eslint --print-config verification — *03-10: One-time check. Still holds.*

### CSS/SCSS Linting (Missing)

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-5** (Medium) Stylelint — *03-10: stylelint in package.json + lint script. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-6** (Medium) .stylelintrc.json — *03-10: .stylelintrc.json present. Still enforced.*

### Python Type Checking (Missing)

- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-7** (Medium) mypy — *03-10: mypy>=1.10 in requirements-test.txt. Still enforced.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed  [✅] 03-10 — **QS-8** (Medium) mypy in pnpm lint — *03-10: lint script includes mypy. Still enforced.*

### SonarQube False Positives (No Action)

- ❌ Reject (false positive)  [✅] 03-10 — ~~shared/src/logger.ts:27 empty arrow function~~ — *03-10: Rejection still valid.*
- ❌ Reject (false positive)  [✅] 03-10 — ~~api-client/src/generated/*.ts interface names~~ — *03-10: Rejection still valid.*
- ❌ Reject (false positive)  [✅] 03-10 — ~~merlin-worker /tmp paths in tests~~ — *03-10: Rejection still valid.*

### SonarQube Valid but Low Priority

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-9** (Low) vmetajson.ts cognitive complexity — *03-10: handleStdoutData/handleProcessExit extracted. Still holds.*
- ❌ Reject (false positive)  [✅] 03-10 — **QS-10** ~~Fix duplicate CSS `monospace`~~ — *03-10: Rejection still valid.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-11** (Low) Duplicate .eki-results-section — *03-10: Still no duplicate.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-12** (Medium) generate.mjs command injection — *03-10: Uses execFileSync (safe). Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-13** (Medium) Docker root user — *03-10: Dockerfile.local has USER appuser. Still holds.*
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **QS-14** (Medium) Regex ReDoS — *03-10: Fixed regex in auth/src/cognito-client.ts. Still holds.*

---

## Public API Security Hardening

Ref: `internal/PROPOSAL-Auth-Public-Endpoints.md`

Endpoints `/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` now require Cognito JWT authentication (PR #759, 2026-03-10). Per-user WAF rate limits enforced. Below: hardening measures implemented.

### Cost & Scaling Limits

- ✅ Accept  [✅] Fixed  [🧪] Closed  [✅] 03-10 — **PUB-1** (CRITICAL) AWS Budgets — *03-10: infra/budgets.tf still present. Still holds. 🧪 TEST-5 still pending.*
- ✅ Accept  [✅] Fixed  [🧪] Closed  [✅] 03-10 — **PUB-2** (CRITICAL) ECS max_capacity — *03-10: infra/merlin/main.tf max_capacity still present. Still holds. 🧪 TEST-2 still pending.*
- ✅ Accept  [❌] Reverted  [✅] Closed  [✅] 03-10 — **PUB-3** (CRITICAL) Lambda concurrency limits — *03-10: Still reverted. Protection via WAF + geo-blocking + SQS cap. Same status.*
- ✅ Accept  [✅] Fixed  [🧪] Closed  [✅] 03-10 — **PUB-4** (HIGH) SQS queue depth cap — *03-10: sqs.ts checkQueueDepth still present. Still holds. 🧪 TEST-6 still pending.*
- ✅ Accept  [✅] Fixed  [⚠️] Closed  [⚠️] 03-10 — **PUB-5** (HIGH) MAX_TEXT_LENGTH — *03-10: Backend enforced (100). Same ⚠️: frontend maxLength attribute still missing on some inputs.*

### Monitoring & Detection

- ✅ Accept  [✅] Fixed  [🧪] Closed  [✅] 03-10 — **PUB-6** (HIGH) CloudWatch alerts — *03-10: infra/cloudwatch-alarms.tf still present. Still holds. 🧪 TEST-4 still pending.*
- ✅ Accept  [❓] Fixed  [🧪] Closed  [❓] 03-10 — **PUB-14** (CRITICAL) Account-level budget + alerts — *03-10: Cannot verify locally (separate infra repo). Same status.*
- ✅ Accept  [❓] Fixed  [🧪] Closed  [❓] 03-10 — **PUB-15** (HIGH) Daily Cost Digest Lambda — *03-10: Cannot verify locally (separate infra repo). Same status.*
- ❌ Reject (rejected) —  [✅] 03-10 — ~~**PUB-16**~~ (MEDIUM) WAF kill switch — *03-10: Rejection still valid.*

### Attack Surface Reduction

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **PUB-9** (HIGH) Per-path WAF rate limit — *03-10: infra/waf.tf rate-limit rules present. Still holds.*
- ✅ Accept  [✅] Fixed  [🧪] Closed  [✅] 03-10 — **PUB-10** (MEDIUM) Geo-blocking — *03-10: infra/waf.tf geo-restrict rule present. Still holds. 🧪 Pen test still pending.*

### Storage

- ❌ Reject (not worth it) —  [✅] 03-10 — ~~**PUB-13**~~ (LOW) S3 audio lifecycle — *03-10: Rejection still valid.*

### Deferred (decided not to do now)

- ⏸️ Deferred  [ ] Fixed  [ ] Closed  [⏸️] 03-10 — **PUB-7** (HIGH) Anomaly detection + auto-ban — *03-10: Still deferred.*
- ⏸️ Deferred  [ ] Fixed  [ ] Closed  [⏸️] 03-10 — **PUB-8** (MEDIUM) Audit and forensics — *03-10: Still deferred.*
- ⏸️ Deferred  [ ] Fixed  [ ] Closed  [⏸️] 03-10 — **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work — *03-10: Still deferred.*
- ⏸️ Deferred  [ ] Fixed  [ ] Closed  [⏸️] 03-10 — **PUB-12** (MEDIUM) Request fingerprinting — *03-10: Still deferred.*

---

## Lauri Code Review (Lauri Index)

Ref: `internal/LauriCodeReview.txt` (original report)

Legend: [ ] Accept/Reject — [ ] Fixed — [ ] Closed

### Previously Tracked (from earlier review)

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LAURI-P1** (Medium) Store API leaks DynamoDB terminology — *03-10: Code fix still in place. Still needs staging verification.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LAURI-P2** (Medium) Store API input validation — *03-10: Code fix still in place. Still needs staging verification.*

### Full Code Review Findings (12 items)

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LAURI-1** (High) No architecture pattern — *03-10: All packages use createApiResponse from @hak/shared. Still holds.*

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LAURI-2** (High) Write skew on first insert — *03-10: Code fix still in place. Still needs staging verification.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-3** (Medium) Inconsistent error handling — *03-10: extractErrorMessage used in store + auth. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-4** (Medium) Missing logging — *03-10: Structured logger from shared used across packages. Still holds.*

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LAURI-5** (High) Risky authentication — *03-10: No X-User-Id in store handler. Still needs staging verification.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-6** (Medium) Broken tests — *03-10: No contains(200,500) pattern in codebase. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-7** (High) Resource starvation / DDoS — *03-10: WAF rate limits + Cognito auth + SQS cap + geo-blocking all present. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-8** (Medium) DynamoDB mocks — *03-10: Tests use InMemoryAdapter. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-9** (Medium) Test code in production — *03-10: No IS_OFFLINE-gated auth shortcuts. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-10** (Low) Low-value unit tests — *03-10: Addressed by WT-1 through WT-12. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-11** (Medium) DynamoDB logic in frontend — *03-10: STORE_KEYS in @hak/shared. Still holds.*

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **LAURI-12** (Low) Inefficient TypeScript patterns — *03-10: Store uses Zod for validation. Still holds.*

---

## Weak Tests Cleanup (2026-02-23)

Ref: `internal/WEAK-TESTS-REPORT.md` | Branch: `fix/strengthen-weak-tests` | PR: #671 (merged)

Identified ~60 weak/useless tests across 12 files in 6 packages. Replaced with meaningful behavioral assertions. Net: +246 / −314 lines.

### Tautologies (`expect(true).toBe(true)`)

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-1** morphology-api/test/hello.test.ts — `expect(true).toBe(true)` → healthHandler returns 200 + parseJsonBody tests
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-2** store/test/adapterSelection.test.ts — `expect(true).toBe(true)` → `expect(() => setAdapter(null)).not.toThrow()`

### Coverage Padding (`toBeDefined()` on imports)

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-3** morphology-api/test/coverage-imports.test.ts — 5× `toBeDefined()` → behavioral smoke tests for each module

### Export Checks (`typeof === "function"`)

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-4** shared/src/index.test.ts — 12× `typeof` checks → real invocations with result verification

### Readonly Tautologies

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-5** shared/src/constants.test.ts — 2× "as const" `toBeDefined()` → exact key enumeration checks

### Constant Equals Literal

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-6** auth/test/types.test.ts — 7× constant===literal → Cognito format checks, email format, prefix validation
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-7** auth/test/handler.test.ts — 9× constant===literal → security contracts (TTL ranges, HTTPS, cookie flags, min CSRF length)
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-8** auth/test/tara-client.test.ts — 7× constant===literal → OIDC protocol contracts (HTTPS URLs, /oidc/* paths, language code format)

### Duplicate Test Suites

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-9** frontend/Footer.test.tsx — full duplicate `describe("Footer")` block (80+ lines from merged Footer.full.test.tsx) → removed, kept 2 unique tests

### Mechanical Enumeration

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-10** frontend/Icons.test.tsx — 12 copy-paste icon render tests → single `it.each` with 13 icons + aria-hidden check

### Weak Type Checks

- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-11** frontend/NotificationContext.types.test.tsx — rendered `data-testid` type checking → `renderHook` + error boundary + invocation safety
- ✅ Accept  [✅] Fixed  [✅] Closed  [✅] 03-10 — **WT-12** frontend/specs/index.test.ts — 2× `typeof === "object"` → non-empty record verification with value type checks

### Statistics

| Metric | Value |
|--------|-------|
| Files modified | 12 |
| Packages touched | 6 |
| Weak tests fixed | ~60 |
| Lines added | 246 |
| Lines removed | 314 |
| All tests passing | ✅ |
| All CI checks | ✅ |
| Coverage regression | None |

---

## Logging System Audit (2026-02-23)

Ref: `internal/LOGGING-ANALYSIS.md` | Analysis of all 7 packages

**Current state:** No systematic logging. Backend has 13 total `logger.*` calls across 6/32 files (19%). 92% are error-only. Zero structured logging, zero request correlation, zero debug calls.

### Phase 1: Structured JSON Logging (foundation)

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-1** (CRITICAL) Structured logger — *03-10: shared/src/logger.ts has JSON + plain text modes. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-2** (CRITICAL) withContext(fields) — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-3** (HIGH) Request correlation — *03-10: Code still in place. Still holds.*

### Phase 2: Add Logging to Silent Handlers

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-4** (CRITICAL) Logging in tts-api — *03-10: tts-api imports logger from @hak/shared. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-5** (HIGH) Store handler silent catch — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-6** (HIGH) Auth Cognito trigger logging — *03-10: Code still in place. Still holds.*
- ✅ Accept  [⚠️] Deferred  [ ] Closed  [⚠️] 03-10 — **LOG-7** (MEDIUM) Store routes logging — *03-10: Still deferred (ESM transform issue).*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-8** (MEDIUM) Auth module logging — *03-10: Code still in place. Still holds.*

### Phase 3: Infrastructure & Observability

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-9** (HIGH) logRetentionInDays: 30 — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-10** (MEDIUM) CloudWatch Insights queries — *03-10: Documented. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-11** (MEDIUM) Standardize error logging — *03-10: Code still in place. Still holds.*

### Phase 4: Business Observability

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-12** (MEDIUM) Business event logging — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-13** (LOW) Debug-level logging — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **LOG-14** (LOW) tts-api → tts-worker correlation — *03-10: cacheKey in logs. Still holds.*

### Statistics

| Metric | Current | Target |
|--------|---------|--------|
| Backend files with logging | 6/32 → 11/32 (34%) | 20+/32 (60%+) |
| Structured/JSON logging | ✅ All Lambda | ✅ All Lambda |
| Request correlation | ✅ All Lambda handlers | ✅ All Lambda |
| Log retention configured | ✅ 30 days (all 4) | ✅ 30 days |
| Error-only calls | 16/27 (59%) | <50% |
| Info-level calls | 5 | 15+ |
| Debug-level calls | 5 | 10+ |
| CloudWatch queries | ✅ 5 saved queries | ✅ Documented |

---

## Error Handling Audit (2026-02-23)

Ref: `internal/ERROR-HANDLING-ANALYSIS.md` | Analysis of all backend packages + frontend service layer

**Current state:** 8 different error handling patterns across 4 backend packages. 3 variants of error message extraction. 2 silent error swallowing locations. No custom error hierarchy. No unified handler wrapper.

### Quick Wins

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-1** (HIGH) extractErrorMessage() everywhere — *03-10: Used in store + auth. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-4** (HIGH) Silent catches in cognito-client — *03-10: Code still in place. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-5** (MEDIUM) Error re-wrapping with cause — *03-10: Code still in place. Still holds.*

### Structural Improvements

- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-2** (MEDIUM) AppError hierarchy — *03-10: 7 error classes in shared. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-6** (MEDIUM) morphology-api shared response — *03-10: HTTP_STATUS imported from @hak/shared via validation.ts. Still holds.*
- ✅ Accept  [✅] Fixed  [ ] Closed  [✅] 03-10 — **ERR-3** (LARGER) wrapLambdaHandler() — *03-10: Available in shared. Still holds.*

### Statistics

| Metric | Current | Target |
|--------|---------|--------|
| Error extraction variants | 3 → 1 | 1 (`extractErrorMessage`) |
| Silent error swallowing | 2 → 0 | 0 |
| Custom error classes | 2 → 9 (hierarchy) | 5+ (hierarchy) |
| Packages using shared response utils | 2/4 → 3/4 | 4/4 |
| Handler wrapper pattern | ✅ Available in shared | 4/4 packages (incremental) |

---

### Testing & Verification (Penetration Tests)

- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-1** (CRITICAL) Load testing — *03-10: Still pending.*
- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-2** (CRITICAL) Auto-scaling testing — *03-10: Still pending.*
- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-3** (CRITICAL) Lambda concurrency testing — *03-10: Still pending.*
- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-4** (HIGH) Alert testing — *03-10: Still pending.*
- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-5** (HIGH) Budget limit testing — *03-10: Still pending.*
- ⏸️ Pending  [ ] Done  [ ] Closed  [⏸️] 03-10 — **TEST-6** (HIGH) SQS queue depth testing — *03-10: Still pending.*
