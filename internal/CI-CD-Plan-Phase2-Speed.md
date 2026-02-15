# CI/CD Phase 2 — Incrementality & Speed

## 2.1 Split monolithic build into parallel jobs

**Problem:** build.yml runs everything sequentially in one job: setup → all tests → build frontend → build simplestore → build merlin-api → build vabamorf-api → Docker → S3 upload. No parallelization.

**Proposed structure:**
```
setup (checkout, install, detect) →
  check (lint + typecheck + tests) →
    build [parallel matrix: frontend | simplestore | merlin-api | vabamorf] →
      upload (S3 artifacts + manifest)
```

**Benefits:** ~30-50% faster for multi-module changes. Test failure stops early.
**Trade-off:** Multiple jobs = multiple checkouts/installs. Mitigate with pnpm store caching.
**Effort:** High — significant workflow restructure.

## 2.2 Make test running incremental

**Problem:** `pnpm test:all` runs ALL package tests even when only one package changed. Change detection exists for builds but not for tests.

**Fix:** Reuse detect outputs:
```yaml
- name: Test frontend
  if: steps.detect.outputs.frontend == 'true'
  run: pnpm --filter @hak/frontend test:full

- name: Test simplestore
  if: steps.detect.outputs.simplestore == 'true'
  run: pnpm --filter @hak/simplestore test:full
```

When `@hak/shared` changes → run all tests (already handled in detection logic).
**Effort:** Medium — straightforward but needs testing.

## 2.3 Add paths-ignore to build.yml

**Problem:** Builds on every push/PR including docs/, internal/, infra/, *.md.

**Fix option A** (paths-ignore):
```yaml
paths-ignore: ['docs/**', 'internal/**', '*.md', 'infra/**']
```
⚠️ Caveat: with required status checks, PRs touching only ignored paths will be blocked forever (check never runs → never passes).

**Fix option B** (recommended): Use `dorny/paths-filter` inside the workflow to conditionally skip steps but always report a status. This keeps the required check working.

## 2.4 Add Docker layer caching

**Problem:** vabamorf-api and merlin-worker Docker builds from scratch every time.

**Fix:** Use `docker/build-push-action` with GHA cache:
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```
Expected: 30-60s savings per build when layers unchanged.

## 2.5 Optimize deploy.yml dependency install

**Problem:** deploy.yml does full `pnpm install` even for frontend-only deploy (just S3 copy). Serverless framework only needed for lambda deploys.

**Fix:** Make install conditional — only when deploying simplestore, merlin-api, or vabamorf-api.

## 2.6 E2E tests on PRs (conditional)

**Problem:** e2e-tests.yml only on push to main. E2E regressions found after merge.

**Fix:** Add `pull_request` trigger but only when frontend changed:
```yaml
on:
  pull_request:
    branches: [main]
    paths: ['packages/frontend/**']
```
