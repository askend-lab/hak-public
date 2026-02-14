# Audit14 — Action Plan

Source: `internal/Audit14.md` (Code Review — HAK Public — 13.02.2026)
Created: 14.02.2026

Legend:
- ✅ **DONE** — already fixed or not applicable (with explanation)
- 🔧 **FIX** — will fix (with specific action)
- 🔜 **LATER** — valid but deferred (with reason)
- ❌ **WONTFIX** — not doing (with reason)

---

## SECURITY & AUTH

### #1 — TARA токены через URL query parameters
**🔜 LATER** — This is inherent to the OAuth2 authorization code flow with TARA. The `code` (not token) is passed via URL — this is standard OAuth2 behavior. The actual tokens are exchanged server-side. The `code` is single-use and short-lived. Risk is low.
**Action:** No immediate fix. Consider implementing POST-based code exchange if TARA supports `response_mode=form_post` in the future.

### #2 — Refresh token в localStorage
**🔧 FIX** — Valid concern. localStorage is accessible to any JS on the page. httpOnly cookie is more secure.
**Action:** Move refresh token storage from localStorage to an httpOnly, Secure, SameSite=Strict cookie set by the auth backend. Requires backend change in tara-auth Lambda to set cookie on token exchange and read it on refresh.

### #3 — JWT подпись не верифицируется на клиенте
**❌ WONTFIX** — Client-side JWT verification is a defense-in-depth measure but not strictly required. The id_token comes directly from the TARA/Cognito server via HTTPS — MITM is not possible. The server-side (API Gateway + Cognito authorizer) verifies tokens properly. Client-side verification would require embedding JWKS public keys and add complexity without meaningful security gain.

### #4 — Hardcoded Cognito credentials
**🔧 FIX** — userPoolId, clientId, domain should come from environment variables, not be hardcoded as fallbacks.
**Action:** Remove fallback values from `config.ts`. Use only `import.meta.env.VITE_*` vars. Add `.env.example` with placeholder values. Fail fast if env vars are missing.

### #5 — PKCE code_verifier в sessionStorage
**❌ WONTFIX** — sessionStorage is the recommended storage for PKCE code_verifier per RFC 7636. It's tab-scoped (not shared across tabs), cleared on tab close, and the code_verifier is only useful during the brief OAuth flow. If XSS is present, the attacker has bigger problems (can act as the user directly). This is standard PKCE implementation.

### #6 — JSON.parse без валидации схемы из localStorage
**🔧 FIX** — Corrupted localStorage data can crash the app.
**Action:** Wrap all `JSON.parse` calls for localStorage/sessionStorage in try/catch with fallback to default values. Add Zod schema validation for `OnboardingContext` stored state. Estimated: ~2-3 files to fix.

### #7 — Share token 8 байт энтропии
**🔧 FIX** — Code generates 16 random bytes (32 hex chars) then `substring(0, 16)` = 16 hex chars = 8 bytes = 64 bits. This is truncating entropy unnecessarily.
**Action:** Remove `substring(0, 16)` — use full 32 hex chars (16 bytes = 128 bits). Update `SHARE_TOKEN_BYTES` constant name for clarity. Single-line fix in `shareTokenUtils.ts`.

### #8 — CORS `Access-Control-Allow-Origin: *`
**🔧 FIX** — Wildcard CORS is too permissive for authenticated endpoints.
**Action:** Replace `*` with specific allowed origins (frontend domain). For simplestore (has Cognito auth): restrict to app domain. For audio/merlin/vabamorf (currently no auth): wildcard is acceptable until auth is added.

### #9 — Нет rate limiting на API endpoints
**🔜 LATER** — Valid concern. AWS API Gateway supports throttling natively.
**Action:** Add `throttle` configuration to each serverless.yml API Gateway definition. Recommended: 100 req/s per IP for synthesis endpoints, 1000 req/s global. This is infrastructure work, defer to infra sprint.

### #10 — Debug endpoint без аутентификации
**🔧 FIX** — Debug endpoint should not exist in production.
**Action:** Gate `/debug/error` behind `IS_OFFLINE` or `STAGE=dev` environment check. Or remove entirely — Sentry already captures errors.

### #11 — Audio API endpoints без аутентификации
**🔜 LATER** — Audio API is intentionally public for now (MVP). Adding auth requires frontend changes to pass tokens.
**Action:** Add Cognito authorizer to audio-api endpoints. Requires: (1) serverless.yml authorizer config, (2) frontend `Authorization` header on audio requests. Defer to auth hardening sprint.

### #12 — Merlin API endpoints без аутентификации
**🔜 LATER** — Same as #11. Merlin API is backend-to-backend for the most part, but direct access is possible.
**Action:** Add API key or IAM auth for merlin-api. Frontend calls go through audio-api, so merlin can be restricted to VPC/IAM. Defer to auth hardening sprint.

### #13 — Vabamorf API полностью открыт
**🔜 LATER** — Vabamorf is a morphological analysis API. Risk is limited to abuse (billing), not data leak.
**Action:** Add API key authentication at minimum. Defer to auth hardening sprint.

### #14 — useUserId() возвращает "test-user"
**🔧 FIX** — All unauthenticated users sharing one userId is a data isolation bug.
**Action:** Either (a) throw/redirect to login when user is not authenticated, or (b) generate a unique anonymous session ID. Option (a) is preferred — the app requires authentication anyway.

### #15 — Нет Content-Security-Policy
**🔧 FIX** — CSP is a critical XSS mitigation.
**Action:** Add CSP meta tag to `index.html` or configure CSP response header via CloudFront. Start with report-only mode: `Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self' *.amazonaws.com *.sentry.io; img-src 'self' data:`.

### #16 — Vite dev proxy молча проксирует в production
**🔧 FIX** — Dev accidentally hitting prod is dangerous.
**Action:** Add prominent console warning when proxy targets contain "prod". Add `VITE_API_TARGET` env var, default to dev/local endpoints. Warn in dev terminal if prod URLs detected.

### #17 — Google Fonts без SRI
**❌ WONTFIX** — Google Fonts uses dynamic URLs — SRI hashes change with font updates. Google's CDN is trusted infrastructure. The audit's concern about "CSS/JS injection" via fonts CDN is theoretical. CSP (#15) is a more effective mitigation.

### #18 — errorDescription из URL рендерится напрямую
**✅ DONE** — Investigated: `setError(errorDescription)` stores it in React state, then rendered via `{error}` in JSX. React auto-escapes string content — `<img onerror=...>` would render as literal text, not HTML. No XSS vector here.

### #19 — Нет ограничения размера data в SimpleStore save
**🔧 FIX** — Valid concern for Lambda memory.
**Action:** Add `data` size validation in `validation.ts` — reject if `JSON.stringify(data).length > 200KB` (DynamoDB limit is 400KB, leave margin). Single function addition.

### #20 — Access-Control-Allow-Methods не включает DELETE
**🔧 FIX** — CORS preflight for DELETE will fail.
**Action:** Add `DELETE` to `Access-Control-Allow-Methods` header in `lambda.ts`. Single-line fix.

---

## DATA & STATE

### #21 — Все задачи в одном DynamoDB item
**🔜 LATER** — Current approach works for MVP scale (dozens of tasks per user). DynamoDB item limit is 400KB, which holds ~100-200 full tasks.
**Action:** Monitor item sizes. When approaching limit, migrate to one-item-per-task model with GSI for user queries. Not urgent for current user base.

### #22 — saveUserTasks перезаписывает весь массив
**🔜 LATER** — Direct consequence of #21. Fixing requires the same migration to per-task items.
**Action:** Same as #21 — defer to data model migration sprint. Add optimistic locking (#23) as interim mitigation.

### #23 — Нет optimistic locking / version check
**🔧 FIX** — Concurrent edits can cause data loss.
**Action:** Add `version` field to user tasks record. Use DynamoDB conditional expression `attribute_not_exists(version) OR version = :expected` on writes. Return 409 Conflict on version mismatch. Frontend retries with fresh data.

### #24 — deleteTask не удаляет unlisted copy
**🔧 FIX** — Deleted tasks remain accessible via share token.
**Action:** In `deleteTask`, also delete the unlisted copy (if exists) by removing the share record from SimpleStore. Add test to verify.

### #25 — addTextEntriesToTask делает double read
**🔧 FIX** — Performance issue: reads all tasks twice.
**Action:** Refactor `addTextEntriesToTask` to accept the already-loaded task object instead of re-reading from store. Or refactor `updateTask` to accept optional pre-loaded data.

### #26 — handleGet возвращает 200 для not-found
**🔧 FIX** — HTTP semantics violation.
**Action:** Return 404 when item is null instead of 200 with `{ item: null }`. Update frontend code that checks for null item to also handle 404 status.

### #27 — Нет пагинации задач
**🔜 LATER** — Current data model (all tasks in one item) doesn't support pagination. Requires #21 migration first.
**Action:** Defer to data model migration. Current user base has <50 tasks per user.

### #28 — TTL=0 — данные живут вечно
**🔧 FIX** — Shared tasks accumulate without cleanup.
**Action:** Set default TTL for unlisted shared tasks (e.g., 90 days). Add TTL field when creating share records. DynamoDB handles automatic deletion.

### #29 — sessionStorage как inter-page transport
**✅ DONE** — `useAppRedirects` hook was recently created to handle this pattern properly. The sessionStorage usage is intentional for cross-page state in SPA navigation (shared task → copy entries → redirect to synthesis). This is a standard pattern for SPAs.

### #30 — getUserTasks и getUserCreatedTasks — идентичные
**✅ DONE** — Already addressed in PR #493 cleanup. `getModifiableTasks` was identified as wrapper for `getUserCreatedTasks`. The baseline task system that differentiated "all tasks" from "user-created tasks" was removed — they are now the same by design.

---

## FRONTEND ARCHITECTURE

### #31 — useSynthesis — 310 строк, 20+ return values
**🔜 LATER** — Valid architectural concern. The hook was recently refactored to extract sub-hooks (useSynthesisOrchestrator, etc.) but the main hook still aggregates many values.
**Action:** Further decomposition into domain-specific hooks. Defer to frontend architecture sprint — functional, just not clean.

### #32 — SynthesisPageContext — god context
**🔜 LATER** — Valid. Context re-renders are a performance concern but not currently causing user-visible issues.
**Action:** Split into domain-specific contexts (SynthesisContext, TaskContext, UIContext). Defer to frontend architecture sprint.

### #33 — useTaskHandlers spread collision risk
**🔧 FIX** — Silent property overwrite if hooks return same key.
**Action:** Refactor to return namespaced objects: `{ modals, crud, entries }` instead of spread. Update consumers. Low-risk refactor.

### #34 — Singleton DataService.getInstance()
**🔜 LATER** — Singleton makes testing harder but works. Replacing with DI requires significant refactoring.
**Action:** Defer. Current approach is testable via `vi.mock`. Not a correctness issue.

### #35 — Нет Error Boundary вокруг lazy routes
**🔧 FIX** — A crash in one route kills the entire app.
**Action:** Add per-route `ErrorBoundary` wrappers in `App.tsx` around each `<Suspense>` boundary. The main ErrorBoundary stays as a fallback. Simple addition.

### #36 — Глубокая вложенность тернарных операторов
**🔧 FIX** — 6 levels of nested ternary in `useCurrentView.ts` is unreadable.
**Action:** Refactor to early returns or a lookup map. E.g., `const VIEW_MAP: Record<string, ViewType> = { '/tasks': 'tasks', '/specs': 'specs', ... }`.

### #37 — "use client" в не-Next.js приложении
**🔧 FIX** — Misleading directive.
**Action:** Remove `"use client"` from all files (~10 files). Simple find-and-replace. No functional change.

### #38 — Module-level side effects в warmAudioWorker.ts
**🔧 FIX** — Event listeners registered on import break tests.
**Action:** Wrap side effects in an `init()` function called explicitly from app entry point. Export `init` for controlled lifecycle.

### #39 — _taskName accepted but unused
**🔧 FIX** — Dead parameter.
**Action:** Remove `_taskName` from `ShareTaskModal` props interface and all callers. Simple cleanup.

### #40 — Нет TypeScript strict: true
**✅ DONE** — tsconfig.json already has `strict: true`, `strictNullChecks: true`, `strictFunctionTypes: true`, `strictBindCallApply: true`, `strictPropertyInitialization: true`. Auditor missed this.

---

## API & NETWORK

### #41 — postJSON не отправляет auth headers
**🔜 LATER** — By design for now — APIs don't require auth (#11, #12, #13). When auth is added to APIs, auth headers will be needed.
**Action:** When implementing API auth (#11-13), add Authorization header to all API calls. Defer to auth hardening sprint.

### #42 — Нет AbortController в synthesizeWithPolling
**🔧 FIX** — Polling continues after unmount.
**Action:** Accept `AbortSignal` parameter in `synthesizeWithPolling`. Check `signal.aborted` in polling loop. Pass abort controller from React component's cleanup function.

### #43 — pollForAudio не отменяем
**🔧 FIX** — Same issue as #42.
**Action:** Combine with #42 fix — add AbortSignal support to both `pollForAudio` and `synthesizeWithPolling`.

### #44 — Нет retry logic
**🔜 LATER** — Valid UX concern but not critical.
**Action:** Add retry with exponential backoff for synthesis/analyze calls. Use a utility wrapper. Defer to UX improvements sprint.

### #45 — SimpleStoreAdapter.get шлёт auth на public endpoint
**🔧 FIX** — Token leaked to public endpoint unnecessarily.
**Action:** Use separate fetch call without Authorization header for `/get-public` endpoint. Simple conditional in adapter.

### #46 — warmAudioWorker пингует на каждое mousemove
**❌ WONTFIX** — The audit overstates the issue. The listener checks a 60-second throttle timer — the actual function body executes at most once per minute. Event listener overhead for a simple timestamp check is negligible. The `passive: true` option is already set.

### #47 — fetchAudioBlob не проверяет размер
**🔧 FIX** — Malicious audioUrl could cause OOM.
**Action:** Check `Content-Length` header before consuming response. Abort if > 50MB. Add `response.headers.get('content-length')` check.

### #48 — Sequential audio download в ZIP
**🔜 LATER** — Valid performance concern but not a bug.
**Action:** Use `Promise.all` with concurrency limit (e.g., 5 parallel downloads). Defer to UX sprint.

### #49 — JSON.parse(event.body) без try/catch
**🔧 FIX** — Unhandled exception on invalid JSON.
**Action:** Wrap in try/catch, return 400 `{ error: "Invalid JSON body" }`. Single fix in `handler.ts`.

### #50 — Непоследовательная CORS-политика
**🔧 FIX** — Combine with #8.
**Action:** Standardize CORS across all APIs. Authenticated endpoints: specific origins. Public endpoints: can remain wildcard until auth is added.

---

## UI & UX

### #51 — Индекс как key в MetricCard
**🔧 FIX** — Anti-pattern in React.
**Action:** Use metric name or unique ID as key instead of array index. Simple fix.

### #52 — Hardcoded fake data в Dashboard
**✅ DONE** — Dashboard is a stub/placeholder page. It's explicitly not a production feature — it shows example UI patterns. This is by design for the current MVP phase.

### #53 — Footer мёртвые ссылки href="#"
**🔧 FIX** — Broken navigation.
**Action:** Either link to actual pages or remove the links. If pages don't exist yet, use `<span>` instead of `<a>` with appropriate styling.

### #54 — Email захардкожен в Footer
**🔧 FIX** — Should be configurable.
**Action:** Move to config/environment variable. E.g., `VITE_CONTACT_EMAIL`. Related to #88 (GDPR).

### #55 — ConfirmationModal cancelText на английском
**🔧 FIX** — i18n inconsistency.
**Action:** Change default `cancelText` from "Cancel" to "Tühista" (Estonian). Single-line fix.

### #56 — Нет max count у notifications
**🔧 FIX** — Uncapped notifications can flood UI.
**Action:** Add `MAX_NOTIFICATIONS = 5` constant. In `setNotifications`, slice to keep only last N. Auto-dismiss older ones.

### #57 — BaseModal overflow: "unset" при cleanup
**🔧 FIX** — Doesn't restore original value.
**Action:** Save `document.body.style.overflow` before setting to "hidden", restore saved value on cleanup.

### #58 — Backdrop div без tabIndex
**🔧 FIX** — Keyboard handler won't fire.
**Action:** Add `tabIndex={-1}` to backdrop div. Or use `onMouseDown` instead of `onKeyDown` for backdrop dismiss.

### #59 — Drag-and-drop без keyboard альтернативы
**🔜 LATER** — WCAG compliance. Important but requires design work.
**Action:** Add keyboard-based reorder controls (up/down buttons on each item). Defer to accessibility sprint.

### #60 — Нет ARIA live region для synthesis states
**🔜 LATER** — Screen reader accessibility.
**Action:** Add `aria-live="polite"` region for synthesis status updates. Defer to accessibility sprint.

---

## INFRASTRUCTURE & DEVOPS

### #61 — Serverless Framework v3 — maintenance mode
**🔜 LATER** — v3 is in maintenance but still receives security patches. Migration to v4 requires license changes and config migration.
**Action:** Plan migration to Serverless v4 or alternative (SST, CDK). Defer to infra sprint. Not urgent — v3 still works.

### #62 — Mixed API types: REST vs HTTP API
**❌ WONTFIX** — REST API (simplestore) is used because it supports Cognito authorizer natively. HTTP API (merlin) is used for cost/performance. This is intentional architectural choice, not inconsistency.

### #63 — COGNITO_USER_POOL_ARN без валидации
**🔧 FIX** — Missing env var silently breaks auth.
**Action:** Add validation in serverless.yml using `${env:COGNITO_USER_POOL_ARN}` (fails on deploy if missing) or add runtime check in Lambda.

### #64 — Нет WAF перед API Gateway
**🔜 LATER** — WAF adds cost and complexity. Current API Gateway throttling (#9) is the first line of defense.
**Action:** Add AWS WAF when the service goes to production scale. Defer to infrastructure hardening sprint.

### #65 — CI/CD не запускает security audit
**✅ DONE** — DevBox has `security-audit` hook that runs `pnpm audit` on every pre-commit. However, CI (build.yml) doesn't run it independently. The audit is effectively run before any code reaches CI.
**Action (minor):** Consider adding `pnpm audit --audit-level=high` step to build.yml for defense-in-depth.

### #66 — Нет SAST/DAST в pipeline
**🔜 LATER** — CodeQL/Snyk integration is valuable but adds CI time and potential cost.
**Action:** Enable GitHub CodeQL (free for public repos). Defer Snyk/Trivy to infra sprint.

### #67 — pnpm overrides для CVE — ручное управление
**🔧 FIX** — 13 manual overrides are fragile.
**Action:** Audit current overrides — remove any that are no longer needed (upstream fixed). Set up automated check via dependabot (#68 already exists) + `pnpm audit` in CI (#65).

### #68 — Нет dependabot/renovate конфигурации
**✅ DONE** — `dependabot.yml` exists with npm, github-actions, and docker ecosystems configured. Weekly schedule, grouped updates (aws-sdk, testing, build). Auditor missed this.

### #69 — build.yml не кэширует pnpm store
**✅ DONE** — `setup-node` action with `cache: pnpm` handles pnpm store caching automatically via GitHub Actions cache. The explicit store caching mentioned is redundant with the built-in mechanism.

### #70 — Нет staging environment
**🔜 LATER** — Valid concern for production safety.
**Action:** Add staging stage to serverless.yml configs. Requires separate AWS resources. Defer to infra sprint.

---

## CODE QUALITY

### #71 — console.error вместо logger
**🔧 FIX** — Inconsistent logging.
**Action:** Replace `console.error` with `logger.error` in `ShareService.ts:26`. Single-line fix.

### #72 — isVabamorfMarker — array.includes вместо Set
**🔧 FIX** — Minor perf issue in hot path.
**Action:** Replace array literal with module-level `Set` constant. Use `set.has()` instead of `array.includes()`. Simple refactor.

### #73 — String concatenation в цикле
**🔧 FIX** — O(n²) string building.
**Action:** Refactor to use array accumulation + `join('')` at the end. Simple refactor in `phoneticMarkers.ts`.

### #74 — generateShareToken truncates entropy
**🔧 FIX** — Same as #7.
**Action:** Covered by #7 fix. Remove `substring(0, 16)`.

### #75 — processedRef не защищает от StrictMode double-mount
**❌ WONTFIX** — The `useRef` + check pattern is the standard React approach for preventing double-execution in StrictMode. The first effect does navigate, but the second is correctly blocked. In production (no StrictMode), effect runs exactly once. This is working as intended.

### #76 — getEntryPlayUrl создаёт blob URL без revoke
**🔧 FIX** — Memory leak from unreleased blob URLs.
**Action:** Return a cleanup function or use a centralized blob URL manager that revokes URLs when entries are no longer displayed. Or revoke in component cleanup.

### #77 — handlePlayAll reads stale state через closure
**🔧 FIX** — Stale closure bug.
**Action:** Use `useRef` for `isPlayingAll`/`isLoadingPlayAll` values accessed in callbacks, or use functional state update pattern.

### #78 — navigator.clipboard без feature detection
**🔧 FIX** — Fails on HTTP context.
**Action:** Add feature detection: `if (!navigator.clipboard?.writeText)` → fallback to `document.execCommand('copy')` or show manual copy instruction. Fix in `clipboardUtils.ts`.

### #79 — a.click() download не работает в Safari iOS
**🔜 LATER** — Safari iOS download limitations are a known platform issue.
**Action:** Add iOS detection and use alternative approach (window.open with blob URL, or show "long-press to save" instruction). Defer to cross-browser compatibility sprint.

### #80 — sanitizeFilename может разрезать multi-byte char
**🔧 FIX** — Unicode safety issue.
**Action:** Use `Array.from(str).slice(0, 80).join('')` instead of `str.slice(0, 80)` to respect grapheme boundaries. Single-line fix.

---

## PRIVACY & COMPLIANCE

### #81 — Sentry replayIntegration() записывает сессии
**🔧 FIX** — GDPR concern for Estonian government service.
**Action:** Either (a) disable `replayIntegration()` entirely, or (b) configure with `maskAllText: true`, `blockAllMedia: true`, and require explicit user consent before enabling. Option (a) is safest.

### #82 — tracesSampleRate: 0.1
**🔜 LATER** — Performance tracing sends metadata to Sentry. Lower risk than replay but still GDPR-relevant.
**Action:** Review with legal team. If consent is required, gate Sentry initialization behind consent banner (#86). Can reduce `tracesSampleRate` to 0.01 as interim measure.

### #83 — Build info показывает workingDir
**✅ DONE** — Code already gates this: `{isLocalDev() && buildTimeInfo.workingDir && (...)}`. The `workingDir` is only shown in local development mode, never in production. Auditor missed the `isLocalDev()` check.

### #84 — User ID отображается в профиле
**🔧 FIX** — Internal Cognito sub UUID shouldn't be shown to users.
**Action:** Remove user ID display from `UserProfile.tsx`. Or show only last 4 chars for support reference. Simple removal of 2 lines.

### #85 — Shared tasks доступны навечно
**🔧 FIX** — Combine with #28.
**Action:** Add TTL to shared tasks (default 90 days). Add expiration notice to `SharedTaskPage`. Add ability for owner to revoke share link.

### #86 — Нет cookie consent / privacy banner
**🔧 FIX** — Required for GDPR compliance with Sentry, Google Fonts, localStorage.
**Action:** Add cookie/privacy consent banner. Gate Sentry init and Google Fonts loading behind consent. This is a significant feature — create separate ticket.

### #87 — logger.debug логирует весь объект задачи
**🔧 FIX** — PII in logs.
**Action:** Replace `logger.debug("Sharing task:", task)` with `logger.debug("Sharing task:", task.id)`. Single-line fix.

### #88 — Personal email в исходном коде
**🔧 FIX** — GDPR: personal data in public repo. Same as #54.
**Action:** Replace hardcoded email with generic contact (e.g., `info@eki.ee` or config variable). Single-line fix.

---

## TESTING & RELIABILITY

### #89 — DataService.getInstance() в компонентах напрямую
**🔜 LATER** — Same concern as #34. Singleton is testable via module mocking.
**Action:** Defer. Current approach works for testing via `vi.mock`.

### #90 — Нет integration tests для API endpoints
**🔜 LATER** — Valid. Unit tests exist for handlers but no end-to-end Lambda tests.
**Action:** Add integration test suite using `@aws-sdk/client-lambda` or local invoke. Defer to testing sprint.

### #91 — new Audio() не мокируется
**✅ DONE** — `createAudioPlayer` abstraction was recently added (visible in PronunciationVariants tests). Audio code is now mockable through this factory function.

### #92 — Нет tests для auth flow
**🔜 LATER** — Auth flow testing requires TARA/Cognito mocking.
**Action:** Add integration tests for `AuthCallbackPage` with mocked OAuth responses. Add test for token refresh flow. Defer to testing sprint.

### #93 — crypto.randomUUID() без polyfill
**❌ WONTFIX** — `crypto.randomUUID()` is supported in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+). The app already requires modern browser features (ES2020, Proxy, etc.). Adding a polyfill for an edge case adds unnecessary bundle weight.

### #94 — Нет health check endpoint для frontend
**❌ WONTFIX** — SPA health is monitored via the hosting platform (CloudFront/S3 or similar). A `/health` endpoint in a static SPA is meaningless — it's the CDN/hosting that needs monitoring, not the JS bundle. Backend health checks exist and are the correct approach.

---

## MISC

### #95 — Serverless v3 TODO × 4
**✅ DONE** — Duplicate of #61. TODOs are tracked in the backlog. Not actionable beyond the migration itself.

### #96 — getModifiableTasks — лишняя индирекция
**✅ DONE** — `getModifiableTasks` is an intentional abstraction. It currently delegates to `getUserCreatedTasks` but exists to support future permission models (e.g., shared editing). The naming communicates intent: "tasks the user can modify" vs "tasks the user created" — these may diverge.

### #97 — @hak/simplestore в devDependencies frontend
**🔧 FIX** — If it's used at runtime, should be in dependencies. If only for types/testing, devDependencies is correct.
**Action:** Verify usage. If only imported in test files (Cucumber steps), devDependencies is correct. If imported in production code, move to dependencies.

### #98 — eslint.base.config.mjs — 13KB
**❌ WONTFIX** — Large ESLint config is expected for a monorepo with custom rules for multiple packages, TypeScript strict mode, accessibility, import ordering, and testing patterns. The config is well-organized with comments. Splitting it would make it harder to maintain.

### #99 — Mixed Vitest + Jest
**❌ WONTFIX** — By design. Frontend uses Vitest (faster for Vite projects), backend packages use Jest (better Node.js ecosystem support). Different test runners for different package types is a reasonable monorepo choice. Root `jest.config.js` explicitly excludes frontend.

### #100 — Sentry.init() до импорта App
**❌ WONTFIX** — This is the recommended Sentry setup pattern. Sentry must initialize before the app to capture initialization errors. If Sentry itself fails, the app continues normally — Sentry init is wrapped in try/catch internally. This is correct.

---

## Summary

| Category | FIX | LATER | DONE | WONTFIX | Total |
|----------|-----|-------|------|---------|-------|
| Security & Auth | 10 | 5 | 1 | 4 | 20 |
| Data & State | 5 | 3 | 2 | 0 | 10 |
| Frontend Architecture | 6 | 2 | 1 | 0 | 9 (+#40 DONE) |
| API & Network | 5 | 2 | 0 | 1 | 8 (+#42/#43 combined) |
| UI & UX | 7 | 2 | 1 | 0 | 10 |
| Infrastructure | 2 | 4 | 3 | 1 | 10 |
| Code Quality | 7 | 1 | 0 | 2 | 10 |
| Privacy & Compliance | 5 | 1 | 1 | 0 | 7 (+#83 DONE) |
| Testing | 0 | 2 | 1 | 2 | 5 (+#94 WONTFIX) |
| Misc | 1 | 0 | 3 | 3 | 7 |

**Totals: 🔧 FIX: 48 | 🔜 LATER: 22 | ✅ DONE: 13 | ❌ WONTFIX: 17**

### Recommended Fix Priority

**P0 — Security critical (do first):**
- [ ] #7/#74 Share token entropy
- [ ] #14 test-user shared data
- [ ] #8 CORS wildcard
- [ ] #10 Debug endpoint
- [ ] #15 CSP
- [ ] #81 Sentry replay GDPR

**P1 — Data integrity & compliance:**
- [ ] #2 Refresh token storage
- [ ] #4 Hardcoded Cognito creds
- [ ] #6 JSON.parse validation
- [ ] #23 Optimistic locking
- [ ] #24 Delete unlisted copy
- [ ] #28/#85 Shared task TTL
- [ ] #86 Cookie consent
- [ ] #84 User ID in profile
- [x] #87/#88 PII in code/logs

**P2 — Code quality quick wins (< 1hr each):**
- [x] #20 CORS DELETE method
- [x] #37 Remove "use client"
- [x] #39 Use taskName in modal title
- [x] #49 JSON.parse try/catch
- [x] #51 MetricCard key
- [x] #53 Dead footer links
- [x] #54 Hardcoded email
- [x] #55 Estonian cancelText
- [x] #56 Notification limit
- [x] #57 BaseModal overflow
- [x] #58 Backdrop tabIndex (already resolved)
- [x] #71 console.error → logger
- [x] #72 Set instead of array
- [x] #73 String concat → join
- [x] #76 Blob URL revoke (already handled by callers)
- [x] #80 Unicode-safe slice
- [x] #97 simplestore dep type (verified: devDeps correct)

**P3 — Architecture improvements:**
- [ ] #16 Vite proxy warning
- [ ] #19 SimpleStore data size limit
- [ ] #25 Double read
- [ ] #26 handleGet 200→404
- [ ] #33 Spread collision
- [ ] #35 Per-route ErrorBoundary
- [ ] #36 Nested ternary
- [ ] #38 warmAudioWorker init
- [ ] #42/#43 AbortController
- [ ] #45 Auth on public endpoint
- [ ] #47 Blob size check
- [ ] #67 Audit overrides
- [ ] #77 Stale closure
- [ ] #78 Clipboard feature detection
