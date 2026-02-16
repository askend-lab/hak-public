# Code Review: Frontend (`packages/frontend`)

**Reviewer:** Luna (AI Agent)  
**Date:** 2026-02-16  
**Scope:** Security, architecture, performance, correctness  
**Stack:** React 19, Vite 7, TypeScript 5.9, Zustand, TanStack Query, Vitest, Playwright

**Excluded from findings** (documented design decisions or already addressed):
- OAuth client_id/domain visible in source → public by design, PKCE + redirect URI whitelist protect
- In-memory token storage instead of localStorage → deliberate XSS mitigation (storage.ts)
- Proxy targets pointing to dev environment → checkProxyTargets warns on prod
- `target="_blank"` links → all have `rel="noopener noreferrer"`
- No `dangerouslySetInnerHTML` usage → verified, JSX escapes all user content
- tsconfig strict mode fully enabled → excellent type safety baseline

Severity scale: 🔴 Critical · 🟠 High · 🟡 Medium  
💥 = fix is **dangerous** — unit tests won't catch regression, requires manual/integration testing

---

## 🔴 CRITICAL

- [ ] **1. TARA Auth Callback Reads Tokens from JS-Accessible Cookies**  
  **File:** `src/features/auth/pages/AuthCallbackPage.tsx:26-37`  
  **Issue:** After TARA auth, the callback reads `hak_access_token` and `hak_id_token` from `document.cookie`. These cookies **cannot** be httpOnly if JavaScript reads them — any XSS can steal them. This undermines the deliberate in-memory token strategy in `storage.ts` (which avoids localStorage specifically to prevent XSS token theft). The refresh token is correctly httpOnly, but the access/id tokens are exposed during the callback window.  
  **Fix:** Backend should pass tokens via a one-time authorization code pattern (POST to backend, receive tokens in response body) instead of setting them in JS-readable cookies. Or use a short-lived intermediate token in the cookie that the frontend exchanges server-side.

- [ ] **2. No Content-Security-Policy Headers**  
  **File:** `index.html`, infrastructure (CloudFront/S3)  
  **Issue:** No CSP meta tag in `index.html` and no CSP response headers configured anywhere. Without CSP, any XSS vulnerability can load external scripts, exfiltrate data, or inject iframes. The Google Fonts external stylesheet is the only external resource — a CSP could whitelist it. Combined with finding #1, this significantly increases XSS impact.  
  **Fix:** Add CSP headers via CloudFront response headers policy. Minimum: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://*.amazoncognito.com https://*.sentry.io; img-src 'self' data: blob:; media-src 'self' blob:`.

## 🟠 HIGH

- [ ] **3. Cognito Config Silently Falls Back to Empty Strings in Production**  
  **File:** `src/features/auth/services/config.ts:55-58`  
  **Issue:** `cognitoConfig.region`, `.userPoolId`, `.clientId`, `.domain` fall back to `""` when env vars are missing and `isLocalDev()` is false. In a misconfigured production deploy, auth silently constructs invalid URLs (`https:///login?client_id=&...`) instead of failing fast. Users see a broken redirect with no useful error.  
  **Fix:** Throw or log a visible error when required Cognito config is empty in production mode. E.g. `if (import.meta.env.PROD && !cognitoConfig.clientId) throw new Error("VITE_COGNITO_CLIENT_ID required")`.

- [ ] **4. recordToTask Unsafe Type Assertion — No Runtime Validation**  
  **File:** `src/services/storage/SimpleStoreAdapter.ts:15-25`  
  **Issue:** `recordToTask` checks only 3 fields (`id`, `userId`, `name`) then casts `data as unknown as Task`. Missing validation for `entries` (array), `speechSequences` (array), `createdAt`/`updatedAt` (dates), `shareToken` (string). If server returns malformed data (e.g. missing `entries`), the app crashes with unhelpful errors deep in component rendering (`task.entries.map` on undefined).  
  **Fix:** Use Zod schema validation (already a dependency) to parse the response, or at minimum add `Array.isArray(data.entries)` check and default to `[]`.

- [ ] **5. No Request Deduplication on Synthesis API Calls**  
  **File:** `src/features/synthesis/hooks/synthesis/useSynthesisOrchestrator.ts`  
  **Issue:** Rapid clicks on the play button trigger multiple concurrent `synthesizeAndPlay` calls for the same sentence. Each call synthesizes independently — no check if a synthesis is already in-flight for the same text. This wastes API quota and can cause race conditions where stale results overwrite fresh ones.  
  **Fix:** Track in-flight synthesis requests per sentence ID. Skip or abort duplicate requests. A simple `isLoading` guard already exists but only prevents UI double-play, not duplicate API calls.

- [ ] **6. ErrorBoundary Doesn't Report to Sentry**  
  **File:** `src/components/ErrorBoundary.tsx:27-29`  
  **Issue:** `componentDidCatch` only calls `logger.error`. Sentry is initialized in `main.tsx` but the ErrorBoundary doesn't call `Sentry.captureException(error)`. Unhandled React rendering errors are the most critical errors to track, yet they're invisible in Sentry.  
  **Fix:** Import Sentry and call `Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })` in `componentDidCatch`.

- [ ] **7. Synthesis Polling Uses Fixed Interval — No Backoff** 💥  
  **File:** `src/features/synthesis/utils/synthesize.ts:28-52`  
  **Issue:** `pollForAudio` polls every 1s for up to 30 attempts with no exponential backoff. Under load (e.g. play-all with 50 entries), this creates 50 concurrent polling chains × 1 req/s = 50 req/s sustained for 30s. The backend's Lambda concurrency and API Gateway throttling can be overwhelmed.  
  **Fix:** Use exponential backoff: `Math.min(1000 * 2^attempt, 8000)`. Also consider passing an AbortSignal to cancel polling when the user navigates away.

## 🟡 MEDIUM

- [ ] **8. useAudioPlayer Abort Listener Never Removed**  
  **File:** `src/features/synthesis/hooks/synthesis/useAudioPlayer.ts:132-136`  
  **Issue:** `playWithAbort` adds an `abort` event listener to the signal but never removes it after the audio finishes normally (onended/onerror). If the same AbortController is reused across a play-all sequence, listeners accumulate.  
  **Fix:** Store listener reference and call `abortSignal.removeEventListener("abort", handler)` in onended/onerror cleanup.

- [ ] **9. useSynthesis Memo Includes Unstable handleKeyDown Reference**  
  **File:** `src/features/synthesis/hooks/useSynthesis.ts:66-74, 128-129`  
  **Issue:** `handleKeyDown` is defined as a plain function (not `useCallback`), yet it's included in the `useMemo` dependency array. Since a new function reference is created every render, the entire memoized return object recreates on every render, defeating the purpose of `useMemo`.  
  **Fix:** Wrap `handleKeyDown` in `useCallback`, or exclude it from the memo deps and use a ref-based approach.

- [ ] **10. Warmup Ping Fires on Every Scroll Event**  
  **File:** `src/features/synthesis/utils/warmAudioWorker.ts:51`  
  **Issue:** `initActivityListeners` registers on `scroll`, which fires at very high rates during scrolling. The 60s throttle in `pingMerlinOnActivity` prevents excessive fetches, but the event handler function itself runs on every scroll frame — unnecessary CPU work for a simple timestamp comparison.  
  **Fix:** Remove `scroll` from the events list — `mouseenter`, `keydown`, `touchstart` already cover user presence. Or use a `{ passive: true, once: true }` listener that re-registers after the throttle period.

- [ ] **11. Download Filename Uses Unsanitized User Text**  
  **File:** `src/features/synthesis/hooks/synthesis/useSentenceActions.ts:105`  
  **Issue:** `a.download = \`${sentence.text || "audio"}.wav\`` uses the raw sentence text as filename. While browsers sanitize download names, the text could contain characters that create confusing filenames (newlines, excessive length, RTL characters). The `downloadTaskAsZip.ts` has a proper `sanitizeFilename` helper but single-sentence download doesn't use it.  
  **Fix:** Apply `sanitizeFilename` (or a simpler `text.replace(/[^\w\s-]/g, '').slice(0, 80)`) to the download name.

- [ ] **12. Vitest Thread Isolation Disabled**  
  **File:** `vitest.config.ts:22`  
  **Issue:** `isolate: false` means test threads share module-level state. Tests that modify global state (localStorage mocks, module-level singletons like `warmed` in warmAudioWorker) can leak between tests, causing intermittent failures depending on execution order.  
  **Fix:** Re-enable isolation (`isolate: true` or remove the line) and fix any tests that depend on shared state. If perf is a concern, use `poolOptions.forks` instead.

- [ ] **13. localStorage Writes Have No Quota Handling**  
  **File:** `src/features/synthesis/hooks/synthesis/useSentenceState.ts:141-146`  
  **Issue:** Sentence state is persisted on every change. If a user has many sentences with long text + audio URLs, the serialized JSON can exceed the ~5MB localStorage quota. The `catch` block logs the error but the user gets no feedback, and data is silently lost.  
  **Fix:** Catch `QuotaExceededError` specifically and show a notification: "Kohalik salvestusruum on täis. Mõned andmed ei pruugi salvestuda."

- [ ] **14. Shared Task URL Reveals Share Token in URL Bar**  
  **File:** `src/main.tsx:69-70`, `src/features/sharing/components/ShareTaskModal.tsx:28`  
  **Issue:** Share tokens appear in the browser URL (`/shared/task/:token`). While necessary for sharing, anyone with access to the user's browser history, Sentry breadcrumbs, or referrer headers can access the shared task. The 90-day TTL limits exposure but doesn't eliminate it.  
  **Fix:** Consider adding `Referrer-Policy: no-referrer` header for shared task pages. Ensure Sentry URL scrubbing is configured to redact share tokens from breadcrumbs.

- [ ] **15. Warmup Endpoint Has No Authentication** 💥  
  **File:** `src/features/synthesis/utils/warmAudioWorker.ts:17-19`  
  **Issue:** The `/api/warmup` POST request sends no auth token. If the backend warmup endpoint is unauthenticated, anyone can trigger Lambda warmups repeatedly, increasing costs. If the endpoint is behind Cognito authorizer, unauthenticated warmup requests fail silently and first-use latency remains.  
  **Fix:** Either add rate limiting on the backend warmup endpoint, or include the auth token when available.

---

**Summary:** 15 findings total (2 critical, 5 high, 8 medium).  
✅ Fixed in this PR: (none yet)  
🟢 False positives excluded: 6 (documented above)

**Strengths observed:**
- Strict TypeScript config with all strict flags enabled
- In-memory token storage pattern (undermined only by TARA callback)
- Good test coverage with multiple test types (vitest, cucumber, playwright, stryker)
- Proper PKCE implementation with crypto.subtle
- All external links have `rel="noopener noreferrer"`
- No `dangerouslySetInnerHTML` or `eval` usage anywhere
- Good error boundary and loading state patterns
- Accessibility: skip links, ARIA labels, keyboard navigation
