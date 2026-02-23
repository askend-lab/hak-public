# Project Audit — Free Search Findings

**Date:** 2026-02-23
**Scope:** Full monorepo scan — code quality, security, architecture, testing, dependencies, infrastructure

---

## 1. Code Duplication

### DUP-1 (HIGH) Audio playback hooks — 90% identical

Two hooks with nearly identical logic (~240 lines each):
- `frontend/src/features/tasks/components/TaskDetailView/hooks/useAudioPlayback.ts`
- `frontend/src/features/sharing/hooks/useSharedTaskAudio.ts`

Only difference: `useSharedTaskAudio` accepts `entries` as a parameter instead of closing over it. Should be extracted into a shared `useAudioPlaybackBase` hook.

### DUP-2 (MEDIUM) loadVersion() duplicated in 2 handlers

Identical `loadVersion()` function in:
- `tts-api/src/handler.ts`
- `morphology-api/src/handler.ts`

Both try `require("./package.json")` then `require("../package.json")`. Should be a shared utility.

### DUP-3 (LOW) store wrapAsync vs shared wrapLambdaHandler

`store/core/store.ts` has its own `wrapAsync()` pattern that overlaps with the new `wrapLambdaHandler()`. Could potentially use `AppError` types instead of string errors in `StoreResult`.

---

## 2. Security

### SEC-1 (HIGH) Unused IAM permission: AdminSetUserPassword

`auth/serverless.yml:73` grants `cognito-idp:AdminSetUserPassword` but no code calls this API. This is a violation of least-privilege IAM. Should be removed.

### SEC-2 (MEDIUM) Silent catch in SpecsPage — could hide errors

`frontend/src/components/SpecsPage.tsx:38` has `catch { /* silent */ }` — if cucumber results fail to load, user sees nothing. Should at least log a warning.

### SEC-3 (MEDIUM) Frontend audio hooks — silent catches hide network errors

Multiple `catch { }` blocks in audio playback hooks (`useSharedTaskAudio.ts`, `useAudioPlayback.ts`) silently swallow errors including network failures, auth failures, etc. Count: 6 silent catches.

### SEC-4 (LOW) Auth token parsing — no validation after decode

`frontend/src/features/auth/services/token.ts` parses JWT payload with `JSON.parse(atob(parts[1]))` — no schema validation of the decoded payload. Could be garbage data.

---

## 3. Architecture

### ARCH-1 (HIGH) CORS_HEADERS is a mutable object constant

`shared/src/lambda.ts:36` exports `CORS_HEADERS` as a plain object with `as const` on values but the object itself is mutable. Any consumer could accidentally mutate it. Should be `Object.freeze()` or a function.

### ARCH-2 (MEDIUM) morphology-api still has local LambdaResponse type

`morphology-api/src/types.ts` likely defines its own `LambdaResponse` type. The `validation.ts` already re-exports from shared, but the handler imports from `./types`. Partial migration done in ERR-6, but not fully complete.

### ARCH-3 (MEDIUM) No input validation on store route parameters

`store/src/lambda/routes.ts` extracts `key`, `id`, `type`, `prefix` from query string parameters with no length limits or character validation. Could allow injection of very long strings or special characters into DynamoDB partition keys.

### ARCH-4 (LOW) Deprecated function still exported

`shared/src/hash.ts` exports `calculateHashSync()` marked as `@deprecated` — only used in tests. Should be removed or truly deprecated via ESLint rule.

---

## 4. Testing

### TEST-G1 (HIGH) Frontend silent catches untestable

The 6+ silent `catch { }` blocks in frontend hooks make it impossible to verify error handling behavior in tests. Errors are swallowed without logging or state changes.

### TEST-G2 (MEDIUM) `as any` usage in tests — 122 matches

122 uses of `any`/`as any` across 58 files. While many are in tests (acceptable for mocking), some are in production code. Should audit production-code `any` usage.

### TEST-G3 (LOW) require() in ESM context — 14 matches

14 uses of `require()` in `.ts` files that may be ESM modules. Could cause issues with future ESM migration. Notable: `loadVersion()` uses `require()` for JSON imports.

---

## 5. Frontend-Specific

### FE-1 (HIGH) No error boundary around audio playback

Audio playback errors (network, decoding, CORS) silently fail. User sees no indication that audio failed to load or play. Should show toast/notification.

### FE-2 (MEDIUM) Auth context refresh — no retry

`frontend/src/features/auth/services/context.tsx:59` returns `false` on refresh failure with a silent catch. No retry logic, no user notification.

### FE-3 (MEDIUM) No loading/error states for specs page

`frontend/src/components/SpecsPage.tsx` catches all errors silently with `/* silent */` comment. Should display error state.

### FE-4 (LOW) 37 console.* calls across 6 files

Most are in test/dev utilities (e2e, a11y-dev, local-server), which is acceptable. But should verify none leak to production.

---

## 6. Infrastructure

### INFRA-1 (MEDIUM) No health check endpoints for store and auth

`tts-api` has a `/health` endpoint. `morphology-api` has a `/health` endpoint. `store` and `auth` Lambdas have no health check. ALB/monitoring can't verify they're responding.

### INFRA-2 (LOW) No request size limit on store Lambda

Store Lambda accepts any body size. While API Gateway has a 10MB limit, there's no application-level limit to prevent abuse. `tts-api` has `MAX_BODY_SIZE = 10_240` and `auth` has `MAX_BODY_SIZE = 1024`.

---

## 7. Code Style / Maintenance

### STYLE-1 (LOW) 61 eslint-disable comments across 40 files

While most are justified with descriptions, the count is high. Notable: `max-statements` disabled in 3 handler functions.

### STYLE-2 (LOW) Inconsistent error constant naming

- `auth/handler.ts`: removed `UNKNOWN_ERROR` (now uses `extractErrorMessage`)
- `store/routes.ts`: `HTTP_ERRORS` object
- `morphology-api/handler.ts`: `ERRORS` object
- `tts-api`: no error constants (inline strings)

---

## Summary Table

| Category | HIGH | MEDIUM | LOW |
|----------|------|--------|-----|
| Code Duplication | 1 | 1 | 1 |
| Security | 1 | 2 | 1 |
| Architecture | 1 | 2 | 1 |
| Testing | 1 | 1 | 1 |
| Frontend | 1 | 2 | 1 |
| Infrastructure | 0 | 1 | 1 |
| Code Style | 0 | 0 | 2 |
| **Total** | **5** | **9** | **8** |

---

## Recommended Priority Order

1. ✅ **SEC-1** — Remove unused `AdminSetUserPassword` IAM permission — **PR #679**
2. **DUP-1** — Extract shared audio playback hook (saves ~200 lines) — DEFERRED (larger frontend refactor)
3. **FE-1** — Add error feedback for audio playback failures
4. ✅ **ARCH-1** — Freeze CORS_HEADERS object — **PR #679**
5. **SEC-3 + TEST-G1** — Add logging to silent frontend catches
6. ✅ **DUP-2** — Extract shared `loadVersion()` utility — **PR #679**
7. ✅ **ARCH-3** — Already implemented (false positive: store validation.ts has key length, charset, data size checks)
8. ✅ **INFRA-1** — Add health check endpoints to store and auth — **PR #679**
9. ✅ **INFRA-2** — Add request body size limit to store Lambda (400KB) — **PR #679**
