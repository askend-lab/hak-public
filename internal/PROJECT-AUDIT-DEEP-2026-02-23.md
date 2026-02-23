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

### SLS-2 (MEDIUM) No X-Ray tracing configured

No `tracing` configuration in any serverless.yml. X-Ray would provide distributed tracing across Lambda → DynamoDB → S3 → SQS.

### SLS-3 (LOW) No reserved concurrency limits

No `reservedConcurrency` on any Lambda. During traffic spikes, one noisy function could consume all account-level concurrency (1000 default).

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

### REACT-1 (MEDIUM) Array index used as React key (3 locations)

```
TagsInput.tsx:105    <input key={index} ...
TagsInput.tsx:121    <div key={index} ...
TagsList.tsx:35      <div key={index} ...
```

If tags are reordered/deleted, React will misidentify elements.

### REACT-2 (LOW) setTimeout in focus management

`AddToTaskDropdown.tsx:137` uses `setTimeout(() => searchInputRef.current?.focus(), 100)` — fragile timing-based focus. Should use `requestAnimationFrame` or `useEffect` with ref callback.

---

## 6. Audio Resource Management

### AUDIO-1 (MEDIUM) 9 locations set `audio.src = ""` for cleanup

Pattern: `currentAudioRef.current.src = ""` used to stop playback. This is correct but combined with silent catches means failed cleanup goes unnoticed. The `URL.revokeObjectURL` calls (20 locations) appear balanced with `URL.createObjectURL` calls (3 locations) — cleanup looks correct.

---

## 7. Code Duplication

### DUP-1 (MEDIUM) useSharedTaskAudio.ts ≈ useAudioPlayback.ts (~250 lines each)

These two hooks share ~90% identical logic (audio playback, abort control, synthesis polling). Only differences are whether `entries` is passed as argument or from parent context. Should be extracted into a shared `useAudioPlaybackCore` hook.

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
| Dependencies | ~~1~~ | ~~1~~ | 1 | ✅ DEP-1, DEP-2 |
| Dead Code | ~~1~~ | ~~1~~ | 0 | ✅ DEAD-1, DEAD-2 |
| Serverless Config | 0 | ~~1~~+1 | 1 | ✅ SLS-1 |
| Silent Catches | ~~1~~ | 0 | 0 | ✅ SILENT-1 |
| React Patterns | 0 | 1 | 1 | |
| Audio Resources | 0 | 1 | 0 | |
| Code Duplication | 0 | 1 | 0 | |
| **Total** | **0** | **4** | **2** | **6 fixed** |

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

## Remaining Priority Order

1. **DUP-1** — Extract shared audio playback hook (~250 lines dedup)
2. **REACT-1** — Fix array index keys in TagsInput/TagsList
3. **SLS-2** — Enable X-Ray tracing
4. **SLS-3** — Set reserved concurrency limits
5. **AUDIO-1** — Audio cleanup observability
6. **DEP-3** — Add `@testing-library/jest-dom` to root package.json
