# Security & Error Handling (Findings 21–40)

## Security

### 21. Cookie parsing via string splitting is fragile
`AuthCallbackPage.tsx:26-34` — manual cookie parsing with `.split(";")` + `.split("=")` doesn't handle all edge cases. Use a proper cookie parser or the `cookie` npm package.

### 22. No token rotation after TARA callback
`context.tsx:64-90` — `storeTokensAndSetAuth` stores tokens but doesn't schedule proactive refresh. Tokens expire silently until an API call fails.

### 23. `refreshTokens()` is a module-level export, not bound to AuthProvider
`context.tsx:38-62` — any module can call it, potentially causing race conditions with AuthProvider's state management.

### 24. `exchangeCodeForTokens` doesn't validate response shape
`config.ts:129` — `await response.json()` — no validation that `access_token`, `id_token`, `expires_in` exist. Silent `undefined` tokens if backend response changes.

### 25. `parseIdToken` treats `email` as always present
`token.ts:44` — `email: payload.email as string` — if `email` claim is missing, this becomes `undefined` cast as `string`.

### 26. In-memory tokens lost on any page refresh
`storage.ts:22-23` — access/id tokens in module-level variables. Every F5 causes a visible loading flash + extra network request.

### 27. `SIMPLE_STORE_TTL_SECONDS = 0` means private tasks never expire
`SimpleStoreAdapter.ts:17` — no cleanup mechanism if a user deletes their account.

### 28. `postJSON` doesn't send auth headers
`analyzeApi.ts:26-31` — no `Authorization` header. Works only because merlin/vabamorf are public APIs.

### 29. `warmAudioWorker` sends POST without auth
`warmAudioWorker.ts:38` — `fetch(WARMUP_API_PATH, { method: "POST" })` — no auth headers. Silent failure if auth is ever required.

### 30. `CookieConsent` only stores acceptance, never rejection
`CookieConsent.tsx:19` — only "accepted" can be stored. GDPR requires a genuine choice. Sentry should not initialize if declined.

## Error Handling

### 31. `SimpleStoreAdapter.save` throws but `saveTaskAsUnlisted` also throws
`SimpleStoreAdapter.ts:46-52` — if private save succeeds but unlisted fails, the task exists without its shared copy. Inconsistent state with no rollback.

### 32. `deleteUnlistedTask` swallows errors silently
`SimpleStoreAdapter.ts:154-158` — catches and logs, returns normally. Caller believes deletion succeeded.

### 33. `synthesizeWithPolling` doesn't pass AbortSignal to initial POST
`synthesize.ts:56` — no signal passed. User navigation doesn't cancel the POST, only polling.

### 34. `pollForAudio` doesn't handle network errors gracefully
`synthesize.ts:28-29` — network drop mid-poll throws the entire polling loop. No retry for transient failures.

### 35. `handlePlayAll` stops on first failure
`useSharedTaskAudio.ts:212` — if one entry fails, entire playlist stops. Should skip failed entries.

### 36. `ErrorBoundary` has no recovery beyond retry
`ErrorBoundary.tsx:44` — clicking "Proovi uuesti" clears error state. Corrupt data or missing API causes infinite retry loop.

### 37. `loadTask` in `SharedTaskPage` doesn't distinguish 404 from 500
`SharedTaskPage.tsx:48-60` — same UI for "task not found" and "server error". User can't troubleshoot.

### 38. `warmAudioWorker` silently swallows all network errors
`warmAudioWorker.ts:26-28` — empty `catch {}`. No way to know if warm-up is consistently failing.

### 39. `analyzeText` returns `null` for all errors
`analyzeApi.ts:43-56` — network errors, 500s, invalid JSON all return `null`. Callers can't distinguish "no analysis" from "server down".

### 40. `fetchAudioBlob` in `downloadTaskAsZip` silently skips failed downloads
`downloadTaskAsZip.ts:36-46` — returns `null` on error. ZIP has missing files with no user indication.
