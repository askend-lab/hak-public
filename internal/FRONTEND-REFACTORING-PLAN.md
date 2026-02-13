# Frontend Refactoring Plan

10 phases, ordered from simplest/lowest-risk to most complex.
Each phase is one PR.

---

## Phase 1: Fix test file naming inconsistencies

Zero-risk rename, no logic changes.

- [ ] Rename `SimpleStoreAdapter.mutation.test.ts` → `SimpleStoreAdapter.mutations.test.ts` (standardize suffix)
- [ ] Rename `BuildInfo.defined.test.tsx` → merge into `BuildInfo.test.tsx`
- [ ] Verify all tests pass after renames

---

## Phase 2: Merge `.mutations.test` files into main `.test` files

30 files → absorbed into their parent test files. Reduces file count by ~30.

- [ ] Merge all `*.mutations.test.*` into corresponding `*.test.*` files (add as new `describe` blocks)
- [ ] Delete empty `.mutations.test` files
- [ ] Verify mutation scores unchanged (Stryker runs on merged tests)
- [ ] Update any test config that references `.mutations.test` pattern

---

## Phase 3: Merge `.full.test` files into main `.test` files

11 files → absorbed into their parent test files.

- [ ] Merge all `*.full.test.*` into corresponding `*.test.*` files
- [ ] Delete empty `.full.test` files
- [ ] Verify coverage thresholds still met
- [ ] For `useSynthesis` (5 test files: `.test`, `.full.test`, `.mutations.test`, `.branches.test`, `.extra.test`, `.playback.test`) — consolidate into max 2 files: `useSynthesis.test.ts` + `useSynthesis.integration.test.ts`

---

## Phase 4: Merge `dataService` scattered test files

7 test files for one service → consolidate.

- [ ] Merge `dataService.baseline.test.ts`, `dataService.crud.test.ts`, `dataService.errors.test.ts`, `dataService.share.test.ts`, `dataService.sharing.test.ts`, `dataService.entries.full.test.ts` into `dataService.test.ts` (use `describe` blocks)
- [ ] Verify all tests pass

---

## Phase 5: Standardize test co-location

Move tests that are in inconsistent locations.

- [ ] For `PronunciationVariants`: consolidate `components/PronunciationVariants.test.tsx`, `components/PronunciationVariants.full.test.tsx`, and `components/PronunciationVariants/PronunciationVariants.test.tsx` into `components/PronunciationVariants/PronunciationVariants.test.tsx`
- [ ] For `TaskDetailView`: consolidate flat `TaskDetailView.test.tsx`, `TaskDetailView.full.test.tsx` into `TaskDetailView/TaskDetailView.test.tsx`
- [ ] Apply same pattern to any other components with tests in both flat and nested locations
- [ ] Update Jest/Vitest config `testMatch` if needed

---

## Phase 6: Extract `features/auth/`

Auth is self-contained — good first feature extraction.

- [ ] Create `features/auth/` directory
- [ ] Move `services/auth/` → `features/auth/services/`
- [ ] Move `pages/AuthCallbackPage.tsx` → `features/auth/pages/`
- [ ] Move `components/LoginModal.tsx` + tests → `features/auth/components/`
- [ ] Create `features/auth/index.ts` with public exports
- [ ] Update all imports across codebase
- [ ] Verify build + tests pass

---

## Phase 7: Extract `features/onboarding/`

Onboarding is already partially grouped.

- [ ] Create `features/onboarding/` directory
- [ ] Move `components/onboarding/` → `features/onboarding/components/`
- [ ] Move `contexts/OnboardingContext.tsx` + tests → `features/onboarding/contexts/`
- [ ] Move related styles → `features/onboarding/styles/`
- [ ] Create `features/onboarding/index.ts`
- [ ] Update all imports
- [ ] Verify build + tests pass

---

## Phase 8: Extract `features/tasks/`

Task management: components, hooks, modals.

- [ ] Create `features/tasks/` directory
- [ ] Move `TasksView`, `TaskManager`, `TaskEditModal`, `TaskDetailView/`, `AddEntryModal`, `AddToTaskDropdown` + tests → `features/tasks/components/`
- [ ] Move `useTaskCRUD`, `useTaskEntries`, `useTaskHandlers`, `useTaskModals`, `useUserTasks` + tests → `features/tasks/hooks/`
- [ ] Move task-related styles → `features/tasks/styles/`
- [ ] Create `features/tasks/index.ts`
- [ ] Update all imports
- [ ] Verify build + tests pass

---

## Phase 9: Extract `features/synthesis/`

Largest feature — synthesis, phonetics, playlist, variants.

- [ ] Create `features/synthesis/` directory
- [ ] Move `SynthesisView`, `SynthesisPageHeader`, `SynthesisModals`, `SentenceSynthesisItem`, `SentencePhoneticPanel`, `SentenceMenu`, `PronunciationVariants/`, `SentenceSynthesis/` + tests → `features/synthesis/components/`
- [ ] Move `hooks/synthesis/`, `useSynthesis`, `useVariantsPanel` + tests → `features/synthesis/hooks/`
- [ ] Move `contexts/SynthesisPageContext` + tests → `features/synthesis/contexts/`
- [ ] Move `utils/phoneticMarkers`, `utils/synthesize`, `utils/analyzeApi`, `utils/audioPlayer`, `utils/warmAudioWorker` → `features/synthesis/utils/`
- [ ] Create `features/synthesis/index.ts`
- [ ] Update all imports
- [ ] Verify build + tests pass

---

## Phase 10: Extract `features/sharing/` + consolidate `shared/`

Sharing feature + clean up remaining shared components.

- [ ] Create `features/sharing/` directory
- [ ] Move `ShareTaskModal`, `SharedTaskPage` + tests → `features/sharing/components/`
- [ ] Move `useTaskSharing`, `useSharedTaskAudio` + tests → `features/sharing/hooks/`
- [ ] Create `features/sharing/index.ts`
- [ ] Rename remaining `components/` → `shared/components/` (BaseModal, ErrorBoundary, Footer, AppHeader, Notification, ui/, etc.)
- [ ] Rename remaining `hooks/` → `shared/hooks/` (useCurrentView, useDocumentTitle, useDragAndDrop, etc.)
- [ ] Rename remaining `utils/` → `shared/utils/`
- [ ] Rename remaining `contexts/` → `shared/contexts/` (NotificationContext)
- [ ] Add TypeScript path alias `@features/*` and `@shared/*` in tsconfig
- [ ] Update all imports
- [ ] Verify build + tests pass
- [ ] Final cleanup: remove empty directories, verify no orphan imports

---

## Notes

- **Each phase = 1 PR.** Don't combine phases.
- **Phases 1-5** (test cleanup) are safe, low-risk, and improve DX immediately.
- **Phases 6-10** (feature extraction) are higher-risk and should be done during low-activity periods to minimize merge conflicts.
- **Always run full test suite** (`pnpm test:all`) after each phase before merging.
- **IDE refactoring tools** (rename/move with auto-import-update) will save significant time in phases 6-10.
