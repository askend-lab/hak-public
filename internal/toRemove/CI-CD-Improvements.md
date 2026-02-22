# CI/CD Improvements

**Author:** Kate | **Date:** 2026-02-15

## Incrementality Audit

| Aspect | Status | Notes |
|--------|--------|-------|
| Build detection (git diff per package) | ✅ | Includes @hak/shared propagation |
| Artifact reuse (S3 copy unchanged) | ✅ | Good build-once-deploy-many design |
| Deploy diffing (SHA + ETag) | ✅ | Content-based for frontend |
| Test incrementality | ❌ | Always runs ALL tests regardless of changes |
| Trigger filtering | ❌ | Builds on every push including docs/infra |
| Docker layer caching | ⚠️ | Builds from scratch every time |

---

## P0 — Merge Safety Bug

PRs merge into main even when Build fails. Root cause: no required status checks + auto-approve all PRs + auto-merge all PRs.

- [x] Add required status check "Build" to main branch protection (GitHub Settings)
- [x] Enable "Require branches to be up to date before merging"
- [x] Keep auto-approve and auto-merge for ALL PRs (required status checks are the gate that prevents merging when builds fail)
- [x] Change `mergeMethod: MERGE` → `SQUASH` in auto-merge-prs.yml

## P1 — Build Reliability

- [x] Add `pnpm lint` and `pnpm typecheck` to build.yml (before tests) — currently only in build.public.yml
- [x] Replace `pnpm install` → `pnpm install --frozen-lockfile` in build.yml, deploy.yml, e2e-tests.yml, release.yml
- [x] Fix terraform plan `continue-on-error: true` in terraform.yml — plan failure silently ignored, apply can still run
- [x] Add `if: steps.plan.outcome == 'success'` guard to terraform apply step (handled by `needs:` + removing continue-on-error)

## P2 — Consistency & Hardening

- [x] Replace hardcoded `node-version: "20"` → `node-version-file: .nvmrc` in 5 workflows
- [x] Pin all action versions with SHA — sync-to-public.yml uses unpinned `@v4` (supply chain risk)
- [x] Unify `actions/checkout` version (currently 3 different SHAs: v4, v4.2.2, v6)
- [x] Unify `pnpm/action-setup` version (currently 2 different SHAs)
- [x] Unify Terraform version: deploy-merlin-infra=1.5.7, terraform.yml=1.6.0
- [x] Add `timeout-minutes` to all jobs (build:30, deploy:20, terraform:15, merlin-worker:20, release:15)

## P3 — Incrementality & Speed

- [x] Make test running incremental — use change detection outputs to run only affected package tests
- [x] Add `dorny/paths-filter` to build.yml (docs-only PRs skip all heavy steps, workflow still succeeds for required check)
- [ ] Split monolithic build job into parallel jobs: check → build [matrix] → upload
- [x] Add Docker layer caching for vabamorf-api (`docker/build-push-action` + GHA cache)
- [ ] Make deploy.yml `pnpm install` conditional — skip when only frontend (S3 copy) is being deployed

## P4 — Missing Checks

- [x] Add real Python tests for merlin-worker in CI (currently `echo` stub, pytest never runs)
- [x] Add `pull_request` trigger to e2e-tests.yml (currently only on push to main — regressions found after merge)
- [x] Scope security audit: `continue-on-error: true` (reports but doesn't block; critical vulns tracked via Dependabot/CodeQL)

## P5 — Cleanup

- [x] Remove redundant CloudFront invalidation from terraform.yml (already done in deploy.yml)
- [x] Add terraform plan-only step for PRs in deploy-merlin-infra.yml (apply gated by event_name)
- [x] Add `@hak/shared` change detection for test commands (SHARED_CHANGED triggers all package tests)
