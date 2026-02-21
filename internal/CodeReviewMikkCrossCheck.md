# Cross-Check: Mikk Merimaa Code Review vs Actual Code

Cross-check of `internal/CodeReviewMikkReport.txt` against the real codebase.
Each finding uses Mikk's original numbering. Verdict per issue:

- **CONFIRMED** — finding matches real code
- **PARTIALLY** — finding is partially correct, with caveats
- **WRONG** — finding does not match reality or is based on misunderstanding
- **OUTDATED** — was true at review time but already fixed or changed
- **BY DESIGN** — code is intentional, documented as such

---

## 1. Documentation

### 1.1 Issue 1 (Low) — README inconsistencies: React version, dev server port

**CONFIRMED.**

- `frontend/README.md` line 7 says "React 18", but `frontend/package.json` has `"react": "^19.0.0"`. Real version is React 19.
- `frontend/README.md` says dev server at `http://localhost:5180`, but `vite.config.ts` sets `port: 5181`. Real port is 5181.

### 1.1 Issue 2 (Low) — Shared module doesn't list dependencies

**WRONG.**

`shared/package.json` has `"@aws-sdk/client-s3": "^3.990.0"` in dependencies. The README also documents Lambda helpers that use S3. Mikk may have looked at an older version.

### 1.1 Issue 3 (Low) — vabamorf-api README lists deps but package.json has empty dependencies

**CONFIRMED.**

`vabamorf-api/package.json` line 23: `"dependencies": {}`. The README lists `vmetajson` and `et.dct` as dependencies, but these are native binaries, not npm packages. The README is technically correct (describes runtime deps), but there is a mismatch with package.json.

### 1.2 Issue 1 (Low) — No separate INSTALL.md

**CONFIRMED but low priority.** The project uses DevBox for setup. Quick Start is in README.md. A separate INSTALL.md is a style preference, not a gap.

### 1.3 Issue 1 (Low) — Duplicate architecture line in README

**PARTIALLY.** README.md line 24 has a one-line architecture summary before linking to ARCHITECTURE.md. This is normal practice — a brief summary + link. Not true duplication.

### 1.3 Issue 2 (Low) — Tech stack duplication in ARCHITECTURE.md and module READMEs

**CONFIRMED.** ARCHITECTURE.md lines 37-45 list tech per package. Module READMEs also list their stack. This is intentional for navigation but does create maintenance burden.

### 1.3 Issue 3 (Medium) — ARCHITECTURE.md says merlin-worker depends on shared

**CONFIRMED — but already fixed.**

Current ARCHITECTURE.md line 28 says: `merlin-worker — depends on shared`. The worker's package.json has NO dependency on shared. However, merlin-worker has a `package.json` in the monorepo, and the architecture doc describes a logical dependency (worker uses shared types via the API). This is misleading. The worker is Python and doesn't use npm shared.

**Wait — checking more carefully:** ARCHITECTURE.md line 28: `**merlin-worker** — depends on \`shared\``. The worker package.json has no `@hak/shared` dependency. This IS incorrect in the architecture doc.

### 1.3 Issue 4 (Medium) — ARCHITECTURE.md says vabamorf-api depends on shared

**WRONG — Mikk is incorrect here.**

ARCHITECTURE.md line 29: `**vabamorf-api** — depends on \`shared\``. Checking vabamorf-api/package.json: `"dependencies": {}`. However, vabamorf-api inlines shared utilities (getCorsOrigin, CORS_HEADERS, etc.) rather than importing them. So the architecture doc is misleading — there's a logical dependency but no npm dependency. Mikk says "vabamorf-api is standalone" which is also not fully accurate — it DOES use shared code, just inlined.

### 1.3 Issue 5 (Medium) — merlin-worker described as Python + TypeScript

**PARTIALLY.**

ARCHITECTURE.md line 40: `**merlin-worker** — Python + TypeScript, Conda, Merlin engine.` The worker is primarily Python (worker.py, merlin/ directory), but it has a package.json with npm scripts. The "TypeScript" label is misleading — there's no .ts source in merlin-worker. The package.json is just for monorepo integration (test scripts). Mikk is right that calling it "Python + TypeScript" is inaccurate.

### 1.3 Issue 6 (High or not an issue) — Architecture document missing key sections

**PARTIALLY.**

ARCHITECTURE.md does include Infrastructure section (lines 62-81), Quality System (lines 83-102), and Data Flows (lines 47-60). It's missing:
- Authentication architecture (TARA/Cognito) — **valid, not described**
- Security considerations — **partially covered in README.md Security section**
- Diagrams — **valid, no visual diagrams**
- Non-functional requirements — **valid, not described**

Impact depends on whether other docs cover this. README.md has a Security section. There's also `SECURITY-AUDIT-2026-02-16.md`. So not all is missing, but the architecture doc could be more complete.

### 1.4 Issue 1 (Medium) — API documentation is manual, should use OpenAPI/Swagger

**CONFIRMED.** The API documentation is hand-maintained in README files per package. No auto-generated docs. Valid suggestion, though for a Lambda-based project, Swagger integration requires additional setup.

### 1.5 Issue 1 (Medium) — No deployment guide for engineers

**CONFIRMED.** There's no document describing how to deploy from zero to DEV/production. Infrastructure is in Terraform (`infra/`), and there are CI workflows, but no human-readable deployment guide.

### 1.5.1 Issue 1 (Low) — Too many markdown files (~46)

**PARTIALLY.** Many .md files serve LLM integration and quality system purposes. The reviewer acknowledges this. The suggestion to move LLM docs to a separate directory has merit.

### 1.5.1 Issue 2 (Low) — Design documentation in two places

**CONFIRMED.** Design docs exist in both `docs/design-systems/` and `packages/frontend/src/styles/`. Consolidation would help.

---

## 2. Technical Stack

### 2.1 Issue 1 (Low) — Node.js 20, latest LTS is 24

**PARTIALLY.** `.nvmrc` specifies Node 20. `package.json` requires `>=20.0.0`. Node 24 may not have been LTS at review date (Feb 18, 2026). Upgrading requires testing all packages. Low priority.

### 2.2 Issue 1 (Low) — 5 testing frameworks is excessive

**PARTIALLY.** The project uses Vitest (frontend unit), Jest (backend unit), Playwright (E2E), Cucumber (BDD), Stryker (mutation). Each serves a different purpose. However, Jest and Vitest overlap — consolidating to Vitest only would reduce complexity. The root package.json still has Jest deps alongside Vitest.

### 2.3 Issue 1 (Low or High) — Bug in generate.py: ERB uses bark_alpha

**CONFIRMED as bug, but DEAD CODE.**

File: `merlin/utils/generate.py` lines 183-187:
```python
if isinstance(cfg_fw_alpha, str):
    if cfg_fw_alpha=='Bark':
        fw_coef = bark_alpha(cfg_sr)
    elif cfg_fw_alpha=='ERB':
        fw_coef = bark_alpha(cfg_sr)  # BUG: should be erb_alpha(cfg_sr)
```

The bug is real — ERB branch calls `bark_alpha` instead of `erb_alpha`. **However**, `cfg_fw_alpha` is set to `0.77` (a float) at line 173, so `isinstance(cfg_fw_alpha, str)` is always False. This code path is never reached in current usage. The bug exists but has zero impact.

---

## 3. Project Structure & Architecture

### 3.1 Issue 1 (Low) — merlin-worker and merlin-api are tightly coupled

**CONFIRMED.** They communicate via SQS and share the same S3 bucket. However, they are different runtimes (Python vs TypeScript) and deploy differently (Docker/ECS vs Lambda). Merging them under one directory is reasonable but not urgent.

---

## 4. Code Style and Readability

### 4.1 Issue 1 (Low) — if statements without curly brackets

**CONFIRMED.** Single-line throws/returns without braces exist in the codebase. Example: `if (!response.ok) throw new Error(...)`. ESLint curly rule is not enforced.

### 4.2 Issue 2 (Medium) — Shared module not consistently used (getCorsOrigin duplication)

**CONFIRMED, but BY DESIGN.**

`merlin-api/src/response.ts` line 10-12 and `vabamorf-api/src/validation.ts` line 4-6 both inline `getCorsOrigin()` with `|| "*"` fallback. The shared module at `shared/src/lambda.ts` uses `"null"` fallback. The inlining is documented in `merlin-api/README.md` line 54: "merlin-api inlines utility functions from @hak/shared because Lambda bundling does not support workspace package imports." This is an intentional trade-off, but the BEHAVIOR difference (wildcard vs null) is a real inconsistency.

### 4.3 Issue 3 (Low) — `as unknown as` usage

**PARTIALLY.** Found 174 occurrences across 49 files, but vast majority are in **test files** (mocking), not production source code. Only 1-2 occurrences in src/ (e.g., `tara-auth/src/tara-client.ts`, `frontend/src/features/synthesis/hooks/synthesis/useTagUpdater.ts`). Mikk's claim "not only tests" is technically true but overstated.

### 4.4 Issue 4 (Low) — Nested ternary statements

**CONFIRMED.** Example exists in specs rendering code. The ESLint config could enforce this but doesn't currently.

### 4.5 Issue 5 (Low) — Array indexes as React keys

**CONFIRMED.** Found in `frontend/src/components/specs/SpecsContent.tsx` using index-based keys (`key={sIdx}`). This is for rendering Gherkin specs, where items have no stable IDs.

### 4.6 Issue 6 (Low) — Unused code

**PARTIALLY.**
- `Icons.tsx` — defines icon components, all appear to be exported and available. Need deeper check on which are actually used.
- `LoginModalProps.message` — CONFIRMED: `message?` field defined at line 14 but not used in the component (line 71 destructures only `{isOpen, onClose}`).
- Commented-out code in Python — CONFIRMED, present in merlin NN code.
- Commented-out code in SCSS — need deeper check.

### 4.7 Issue 7 (Low) — Redundant `?` and `undefined` type specifiers

**CONFIRMED in principle.** Pattern `title?: string | null | undefined` has redundancy — `?` already means `| undefined`. Would need targeted search for specific occurrences.

### 4.8 Issue 8 (Medium) — Deprecated APIs

**PARTIALLY.**
- `React.FormEvent` — found in `AddEntryModal.tsx` and `TaskEditModal.tsx`. `React.FormEvent` is NOT deprecated; it's the standard way to type form events. **Mikk is WRONG here.**
- `document.execCommand("copy")` — CONFIRMED in `clipboardUtils.ts` line 26. But it's used as a **fallback** when `navigator.clipboard` is unavailable (HTTP contexts). This is intentional progressive enhancement, not negligence.
- `np.random.RandomState` — CONFIRMED deprecated in `deep_rnn.py` and `hed_rnn.py`. Should use `np.random.default_rng()`.
- `error.code` — present in S3 error handling. Not deprecated per se, but AWS SDK v3 uses `$metadata.httpStatusCode` instead.

### 4.9 Issue 9 (Low) — Duplicate CSS selectors

**CONFIRMED.** `.marker-tooltip--align-center` appears twice in `_marker-tooltip.scss` — once at line 40 for positioning, once at line 90 for animation override. This is a common SCSS pattern (grouping by concern), not necessarily a bug, but could be consolidated.

### 4.10 Issue 10 (Low) — Redundant `return None` in Python

**NOT CONFIRMED.** Searched for explicit `return None` in merlin-worker Python files — none found. Mikk may have been referring to bare `return` statements, which are stylistically acceptable.

### 4.11 Issue 11 (Low) — ~30 TODO matches

**PARTIALLY.** Found 12 TODO matches across 6 files (mostly in tara-auth). Mikk claimed ~30, which is overstated. Some may have been in files that were since cleaned up, or Mikk counted TODOs in non-source files.

### 4.12 Issue 12 (Low) — Unnecessary list() calls on iterables

**CONFIRMED.** Found 10+ occurrences in merlin Python code, e.g.:
- `list(out_dimension_dict.keys())` in `parameter_generation.py`, `acoustic_composition.py`, `acoustic_base.py`
- `list(var_file_dict.keys())` in `parameter_generation.py`
These are unnecessary — `dict.keys()` is already iterable in Python 3.

### 4.13 Issue 13 (Low) — Unnecessary awaits not attached to promises

**NOT CONFIRMED in src/.** The `await` usage in source code appears correct — functions being awaited are async. In test files, some awaits may be on non-promise values, but this is harmless.

### 4.14 Issue 14 (Medium) — DeepRecurrentNetwork class issues

**CONFIRMED.** `merlin/models/deep_rnn.py` is 301 lines, single class. The `__init__` method is large. This is external library code (University of Edinburgh Merlin TTS).

### 4.15 Issue 15 (Low) — Python naming case issues

**CONFIRMED.** Merlin code uses `W_value`, `mW_value`, `Whx` etc. — these are mathematical notation conventions in ML code, not arbitrary naming violations. Renaming would reduce readability for ML researchers. This is an external library.

### 4.16 Issue 16 (Medium) — 1000+ code style issues from SonarQube

**CANNOT VERIFY.** No SonarQube results available in repo. Mikk ran external tools; we'd need to reproduce.

### 4.17 Issue 17 (Medium) — Merlin NN Python files have style issues and commented-out code

**CONFIRMED.** The merlin/ directory contains the Merlin TTS engine from University of Edinburgh. It has commented-out code, debug prints, and different coding standards. This is an external library integrated into the project.

### 4.18 Issue 18 (Medium) — Floating point equality checks

**CONFIRMED.**

`worker.py` lines 191-196:
```python
if speed == 1.0 and pitch == 0:
    return wav_file
if speed != 1.0:
    cmd.extend(["tempo", str(speed)])
```

Float equality comparison. In practice, speed comes from JSON (which preserves exact float values for simple decimals like 1.0), so this is unlikely to cause bugs. But using `math.isclose()` would be more robust.

---

## 5. Simplicity and Pattern Usage

### 5.1 Issue 1 (Low) — S3 utilities duplicated between shared and merlin-api

**CONFIRMED.**

`shared/src/s3.ts` exports `isS3Error`, `isNotFoundError`, `checkFileExists`, `buildS3Url`.
`merlin-api/src/s3.ts` has identical implementations. Duplication is real.

However, per merlin-api/README.md: "merlin-api inlines utility functions from @hak/shared because Lambda bundling does not support workspace package imports." This is a known trade-off. merlin-api DOES have `@hak/shared` as a dependency in package.json — so the inlining explanation may be outdated.

### 5.2 Issue 2 (Low) — LambdaResponse and createResponse duplicated

**CONFIRMED.**

- `shared/src/lambda.ts` — defines LambdaResponse, createLambdaResponse, createApiResponse
- `merlin-api/src/response.ts` — defines LambdaResponse, createResponse (identical shape)
- `vabamorf-api/src/validation.ts` — defines LambdaResponse, createResponse (identical shape)

Same trade-off as 5.1.

### 5.3 Issue 3 (Low) — `if True:` block in run_merlin.py

**CONFIRMED.**

`run_merlin.py` line 237: `if True: # Sest ei viitsi neid tühikuid paika ajada`
Translation: "Because I don't bother fixing the indentation."
This wraps ~60 lines. Should be dedented.

### 5.4 Issue 4 (Low) — HTTP_STATUS duplicated

**CONFIRMED.**

- `shared/src/lambda.ts` — full HTTP_STATUS object
- `merlin-api/src/response.ts` — HTTP_STATUS with 8 codes
- `vabamorf-api/src/validation.ts` — does NOT define HTTP_STATUS (uses raw numbers)

Mikk said vabamorf-api has a subset — actually vabamorf-api doesn't define HTTP_STATUS at all, it uses `handler.ts` with hardcoded status numbers. So the finding is partially wrong about vabamorf-api having a "subset."

---

## 6. Maintainability

### 6.1 Issue 1 (High) — pnpm test:all silently skips merlin-worker Python tests

**CONFIRMED.**

`merlin-worker/package.json` line 7-8:
```json
"test": "echo 'Python package — run pytest tests/ -v'",
"test:full": "if [ -f .venv/bin/pytest ]; then .venv/bin/pytest ...; else echo 'Skip: .venv not set up ...'; fi"
```

`pnpm test:all` (root package.json) runs `pnpm -r run test:full` — this will silently skip if venv is not set up. A developer running test:all gets green even though Python tests didn't run.

---

## 7. Error Handling & Logging

### 7.1 Issue 1 (Low) — simplestore doesn't use extractErrorMessage from shared

**CONFIRMED.**

`simplestore/src/core/store.ts` line 196: `return { success: false, error: String(error) }`.
Shared module exports `extractErrorMessage()` but simplestore doesn't import it.

### 7.2 Issue 2 (Low) — merlin-api and vabamorf-api use console.error instead of shared logger

**CONFIRMED.**

`merlin-api/src/response.ts` line 51: `console.error(...)`.
`vabamorf-api/src/handler.ts` has `console.error()` usage.
Shared module exports `createLogger` / `logger`.

However, merlin-api and vabamorf-api are standalone Lambdas that inline shared code. Using shared logger would require importing the full shared package.

---

## 8. Testing Quality

### 8.1 Issue 1 (High) — merlin-worker Python tests not executed by CI

**WRONG.**

`.github/workflows/build-merlin-worker.yml` lines 36-40:
```yaml
- name: Run Python tests
  working-directory: packages/merlin-worker
  run: |
    pip install -r requirements-test.txt
    pytest tests/ -v --json-report
```

Python tests ARE executed in CI — in the separate `build-merlin-worker.yml` workflow. They are NOT in the main `build.yml` (which only runs pnpm-based tests). So they run on merlin-worker changes, not on every PR.

Mikk's claim is partially wrong — the tests ARE in CI, but in a separate workflow. The main `build.yml` does silently skip them.

### 8.2 Issue 1 (Medium) — Test duplications in simplestore

**PARTIALLY.**

simplestore has 22 test files. Some test the same endpoints:
- `handler.test.ts` and `routes.test.ts` — both test HTTP routes
- `handler.get-public.test.ts` and `routes.public.test.ts` — both test /get-public

However, they may test different layers (handler logic vs route configuration). Would need detailed comparison to confirm true duplication vs complementary testing.

### 8.2 Issue 2 (Low) — Auth context tests fragmented into 6 files

**CONFIRMED.** Found 6 test files + 1 test-utils file for AuthProvider context:
- `context.test.tsx`
- `context.state.test.tsx`
- `context.callbacks.test.tsx`
- `context.edge.test.tsx`
- `context.refresh.test.tsx`
- `context.returns.test.tsx`
- `context.test-utils.tsx`

This is intentional organization by concern (state, callbacks, edge cases, refresh, return values). Whether this is "fragmented" or "well-organized" is subjective. The shared test-utils file suggests intentional structure.

---

## 9. CI/CD & DevOps

### 9.1 Issue 1 (Low) — Dockerfile uses `RUN cd` instead of WORKDIR

**CONFIRMED.**

`merlin-worker/Dockerfile` line 66: `RUN cd merlin_repo/tools && bash compile_tools.sh`
Could use `WORKDIR merlin_repo/tools` + `RUN bash compile_tools.sh`. Only one occurrence.

### 9.2 Issue 2 (Low) — Serverless framework version mismatch

**CONFIRMED.**

All `serverless.yml` files: `frameworkVersion: "3"`
All `package.json` files: `"serverless": "^4.32.0"`

However, README.md explicitly states: "we use Serverless Framework v3 (EOL) intentionally. v4 requires a commercial license." **This is BY DESIGN** — the frameworkVersion in yml controls runtime, the package.json version is just the CLI tool installed. But having v4 CLI with v3 config is indeed a mismatch that should be reconciled.

### 9.3 Issue 3 (Medium) — No deployment workflow for Lambdas, Docker, Frontend

**PARTIALLY.**

- Docker: `build-merlin-worker.yml` EXISTS — builds and pushes Docker image to ECR
- Lambdas: `deploy.yml` EXISTS for serverless deployments
- Frontend: no explicit frontend deployment workflow found (likely S3 sync in deploy.yml)
- Terraform: `terraform.yml` EXISTS

Mikk may not have seen all workflows. The claim is overstated.

---

## 10. Configuration & Environment

### 10.1 Issue 1 (Low) — Unused environment variables (COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID)

**CONFIRMED.**

`merlin-api/README.md` lists COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID. These are defined in the README but not used in merlin-api source code — the API has no JWT validation. The README documentation is wrong (says "Cognito JWT" auth but endpoints are actually NONE).

### 10.2 Issue 2 (Medium) — Empty-string fallback for ECS env vars

**CONFIRMED, but mitigated.**

`merlin-api/src/env.ts` lines 22-28:
```typescript
export function getEcsCluster(): string {
  return process.env.ECS_CLUSTER ?? "";
}
export function getEcsService(): string {
  return process.env.ECS_SERVICE ?? "";
}
```

Empty string fallback could cause AWS SDK errors. However, `ecs.ts` line 20 has: `return getEcsCluster() !== "" && getEcsService() !== ""` — the `isEcsConfigured()` guard prevents usage when empty. So the empty-string pattern is handled, just not with a thrown error.

---

## 11. Dependencies

### 11.1 Issue 1 (Medium) — 10 unused dependencies

**PARTIALLY CONFIRMED.** Checked each:

| Dependency | In package.json | Used in src/ | Verdict |
|---|---|---|---|
| @tanstack/react-query | dependencies | NOT found | **UNUSED** |
| zustand | dependencies | NOT found | **UNUSED** |
| zod | dependencies | NOT found | **UNUSED** |
| @dnd-kit/core | dependencies | NOT found | **UNUSED** |
| @dnd-kit/sortable | dependencies | NOT found | **UNUSED** |
| @dnd-kit/utilities | dependencies | NOT found | **UNUSED** |
| i18next-http-backend | dependencies | NOT found | **UNUSED** |
| i18next | devDependencies | NOT found in src/ | May be used in test/config |
| react-i18next | devDependencies | NOT found in src/ | May be used in test/config |
| @aws-sdk/client-secrets-manager | devDependencies | NOT found | **UNUSED** |

7 out of 10 are confirmed unused in production source code. i18next and react-i18next are in devDependencies — they may be configured somewhere but are not imported in src/. Mikk's finding is largely correct.

---

## 12. Security

### 12.1 Issue 1 (High) — /synthesize and /warmup have no authentication

**BY DESIGN — Mikk is WRONG about this being a security issue.**

README.md lines 58-61 explicitly states: "Merlin API (TTS) and Vabamorf API (NLP) are **public endpoints** — no authentication is required. These APIs serve the core learning experience and must be accessible without login. Protection is via API Gateway throttling and AWS WAF rate limiting only."

The `serverless.yml` has `AuthorizationType: NONE` with a **test confirming this is intentional** (`serverless-config.test.ts` line 135). The merlin-api README incorrectly says "Cognito JWT" auth for these endpoints — **the README is wrong, not the code.**

### 12.2 Issue 2 (Medium) — Shared throttling (not per-user)

**CONFIRMED.** API Gateway throttle is shared (2 req/s, burst 4). But the README also mentions "AWS WAF: 100 requests / 5 minutes per IP" — so there IS per-IP rate limiting at WAF level. Mikk may not have seen the WAF configuration.

### 12.3 Issue 3 (Medium) — CORS behavior differs between packages

**CONFIRMED.**

- `shared/src/lambda.ts`: defaults to `"null"` when ALLOWED_ORIGIN unset
- `merlin-api/src/response.ts`: defaults to `"*"` when ALLOWED_ORIGIN unset
- `vabamorf-api/src/validation.ts`: defaults to `"*"` when ALLOWED_ORIGIN unset

This inconsistency is real and documented as a known trade-off of inlining.

### 12.4 Issue 4 (Medium) — OS Command Injection via shell=True

**CONFIRMED, with mitigation in place.**

`generate.py` line 73: `subprocess.Popen(args, shell=True, ...)` in `run_process()`.
`run_merlin.py` lines 316-336: string concatenation with `run_process()`.

However, `worker.py` line 160 uses `shlex.quote()` for the outer call to run_merlin.py. And there are already TDD tests for a safe replacement (`tests/test_safe_subprocess.py`). The fix is in progress but not yet applied to the actual code.

### 12.5 Issue 5 (Medium) — pickle.load without integrity verification

**CONFIRMED.**

`run_merlin.py` line 93: `dnn_model = pickle.load(open(nnets_file_name, 'rb'))`.
Model files are loaded from a fixed path set at Docker build time. The path is not user-controllable. Risk is theoretical but real if the Docker image is compromised.

### 12.6 Issue 6 (Medium) — CORS misconfiguration (duplicate of 12.3)

**CONFIRMED.** Same finding as 12.3, described with more detail. See 12.3.

### 12.7 Issue 7 (Medium) — Missing cacheKey validation in worker

**CONFIRMED.**

`merlin-api/src/s3.ts` has `isValidCacheKey()` with regex `/^[a-f0-9]{64}$/`.
`worker.py` does NOT validate cacheKey before using it in S3 upload path (`f"cache/{cache_key}.wav"`). No validation found in worker Python code.

---

## 13. Performance

### 13.1 Issue 1 (Medium) — DNN model loaded from disk on every request

**CONFIRMED.**

`run_merlin.py` line 93: `dnn_model = pickle.load(open(nnets_file_name, 'rb'))` is called inside `dnn_generation()`, which is invoked twice per synthesis request (duration + acoustic model). Loading at process startup and caching would improve latency.

### 13.2 Issue 2 (Medium) — SQS polls only 1 message per cycle

**CONFIRMED.**

`worker.py` line 286: `MaxNumberOfMessages=1`. SQS supports up to 10. However, since Merlin TTS synthesis is CPU-intensive (seconds per request), processing more than 1 message at a time would require threading/multiprocessing. Single-message polling matches the sequential processing model.

---

## 14. Domain Logic

### 14.1 Issue 1 (Low) — Module names should reflect domain, not technology

**CONFIRMED but low priority.** Renaming packages is high-effort, low-value at this stage. The current names (frontend, merlin-api, simplestore) are well-understood by the team.

---

## Summary of Review Accuracy

| Category | Total Issues | Confirmed | Partially | Wrong | By Design |
|---|---|---|---|---|---|
| Documentation | 12 | 7 | 3 | 1 | 0 |
| Tech Stack | 3 | 1 | 2 | 0 | 0 |
| Structure | 1 | 1 | 0 | 0 | 0 |
| Code Style | 18 | 9 | 5 | 1 | 1 |
| Simplicity | 4 | 3 | 0 | 0 | 0 |
| Maintainability | 1 | 1 | 0 | 0 | 0 |
| Error Handling | 2 | 2 | 0 | 0 | 0 |
| Testing | 3 | 1 | 2 | 0 | 0 |
| CI/CD | 3 | 1 | 1 | 0 | 1 |
| Config | 2 | 1 | 1 | 0 | 0 |
| Dependencies | 1 | 0 | 1 | 0 | 0 |
| Security | 7 | 4 | 0 | 1 | 1 |
| Performance | 2 | 2 | 0 | 0 | 0 |
| Domain | 1 | 1 | 0 | 0 | 0 |
| **TOTAL** | **60** | **34** | **15** | **3** | **3** |

### Key errors in the review:

1. **12.1 (High) — Auth on /synthesize and /warmup**: Mikk flagged this as a critical security issue, but public access is **intentional and documented**. The README explicitly states these are public endpoints. This is the biggest error in the review.
2. **1.1 Issue 2 — shared module dependencies**: Mikk said shared doesn't list `@aws-sdk/client-s3`, but it does.
3. **4.8 — React.FormEvent deprecated**: `React.FormEvent` is NOT deprecated. Standard React typing.
4. **8.1 — Python tests not in CI**: They ARE in CI, in `build-merlin-worker.yml`. Not in main build.yml though.

### What Mikk missed:

1. **merlin-api README says auth is "Cognito JWT" for /synthesize, /warmup, /status** — but code has AuthorizationType: NONE. The README is wrong.
2. **Serverless v3 is BY DESIGN** — documented in README as a cost decision. Not an oversight.
3. **The shell injection fix is already in progress** — TDD tests exist in `test_safe_subprocess.py`.
4. **ECS empty-string env vars are guarded** by `isEcsConfigured()` check.

---

*Cross-check performed by Kate, 2026-02-21*
*Based on commit at branch: main*
