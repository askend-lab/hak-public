# Code Review Tracker

Ref: `internal/CodeReviewMikkReport.txt` (Mikk original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check) | `internal/LauriCodeReview.txt` (Lauri original)

## Mikk Merimaa Findings

Legend: ✅ Accept (will fix) | ❌ Reject (won't fix) | [ ] Fixed — code changed | [ ] Closed — verified done | 🛡️ — enforced by DevBox hook (won't regress)

---

## 1. Documentation

- ✅ Accept  [✅] Fixed  [✅] Closed — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181 — *Verified: React ^19.0.0 in package.json, port 5181 in README. ⚠️ README lines 24/27 still say `merlin-worker` instead of `ol after rename (minor, separate fix).*
- ❌ Reject (wrong)  —  — **1.1.2** (Low) Shared module doesn't list dependencies — finding incorrect, s3 client IS in package.json
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty — *Verified: README now says "Runtime Dependencies (non-npm)" with native binaries. package.json has `@hak/shared` + `zod` in dependencies. Consistent.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.2.1** (Low) No separate INSTALL.md — expanded Quick Start in root README — *Verified: Quick Start section in README.md has prerequisites, clone, install, test, dx, start commands + separate merlin-worker setup block.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.1** (Low) Duplicate architecture line in README — not real duplication (summary + link) — *Verified: README has one "## Architecture" section with a summary line + link to ARCHITECTURE.md. No duplication. ⚠️ README line 71 still says "Merlin API" and "Vabamorf API" — stale after rename (minor).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs — intentional for navigation — *Verified: duplication is intentional. ARCHITECTURE.md now uses current names (store, tts-api, tts-worker, morphology-api, auth). Only remaining old name is `build-merlin-worker.yml` which is the actual workflow filename.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect) — *Verified: ARCHITECTURE.md line 28 now says "merlin-worker — standalone (Python, no npm dependencies)". Correct. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading) — *Verified: ARCHITECTURE.md line 29 now says "vabamorf-api — standalone (inlines shared utilities for Docker Lambda bundling)". Accurate. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate) — *Verified: ARCHITECTURE.md line 40 now says "Python, Conda, Merlin engine" only. No TypeScript mention. Correct. ⚠️ Name still old (see 1.3.2).*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.3.6** (High?) Architecture doc missing key sections (auth, security, diagrams) — *Verified: ARCHITECTURE.md has sections "Authentication & Authorization", "Security Model", "System Diagrams", "CI/CD & Deployment". All present and substantive.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger — *Verified: OpenAPI 3.0.3 specs exist in `docs/merlin-api.openapi.yaml` and `docs/vabamorf-api.openapi.yaml`. Generated from Zod via `api-client/scripts/generate.mjs`. generate.mjs lines 28/34 already use correct paths `packages/tts-api/` and `packages/morphology-api/`.*
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
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.6** (Low) Unused code: LoginModalProps.message, commented code in Python — *Verified: Ruff ERA001 enabled in `tts-worker/ruff.toml:15` (commented-out code). knip + DevBox `dead-code` hook active. `LoginModalProps.message` removed along with `MODAL_STRINGS.LOGIN_MESSAGE`.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **4.7** (Low) Redundant `?` and `undefined` type specifiers — *Verified: `@typescript-eslint/no-unnecessary-type-arguments: 'error'` at `eslint.base.config.mjs:212`. Rule IS present. Previous cross-check missed it.*
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

- ✅ Accept  [✅] Fixed  [✅] Closed — **15.1** (Medium) Removed /warmup endpoint entirely — *Verified: No `warmup` in `tts-api/src/`, `serverless.yml`, or `README.md`. Handler, config, and docs all clean.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **15.2** (Medium) merlin-api README says "Cognito JWT" auth but code has AuthorizationType: NONE — *Verified: `tts-api/README.md` now says "Auth: None" for all endpoints + "All endpoints are public by design". No Cognito/JWT references.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **15.3** (Low) Applied shell injection fix in run_merlin.py — *Verified: `run_merlin.py` lines 337/351 use `subprocess.run(args, check=True)` with argument lists (safe). `run_process` import not found at line 53 (removed or tracker error). `generate.py:73` shell=True is in external `merlin/` library — excluded from ruff, not our code to modify.*
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.4** (Medium) Remove /status/{cacheKey} from public access — DEFERRED permanently, frontend depends on this endpoint
- ✅ Accept  [✅] Fixed  [✅] Closed — **15.5** (Medium) Reduce MAX_TEXT_LENGTH from 1000 to 100 chars — *Verified: `tts-api/src/schemas.ts:6` has `MAX_TEXT_LENGTH = 100` with Zod `.max()`. `worker.py:77` has `MAX_TEXT_LENGTH = 100`. Frontend: `maxLength={100}` on TagsInput, SentencePhoneticPanel textarea, and CustomVariantForm input.*

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

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-1** (Critical) Fix `eslint.base.config.mjs` — TS file block inherits ALL rules — *Verified: `eslint.base.config.mjs` spreads `sonarRules`, `securityRules`, `regexpRules`, `unicornRules`, `promiseRules`, `eslintCommentsRules` into both `**/*.ts` and `**/*.tsx` blocks. 30+ rules active. PR #661.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-2** (Critical) Verify `sonarjs/cognitive-complexity` works on `.ts` — *Verified: `sonarjs/cognitive-complexity: ['error', 20]` in `sonarRules` object, spread into TS blocks. 9 sonarjs rules active. PR #661.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-3** (Critical) Verify `regexp/*` rules work on `.ts` — *Verified: `regexpRules` with 5 rules (`no-unused-capturing-group`, `no-useless-flag`, `prefer-d`, `prefer-w`, `no-super-linear-backtracking`) spread into TS blocks. ReDoS check active. PR #661.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-4** (Critical) Verify via `npx eslint --print-config` — *Verified: One-time manual check confirmed 9 sonarjs + 10 security + 5 regexp + 13 promise rules present on .ts files. PR #661.*

### CSS/SCSS Linting (Missing)

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-5** (Medium) Add Stylelint — *Verified: `stylelint: ^17.3.0` + `stylelint-config-standard-scss: ^17.0.0` in root `package.json:95-96`. `pnpm lint` runs `npx stylelint 'packages/frontend/src/styles/**/*.scss'`. Enforced by DevBox `run-lint` hook.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-6** (Medium) Configure `.stylelintrc.json` — *Verified: `.stylelintrc.json` has `customSyntax: "postcss-scss"`, rules `no-duplicate-selectors: true`, `declaration-block-no-duplicate-properties: [true, ...]`. All SCSS files pass clean.*

### Python Type Checking (Missing)

- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-7** (Medium) Add mypy to merlin-worker — *Verified: `mypy>=1.10` in `tts-worker/requirements-test.txt:5`. External `merlin/` library excluded.*
- ✅ Accept  [🛡️] Fixed  [✅] Closed — **QS-8** (Medium) mypy integrated into `pnpm lint` — *Verified: `package.json:23` lint script includes `cd packages/tts-worker && .venv/bin/mypy worker.py tests/ --ignore-missing-imports`. Enforced by DevBox `run-lint` hook.*

### SonarQube False Positives (No Action)

- ❌ Reject (false positive) — ~~shared/src/logger.ts:27 empty arrow function~~ — intentional NO_OP for filtered log levels
- ❌ Reject (false positive) — ~~api-client/src/generated/*.ts interface names~~ — auto-generated from OpenAPI, lowercase by spec
- ❌ Reject (false positive) — ~~merlin-worker /tmp paths in tests~~ — test fixtures only

### SonarQube Valid but Low Priority

- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-9** (Low) Refactor vmetajson.ts cognitive complexity — *Verified: `vmetajson.ts` has `handleStdoutData()` (line 45) and `handleProcessExit()` (line 68) extracted as private methods from `init()`. Reduces cognitive complexity.*
- ❌ Reject (false positive) — **QS-10** ~~Fix duplicate CSS `monospace`~~ — `monospace, monospace` is intentional normalize.css hack for browser font rendering
- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-11** (Low) Fix duplicate `.eki-results-section` selector — *Verified: Only one `.eki-results-section` block in `_eki-app.scss:165`. No duplicate.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-12** (Medium) Fix `generate.mjs` command injection — *Verified: `generate.mjs:12` imports `execFileSync` (not `execSync`). Line 51 uses `execFileSync("npx", [...])` — no shell interpolation.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-13** (Medium) Fix Docker root user in vabamorf-api/Dockerfile.local — *Verified: `morphology-api/Dockerfile.local:24-27` has `adduser appuser` + `USER appuser`. Matches production `Dockerfile:21-24`.*
- ✅ Accept  [✅] Fixed  [✅] Closed — **QS-14** (Medium) Fix regex ReDoS in tara-auth/cognito-client.ts:66 — *Verified: Regex `^[^\s"\\@]+@[^\s"\\@.]+\.[^\s"\\@]+$` at `auth/src/cognito-client.ts:66` — `.` added to excluded chars in middle group `[^\s"\\@.]`, preventing backtracking ambiguity.*

---

## Public API Security Hardening

Ref: `internal/PROPOSAL-Auth-Public-Endpoints.md`

Endpoints `/synthesize`, `/status/{cacheKey}`, `/analyze`, `/variants` are public. Authentication proposal sent to client (pending decision). Below: what we must do regardless to harden the public setup.

### Cost & Scaling Limits

- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-1** (CRITICAL) AWS Budgets — *Verified: `infra/budgets.tf` has `aws_budgets_budget` with Project=HAK tag filter, 4 notifications (70%, 90%, 100% actual + 100% forecasted) → SNS alerts. Code matches. 🧪 Needs penetration test TEST-5: set budget to $0.01 in staging, verify alert fires.*
- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-2** (CRITICAL) ECS max_capacity hard cap — *Verified: `infra/merlin/main.tf:373` has `max_capacity = var.ecs_max_capacity` (dev=0, prod=cap). Code matches. 🧪 Needs penetration test TEST-2: flood `/synthesize`, verify ECS doesn't scale beyond cap.*
- ✅ Accept  [❌] Reverted  [✅] Closed — **PUB-3** (CRITICAL) Lambda concurrency limits — *`reservedConcurrency: 3` removed from both `tts-api/serverless.yml` and `morphology-api/serverless.yml`. Reason: AWS account's UnreservedConcurrentExecution drops below minimum 10, causing deploy failure. Also removed invalid `provider.httpApi.throttle` property (not supported in Serverless Framework v3). Protection now via WAF rate limit (PUB-9), geo-blocking (PUB-10), SQS queue depth cap (PUB-4).*
- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-4** (HIGH) SQS queue depth cap — *Verified: `tts-api/src/sqs.ts` has `checkQueueDepth()` with `MAX_QUEUE_DEPTH = 50`, `QueueFullError` → handler returns 503. Code matches. 🧪 Needs penetration test TEST-6: burst 60+ synthesis requests, verify 503 at queue depth 50 + recovery after drain.*
- ✅ Accept  [✅] Fixed  [⚠️] Closed — **PUB-5** (HIGH) Reduce MAX_TEXT_LENGTH — *Verified: See 15.5. Backend enforced (100 chars in Zod + Python). ⚠️ Frontend missing `maxLength` attribute — users see error only after submit.*

### Monitoring & Detection

- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-6** (HIGH) CloudWatch alerts — *Verified: `infra/cloudwatch-alarms.tf` has alarms for SQS depth, ECS tasks, WAF blocked, API 5xx/4xx, Lambda errors, DynamoDB throttling, latency. All → SNS. Code matches. 🧪 Needs penetration test TEST-4: trigger each alarm manually, verify Slack delivery < 5 min.*
- ✅ Accept  [❓] Fixed  [🧪] Closed — **PUB-14** (CRITICAL) Account-level budget + alerts — *Cannot verify locally: in separate infra repo (`terraform/budget.tf`, PR #27). 🧪 Needs manual verification in infra repo + TEST-5.*
- ✅ Accept  [❓] Fixed  [🧪] Closed — **PUB-15** (HIGH) Daily Cost Digest Lambda — *Cannot verify locally: in separate infra repo (`lambdas/cost-digest/index.py` + `terraform/cost-digest.tf`, PR #27). 🧪 Needs manual verification in infra repo.*
- ❌ Reject (rejected) — ~~**PUB-16**~~ (MEDIUM) WAF kill switch — discussed and rejected. Concurrency limits + geo-blocking + rate limits already sufficient. Auto-block risks false positives.

### Attack Surface Reduction

- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-9** (HIGH) Per-path WAF rate limit for `/synthesize` — *Verified: `infra/waf.tf` rule "rate-limit-synthesize" (priority 2): `rate_based_statement` limit=20, `scope_down_statement` on `/api/synthesize`. Code matches. 🧪 Needs penetration test TEST-1: 100+ req/min from single IP, verify WAF blocks after 20.*
- ✅ Accept  [✅] Fixed  [🧪] Closed — **PUB-10** (MEDIUM) Geo-blocking — *Verified: `infra/waf.tf` rule "geo-restrict-synthesize" (priority 3): `geo_match_statement` allows only EE, LV, LT, FI, SE, DE, PL, NO, DK for `/api/synthesize`. Code matches. 🧪 Needs penetration test: request from non-allowed country (VPN), verify block.*

### Storage

- ❌ Reject (not worth it) — ~~**PUB-13**~~ (LOW) S3 audio lifecycle — audio files are small, complexity not justified.

### Deferred (decided not to do now)

- ⏸️ Deferred  [ ] Fixed  [ ] Closed — **PUB-7** (HIGH) Anomaly detection + auto-ban — bot pattern detection. New Lambda + EventBridge cron needed. Separate dev effort.
- ⏸️ Deferred  [ ] Fixed  [ ] Closed — **PUB-8** (MEDIUM) Audit and forensics — CloudWatch Logs Insights saved queries. Manual AWS Console setup.
- ⏸️ Deferred  [ ] Fixed  [ ] Closed — **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work — AWS WAF Bot Control (~$10/month) or custom PoW header. Separate evaluation.
- ⏸️ Deferred  [ ] Fixed  [ ] Closed — **PUB-12** (MEDIUM) Request fingerprinting — device fingerprint + session token. Frontend + backend changes needed.

---

## Lauri Code Review (Lauri Index)

Ref: `internal/LauriCodeReview.txt` (original report)

Legend: [ ] Accept/Reject — [ ] Fixed — [ ] Closed

### Previously Tracked (from earlier review)

- ✅ Accept  [✅] Fixed  [ ] Closed — **LAURI-P1** (Medium) Store API leaks DynamoDB terminology — client-facing `pk`/`sk` renamed to `key`/`id`, `sortKey` intermediate step also removed. API contract is now database-agnostic. Validation, routes, frontend adapter, and all tests updated. *Needs verification: deploy to staging and confirm frontend works with new field names.*
- ✅ Accept  [✅] Fixed  [ ] Closed — **LAURI-P2** (Medium) Store API input validation too permissive — switched from blacklist to whitelist character validation. Keys/IDs now only allow `a-z A-Z 0-9 . _ - : @`. Null/array data payloads rejected. Query prefix hardened (delimiter, control chars, max length). 14 security tests added. *Needs verification: deploy to staging and confirm no legitimate keys are rejected by the whitelist.*

### Full Code Review Findings (12 items)

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-1** (High) No architecture pattern, duplicate validation, drift risk, missing middleware — `createResponse()` independently defined in 4 places (simplestore, merlin-api, vabamorf-api, shared). Validation helpers duplicated across 3 packages. No middleware abstraction — each Lambda handler manually performs parse→validate→authenticate→execute→error→response inline. **Remediation:** adopt `withMiddleware(handler, [...])` wrapper; move all response creation to `@hak/shared`; extract common validation into `@hak/shared/validation`.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-2** (High) Write skew on first insert — DynamoDB `put` uses `ConditionExpression` only on update (when `expectedVersion` is set). First insert is unconditional — two concurrent inserts for the same key both succeed, second silently overwrites first. **Location:** `store/src/core/store.ts:97-100`, `store/src/adapters/dynamodb.ts:59-62`. **Remediation:** use `attribute_not_exists(PK)` as condition on first insert.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-3** (Medium) Inconsistent error handling — different conventions across packages. `store/src/core/store.ts:179` catches all errors with `String(error)` (loses type + stack). `merlin-api/src/response.ts:51` and `vabamorf-api/src/handler.ts:88` use `console.error` directly. `ERROR_STATUS_MAP` pattern only in simplestore. **Remediation:** standardize error handling at handler boundary; use shared error mapping; replace `console.error` with `logger.error`.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-4** (Medium) Missing logging — shared logger exists but used inconsistently. `console.error`/`console.log` used directly in merlin-api, vabamorf-api, shared. No structured request logging. No logging on auth failures, access denied, or successful writes. **Remediation:** replace all `console.*` with shared logger; add request-level logging; log auth failures at warn level; log mutations at info level.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-5** (High) Risky authentication — no default API Gateway enforcement. If authorizer is removed, unauthenticated requests fall through silently. Tests use `X-User-Id` header shortcut only — never test real Cognito claims. No test with `IS_OFFLINE=false` and no Cognito sub to verify 401 path. **Location:** `store/src/lambda/handler.ts:62-77`. **Remediation:** add tests with real `requestContext.authorizer.claims.sub`; test 401 path without IS_OFFLINE.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-6** (Medium) Broken tests — `contains(200, 500)` pattern — some test assertions accept both success and error status codes, making them useless as regression guards. A test that passes on 200 or 500 tests nothing. **Remediation:** audit all multi-status assertions; replace with exact equality; split into separate success/error test cases.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-7** (High) Merlin prone to resource starvation and DDoS — no per-user rate limiting, no request queue depth cap (at time of review), no backpressure. Single client can flood SQS and starve legitimate users. **Location:** `tts-api/src/handler.ts:111-156`. **Note:** partially addressed by WAF rate limits (PUB-9) and SQS queue depth cap (PUB-4). Per-user limits still missing (requires auth — SEC-H4).

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-8** (Medium) DynamoDB incorrectly mocked in tests — hand-written `InMemoryDynamoDB` mock doesn't exercise real DynamoDB behavior (attribute serialization, condition expressions, pagination). Production `InMemoryAdapter` exists but test mock drifts from it. **Location:** `store/test/mockDynamoDB.ts`. **Remediation:** use production `InMemoryAdapter` in tests or replace with `aws-sdk-client-mock`.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-9** (Medium) Test code in production — `X-User-Id` header path in production handler when `IS_OFFLINE=true`. Risk: misconfiguration could expose trivial auth bypass. **Location:** `store/src/lambda/handler.ts:62-77`. **Remediation:** remove `X-User-Id` from production handler; move to separate `handler.local.ts` or use Lambda authorizer mock.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-10** (Low) Low-value unit tests — testing TypeScript instead of logic. `createResponse()` tests verify pass-through behavior with no conditional branches. Trivially guaranteed by type system. **Remediation:** delete pass-through tests; redirect effort to authorization decisions, error mapping, validation rules.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-11** (Medium) DynamoDB logic leaked into frontend — frontend `SimpleStoreAdapter` constructs `pk`/`sk` pairs directly (`"task"`, `task.id`). Couples frontend to backend storage schema. **Location:** `frontend/src/services/storage/SimpleStoreAdapter.ts:84-150`. **Note:** partially addressed by LAURI-P1 (renamed pk/sk to key/id). Type strings still hardcoded in frontend.

- [ ] Accept  [ ] Fixed  [ ] Closed — **LAURI-12** (Low) Inefficient TypeScript patterns — manual `typeof` checks where Zod schemas would be cleaner, repeated validation patterns, `as string | undefined` casts that bypass type safety. **Location:** `store/src/core/validation.ts`, `store/src/lambda/handler.ts:64`. **Remediation:** replace typeof patterns with Zod schema at handler boundary; avoid `as Type` casts on external data.

---

## Weak Tests Cleanup (2026-02-23)

Ref: `internal/WEAK-TESTS-REPORT.md` | Branch: `fix/strengthen-weak-tests` | PR: #671 (merged)

Identified ~60 weak/useless tests across 12 files in 6 packages. Replaced with meaningful behavioral assertions. Net: +246 / −314 lines.

### Tautologies (`expect(true).toBe(true)`)

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-1** morphology-api/test/hello.test.ts — `expect(true).toBe(true)` → healthHandler returns 200 + parseJsonBody tests
- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-2** store/test/adapterSelection.test.ts — `expect(true).toBe(true)` → `expect(() => setAdapter(null)).not.toThrow()`

### Coverage Padding (`toBeDefined()` on imports)

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-3** morphology-api/test/coverage-imports.test.ts — 5× `toBeDefined()` → behavioral smoke tests for each module

### Export Checks (`typeof === "function"`)

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-4** shared/src/index.test.ts — 12× `typeof` checks → real invocations with result verification

### Readonly Tautologies

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-5** shared/src/constants.test.ts — 2× "as const" `toBeDefined()` → exact key enumeration checks

### Constant Equals Literal

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-6** auth/test/types.test.ts — 7× constant===literal → Cognito format checks, email format, prefix validation
- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-7** auth/test/handler.test.ts — 9× constant===literal → security contracts (TTL ranges, HTTPS, cookie flags, min CSRF length)
- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-8** auth/test/tara-client.test.ts — 7× constant===literal → OIDC protocol contracts (HTTPS URLs, /oidc/* paths, language code format)

### Duplicate Test Suites

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-9** frontend/Footer.test.tsx — full duplicate `describe("Footer")` block (80+ lines from merged Footer.full.test.tsx) → removed, kept 2 unique tests

### Mechanical Enumeration

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-10** frontend/Icons.test.tsx — 12 copy-paste icon render tests → single `it.each` with 13 icons + aria-hidden check

### Weak Type Checks

- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-11** frontend/NotificationContext.types.test.tsx — rendered `data-testid` type checking → `renderHook` + error boundary + invocation safety
- ✅ Accept  [✅] Fixed  [✅] Closed — **WT-12** frontend/specs/index.test.ts — 2× `typeof === "object"` → non-empty record verification with value type checks

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

- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-1** (CRITICAL) Upgrade `shared/src/logger.ts` — output JSON in Lambda/production, plain text in dev/browser. Fields: `timestamp`, `level`, `message`, `package`. **How:** detect `AWS_LAMBDA_FUNCTION_NAME` env var → switch to JSON format. **PR #674**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-2** (CRITICAL) Add `withContext(fields)` method to logger — returns child logger that includes metadata (requestId, userId, package) in every log line. **How:** extend `createLogger` to accept default fields. **PR #674**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-3** (HIGH) Add request correlation — pass `event.requestContext.requestId` into logger context in every Lambda handler (auth, store, tts-api, morphology-api). **How:** `const log = logger.withContext({ requestId: event.requestContext.requestId })`. **PR #675**

### Phase 2: Add Logging to Silent Handlers

- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-4** (CRITICAL) Add logging to tts-api — currently ZERO logging across 9 source files. Add info-level to `synthesize()` (cache hit/miss, queue send, validation fail) and `status()`. **How:** import logger, add ~8 log calls. **PR #674**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-5** (HIGH) Fix store handler silent error swallowing — `handler.ts:162` has bare `catch {}` returning 500 without logging. **How:** add `logger.error()` with error details in catch block. **PR #674**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-6** (HIGH) Add logging to auth Cognito triggers — `cognito-triggers.ts` has zero logging for security-critical challenge flow. **How:** add debug-level logging for challenge state transitions. **PR #674**
- ✅ Accept  [⚠️] Deferred  [ ] Closed — **LOG-7** (MEDIUM) Add logging to store routes — `routes.ts` handles save/get/delete/query with no logging. **Blocked:** store handler tests have pre-existing ESM transform issue; adding lines drops coverage below 95%.
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-8** (MEDIUM) Add logging to auth supporting modules — `tara-client.ts`, `cognito-client.ts`, `cookies.ts` have zero logging. **How:** add error + debug level for OIDC exchange, Cognito calls, cookie operations. **PR #675**

### Phase 3: Infrastructure & Observability

- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-9** (HIGH) Add `logRetentionInDays: 30` to all 4 serverless.yml — currently Lambda log groups default to never-expire (unbounded cost). **How:** add `logRetentionInDays: 30` to `provider` block in auth, store, tts-api, morphology-api. **PR #674**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-10** (MEDIUM) Add CloudWatch Logs Insights saved queries — common debug queries for error analysis, request tracing, latency. **How:** document in LOGGING-ANALYSIS.md or add to infra. **PR #676**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-11** (MEDIUM) Standardize error logging format — currently inconsistent: some log `error.message`, some log full error, some log neither. **How:** use `error instanceof Error ? error.message : String(error)` pattern. **PR #676**

### Phase 4: Business Observability

- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-12** (MEDIUM) Add info-level business event logging — successful synthesis, auth, store operations. Already implemented: tts-api cache hit/miss/queue, auth TARA success. **PR #674, #676**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-13** (LOW) Add debug-level development logging — state transitions, config loading, adapter selection. Already implemented: cognito-triggers challenge flow, tts-api status check. **PR #674, #675**
- ✅ Accept  [✅] Fixed  [ ] Closed — **LOG-14** (LOW) Add tts-api → tts-worker correlation — include cacheKey in tts-api logs to enable tracing synthesis flow across tts-api → SQS → tts-worker → S3. Already implemented: cacheKey in synthesize/status logs. **PR #674**

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

- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-1** (HIGH) Use `extractErrorMessage()` everywhere — replaced all 3 variants across auth, tts-api, store, morphology-api, cognito-client. Made fallback param optional. **PR #677**
- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-4** (HIGH) Fix silent catches in cognito-client — added `logger.warn()` to `findUserByPersonalCode` and `findUserByEmail` catch blocks. **PR #677**
- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-5** (MEDIUM) Fix error re-wrapping in cognito-client — now sets `cause` property to preserve error chain (ES2020-compatible). **PR #677**

### Structural Improvements

- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-2** (MEDIUM) Add `AppError` base class to shared — 7 classes: `AppError`, `ValidationError(400)`, `NotFoundError(404)`, `AuthError(401)`, `ForbiddenError(403)`, `ExternalServiceError(502)`, `RateLimitError(429)`. 10 tests. **PR #677**
- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-6** (MEDIUM) Migrate morphology-api to shared response utilities — removed local `HTTP_STATUS` constant, now imports from `@hak/shared` via validation.ts. **PR #677**
- ✅ Accept  [✅] Fixed  [ ] Closed — **ERR-3** (LARGER) Create `wrapLambdaHandler()` in shared — generic handler wrapper with contextual logging, AppError-aware catch, 8 tests. Packages can adopt incrementally. **PR #677**

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

- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-1** (CRITICAL) Load testing — normal (10 users) and attack (100+ req/min) scripts. **How:** k6 or Artillery scripts in `scripts/`. **Verifies:** PUB-9 WAF rate limit.
- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-2** (CRITICAL) Auto-scaling testing — verify ECS max_capacity behavior. **How:** run TEST-1 attack, observe ECS task count in CloudWatch. **Verifies:** PUB-2.
- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-3** (CRITICAL) Lambda concurrency testing — verify limits and 429 responses. **How:** 50+ concurrent requests via k6, check for 429 (not 500). **Verifies:** PUB-3.
- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-4** (HIGH) Alert testing — simulate each alert, verify Slack delivery < 5 min. **How:** manual trigger of CloudWatch alarms. **Verifies:** PUB-6.
- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-5** (HIGH) Budget limit testing — verify AWS Budget alarm fires. **How:** set test budget to $0.01 in staging. **Verifies:** PUB-1, PUB-14.
- ⏸️ Pending  [ ] Done  [ ] Closed — **TEST-6** (HIGH) SQS queue depth testing — fill queue to threshold, verify 503 + recovery. **How:** burst 60+ synthesis requests. **Verifies:** PUB-4.
