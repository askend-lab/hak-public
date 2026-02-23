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

### DEP-2 (MEDIUM) 37 unused devDependencies across packages

Notable: `serverless-domain-manager` in 3 packages, `serverless-esbuild` in 2, `serverless-offline` in 2, many old ESLint plugins in frontend. Full list in knip output.

### DEP-3 (LOW) 1 unlisted dependency

`@testing-library/jest-dom` used in `jest.setup.ts` but not in root `package.json`.

---

## 2. Dead Code / Unused Exports (knip)

### DEAD-1 (HIGH) 32 unused exports across the monorepo

**Backend:**
- `healthHandler` in `auth/src/handler.ts` — just added but serverless.yml references it, knip false positive (serverless entry not in knip config)
- `LambdaResponse` type in `morphology-api/src/validation.ts` — only re-exported, never imported
- `AnalyzeRequest/Response`, `VariantsRequest/Response` types in morphology-api schemas
- `SynthesizeResponse`, `StatusResponse`, `HealthResponse` types in tts-api schemas
- `UpsertFields` type in store core

**Frontend (24 unused exports):**
- 6 unused icon components: `DownloadIcon`, `ChevronUpIcon`, `ChevronLeftIcon`, `ShareIcon`, `CheckIcon`, `Icon`
- `refreshTokens` function in auth context
- `CONSENT_KEY` in CookieConsent
- `warmAudioWorker`, `pingMerlinOnActivity` — exported but only used internally
- `decodeJwtPayload`, `TOKEN_EXPIRY_BUFFER_SECONDS` in auth token utils
- `CONTENT_TYPE_JSON` in analyzeApi
- `useUserId`, `useDropdownPosition` hooks
- `runPageAudit` in a11y-dev utils
- Multiple unused type exports

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

## Summary Table

| Category | HIGH | MEDIUM | LOW | Fixed |
|----------|------|--------|-----|-------|
| Dependencies | ~~1~~ | 1 | 1 | ✅ DEP-1 |
| Dead Code | 1 | ~~1~~ | 0 | ✅ DEAD-2 |
| Serverless Config | 0 | ~~1~~+1 | 1 | ✅ SLS-1 |
| Silent Catches | ~~1~~ | 0 | 0 | ✅ SILENT-1 |
| React Patterns | 0 | 1 | 1 | |
| Audio Resources | 0 | 1 | 0 | |
| Code Duplication | 0 | 1 | 0 | |
| **Total** | **1** | **5** | **2** | **4 fixed** |

---

## Completed Fixes

| Finding | PR | Status |
|---------|-----|--------|
| DEP-1 — Remove 7 unused deps | #681 | ✅ merged |
| SLS-1 — Explicit Lambda timeouts | #681 | ✅ merged |
| DEAD-2 — Fix auth package.json | #681 | ✅ merged |
| SILENT-1 — Log 12 silent catches | #682 | ✅ merged |

## Remaining Priority Order

1. **DEAD-1** — Remove 32 unused exports (reduces confusion, improves tree-shaking)
2. **DUP-1** — Extract shared audio playback hook (~250 lines dedup)
3. **DEP-2** — Clean up 37 unused devDependencies
4. **REACT-1** — Fix array index keys in TagsInput/TagsList
5. **SLS-2** — Enable X-Ray tracing
6. **SLS-3** — Set reserved concurrency limits
7. **AUDIO-1** — Audio cleanup observability
