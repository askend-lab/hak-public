# Testing & Accessibility (Findings 81–100)

## Testing

### 81. `App.routing.test.tsx` duplicates auth mock setup 6 times
`App.routing.test.tsx:106-120, 132-146, 190-204, 217-231, 255-269` — identical `vi.mocked(useAuth).mockReturnValue({...})` blocks. Extract a `mockAuthenticatedUser()` helper.

### 82. No unit tests for `SimpleStoreAdapter`
The adapter has 10 methods, handles auth headers, error parsing, TTL logic — zero test coverage.

### 83. No unit tests for `TaskRepository`
`TaskRepository.ts` — 216 lines of business logic (create, update, delete, entry management, order calculation) with no direct tests.

### 84. No unit tests for `ShareService`
`ShareService.ts` — share/unshare logic untested directly.

### 85. No unit tests for `downloadTaskAsZip`
`downloadTaskAsZip.ts` — 127 lines of complex logic (parallel downloads, ZIP generation, size limits, filename sanitization) — no tests.

### 86. No unit tests for `synthesize.ts` polling logic
`synthesize.ts` — `pollForAudio` (retry loop with 30 attempts, abort signal) has no tests.

### 87. No unit tests for `phoneticMarkers.ts` edge cases
Edge cases like empty strings, strings with only markers, and mixed Unicode + markers are not covered.

### 88. `useSharedTaskAudio` has no tests
239 lines of complex audio playback state management with abort controllers, sequential playback, error recovery — no tests.

### 89. `AuthCallbackPage` test doesn't cover TARA cookie flow
The TARA cookie-based token flow (primary auth path) has limited coverage.

### 90. `useSynthesisOrchestrator` has no dedicated tests
240 lines orchestrating synthesis, caching, retry, and audio playback — no unit tests.

## Accessibility

### 91. `UserProfile` dropdown has no `aria-haspopup`
`UserProfile.tsx:69-74` — trigger button has `aria-expanded` but no `aria-haspopup="true"`. Screen readers won't announce it as a menu trigger.

### 92. `UserProfile` dropdown menu items lack `role="menuitem"`
`UserProfile.tsx:107-114` — logout button inside `role="menu"` div should have `role="menuitem"`.

### 93. `AppHeader` navigation lacks `aria-current="page"`
`AppHeader.tsx:38-55` — `NavLink` gets `className="active"` but no `aria-current="page"`. Screen readers can't distinguish the active page.

### 94. `CookieConsent` banner has `role="alert"` — too aggressive
`CookieConsent.tsx:26` — causes immediate screen reader announcement, interrupting the user. Use `role="status"` or `role="dialog"`.

### 95. `ErrorBoundary` retry button has no `aria-label`
`ErrorBoundary.tsx:43-55` — says "Proovi uuesti" but has no context about what failed.

### 96. `SharedTaskPage` info banner lacks landmark role
`SharedTaskPage.tsx:140-159` — informational banner has no `role` or semantic element. Use `<aside>` or `role="complementary"`.

### 97. `Dashboard` quick link buttons use emoji as accessible names
`Dashboard.tsx:57-58` — `🎤` and `📋` screen readers announce Unicode emoji names. Use `aria-hidden="true"` on emoji spans.

### 98. `Footer` social links have empty `alt=""` on icons
`Footer.tsx:54-55` — `<img alt="" />` followed by `<span>Facebook</span>`. Link structure could be clearer with `aria-label`.

### 99. `PrivacyPage` uses `<h4>` as top-level section headings
`PrivacyPage.tsx:13,26,38...` — heading hierarchy skips h2 and h3, jumping from h1 to h4. Violates WCAG heading hierarchy.

### 100. No focus management after route transitions
`App.tsx:86-88` — `<main id="main-content" tabIndex={-1}>` exists for skip-link, but focus is not programmatically moved after route changes. Keyboard users must tab through the entire header again.
