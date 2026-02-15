# CI/CD Phase 1 — Build Reliability & Correctness

## 1.1 Add lint + typecheck to build.yml

**Problem:** build.yml runs `pnpm test:all` but NOT `pnpm lint` or `pnpm typecheck`. The public repo workflow (build.public.yml) does run them. TypeScript errors and lint violations can reach main.

**Fix:** Add before "Run tests" step:
```yaml
- name: Lint
  run: pnpm lint

- name: Typecheck
  run: pnpm typecheck
```

## 1.2 Use --frozen-lockfile everywhere

**Problem:** 4 of 5 workflows use bare `pnpm install`. Only build.public.yml uses `--frozen-lockfile`.

| Workflow | Status |
|----------|--------|
| build.yml | ❌ bare install |
| deploy.yml | ❌ bare install |
| e2e-tests.yml | ❌ bare install |
| release.yml | ❌ bare install |
| build.public.yml | ✅ --frozen-lockfile |

**Fix:** `pnpm install --frozen-lockfile` in all workflows.

## 1.3 Use .nvmrc for Node version

**Problem:** 5 workflows hardcode `node-version: "20"`. Only build.public.yml uses `.nvmrc`.

**Fix:** Replace `node-version: "20"` with `node-version-file: .nvmrc` everywhere.

## 1.4 Pin all action versions with SHA

**Problem:** Mixed versions across workflows:
- `actions/checkout`: 3 different SHAs + unpinned `@v4` in sync-to-public.yml
- `pnpm/action-setup`: 2 different SHAs
- `actions/setup-node`: unpinned `@v4` in sync-to-public.yml

**Fix:** Standardize all on latest pinned SHA. Remove all unpinned tag references.

## 1.5 Add timeout-minutes to all jobs

**Problem:** Only e2e-tests.yml (15min) has a timeout. Others can hang indefinitely.

| Workflow | Suggested |
|----------|-----------|
| build.yml | 30 min |
| deploy.yml | 20 min |
| terraform.yml | 15 min |
| build-merlin-worker.yml | 20 min |
| release.yml | 15 min |

## 1.6 Unify Terraform versions

deploy-merlin-infra.yml uses 1.5.7, terraform.yml uses 1.6.0. Pick one.

## 1.7 Fix Terraform plan continue-on-error

**Problem:** `terraform plan` has `continue-on-error: true` — plan failure is silently ignored, apply can still run.

**Fix:** Remove `continue-on-error` from plan. Add `if: steps.plan.outcome == 'success'` to apply step. Keep `continue-on-error` only on `terraform fmt -check` (cosmetic).
