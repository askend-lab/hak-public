# hak-public DX Improvement Plan

Analysis date: 2026-02-13
Analyst: Sam
Source: Fresh clone of `askend-lab/hak-public` (commit 5aaee90)

## Current State

| Check | Result |
|-------|--------|
| `pnpm install` | ✅ 9.6s, clean |
| `pnpm start` | ✅ dev server at :5181, proxies to deployed APIs |
| `pnpm test:all` | ✅ 2179 passed, 3 skipped, 5s |
| `pnpm lint` | ✅ zero warnings |
| `pnpm typecheck` | ❌ FAILS — missing jest.setup.ts |
| `pnpm check` | ❌ FAILS — typecheck breaks it |
| `pnpm build` | ✅ with warnings (831KB chunk, sourcemap warnings) |

**Goal:** After Phase 1, all checks should pass and a new frontend developer can start working immediately.

---

## Phase 1 — Quick Sync/Filter Fixes

Fixes via `scripts/sync-to-public.sh`, `.opensource-exclude`, or adding small files. No large refactoring. Goal: make everything run and pass in the public repo.

- [ ] **1.1 Fix `pnpm typecheck` — transform tsconfig.json during sync** ❌ BLOCKER
  - Root cause: `jest.setup.ts` excluded (`.opensource-exclude:42`) but `tsconfig.json` has `"include": ["jest.setup.ts"]` → TS18003 error
  - Fix: Add `sed` in `sync-to-public.sh` to replace `"include": ["jest.setup.ts"]` with `"include": []`
  - Where: `scripts/sync-to-public.sh` (after line 224, add tsconfig cleanup)

- [ ] **1.2 Add `packages/shared/tsconfig.json`** ❌ BLOCKER
  - Root cause: `shared` has no tsconfig, falls back to root which needs jest.setup.ts
  - Fix: Create `packages/shared/tsconfig.json` extending root config (benefits both repos)
  - Where: new file `packages/shared/tsconfig.json`

- [ ] **1.3 Verify `pnpm check` passes after 1.1 + 1.2**
  - Run sync dry-run, then `pnpm check` in output dir
  - All 3 stages must pass: lint ✅ typecheck ✅ tests ✅

- [ ] **1.4 Add CI workflow for public repo**
  - Root cause: All workflows excluded → zero CI, PRs merge without checks
  - Fix: Create `.github/workflows/build.public.yml` in main repo, sync script renames to `build.yml`
  - Steps: lint → typecheck → test on push/PR to main

- [ ] **1.5 Add `.env.example` for public repo**
  - Root cause: `.env.example` excluded (has internal AWS values), but 6 VITE_ vars are undocumented
  - Fix: Create `.env.example.public` with public-safe VITE_ vars (empty defaults), rename during sync

- [ ] **1.6 Fix `engines.node` vs `.nvmrc` mismatch**
  - `package.json` says `>=18.0.0`, `.nvmrc` says `20`
  - Fix: Change engines to `>=20.0.0`

- [ ] **1.7 Verify CHANGELOG.md syncs correctly**
  - Exists in main, not in `.opensource-exclude` — should sync. Confirm after next sync run.

- [ ] **1.8 Re-sync and verify everything works end-to-end**
  - Run `scripts/sync-to-public.sh --dry-run --output /tmp/hak-public-test`
  - In output: `pnpm install && pnpm check && pnpm build` all pass
  - Push to hak-public

---

## Phase 2 — Quality & DX Improvements

Larger changes that improve the developer experience and code quality. Not blocking, but make the project more professional.

- [ ] **2.1 Code splitting — reduce 831KB bundle**
  - Add `React.lazy()` for route-level components (SpecsPage, Dashboard, TasksView)
  - Target: main chunk < 500KB

- [x] **2.2 Add pre-commit hooks for external contributors** ✅ DONE
  - Implemented: Husky + lint-staged (`.husky/pre-commit` → `pnpm lint-staged` → ESLint on staged files)
  - Sync script adds `"prepare": "husky"` and keeps `lint-staged` config in public package.json
  - Private repo unaffected (core.hooksPath=.githooks overrides husky)

- [ ] **2.3 E2E tests without AWS dependencies**
  - Currently excluded (depend on Secrets Manager, Cognito test users)
  - Create mock-based Playwright tests that work standalone

- [ ] **2.4 Auth flow documentation**
  - tara-auth package excluded (security-sensitive), but devs need to understand auth
  - Add architecture/sequence diagrams to `docs/` without implementation details

- [ ] **2.5 Fix `pnpm approve-builds` warning**
  - First `pnpm install` warns about 7 blocked build scripts
  - Add `pnpm.onlyBuiltDependencies` to package.json

- [ ] **2.6 Fix sourcemap warnings during build**
  - 8 files emit "Can't resolve original location of error"
  - Investigate SCSS sourcemaps in PronunciationVariants/TaskDetailView components

- [ ] **2.7 Clean up `simplestore` workspace dependency name**
  - Frontend devDeps has `"simplestore": "workspace:*"` (missing `@hak/` scope)
  - Rename or remove if not actually needed
