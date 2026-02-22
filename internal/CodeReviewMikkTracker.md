# Code Review Tracker — Mikk Merimaa Findings

Ref: `internal/CodeReviewMikkReport.txt` (original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check)

Legend: ✅ Accept (will fix) | ❌ Reject (won't fix) | [ ] Fixed — code changed | [ ] Closed — verified done | 🛡️ — enforced by DevBox hook (won't regress)

---

## 1. Documentation

- ✅ Accept  [✅] Fixed  [ ] Closed — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181
- ❌ Reject (wrong)  —  — **1.1.2** (Low) Shared module doesn't list dependencies — finding incorrect, s3 client IS in package.json
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.2.1** (Low) No separate INSTALL.md — expanded Quick Start in root README
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.1** (Low) Duplicate architecture line in README — not real duplication (summary + link)
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs — intentional for navigation
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect)
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading)
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate)
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.3.6** (High?) Architecture doc missing key sections (auth, security, diagrams) — ARCHITECTURE.md now has Authentication & Authorization, Security Model, System Diagrams, CI/CD sections
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger — OpenAPI 3.0.3 specs now auto-generated from Zod schemas (zod-to-openapi), copied to docs/ by api-client generate script
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.5.1** (Medium) No deployment guide for engineers — docs/DEPLOYMENT.md (84 lines) covers dev + prod
- ❌ Reject (acceptable)  —  — **1.5.1.1** (Low) Too many markdown files (~46, now 74) — acceptable count, will reduce over time
- ✅ Accept  [✅] Fixed  [ ] Closed — **1.5.1.2** (Low) Design documentation in two places — no duplication found (docs/design-systems/ doesn't exist)

## 2. Technical Stack

- ✅ Accept  [✅] Fixed  [ ] Closed — **2.1** (Low) Node.js 20, upgrade to latest LTS — upgraded to nodejs22.x in all serverless.yml configs
- ✅ Accept  [✅] Fixed  [ ] Closed — **2.2** (Low) 5 testing frameworks — removed Jest from shared, simplestore, frontend
- ✅ Accept  [✅] Fixed  [ ] Closed — **2.3** (Low) Bug in generate.py: ERB now uses erb_alpha

## 3. Project Structure

- ❌ Reject (different runtimes)  —  — **3.1** (Low) Merge merlin-worker and merlin-api — different runtimes (Python/TS), different deploy (Docker/Lambda)

## 4. Code Style

- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.1** (Low) if statements without curly brackets — `curly: 'all'` ESLint rule
- ✅ Accept  [✅] Fixed  [ ] Closed — **4.2** (Medium) getCorsOrigin unified — merlin-api and vabamorf-api now return 'null' when ALLOWED_ORIGIN unset
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.3** (Low) `as unknown as` double type assertions — `consistent-type-assertions` ESLint rule
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.4** (Low) Nested ternary statements — `no-nested-ternary` ESLint rule
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.5** (Low) Array indexes as React keys — `react/no-array-index-key` ESLint rule
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.6** (Low) Unused code: LoginModalProps.message, commented code in Python — knip dead-code hook + Ruff ERA001
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.7** (Low) Redundant `?` and `undefined` type specifiers — `no-unnecessary-type-arguments` ESLint rule (tool enabled, violations pending)
- ✅ Accept  [✅] Fixed  [ ] Closed — **4.8** (Medium) Deprecated APIs — removed execCommand fallback, uses Clipboard API only
- ✅ Accept  [✅] Fixed  [ ] Closed — **4.9** (Low) Duplicate CSS selectors — merged into single .marker-tooltip--align-center block
- ❌ Reject (not found)  —  — **4.10** (Low) Redundant return None — not confirmed in code
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.11** (Low) TODO matches — 12 found (not 30 as claimed), resolve them — `no-warning-comments` ESLint rule
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.12** (Low) Unnecessary list() calls on iterables in Python — Ruff PLW0117
- ❌ Reject (not found)  —  — **4.13** (Low) Unnecessary awaits — not confirmed in source code
- ❌ Reject (external lib)  —  — **4.14** (Medium) DeepRecurrentNetwork class — external Merlin library, not our code
- ❌ Reject (ML convention)  —  — **4.15** (Low) Python naming case — ML math notation convention (W_value, Whx)
- ✅ Accept  [✅] Fixed  [ ] Closed — **4.16** (Medium) SonarQube issues — ran SonarQube, found ESLint config gap (QS-1–QS-4), all fixed in PR #661
- ❌ Reject (external lib)  —  — **4.17** (Medium) Merlin NN Python style issues — external library code
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **4.18** (Medium) Floating point equality checks in worker.py — Ruff PLR2004

## 5. Simplicity & Patterns

- ✅ Accept  [✅] Fixed  [ ] Closed — **5.1** (Low) S3 utilities duplicated between shared and merlin-api — deduplicated, merlin-api imports from @hak/shared
- ✅ Accept  [✅] Fixed  [ ] Closed — **5.2** (Low) LambdaResponse and createResponse duplicated across packages — deduplicated, all packages import from @hak/shared
- ✅ Accept  [✅] Fixed  [ ] Closed — **5.3** (Low) Removed `if True:` indentation hack in run_merlin.py
- ✅ Accept  [✅] Fixed  [ ] Closed — **5.4** (Low) HTTP_STATUS duplicated across packages — deduplicated, all packages import from @hak/shared

## 6. Maintainability

- ✅ Accept  [🛡️] Fixed  [ ] Closed — **6.1** (High) pnpm test:all silently skips merlin-worker Python tests — DevBox `run-tests` hook + merlin-worker test script fix

## 7. Error Handling

- ✅ Accept  [✅] Fixed  [ ] Closed — **7.1** (Low) simplestore now uses extractErrorMessage from shared
- ✅ Accept  [✅] Fixed  [ ] Closed — **7.2** (Low) merlin-api and vabamorf-api now use inlined structured logger

## 8. Testing

- ❌ Reject (wrong)  —  — **8.1** (High) Python tests not in CI — WRONG, they ARE in build-merlin-worker.yml
- ✅ Accept  [✅] Fixed  [ ] Closed — **8.2.1** (Medium) Test duplications in simplestore — complementary testing, not true duplication
- ❌ Reject (intentional)  —  — **8.2.2** (Low) Auth context 6 test files — intentional organization by concern

## 9. CI/CD

- ✅ Accept  [✅] Fixed  [ ] Closed — **9.1** (Low) Dockerfile now uses WORKDIR instead of RUN cd
- ❌ Reject (by design)  —  — **9.2** (Low) Serverless v3/v4 mismatch — by design, documented in README (cost decision)
- ✅ Accept  [✅] Fixed  [ ] Closed — **9.3** (Medium) Deploy workflows — added CI/CD section to ARCHITECTURE.md

## 10. Configuration

- ✅ Accept  [✅] Fixed  [ ] Closed — **10.1** (Low) merlin-api README lists wrong auth info (COGNITO vars unused)
- ✅ Accept  [✅] Fixed  [ ] Closed — **10.2** (Medium) Empty-string ECS env vars — now throw with descriptive messages

## 11. Dependencies

- ✅ Accept  [🛡️] Fixed  [ ] Closed — **11.1** (Medium) Unused dependencies — 7 of 10 confirmed unused — knip + DevBox `deps` hook

## 12. Security

- ❌ Reject (by design)  —  — **12.1** (High) No auth on /synthesize, /warmup — BY DESIGN, documented in README
- ✅ Accept  [ ] Fixed  [ ] Closed — **12.2** (Medium) Shared throttling — DEFERRED, requires client decision on authentication first
- ✅ Accept  [✅] Fixed  [ ] Closed — **12.3** (Medium) CORS behavior unified — all packages now return 'null' when ALLOWED_ORIGIN unset
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **12.4** (Medium) OS Command Injection via shell=True (TDD tests exist, fix in progress) — Ruff S602
- ✅ Accept  [🛡️] Fixed  [ ] Closed — **12.5** (Medium) pickle.load — add SHA-256 checksum verification for model files — Ruff S301
- ❌ Reject (duplicate)  —  — **12.6** (Medium) CORS misconfiguration — duplicate of 12.3
- ✅ Accept  [✅] Fixed  [ ] Closed — **12.7** (Medium) Added cacheKey validation in worker.py (64-char hex, matching API-side regex)

## 13. Performance

- ✅ Accept  [✅] Fixed  [ ] Closed — **13.1** (Medium) DNN model now cached in memory via _model_cache dict
- ❌ Reject (appropriate)  —  — **13.2** (Medium) SQS 1 message/cycle — sequential TTS processing, batching needs threading

## 14. Domain Logic

- ✅ Accept  [ ] Fixed  [ ] Closed — **14.1** (Low) Rename modules to reflect domain, not technology

## 15. Our Own Findings (not in Mikk's review)

- ✅ Accept  [✅] Fixed  [ ] Closed — **15.1** (Medium) Removed /warmup endpoint entirely (handler, serverless.yml, tests)
- ✅ Accept  [✅] Fixed  [ ] Closed — **15.2** (Medium) merlin-api README says "Cognito JWT" auth but code has AuthorizationType: NONE — README is wrong
- ✅ Accept  [✅] Fixed  [ ] Closed — **15.3** (Low) Applied shell injection fix in run_merlin.py — replaced run_process() with safe alternatives
- ✅ Accept  [ ] Fixed  [ ] Closed — **15.4** (Medium) Remove /status/{cacheKey} from public access — DEFERRED permanently, frontend depends on this endpoint
- ✅ Accept  [✅] Fixed  [ ] Closed — **15.5** (Medium) Reduce MAX_TEXT_LENGTH from 1000 to 100 chars everywhere — merlin-api Zod schema, merlin-worker Python, frontend textarea maxLength + user-facing message (PR #660)

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
- [x] **PUB-1** (CRITICAL) AWS Budgets — `aws_budgets_budget` with Project=HAK tag filter, 4 notifications (70%, 90%, 100% actual + 100% forecasted) → SNS alerts topic. In `infra/budgets.tf`.
- [x] **PUB-2** (CRITICAL) ECS max_capacity hard cap — `ecs_max_capacity` variable (default 2), SQS-based auto-scaling policy added. In `infra/merlin/main.tf`.
- [x] **PUB-3** (CRITICAL) Lambda concurrency limits — `reservedConcurrency: 3` for tts-api synthesize, `reservedConcurrency: 3` for morphology-api. In `serverless.yml` files. (Reduced from 10/20 — account pool too small, PR #666).
- [x] **PUB-4** (HIGH) SQS queue depth cap — `checkQueueDepth()` in `sqs.ts`, throws `QueueFullError` at >= 50 messages → handler returns 503. Tests added. `sqs:GetQueueAttributes` IAM permission added.
- [x] **PUB-5** (HIGH) Reduce MAX_TEXT_LENGTH — DONE in 15.5 (1000 → 100 chars)

### Monitoring & Detection
- [x] **PUB-6** (HIGH) CloudWatch alerts — SQS queue depth (>50), ECS task count (at max), WAF blocked requests (>100/5min). All → SNS alerts topic. In `infra/cloudwatch-alarms.tf`.
- [ ] **PUB-7** (HIGH) Anomaly detection + auto-ban — bot pattern detection. **How:** new Lambda + EventBridge cron (every 5 min), reads CloudWatch logs, adds IPs to WAF IP set. Separate development effort.
- [ ] **PUB-8** (MEDIUM) Audit and forensics — CloudWatch Logs Insights saved queries. **How:** manual setup in AWS Console, save Top-10 IPs, hourly distribution, atypical User-Agents.
- [x] **PUB-14** (CRITICAL) Account-level budget + alerts — $200/month, SNS alerts every 10% (ACTUAL) + 100% FORECASTED. Email: aleksei.bljahhin@gmail.com (expandable via `budget_alert_emails` variable). In infra repo `terraform/budget.tf` (PR #27).
- [x] **PUB-15** (HIGH) Daily Cost Digest Lambda — Python Lambda sends daily email at 08:00 UTC: yesterday's spend, MTD, forecast, top services. In infra repo `lambdas/cost-digest/index.py` + `terraform/cost-digest.tf` (PR #27).
- ~~**PUB-16**~~ (MEDIUM) WAF kill switch (auto-block all traffic on budget breach) — discussed and rejected. With concurrency limits, geo-blocking, and rate limits already in place, automatic WAF block is unnecessary and risks false positives.

### Attack Surface Reduction
- [x] **PUB-9** (HIGH) Per-path WAF rate limit for `/synthesize` — 20 req/5min per IP, `rate_based_statement` with `scope_down_statement` on URI path. In `infra/waf.tf`.
- [x] **PUB-10** (MEDIUM) Geo-blocking — `/synthesize` restricted to EE, LV, LT, FI, SE, DE, PL, NO, DK. WAF `geo_match_statement` with `and_statement`. In `infra/waf.tf`.
- [ ] **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work. **How:** AWS WAF Bot Control (~$10/month) or custom proof-of-work header in frontend. Separate evaluation needed.
- [ ] **PUB-12** (MEDIUM) Request fingerprinting — device fingerprint + session token. **How:** frontend code change (canvas/screen/timezone hash as header) + backend validation. Separate development effort.

### Storage
- ~~**PUB-13**~~ (LOW) S3 audio lifecycle — not worth the complexity, audio files are small. Skip.

### Testing & Verification
- [ ] **TEST-1** (CRITICAL) Load testing — normal (10 users) and attack (100+ req/min) scripts. **How:** k6 or Artillery scripts in `scripts/` directory.
- [ ] **TEST-2** (CRITICAL) Auto-scaling testing — verify ECS max_capacity behavior. **How:** run TEST-1 attack script, observe ECS task count in CloudWatch.
- [ ] **TEST-3** (CRITICAL) Lambda concurrency testing — verify limits and 429 responses. **How:** concurrent requests via k6, check for 429 (not 500).
- [ ] **TEST-4** (HIGH) Alert testing — simulate each alert, verify Slack delivery < 5 min. **How:** manual trigger of CloudWatch alarms.
- [ ] **TEST-5** (HIGH) Budget limit testing — verify AWS Budget alarm + auto-action. **How:** set test budget to $0.01 in staging, verify trigger.
- [ ] **TEST-6** (HIGH) SQS queue depth testing — fill queue to threshold, verify 503 + recovery. **How:** send burst of synthesis requests, verify PUB-4 cap works.
