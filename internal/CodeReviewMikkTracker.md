# Code Review Tracker — Mikk Merimaa Findings

Ref: `internal/CodeReviewMikkReport.txt` (original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check)

Legend: ✅ Accept (will fix) | ❌ Reject (won't fix) | [ ] Fixed — code changed | [ ] Closed — verified done | 🛡️ — enforced by DevBox hook (won't regress)

---

## 1. Documentation

- ✅ Accept  [✅] Fixed  [✅] Closed — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181 — *Verified: React ^19.0.0 in package.json, port 5181 in README. ⚠️ README lines 24/27 still say `merlin-worker` instead of `tts-worker` after rename (minor, separate fix).*
- ❌ Reject (wrong)  —  — **1.1.2** (Low) Shared module doesn't list dependencies — finding incorrect, s3 client IS in package.json
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty — *Verified: README now says "Runtime Dependencies (non-npm)" with native binaries. package.json has `@hak/shared` + `zod` in dependencies. Consistent.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.2.1** (Low) No separate INSTALL.md — expanded Quick Start in root README — *Verified: Quick Start section in README.md has prerequisites, clone, install, test, dx, start commands + separate merlin-worker setup block.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.1** (Low) Duplicate architecture line in README — not real duplication (summary + link) — *Verified: README has one "## Architecture" section with a summary line + link to ARCHITECTURE.md. No duplication. ⚠️ README line 71 still says "Merlin API" and "Vabamorf API" — stale after rename (minor).*
- ✅ Accept  [✅] Fixed  [⚠️] Closed — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs — intentional for navigation — *Verified: duplication is intentional and documented. BUT ⚠️ ARCHITECTURE.md still uses old package names throughout (simplestore, merlin-api, merlin-worker, vabamorf-api, tara-auth). Needs bulk rename to match PR #664.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect) — *Verified: ARCHITECTURE.md line 28 now says "merlin-worker — standalone (Python, no npm dependencies)". Correct. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading) — *Verified: ARCHITECTURE.md line 29 now says "vabamorf-api — standalone (inlines shared utilities for Docker Lambda bundling)". Accurate. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate) — *Verified: ARCHITECTURE.md line 40 now says "Python, Conda, Merlin engine" only. No TypeScript mention. Correct. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.6** (High?) Architecture doc missing key sections (auth, security, diagrams) — *Verified: ARCHITECTURE.md has sections "Authentication & Authorization", "Security Model", "System Diagrams", "CI/CD & Deployment". All present and substantive.*
- ✅ Accept  [✅] Fixed  [⚠️] Closed — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger — *Verified: OpenAPI 3.0.3 specs exist in `docs/merlin-api.openapi.yaml` and `docs/vabamorf-api.openapi.yaml`. Generated from Zod via `api-client/scripts/generate.mjs`. BUT ⚠️ generate.mjs lines 28/34 still reference old paths `packages/merlin-api/` and `packages/vabamorf-api/` — will break after rename. Must update to `packages/tts-api/` and `packages/morphology-api/`.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.5.1** (Medium) No deployment guide for engineers — *Verified: `docs/DEPLOYMENT.md` exists, 84 lines, covers dev + prod deployment.*
- ❌ Reject (acceptable)  —  — **1.5.1.1** (Low) Too many markdown files (~46, now 74) — acceptable count, will reduce over time
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.5.1.2** (Low) Design documentation in two places — *Verified: `docs/design-systems/` does not exist. Only `docs/internal/design-system/` exists. No duplication.*

## 2. Technical Stack

- ✅ Accept  [✅] Fixed  [✅] Closed — **2.1** (Low) Node.js 20, upgrade to latest LTS — *Verified: `.nvmrc` = 22. All 4 serverless.yml files have `runtime: nodejs22.x` (auth, store, morphology-api, tts-api).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **2.2** (Low) 5 testing frameworks — removed Jest from shared, simplestore, frontend — *Verified: `shared`, `store`, `frontend` all use vitest. No jest dependency in any of them. Backend packages (`auth`, `tts-api`, `morphology-api`) still use Jest — correct, they're Lambda packages with different test setup.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **2.3** (Low) Bug in generate.py: ERB now uses erb_alpha — *Verified: `generate.py` line 186-187: `elif cfg_fw_alpha=='ERB': fw_coef = erb_alpha(cfg_sr)`. Function `erb_alpha` defined at line 121. Correct.*

## 3. Project Structure

- ❌ Reject (different runtimes)  —  — **3.1** (Low) Merge merlin-worker and merlin-api — different runtimes (Python/TS), different deploy (Docker/Lambda)

## 4. Code Style

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.1** (Low) if statements without curly brackets — *Verified: `curly: ['error', 'all']` in `eslint.base.config.mjs:61`. Enforced by DevBox `run-lint` hook. Lint passes clean.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **4.2** (Medium) getCorsOrigin unified — *Verified: `getCorsOrigin()` defined in `shared/src/lambda.ts`, returns `"null"` when ALLOWED_ORIGIN unset. tts-api re-exports from `@hak/shared` (`response.ts:11`). auth, store also import from shared. All consistent.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.3** (Low) `as unknown as` double type assertions — *Verified: `consistent-type-assertions: ['error', ...]` in `eslint.base.config.mjs:211`. Enforced by DevBox `run-lint` hook. Lint passes clean.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.4** (Low) Nested ternary statements — *Verified: `no-nested-ternary: 'error'` in `eslint.base.config.mjs:62`. Enforced by DevBox.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.5** (Low) Array indexes as React keys — *Verified: `react/no-array-index-key: 'error'` in `eslint.base.config.mjs:381`. Enforced by DevBox.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed — **4.6** (Low) Unused code: LoginModalProps.message, commented code in Python — *Verified: Ruff ERA001 enabled in `tts-worker/ruff.toml:15` (commented-out code). knip + DevBox `dead-code` hook active. BUT ⚠️ `LoginModalProps.message` is still declared but unused in `LoginModal.tsx:14` — knip doesn't catch unused interface properties, only unused exports/files. Minor gap.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed — **4.7** (Low) Redundant `?` and `undefined` type specifiers — *Verified: ⚠️ Rule `no-unnecessary-type-arguments` NOT found in `eslint.base.config.mjs`. Tracker says "tool enabled" but rule is missing. Either not added or added under a different name. Needs investigation.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **4.8** (Medium) Deprecated APIs — removed execCommand fallback, uses Clipboard API only — *Verified: No `execCommand` in codebase. All clipboard usage is `navigator.clipboard.writeText()`. Utility in `clipboardUtils.ts` with tests.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **4.9** (Low) Duplicate CSS selectors — *Verified: Only one `.marker-tooltip--align-center` block in `_marker-tooltip.scss:40`. No duplication.*
- ❌ Reject (not found)  —  — **4.10** (Low) Redundant return None — not confirmed in code
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.11** (Low) TODO matches — *Verified: `no-warning-comments: ['warn', ...]` in `eslint.base.config.mjs:59`. Set as `warn` (not error) — TODOs are flagged but don't block commits. Reasonable: allows dev work while tracking tech debt.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.12** (Low) Unnecessary list() calls on iterables in Python — *Verified: Ruff `PLW` rules enabled in `tts-worker/ruff.toml:17` (includes PLW0117). Enforced by DevBox `run-tests` hook for Python.*
- ❌ Reject (not found)  —  — **4.13** (Low) Unnecessary awaits — not confirmed in source code
- ❌ Reject (external lib)  —  — **4.14** (Medium) DeepRecurrentNetwork class — external Merlin library, not our code
- ❌ Reject (ML convention)  —  — **4.15** (Low) Python naming case — ML math notation convention (W_value, Whx)
- ✅ Accept  [✅] Fixed  [✅] Closed — **4.16** (Medium) SonarQube issues — *Verified: PR #661 merged. `eslint-comments/require-description: 'error'` confirmed in config. 30+ rules migrated to .ts/.tsx. QS section in tracker documents all changes. Lint passes clean.*
- ❌ Reject (external lib)  —  — **4.17** (Medium) Merlin NN Python style issues — external library code
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.18** (Medium) Floating point equality checks in worker.py — *Verified: Ruff `PLR2004` enabled in `tts-worker/ruff.toml:18`. Catches magic-value comparisons like `speed == 1.0`. Enforced by DevBox.*

## 5. Simplicity & Patterns

- ✅ Accept  [✅] Fixed  [✅] Closed — **5.1** (Low) S3 utilities duplicated between shared and merlin-api — *Verified: `tts-api/src/s3.ts` imports `buildS3Url`, `checkFileExists`, `isNotFoundError` from `@hak/shared`. No local S3 utility duplication.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **5.2** (Low) LambdaResponse and createResponse duplicated across packages — *Verified: `auth`, `store`, `morphology-api` all import from `@hak/shared`. `tts-api` re-exports via `response.ts`. No local duplication of LambdaResponse/createResponse.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **5.3** (Low) Removed `if True:` indentation hack in run_merlin.py — *Verified: No `if True:` found anywhere in `tts-worker/*.py`. Removed.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **5.4** (Low) HTTP_STATUS duplicated across packages — *Verified: `auth`, `store` import `HTTP_STATUS` from `@hak/shared`. `tts-api` re-exports via `response.ts`. No local HTTP_STATUS definitions.*

## 6. Maintainability

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **6.1** (High) pnpm test:all silently skips merlin-worker Python tests — *Verified: DevBox `run-tests` hook in `devbox.yaml:163` runs `node devbox test`. tts-worker listed as `type: pytest` module at line 20-25 with `.venv/bin/pytest` command. Python tests now included in every commit.*

## 7. Error Handling

- ✅ Accept  [✅] Fixed  [✅] Closed — **7.1** (Low) simplestore now uses extractErrorMessage from shared — *Verified: `store/src/core/store.ts:8` imports `extractErrorMessage` from `@hak/shared`. Used at line 197. No local error extraction logic.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **7.2** (Low) merlin-api and vabamorf-api now use inlined structured logger — *Verified: morphology-api re-exports `logger` from `@hak/shared` via `logger.ts`. tts-api uses `createInternalError()` from shared (handles logging internally). `console.log` only in `local-server.ts` (dev-only, eslint-disabled).*

## 8. Testing

- ❌ Reject (wrong)  —  — **8.1** (High) Python tests not in CI — WRONG, they ARE in build-merlin-worker.yml
- ✅ Accept  [✅] Fixed  [✅] Closed — **8.2.1** (Medium) Test duplications in simplestore — *Verified: 20 test files in `store/test/`, organized by concern (handler, routes, validation, integration, adapters, etc.). No true duplication — complementary layers.*
- ❌ Reject (intentional)  —  — **8.2.2** (Low) Auth context 6 test files — intentional organization by concern

## 9. CI/CD

- ✅ Accept  [✅] Fixed  [✅] Closed — **9.1** (Low) Dockerfile now uses WORKDIR instead of RUN cd — *Verified: `tts-worker/Dockerfile` uses `WORKDIR` at lines 19, 66, 69. No `RUN cd` found.*
- ❌ Reject (by design)  —  — **9.2** (Low) Serverless v3/v4 mismatch — by design, documented in README (cost decision)
- ✅ Accept  [✅] Fixed  [✅] Closed — **9.3** (Medium) Deploy workflows — *Verified: ARCHITECTURE.md has "## CI/CD & Deployment" section with workflow table (build.yml, deploy.yml, build-merlin-worker.yml, terraform.yml, e2e.yml, release.yml). Substantive.*

## 10. Configuration

- ✅ Accept  [✅] Fixed  [✅] Closed — **10.1** (Low) merlin-api README lists wrong auth info (COGNITO vars unused) — *Verified: `tts-api/README.md` endpoint table shows "Auth: None" for both endpoints. No COGNITO references.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **10.2** (Medium) Empty-string ECS env vars — *Verified: `tts-api/src/env.ts` has strict validation for all env vars: SQS_QUEUE_URL, S3_BUCKET (regex), ECS_CLUSTER, ECS_SERVICE — all throw descriptive errors on empty/missing.*

## 11. Dependencies

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **11.1** (Medium) Unused dependencies — *Verified: `knip.json` configured at repo root. DevBox `dead-code` hook at `devbox.yaml:257` runs on every commit. knip detects unused exports/files/dependencies.*

## 12. Security

- ❌ Reject (by design)  —  — **12.1** (High) No auth on /synthesize, /warmup — BY DESIGN, documented in README
- ✅ Accept  [ ] Fixed  [ ] Closed — **12.2** (Medium) Shared throttling — DEFERRED, requires client decision on authentication first
- ✅ Accept  [✅] Fixed  [✅] Closed — **12.3** (Medium) CORS behavior unified — *Verified: Same as 4.2. `getCorsOrigin()` in `@hak/shared` returns `"null"` when ALLOWED_ORIGIN unset. All packages use it.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed — **12.4** (Medium) OS Command Injection via shell=True — *Verified: Ruff S602 enabled in `ruff.toml`. TDD tests exist in `test_safe_subprocess.py`. BUT ⚠️ `generate.py:73` still uses `shell=True` in `subprocess.Popen()`. Fix NOT applied to production code — only tests written. Needs actual fix.*
- ✅ Accept  [🛡️] Fixed  [⚠️] Closed — **12.5** (Medium) pickle.load — Ruff S301 — *Verified: Ruff S301 (pickle) enabled in `ruff.toml`. BUT ⚠️ `run_merlin.py:100` still uses `pickle.load()` without checksum verification, AND file is in `merlin/` dir which is excluded from ALL ruff rules (`per-file-ignores: "merlin/**" = ["ALL"]`). Rule doesn't protect this file. No SHA-256 verification added.*
- ❌ Reject (duplicate)  —  — **12.6** (Medium) CORS misconfiguration — duplicate of 12.3
- ✅ Accept  [✅] Fixed  [✅] Closed — **12.7** (Medium) Added cacheKey validation in worker.py — *Verified: `worker.py:78` has `VALID_CACHE_KEY = re.compile(r"^[a-f0-9]{64}$")`. Line 113: `VALID_CACHE_KEY.match(cache_key)` with descriptive ValueError. Tests in `test_worker.py` cover valid/invalid cacheKeys.*

## 13. Performance

- ✅ Accept  [✅] Fixed  [✅] Closed — **13.1** (Medium) DNN model now cached in memory via _model_cache dict — *Verified: `run_merlin.py:92` has `_model_cache = {}`. Lines 97-101: check cache before `pickle.load`, store after load. Avoids redundant disk I/O.*
- ❌ Reject (appropriate)  —  — **13.2** (Medium) SQS 1 message/cycle — sequential TTS processing, batching needs threading

## 14. Domain Logic

- ✅ Accept  [✅] Fixed  [✅] Closed — **14.1** (Low) Rename modules to reflect domain, not technology — *Verified: Folders renamed in PR #664: `simplestore`→`store`, `tara-auth`→`auth`, `merlin-api`→`tts-api`, `merlin-worker`→`tts-worker`, `vabamorf-api`→`morphology-api`. All present in `packages/`. ⚠️ Docs (ARCHITECTURE.md, README.md) still use old names (see 1.3.2).*

## 15. Our Own Findings (not in Mikk's review)

- ✅ Accept  [✅] Fixed  [⚠️] Closed — **15.1** (Medium) Removed /warmup endpoint entirely — *Verified: No `warmup` in `tts-api/src/` or `serverless.yml`. Handler and config clean. BUT ⚠️ `tts-api/README.md` still lists `/warmup` endpoint (line 18), warmup rate limit (line 39), and ECS_CLUSTER/ECS_SERVICE env vars "for warmup" (lines 49-50). README not updated.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **15.2** (Medium) merlin-api README says "Cognito JWT" auth but code has AuthorizationType: NONE — *Verified: `tts-api/README.md` now says "Auth: None" for all endpoints + "All endpoints are public by design". No Cognito/JWT references.*
- ✅ Accept  [✅] Fixed  [⚠️] Closed — **15.3** (Low) Applied shell injection fix in run_merlin.py — *Verified: `run_merlin.py` lines 337/351 use `subprocess.run(args, check=True)` with argument lists (safe). BUT ⚠️ `run_process` still imported at line 53 (dead import). And `generate.py:73` still has `shell=True` in `subprocess.Popen` (see 12.4). Partial fix.*
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.4** (Medium) Remove /status/{cacheKey} from public access — DEFERRED permanently, frontend depends on this endpoint
- ✅ Accept  [✅] Fixed  [⚠️] Closed — **15.5** (Medium) Reduce MAX_TEXT_LENGTH from 1000 to 100 chars — *Verified: `tts-api/src/schemas.ts:6` has `MAX_TEXT_LENGTH = 100` with Zod `.max()`. `worker.py:77` has `MAX_TEXT_LENGTH = 100`. BUT ⚠️ Frontend textarea has NO `maxLength` attribute and no user-facing character limit message. Tracker claims "frontend textarea maxLength + user-facing message" — not implemented. Users will only see an error after submit.*

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

- [x] **QS-1** Fix `eslint.base.config.mjs` — TS file block (`**/*.ts`) now inherits ALL rules from JS block: `sonarRules`, `securityRules`, `regexpRules`, `unicornRules`, `promiseRules`, `eslintCommentsRules`. Same for `**/*.tsx`. All 30+ previously-missing rules enabled with practical thresholds. (PR #661)
- [x] **QS-2** Verify `sonarjs/cognitive-complexity` works on `.ts` — enabled with threshold 20 for src, 30 for TSX. 9 sonarjs rules active on .ts files. (PR #661)
- [x] **QS-3** Verify `regexp/*` rules work on `.ts` — 5 regexp rules now active on .ts files. ReDoS check active. (PR #661)
- [x] **QS-4** Verified: `npx eslint --print-config` confirms 9 sonarjs + 10 security + 5 regexp + 13 promise rules present on .ts files. (PR #661)

### CSS/SCSS Linting (Missing)

- [x] **QS-5** Add Stylelint — installed `stylelint` + `stylelint-config-standard-scss`, added to `pnpm lint` script (enforced by DevBox `run-lint` hook). Minimal config: `no-duplicate-selectors`, `declaration-block-no-duplicate-properties`.
- [x] **QS-6** Configured `.stylelintrc.json` with `postcss-scss` syntax and target rules. All SCSS files pass clean.

### Python Type Checking (Missing)

- [x] **QS-7** Add mypy to merlin-worker — installed, added to `requirements-test.txt`. Runs on `worker.py` + `tests/` (external `merlin/` library excluded). All 5 files pass clean.
- [x] **QS-8** mypy integrated into `pnpm lint` script — enforced by DevBox `run-lint` hook on every commit.

### SonarQube False Positives (No Action)

- ~~shared/src/logger.ts:27 empty arrow function~~ — intentional NO_OP for filtered log levels
- ~~api-client/src/generated/*.ts interface names~~ — auto-generated from OpenAPI, lowercase by spec
- ~~merlin-worker /tmp paths in tests~~ — test fixtures only

### SonarQube Valid but Low Priority

- [x] **QS-9** Refactor vmetajson.ts:62 — extracted `handleStdoutData()` and `handleProcessExit()` methods from `init()`, reducing cognitive complexity
- [x] **QS-10** ~~Fix duplicate CSS `monospace`~~ — FALSE POSITIVE: `monospace, monospace` is an intentional normalize.css hack for browser font rendering
- [x] **QS-11** Fix duplicate `.eki-results-section` selector — merged nested styles from line 470 into first block at line 165
- [x] **QS-12** Fix `api-client/scripts/generate.mjs:52` — replaced `execSync` with `execFileSync` (no shell interpolation, eliminates OS command injection risk)
- [x] **QS-13** Fix Docker root user in `vabamorf-api/Dockerfile.local` — added `USER appuser` directive matching production Dockerfile
- [x] **QS-14** Fix regex ReDoS in `tara-auth/cognito-client.ts:66` — added `.` to excluded chars in middle group, eliminating backtracking ambiguity

---

## Public API Security Hardening

Ref: `internal/PROPOSAL-Auth-Public-Endpoints.md`

Endpoints `/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` are public. Authentication proposal sent to client (pending decision). Below: what we must do regardless to harden the public setup.

### Cost & Scaling Limits
- [x] **PUB-1** (CRITICAL) AWS Budgets — *Verified: `infra/budgets.tf` has `aws_budgets_budget` with Project=HAK tag filter, 4 notifications (70%, 90%, 100% actual + 100% forecasted) → SNS alerts. ✅ Code matches description. 🧪 Needs functional test (TEST-5).*
- [x] **PUB-2** (CRITICAL) ECS max_capacity hard cap — *Verified: `infra/merlin/main.tf:373` has `max_capacity = var.ecs_max_capacity` (dev=0, prod=cap). ✅ Code matches. 🧪 Needs functional test (TEST-2).*
- [x] **PUB-3** (CRITICAL) Lambda concurrency limits — *Verified: `tts-api/serverless.yml:76` has `reservedConcurrency: 3`. `morphology-api/serverless.yml:48` has `reservedConcurrency: 3`. ✅ Code matches (PR #666). 🧪 Needs functional test (TEST-3).*
- [x] **PUB-4** (HIGH) SQS queue depth cap — *Verified: `tts-api/src/sqs.ts` has `checkQueueDepth()` with `GetQueueAttributesCommand`, `MAX_QUEUE_DEPTH = 50`, `QueueFullError`. Handler catches it → 503. ✅ Code matches. 🧪 Needs functional test (TEST-6).*
- [x] **PUB-5** (HIGH) Reduce MAX_TEXT_LENGTH — *Verified: See 15.5. Backend enforced (100 chars). ⚠️ Frontend missing `maxLength` attribute (see 15.5).*

### Monitoring & Detection
- [x] **PUB-6** (HIGH) CloudWatch alerts — *Verified: `infra/cloudwatch-alarms.tf` has alarms for SQS depth (`merlin_sqs_depth`), ECS tasks (`merlin_ecs_high_tasks`), WAF blocked (`waf_blocked_requests`), plus API 5xx/4xx, Lambda errors, DynamoDB throttling, latency. All → SNS. ✅ Code matches. 🧪 Needs functional test (TEST-4).*
- [x] **PUB-14** (CRITICAL) Account-level budget + alerts — *Cannot verify locally: in separate infra repo (`terraform/budget.tf`, PR #27). Description says $200/month, SNS every 10% + 100% forecasted. 🧪 Needs manual verification in infra repo.*
- [x] **PUB-15** (HIGH) Daily Cost Digest Lambda — *Cannot verify locally: in separate infra repo (`lambdas/cost-digest/index.py` + `terraform/cost-digest.tf`, PR #27). 🧪 Needs manual verification in infra repo.*
- ~~**PUB-16**~~ (MEDIUM) WAF kill switch (auto-block all traffic on budget breach) — discussed and rejected. With concurrency limits, geo-blocking, and rate limits already in place, automatic WAF block is unnecessary and risks false positives.

### Attack Surface Reduction
- [x] **PUB-9** (HIGH) Per-path WAF rate limit for `/synthesize` — *Verified: `infra/waf.tf` rule "rate-limit-synthesize" (priority 2): `rate_based_statement` limit=20, `scope_down_statement` on `/api/synthesize`. ✅ Code matches.*
- [x] **PUB-10** (MEDIUM) Geo-blocking — *Verified: `infra/waf.tf` rule "geo-restrict-synthesize" (priority 3): `and_statement` with `/api/synthesize` path match + `not_statement { geo_match_statement { country_codes = ["EE", "LV", "LT", "FI", "SE", "DE", "PL", "NO", "DK"] } }`. ✅ Code matches.*

### Storage
- ~~**PUB-13**~~ (LOW) S3 audio lifecycle — not worth the complexity, audio files are small. Skip.

### Deferred (decided not to do now)
- [ ] **PUB-7** (HIGH) Anomaly detection + auto-ban — bot pattern detection. **How:** new Lambda + EventBridge cron (every 5 min), reads CloudWatch logs, adds IPs to WAF IP set. Separate development effort.
- [ ] **PUB-8** (MEDIUM) Audit and forensics — CloudWatch Logs Insights saved queries. **How:** manual setup in AWS Console, save Top-10 IPs, hourly distribution, atypical User-Agents.
- [ ] **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work. **How:** AWS WAF Bot Control (~$10/month) or custom proof-of-work header in frontend. Separate evaluation needed.
- [ ] **PUB-12** (MEDIUM) Request fingerprinting — device fingerprint + session token. **How:** frontend code change (canvas/screen/timezone hash as header) + backend validation. Separate development effort.

### Testing & Verification
- [ ] **TEST-1** (CRITICAL) Load testing — normal (10 users) and attack (100+ req/min) scripts. **How:** k6 or Artillery scripts in `scripts/` directory.
- [ ] **TEST-2** (CRITICAL) Auto-scaling testing — verify ECS max_capacity behavior. **How:** run TEST-1 attack script, observe ECS task count in CloudWatch.
- [ ] **TEST-3** (CRITICAL) Lambda concurrency testing — verify limits and 429 responses. **How:** concurrent requests via k6, check for 429 (not 500).
- [ ] **TEST-4** (HIGH) Alert testing — simulate each alert, verify Slack delivery < 5 min. **How:** manual trigger of CloudWatch alarms.
- [ ] **TEST-5** (HIGH) Budget limit testing — verify AWS Budget alarm + auto-action. **How:** set test budget to $0.01 in staging, verify trigger.
- [ ] **TEST-6** (HIGH) SQS queue depth testing — fill queue to threshold, verify 503 + recovery. **How:** send burst of synthesis requests, verify PUB-4 cap works.
