# CI/CD Phase 0 — Merge Safety Bug

## The Problem

PRs merge into main even when Build fails. Three workflows create a bypass chain:

1. **auto-approve-prs.yml** — approves EVERY PR on `opened/reopened/synchronize`
2. **auto-merge-prs.yml** — enables auto-merge on EVERY PR on `opened/reopened`
3. **Branch protection** — requires 1 approval (satisfied by #1) but NO required status checks

**Result:** PR opens → instant approval → merges before Build completes or despite Build failure.

## Fixes

### Fix 1: Add required status checks (GitHub Settings)

In repo Settings → Branches → `main` protection rule:
- Enable "Require status checks to pass before merging"
- Add required check: `Build` (job name from build.yml)
- Enable "Require branches to be up to date before merging"

### Fix 2: Scope auto-approve to bot PRs only

Replace `auto-approve-prs.yml` content — add condition:
```yaml
if: github.actor == 'dependabot[bot]'
```
Or delete the workflow entirely if manual review is preferred for all PRs.

### Fix 3: Change merge method to SQUASH

In `auto-merge-prs.yml`, change `mergeMethod: MERGE` to `mergeMethod: SQUASH`.

### Fix 4: Scope auto-merge to bot PRs

Same pattern — add `if: github.actor == 'dependabot[bot]'` to auto-merge job.

## Verification

After applying:
1. Open a PR with a failing test
2. Confirm Build workflow runs and reports failure
3. Confirm PR cannot merge (blocked by required check)
4. Fix the test, push — Build passes — PR can merge
