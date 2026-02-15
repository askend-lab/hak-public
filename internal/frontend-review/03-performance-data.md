# Performance & Data Management (Findings 41–60)

## Performance

### 41. `useSynthesisOrchestrator` creates new callbacks on every render
`useSynthesisOrchestrator.ts:37-98` — `playSingleSentence`, `synthesizeAndPlay`, `synthesizeWithText` wrapped in `useCallback` but have 5-6 dependencies each, recreating on almost every state change.

### 42. `JSON.stringify(contentDeps)` in `useDropdownPosition` runs every render
`useDropdownPosition.ts:108` — O(n) serialization per render if `contentDeps` contains objects.

### 43. `useSharedTaskAudio` has stale closure risk
`useSharedTaskAudio.ts:179` — `handlePlayAll` reads `isPlayingAll`/`isLoadingPlayAll` from closure. Due to `useCallback` dependencies, these may be stale during rapid clicks.

### 44. `warmAudioWorker` registers 4 global event listeners that never get cleaned up
`warmAudioWorker.ts:48-53` — `mouseenter`, `keydown`, `touchstart`, `scroll` listeners added globally, never removed. Stacks in test environments.

### 45. `downloadTaskAsZip` loads entire audio files into memory simultaneously
`downloadTaskAsZip.ts:95-113` — batches of 4 audio blobs kept in memory until ZIP is generated. 100 entries × 5MB = 500MB.

### 46. `SynthesisPageProvider` creates new objects on every render
`SynthesisPageContext.tsx:67-85` — `handleUseVariant`, `handleTagMenuOpen`, `handleTagMenuClose` are arrow functions not wrapped in `useCallback`. Every consumer re-renders.

### 47. `Dashboard` loads all user tasks on mount just to count them
`Dashboard.tsx:100-102` — fetches full task list to compute `taskCount` and `entryCount`. A `/count` endpoint would avoid transferring all data.

### 48. `convertTextToTags` called redundantly
`synthesis.ts:91-96` — called every time text is analyzed, not memoized. Called again in `useSynthesisOrchestrator.ts:106` for the same text.

### 49. `normalizeTags` uses `Array.shift()` which is O(n)
`synthesis.ts:82` — copies entire array. Negligible for small arrays but suboptimal pattern.

### 50. `sentences` array passed as prop triggers deep comparison issues
`App.tsx:98-100` — new array reference on every state update, causing `SynthesisPageProvider` and all children to re-render.

## Data Management

### 51. `createTask` generates `shareToken` for every task
`TaskRepository.ts:78` — every task gets a share token and is saved as unlisted (line 84). Private, never-shared tasks are publicly accessible via token. Should generate on first share.

### 52. No input validation in `TaskRepository.createTask`
`TaskRepository.ts:46-86` — `taskData.name` used directly. No length check, no XSS sanitization, no empty string check.

### 53. `addTextEntriesToTask` doesn't validate entry count
`TaskRepository.ts:134-183` — no limit on entries per task. Could add thousands, bloating the DynamoDB item.

### 54. `updateTask` spread operator can overwrite critical fields
`TaskRepository.ts:106-109` — `{ ...existingTask, ...updates }` — if `updates` contains `id`, `userId`, `shareToken`, they'd be silently overwritten. Should whitelist allowed fields.

### 55. `SimpleStoreAdapter` doesn't handle 401/403
`SimpleStoreAdapter.ts:48,71,98,119` — checks `response.ok` but doesn't distinguish 401 (need re-auth) from 500 (server error). Should trigger token refresh on 401.

### 56. No data validation on API responses
`SimpleStoreAdapter.ts:78` — `const result = await response.json()` — blindly trusts server response shape. No runtime validation.

### 57. `Task.entries` can contain entries from different tasks after merge
`TaskRepository.ts:171-173` — new entries get correct `taskId` while existing entries might have stale values if the task was copied.

### 58. `toSummary` creates `Date` objects that may be invalid
`TaskRepository.ts:24-25` — `new Date(task.createdAt)` — if `createdAt` is not a valid date string, creates `Invalid Date`.

### 59. No rate limiting on client side for API calls
Users can spam the synthesize button rapidly, creating many concurrent requests. No debounce on `synthesizeAndPlay`.

### 60. `consumeCopiedEntries` reads stale state
`CopiedEntriesContext.tsx:31-36` — captures `copiedEntries` in a closure via `useCallback([copiedEntries])`. Rapid calls may return stale data.
