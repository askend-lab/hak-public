# HAK Refactoring Plan (Round 2)

## Overview

Deep analysis of the entire HAK project identified 10 major refactoring candidates across security, architecture, CI/CD, and code quality.

## Candidates

### 🔴 CRITICAL (Security)

#### 1. AWS Credentials in Docker Build-Args
- **File:** `.github/workflows/build-merlin-worker.yml:47-50`
- **Problem:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` passed as `--build-arg` to Docker. These get baked into image layer history and are visible via `docker history`.
- **Fix:** Use Docker BuildKit secrets (`--mount=type=secret`) or multi-stage build without passing credentials into layers.
- **Status:** [x] Done — commit 3b944b6

#### 2. Auth Tokens Stored in localStorage (XSS-Vulnerable)
- **File:** `packages/frontend/src/services/auth/storage.ts`
- **Problem:** `access_token`, `id_token`, `refresh_token` stored in `localStorage`. Any XSS gives full token access. `tara-auth` backend already uses HttpOnly cookies correctly.
- **Fix:** Move access/id tokens to in-memory storage; keep only refresh_token in localStorage. On page refresh, re-obtain tokens via Cognito refresh flow.
- **Status:** [x] Done — commit 4e5e6e4

### 🟡 HIGH (Architecture / Quality)

#### 3. CORS Headers Duplicated Across 4 Packages with Inconsistencies
- **Files:** `merlin-api/src/response.ts`, `audio-api/src/response.ts`, `vabamorf-api/src/validation.ts`, `simplestore/src/lambda/routes.ts`
- **Problem:** Each package defines its own CORS headers with differences:
  - `merlin-api`: `Allow-Headers: "Content-Type,Authorization"`, `Methods: "GET,POST,OPTIONS"`
  - `audio-api`: `Allow-Headers: "Content-Type"`, `Methods: "POST, OPTIONS"` (with spaces!)
  - `vabamorf-api`: `Allow-Headers: "Content-Type,Authorization"`, `Methods: "GET,POST,OPTIONS"`
  - `simplestore`: only `Content-Type` + `Allow-Origin` (no Methods/Headers at all)
- **Fix:** Centralize CORS configuration in `@hak/shared` with variants (public/authenticated).
- **Status:** [ ] Not started

#### 4. vabamorf-api Not Using @hak/shared Lambda Utilities
- **File:** `packages/vabamorf-api/src/validation.ts:6-22`
- **Problem:** Despite `@hak/shared` being a dependency, `validation.ts` still defines its own `createResponse()` and `RESPONSE_HEADERS` locally. Missed in Refactor Round 1.
- **Fix:** Replace with `createLambdaResponse` from `@hak/shared`.
- **Status:** [ ] Not started

#### 5. tara-auth Completely Isolated from Shared Infrastructure
- **File:** `packages/tara-auth/src/handler.ts`
- **Problem:** Manually constructs response objects `{statusCode, headers, body}` without `@hak/shared`. Has hardcoded default frontend URLs. Not connected to the monorepo shared package.
- **Fix:** Add `@hak/shared` dependency, use shared response utilities, extract hardcoded URLs to env vars.
- **Status:** [ ] Not started

#### 6. App.tsx God Component — ~76 Props Drilled into SynthesisView
- **File:** `packages/frontend/src/App.tsx:155-222`
- **Problem:** App.tsx manually wires ~76 props from 6 hooks (synthesis, taskHandlers, dragDrop, variants, menu, auth) into `SynthesisView`. Extreme prop drilling.
- **Fix:** Create `SynthesisContext` so child components subscribe directly to needed state.
- **Status:** [ ] Not started

#### 7. CI Build Pipeline Runs Jest Instead of Vitest — Frontend Tests Skipped
- **File:** `.github/workflows/build.yml:116`
- **Problem:** `pnpm exec jest --passWithNoTests` — but frontend uses Vitest. Jest only covers backend packages. Frontend tests (the bulk of all tests) are NOT running in CI.
- **Fix:** Replace with `pnpm test:all` or `pnpm -r run test:full`.
- **Status:** [ ] Not started

#### 8. Docker Security Scan (Trivy) Never Blocks Build
- **File:** `.github/workflows/build.yml:157-167`
- **Problem:** Trivy scan has `exit-code: '0'` and `continue-on-error: true`. Even CRITICAL/HIGH vulnerabilities never prevent pushing to ECR.
- **Fix:** Set `exit-code: '1'` and remove `continue-on-error`.
- **Status:** [ ] Not started

### 🟢 CLEANUP

#### 9. Dead Code in SimpleStoreAdapter
- **File:** `packages/frontend/src/services/storage/SimpleStoreAdapter.ts:113-122`
- **Problem:** `findAllUserTaskKeys()` and `loadTasksByKey()` always return empty arrays. Legacy from previous architecture.
- **Fix:** Remove methods and update related test stubs.
- **Status:** [ ] Not started

#### 10. Remaining Hardcoded Estonian Strings in AppModals.tsx
- **File:** `packages/frontend/src/components/AppModals.tsx:107,144,148-153`
- **Problem:** Missed in Refactor Round 1 (ui-strings):
  - `"Lause uus häälduskuju rakendatud"` (line 107)
  - `"Sisene, et luua ja hallata ülesandeid"` (line 144)
  - `"Kustuta ülesanne"`, `"Kas oled kindel..."`, `"Kustuta"`, `"Tühista"` (lines 148-153)
- **Fix:** Add to `constants/ui-strings.ts` and replace in `AppModals.tsx`.
- **Status:** [ ] Not started

## Priority Order

1. **#1** — AWS credentials in Docker (security)
2. **#2** — Tokens in localStorage (security)
3. **#7** — CI tests gap (quality gate)
4. **#3** — CORS centralization (architecture)
5. **#4** — vabamorf-api shared (architecture)
6. **#5** — tara-auth shared (architecture)
7. **#6** — App.tsx god component (architecture)
8. **#8** — Trivy blocking (CI hardening)
9. **#9** — Dead code cleanup
10. **#10** — i18n strings cleanup
