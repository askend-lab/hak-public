# Project Deep Audit — Round 2

**Date:** 2026-02-23
**Tools used:** knip (unused deps/exports), manual grep scans, serverless.yml analysis

---

## 1. Unused Dependencies (knip)

### DEP-1 (HIGH) 7 unused production dependencies in frontend

```
@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
@tanstack/react-query
i18next-http-backend
zod
zustand
```

These add to bundle size and attack surface. Either remove or start using them.

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

### DEAD-2 (MEDIUM) Auth package entry file misconfigured

knip reports: `./src/index.ts` listed as entry in `packages/auth/package.json` but file not found. Auth uses `src/handler.ts` directly via serverless.yml.

---

## 3. Serverless Configuration Gaps

### SLS-1 (MEDIUM) No timeout configured for auth and store Lambdas

| Package | timeout | memorySize |
|---------|---------|------------|
| tts-api | 5-30s per function | default (128MB) |
| morphology-api | 30s | 1024MB |
| auth | **default (6s)** | **default (128MB)** |
| store | **default (6s)** | 512MB |

Auth and store use AWS default 6s timeout. TARA token exchange involves external HTTP call — 6s may be tight.

### SLS-2 (MEDIUM) No X-Ray tracing configured

No `tracing` configuration in any serverless.yml. X-Ray would provide distributed tracing across Lambda → DynamoDB → S3 → SQS.

### SLS-3 (LOW) No reserved concurrency limits

No `reservedConcurrency` on any Lambda. During traffic spikes, one noisy function could consume all account-level concurrency (1000 default).

---

## 4. Frontend Silent Catches (14 locations)

### SILENT-1 (HIGH) 14 parameterless catch blocks in production frontend code

| File | Count | Risk |
|------|-------|------|
| useSharedTaskAudio.ts | 3 | Audio errors hidden |
| useAudioPlayback.ts | 3 | Audio errors hidden |
| useSynthesisOrchestrator.ts | 2 | Synthesis errors hidden |
| usePronunciationVariants.ts | 1 | API errors hidden |
| context.tsx (auth) | 1 | Token refresh failure hidden |
| storage.ts (auth) | 1 | localStorage parse error hidden |
| token.ts (auth) | 1 | JWT decode error hidden |
| SpecsPage.tsx | 1 | Data load error hidden |
| main.tsx | 1 | Sentry init failure (acceptable) |

Only `main.tsx` Sentry catch is justified. The rest should at minimum log warnings.

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

## Summary Table

| Category | HIGH | MEDIUM | LOW |
|----------|------|--------|-----|
| Dependencies | 1 | 1 | 1 |
| Dead Code | 1 | 1 | 0 |
| Serverless Config | 0 | 2 | 1 |
| Silent Catches | 1 | 0 | 0 |
| React Patterns | 0 | 1 | 1 |
| Audio Resources | 0 | 1 | 0 |
| **Total** | **3** | **6** | **3** |

---

## Recommended Priority Order

1. **DEP-1** — Remove 7 unused frontend dependencies (reduces bundle + attack surface)
2. **DEAD-1** — Remove unused exports (reduces confusion, improves tree-shaking)
3. **SILENT-1** — Add logging to 13 silent catches (1 Sentry catch is OK)
4. **SLS-1** — Set explicit timeouts for auth (15s) and store (10s)
5. **DEP-2** — Clean up 37 unused devDependencies
6. **REACT-1** — Fix array index keys in TagsInput/TagsList
7. **SLS-2** — Enable X-Ray tracing
8. **DEAD-2** — Fix auth package.json entry
