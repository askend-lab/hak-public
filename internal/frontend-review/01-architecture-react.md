# Architecture & React Patterns (Findings 1–20)

## Architecture & SOLID

### 1. God Component: `App.tsx` knows too much
`App.tsx` instantiates `useSynthesis()`, `useTaskHandlers()`, and passes them down through props and context. It is both a router and a state orchestrator. **SRP violation.** Extract `SynthesisRoute` and `TasksRoute` wrappers that own their own state.

### 2. `useSynthesis` returns 20+ values
`useSynthesis.ts` returns a flat object with 20+ properties. Consumers destructure whatever they need, but it's impossible to tell which parts trigger re-renders. Split into domain hooks (`useSynthesisPlayback`, `useSynthesisEditing`, etc.).

### 3. `SynthesisPageContext` merges unrelated concerns
`SynthesisPageContext.tsx` bundles drag-drop, variants panel, sentence menu, synthesis, and task handlers into a single provider. Any state change re-renders every consumer. Already partially split into `SynthesisCoreContext` and `SynthesisInteractionContext` — but re-merged in `useSynthesisPage()` (line 116-118), defeating the purpose.

### 4. `DataService` is a pass-through facade
`dataService.ts` has 10 methods that just call `this.repository.xxx()` or `this.shareService.xxx()`. No caching, no error handling, no retry. Either add value or remove the indirection.

### 5. `TaskRepository` accepts but ignores `_userId`
`TaskRepository.ts` — methods `getUserTasks`, `getUserCreatedTasks`, `getModifiableTasks`, `getTask`, `deleteTask` all accept `_userId` and ignore it. Misleading API contract.

### 6. Three identical methods: `getUserTasks` → `getUserCreatedTasks` → `getModifiableTasks`
`TaskRepository.ts:29-40` — three methods delegating to each other, returning identical results. Documented as "future permission model" but currently YAGNI.

### 7. `useTaskHandlers` receives `setCurrentView` typed as function but caller passes a lambda ignoring the argument
`App.tsx:50` passes `() => navigate("/tasks")` for `setCurrentView: (view: "synthesis" | "tasks") => void`. The type contract is a lie.

### 8. `useTaskCRUD` takes 15 dependencies via a single object
`useTaskCRUD.ts:12-29` — `UseTaskCRUDDeps` has 15 fields. "Pass everything" pattern. The hook has too many responsibilities.

### 9. `AppModals` re-declares a `Task` interface locally
`AppModals.tsx:12-17` — declares `interface Task { id; name; ... }` instead of importing from `@/types/task`. Silent breakage if the real Task type changes.

### 10. Tight coupling between `SimpleStoreAdapter` and `AuthStorage`
`SimpleStoreAdapter.ts:29` calls `AuthStorage.getIdToken()` directly. Hard-couples the data layer to auth. Should accept token via constructor/parameter for testability.

## React Patterns

### 11. `App.tsx` uses conditional rendering instead of React Router
`App.tsx:95-134` — seven `{currentView === "xxx" && <Component />}` blocks instead of `<Route>` elements. URL is parsed manually in `useCurrentView`, duplicating React Router's job.

### 12. `useCurrentView` reimplements routing logic
`useCurrentView.ts:30-42` — manually maps pathnames to view types with `startsWith` checks. Should use `useMatch` or nested routes.

### 13. `useAppRedirects` has `hasCopiedEntries` checked but not in dependency array
`useAppRedirects.ts:46-53` — variable can change after initial check and the redirect won't re-evaluate.

### 14. `AuthCallbackPage` resets `processedRef` in cleanup
`AuthCallbackPage.tsx:76-78` — in StrictMode, cleanup resets the ref, causing the effect to run twice. The ref is supposed to prevent double execution but cleanup undoes it.

### 15. `SharedTaskPage` missing `dataService` in useEffect dependency array
`SharedTaskPage.tsx:65` — depends on `[token]` but uses `dataService` inside.

### 16. `useDashboardData` has `dataService` in useCallback deps
`Dashboard.tsx:112` — works only because `DataServiceProvider` uses `useMemo(() => new DataService(), [])`. Fragile.

### 17. `CopiedEntriesProvider` creates new context value on every render
`CopiedEntriesContext.tsx:39-48` — value object recreated each render. Should be memoized with `useMemo`.

### 18. `useSynthesis` returns a new object literal on every call
`useSynthesis.ts:115-142` — fresh object every render. All consumers re-render. Consider `useMemo` for the return value.

### 19. `useTaskHandlers` receives a new lambda from `App.tsx` on every render
`App.tsx:50-51` — `() => navigate("/tasks")` creates a new function reference each render, cascading re-renders.

### 20. No `React.memo` on frequently rendered list items
`SharedTaskPage.tsx:170-178` — `SentenceSynthesisItem` rendered for every entry, not memoized. Parent re-renders (e.g., `currentPlayingId` change) re-render all items.
