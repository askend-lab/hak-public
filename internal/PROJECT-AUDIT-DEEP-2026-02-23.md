# Project Deep Audit — Round 2

**Date:** 2026-02-23
**Tools used:** knip (unused deps/exports), manual grep scans, serverless.yml analysis

---

## 1. Unused Dependencies (knip)

### DEP-1 ~~(HIGH)~~ ✅ FIXED — 7 unused production dependencies removed

```
@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
@tanstack/react-query
i18next-http-backend
zod
zustand
```

Removed in PR #681. Also cleaned up corresponding `manualChunks` entries in `vite.config.ts`.

### DEP-2 ~~(MEDIUM)~~ ✅ PARTIALLY FIXED — 6 unused devDependencies removed

Removed `i18next`, `react-i18next`, `chai`, `@types/chai`, `nyc`, `ts-node` from frontend devDependencies (PR #684).

Remaining 31 are false positives: Serverless Framework plugins (`serverless-domain-manager`, `serverless-esbuild`, `serverless-offline`), ESLint plugins (used by DevBox base config), `@playwright/test` (e2e), `@types/react` (TS types), DevBox tools (`gitleaks`, `husky`, `madge`, `stylelint`).

### DEP-3 (LOW) 1 unlisted dependency

`@testing-library/jest-dom` used in `jest.setup.ts` but not in root `package.json`.

---

## 2. Dead Code / Unused Exports (knip)

### DEAD-1 ~~(HIGH)~~ ✅ FIXED — 32 unused exports cleaned up (PR #684)

**Removed (dead code):**
- 5 unused icon components, `warmAudioWorker` function, `getMarkerBySymbol` function
- Unused `Icon` re-export, `CONTENT_TYPE_JSON` re-export

**Un-exported (used internally only):**
- `CONSENT_KEY`, `refreshTokens`, `decodeJwtPayload`, `TOKEN_EXPIRY_BUFFER_SECONDS`, `LOCALE_ET`
- `pingMerlinOnActivity`, `runPageAudit`
- `MorphologyInfoSchema`, `VariantSchema`, `MAX_TTL_SECONDS`, `MAX_DATA_SIZE_BYTES`, `adapterManager`
- `TEST_ECS_CLUSTER`, `TEST_ECS_SERVICE`

**Removed unused barrel re-exports:**
- `auth/services/index.ts`: `AuthStorage`, `cognitoConfig`, `getLoginUrl`, `getLogoutUrl`, `exchangeCodeForTokens`
- `onboarding/components/index.ts`: `WizardTooltip`
- `hooks/index.ts`: `useUserId`, `useDropdownPosition`

Only `healthHandler` remains — knip false positive (referenced by serverless.yml).

### DEAD-2 ~~(MEDIUM)~~ ✅ FIXED — Auth package entry file

Removed invalid `main` and `types` fields from `packages/auth/package.json` — auth is a serverless Lambda, not a library. Fixed in PR #681.

---

## 3. Serverless Configuration Gaps

### SLS-1 ~~(MEDIUM)~~ ✅ FIXED — Explicit timeouts for auth and store

| Package | timeout | memorySize |
|---------|---------|------------|
| tts-api | 5-30s per function | default (128MB) |
| morphology-api | 30s | 1024MB |
| auth | **15s** ✅ | **default (128MB)** |
| store | **10s** ✅ | 512MB |

Set explicit timeouts: 15s for auth (TARA token exchange involves external HTTP), 10s for store (DynamoDB ops). Fixed in PR #681.

### SLS-2 ~~(MEDIUM)~~ ✅ FIXED — X-Ray tracing enabled (PR #689)

Added `tracing: lambda: true` to all 4 serverless.yml files, `apiGateway: true` for REST API services (simplestore, tara-auth), and xray IAM permissions.

### SLS-3 ~~(LOW)~~ ✅ FIXED — Reserved concurrency limits set (PR #689, #693)

Prod-only concurrency via SLS v3 `${var, null}` fallback (dev uses shared unreserved pool).
Simplestore: 50, merlin synthesize/status: 25, health: 5, vabamorf: 25, tara-auth functions: 10, health: 5.

---

## 4. Frontend Silent Catches (14 locations)

### SILENT-1 ~~(HIGH)~~ ✅ FIXED — 12 silent catches now log warnings

Added `logger.warn()` from `@hak/shared` to 12 parameterless catch blocks. Fixed in PR #682.

| File | Count | Status |
|------|-------|--------|
| useSharedTaskAudio.ts | 3 | ✅ logged |
| useAudioPlayback.ts | 3 | ✅ logged |
| useSynthesisOrchestrator.ts | 2 | ✅ logged |
| context.tsx (auth) | 1 | ✅ logged |
| storage.ts (auth) | 1 | ✅ logged |
| token.ts (auth) | 1 | ✅ logged |
| SpecsPage.tsx | 1 | ✅ logged |
| usePronunciationVariants.ts | 1 | Already had logger.error |
| main.tsx | 1 | Sentry init (acceptable) |

Also added error-path test for SpecsPage to maintain 95% coverage.

---

## 5. React Patterns

### REACT-1 ~~(MEDIUM)~~ ✅ FIXED — Array index keys replaced (PR #689)

Replaced `key={index}` with stable content-based keys using `buildTagKeys()` helper in TagsList and TagsInput.

### REACT-2 ~~(LOW)~~ ✅ FIXED — requestAnimationFrame for focus (PR #691)

Replaced `setTimeout(..., 100)` with `requestAnimationFrame` in `AddToTaskDropdown.tsx` for reliable focus management.

---

## 6. Audio Resource Management

### AUDIO-1 ~~(MEDIUM)~~ ✅ FIXED — Audio cleanup observability added (PR #689)

Added `revokeAndLog()` helper with debug-level logging to all `URL.revokeObjectURL` and `audio.src` cleanup paths. Each cleanup now logs reason (ended, error, abort, play-failure, catch) and entry ID.

---

## 7. Code Duplication

### DUP-1 ~~(MEDIUM)~~ ✅ FIXED — Shared audio playback hook extracted (PR #689)

Created `useAudioPlaybackCore` (258 lines). `useAudioPlayback` reduced from 246 → 46 lines, `useSharedTaskAudio` from 250 → 22 lines. ~250 lines deduplication, 10 new core tests, all 46 audio tests pass.

---

## 8. Code Quality Observations (positive)

- Zero `any` types in production frontend code
- Zero `@ts-ignore` / `@ts-expect-error` in production code
- Zero `dangerouslySetInnerHTML` usage
- Only 4 `eslint-disable-next-line` comments in production frontend (all justified)
- All `fetch()` calls check `response.ok`
- All `addEventListener` calls have matching `removeEventListener` cleanup
- All backend silent catches are intentional JSON parse guards

---

## Summary Table

| Category | HIGH | MEDIUM | LOW | Fixed |
|----------|------|--------|-----|-------|
| Dependencies | ~~1~~ | ~~1~~ | ~~1~~ | ✅ DEP-1, DEP-2, DEP-3 |
| Dead Code | ~~1~~ | ~~1~~ | 0 | ✅ DEAD-1, DEAD-2 |
| Unused Types | 0 | 0 | 0 | ✅ TYPE-1 (42 types) |
| Serverless Config | 0 | ~~1~~ | ~~1~~ | ✅ SLS-1, SLS-2, SLS-3 |
| Silent Catches | ~~1~~ | 0 | 0 | ✅ SILENT-1 |
| React Patterns | 0 | ~~1~~ | ~~1~~ | ✅ REACT-1, REACT-2 |
| Audio Resources | 0 | ~~1~~ | 0 | ✅ AUDIO-1 |
| Code Duplication | 0 | ~~1~~ | 0 | ✅ DUP-1 |
| **Total** | **0** | **0** | **0** | **14 fixed** |

---

## Completed Fixes

| Finding | PR | Status |
|---------|-----|--------|
| DEP-1 — Remove 7 unused prod deps | #681 | ✅ merged |
| SLS-1 — Explicit Lambda timeouts | #681 | ✅ merged |
| DEAD-2 — Fix auth package.json | #681 | ✅ merged |
| SILENT-1 — Log 12 silent catches | #682 | ✅ merged |
| DEAD-1 — Remove/un-export 32 unused exports | #684 | ✅ merged |
| DEP-2 — Remove 6 unused devDependencies | #684 | ✅ merged |
| TYPE-1 — Clean up 42+ unused type exports | #685 | ✅ merged |
| DEP-3 — Add @testing-library/jest-dom + postcss-scss | #685 | ✅ merged |
| KNIP-1 — Fix knip config (redundant entry) | #685 | ✅ merged |
| DUP-1 — Extract shared useAudioPlaybackCore hook | #689 | ✅ merged |
| REACT-1 — Replace array index keys in TagsList/TagsInput | #689 | ✅ merged |
| SLS-2 — Enable X-Ray tracing for all Lambda services | #689 | ✅ merged |
| SLS-3 — Set reserved concurrency limits | #689 | ✅ merged |
| AUDIO-1 — Audio cleanup observability | #689 | ✅ merged |
| REACT-2 — requestAnimationFrame for focus management | #691 | ✅ merged |

## Remaining

All findings resolved. ✅

## Knip Status

After all fixes, `npx knip --include exports,types` reports:
- 1 unused export: `healthHandler` (false positive — referenced by serverless.yml)
- 14 unused types: all in `api-client/src/generated/*` (auto-generated, skip)
- 0 unlisted dependencies
- 0 unused files
