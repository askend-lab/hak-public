# UX & Miscellaneous (Findings 101–120)

## UX / Usability

### 101. No loading indicator during `handleConfirmDelete`
`useTaskCRUD.ts:187-207` — async but confirmation modal has no loading state. User can click "Kustuta" multiple times.

### 102. No optimistic update for task operations
All CRUD operations wait for server response before updating UI. Delete takes ~500ms with no visual feedback beyond modal closing.

### 103. `SharedTaskPage` shows a generic error for expired share links
`SharedTaskPage.tsx:54` — "Ülesannet ei leitud" — no distinction between "link expired" (90-day TTL), "link revoked", or "link never existed".

### 104. No "undo" for task deletion
`useTaskCRUD.ts:191` — task deletion is immediate and irreversible. No soft-delete, no undo notification, no grace period.

### 105. `Dashboard` shows "Tegevust pole veel" always
`Dashboard.tsx:108` — `setRecentActivity([])` — recent activity is always empty. The feature is a stub. Either implement or remove.

### 106. No offline state detection or handling
No checks for `navigator.onLine`. API calls fail silently or show generic error messages when connectivity is lost.

### 107. No pagination for task list
`TaskRepository.queryUserTasks` fetches all tasks in a single query. At scale (100+ tasks), slow and memory-intensive.

### 108. `downloadTaskAsZip` has no cancel mechanism
Once started, the download runs to completion. No way to cancel a large ZIP download.

### 109. `Footer` "Portaalist" and "Versiooniajalugu" are dead links
`Footer.tsx:29,32` — rendered as `<span>` but still shown in UI. Confusing — either implement or hide.

### 110. Cookie consent has no decline option
`CookieConsent.tsx` — only "Nõustun" button. GDPR requires a way to decline non-essential tracking.

## Miscellaneous

### 111. Mixed import path styles
Some files use `@/` alias, others use relative paths. Inconsistent within the same feature directory.

### 112. `PrivacyPage.tsx` is 242 lines of hardcoded Estonian legal text
Should be in a separate `.md` or `.json` file rendered dynamically. Privacy policy changes require code changes and a new build.

### 113. `vite-env.d.ts` only declares Vite types, no custom env vars
Doesn't declare `VITE_SENTRY_DSN`, `VITE_TARA_LOGIN_URL`, `VITE_AUTH_API_URL`, etc. TypeScript can't verify env var usage.

### 114. No `.env.example` file documenting required environment variables
Frontend requires ~10 `VITE_*` env vars but no example file or documentation of which are required vs optional.

### 115. `hooks/index.ts` re-exports from multiple feature directories
Creates circular dependency risk — hooks barrel file imports from features which import from hooks.

### 116. `config/ui-strings.ts` mixes static and dynamic strings
`TASK_STRINGS.ADDED_ENTRIES` is a function, while `TASK_STRINGS.ADDED_TO_TASK` is a string. Consumers must know which are which. Use a consistent pattern or a proper i18n library.

### 117. No feature flags system
Features like Dashboard (stub), onboarding wizard, and specs page are always enabled. No way to toggle without code changes.

### 118. `useDocumentTitle` has dead code path for `/shared/task/:token`
`useDocumentTitle.ts:41-48` — handles shared task prefix, but `SharedTaskPage` lives outside main `App` and sets its own title.

### 119. `NotificationProvider` creates a new `showNotification` function on every render
`NotificationContext.tsx:23-25` — arrow function not wrapped in `useCallback`. Every consumer re-renders.

### 120. Build info comment suggests manual versioning
`main.tsx:74` — `// Build 20260209115004` — should be injected by build system via `define` in Vite config.
