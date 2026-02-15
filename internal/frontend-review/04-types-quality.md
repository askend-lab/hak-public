# Type Safety & Code Quality (Findings 61–80)

## Type Safety

### 61. `as unknown as Task` casts throughout `SimpleStoreAdapter`
`SimpleStoreAdapter.ts:85,135,141,150,173` — five double-casts bypassing TypeScript entirely. Should use Zod or runtime validation.

### 62. `SimpleStoreResponse` is too loose
`SimpleStoreAdapter.ts:9-14` — `item?: { data: Record<string, unknown> }` — every consumer must cast. Define typed response interfaces per endpoint.

### 63. `SentenceState.phoneticText` has triple-optional type
`synthesis.ts:11` — `phoneticText?: string | null | undefined` — three ways to represent "no value". Pick one convention.

### 64. `updateSentence` accepts `Record<string, unknown>`
`useSynthesisOrchestrator.ts:142` — loses all type safety. Should be `Partial<SentenceState>`.

### 65. `Task.entries` is required in interface but treated as optional everywhere
`task.ts:10` — `entries: TaskEntry[]` is non-optional, but `TaskRepository.ts:23` uses `task.entries?.length || 0` and line 146 uses `task.entries ?? []`.

### 66. `Task.createdAt` is `Date` in interface but `string` from API
`task.ts:11` — `createdAt: Date` but DynamoDB returns ISO strings. `TaskRepository.ts:24` does `new Date(task.createdAt)` in `toSummary`, but raw tasks have `createdAt` as string.

### 67. `AppModalsProps.taskHandlers` is a deeply nested inline type
`AppModals.tsx:23-51` — 30 lines of inline type definition. Extract into a shared type or use `ReturnType<typeof useTaskHandlers>`.

### 68. `getErrorMessage` returns string but callers don't distinguish error types
`getErrorMessage.ts:8-10` — collapses all error types into a string. Network, validation, and runtime errors become indistinguishable.

### 69. `SynthesizeResponse.status` includes "cached" but `StatusResponse.status` doesn't
`synthesize.ts:13` — `"processing" | "ready" | "cached"` vs line 19 `"processing" | "ready" | "error"`. Different types for the same concept.

### 70. `handleAddTask` callback signature doesn't match naming
`useTaskCRUD.ts:70` — `async (title: string, description: string)` but `AddEntryModal` calls it as `onAdd` — naming conflict between "add task" (create) and "add entry" (to existing).

## Code Quality / KISS

### 71. `sanitizeFilename` splits into array incorrectly for Unicode
`downloadTaskAsZip.ts:13-15` — `.split("").slice(0, 80).join("")` breaks surrogate pairs. Use `Array.from(text).slice(0, 80).join("")`.

### 72. `CONTENT_TYPE_JSON` imported from feature module into data layer
`SimpleStoreAdapter.ts:6` imports from `analyzeApi.ts`. Data layer shouldn't import from a feature module. Move constant to shared.

### 73. `formatDate` uses `const` arrow functions instead of `function` declarations
`formatDate.ts:13,25` — inconsistent with codebase style which uses `function` declarations. Less readable and prevents hoisting.

### 74. `a11y-dev.ts` has module-level side effect
`a11y-dev.ts:91-93` — `window.runA11yAudit = runPageAudit` runs on import. Side effects on import are an anti-pattern.

### 75. `initActivityListeners` uses `initialized` module flag
`warmAudioWorker.ts:41-54` — `let initialized = false` as singleton guard. Breaks in test environments where module state persists between tests.

### 76. `useDropdownPosition` hardcodes `250` as estimated menu width
`useDropdownPosition.ts:99` — magic number for initial position estimate. Should be a named constant.

### 77. `ShareService.shareUserTask` is redundant
`ShareService.ts:18-28` — wraps `this.storage.saveTaskAsUnlisted(task)` with logging. `TaskRepository.createTask` already calls `saveTaskAsUnlisted` directly. Double save on creation.

### 78. `generateShareToken` is re-exported through `ShareService`
`ShareService.ts:14-16` — instance method that calls the module-level function. Unnecessary indirection.

### 79. `SIMPLE_STORE_BASE_URL = "/api"` is hardcoded
`SimpleStoreAdapter.ts:16` — should be an environment variable for flexibility across environments.

### 80. Build timestamp hardcoded as comment in `main.tsx:74`
`main.tsx:74` — `// Build 20260209115004` — manual timestamp, stale immediately after any commit. Should be injected by build system.
