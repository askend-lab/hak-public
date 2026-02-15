# CI/CD Improvement Plan — Overview

**Author:** Kate | **Date:** 2026-02-15 | **Status:** Draft

## Context

HAK monorepo: 10 packages, 4 deployed modules (frontend, simplestore, merlin-api, vabamorf-api) + merlin-worker. Philosophy: incremental build → S3 artifact → incremental deploy. Currently 13 GitHub Actions workflows.

## Critical Bug: PRs Merge Despite Failing Builds

Branch protection on `main` requires 1 approval but **no required status checks**. Combined with `auto-approve-prs.yml` (approves ALL PRs) and `auto-merge-prs.yml` (enables auto-merge on open), PRs merge immediately regardless of Build status.

**Fix (Phase 0):** Add required status check "Build" + scope auto-approve to dependabot only.

## Incrementality Audit

| Aspect | State | Notes |
|--------|-------|-------|
| Build detection (git diff per package) | ✅ | Includes @hak/shared propagation |
| Artifact reuse (S3 copy for unchanged) | ✅ | Good design |
| Deploy diffing (SHA + ETag comparison) | ✅ | Content-based for frontend |
| Test incrementality | ❌ | Always runs ALL tests |
| Trigger filtering (paths-ignore) | ❌ | Builds on every push including docs/infra |
| Docker layer caching | ⚠️ | Builds from scratch every time |
| Deploy dependency install | ⚠️ | Full install even for S3-only frontend deploy |

## Plan Structure

- **Phase 0** — Fix merge safety bug → `CI-CD-Plan-Phase0-Safety.md`
- **Phase 1** — Build reliability → `CI-CD-Plan-Phase1-Reliability.md`
- **Phase 2** — Incrementality & speed → `CI-CD-Plan-Phase2-Speed.md`
- **Phase 3** — Missing checks & cleanup → `CI-CD-Plan-Phase3-Coverage.md`

## Priority Matrix

| Pri | Items | Impact | Effort |
|-----|-------|--------|--------|
| P0 | Required status checks, scope auto-approve | Critical | Low |
| P1 | Lint/typecheck in build, --frozen-lockfile, fix TF plan | High | Low |
| P2 | .nvmrc, pin actions, timeouts, paths-ignore, incremental tests, SQUASH | Med-High | Low-Med |
| P3 | Parallel builds, Docker cache, Python tests, E2E on PRs | Med-High | Med-High |
| P4 | CF invalidation cleanup, TF version unify, merlin-infra plan | Low | Low-Med |
