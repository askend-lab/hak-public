# CI/CD Phase 3 — Missing Checks & Cleanup

## 3.1 Add merlin-worker Python tests to CI

**Problem:** `merlin-worker` test:full is `echo 'Python package — run pytest tests/ -v'` — just prints a message. Python tests never actually run in CI.

**Fix:** Add to build-merlin-worker.yml before Docker build:
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
- name: Run tests
  working-directory: packages/merlin-worker
  run: |
    pip install -r requirements.txt
    pytest tests/ -v
```

## 3.2 Scope security audit

**Problem:** `pnpm audit --audit-level=high` in build.yml fails the entire build on any high advisory, including dev dependencies. No workaround.

**Options:**
1. Separate non-blocking security job (recommended)
2. `pnpm audit --audit-level=high --production` (skip dev deps)
3. `pnpm audit || true` with PR comment reporting

Critical vulns are already tracked via Dependabot and CodeQL.

## 3.3 Remove or scope auto-approve

Either delete `auto-approve-prs.yml` or limit to: `if: github.actor == 'dependabot[bot]'`

## 3.4 Remove redundant CloudFront invalidation

Both deploy.yml and terraform.yml invalidate CloudFront. Terraform doesn't change frontend content — only infrastructure. Remove invalidation from terraform.yml.

## 3.5 Add deploy-merlin-infra plan step for PRs

**Problem:** deploy-merlin-infra.yml runs terraform apply on push to main without plan-review for PRs.

**Fix:** Add plan-only job triggered on `pull_request` with `paths: ['infra/merlin/**']`. Apply only on push to main.

## 3.6 Add @hak/shared to change detection for tests

When `@hak/shared` changes, detection already triggers all builds. Extend the same logic to test commands so all package tests run when shared changes.

## 3.7 Change auto-merge method to SQUASH

In `auto-merge-prs.yml`: `mergeMethod: MERGE` → `mergeMethod: SQUASH`. Cleaner history.
