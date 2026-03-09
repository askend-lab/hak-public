# Project Backlog

## Infrastructure

### ~~Upgrade Lambda Node.js runtime to 20.x~~ ✅ DONE

**Priority:** HIGH
**Added:** 2026-02-15 | **Completed:** 2026-02-22
**Context:** Infrastructure audit (see `internal/INFRA_AUDIT_PLAN.md`, item 3.4)

All Lambda functions upgraded to `nodejs22.x` — merlin-api, simplestore, vabamorf-api, tara-auth.
Also added esbuild bundling (PR #657) to properly package runtime dependencies.

---

### ECS Fargate — move to private subnets

**Priority:** MEDIUM
**Added:** 2026-02-15
**Context:** Infrastructure audit (see `internal/INFRA_AUDIT_PLAN.md`, item 3.3)

Merlin worker ECS Fargate tasks run in the default VPC with public IPs. Should move to private subnets with NAT gateway for better security isolation.

**Cost impact:** ~$30/mo for NAT gateway.
**Decision:** Deferred — cost vs security tradeoff for a dev/small-scale project.

---

## CI/CD

### Sync to Public Repository — auth failure

**Priority:** HIGH
**Added:** 2026-03-09
**Context:** GitHub Actions workflow `sync-public.yml` fails on every push to main with auth error. Likely expired PAT/token in repo secrets. Needs secret rotation in GitHub repo settings.

---

### Trivy Docker scan — update action version

**Priority:** MEDIUM
**Added:** 2026-03-09
**Context:** `aquasecurity/trivy-action` pinned to SHA `c1824fd6` fails to download binary. Currently set to `continue-on-error: true` in `build.yml` to unblock builds. Need to update to a newer trivy-action release and remove `continue-on-error`.

---

### jscpd hook — OOM on HAK

**Priority:** MEDIUM
**Added:** 2026-03-09
**Context:** jscpd hook OOMs when scanning HAK project (too many files, 30s timeout). Currently disabled (`mode: off`) in `devbox.yaml`. Previously passed only because of stale `/tmp/jscpd-report/jscpd-report.json` from other projects. Fix options: limit jscpd scan scope in boxer devbox hook, or increase memory/timeout.

---

### Dependabot PRs — stale failures

**Priority:** LOW
**Added:** 2026-03-09
**Context:** 10+ open Dependabot PRs from 2026-02-28, all with failed CI checks. Need review — merge valid updates, close incompatible ones.

---

### Build concurrency — cancel-in-progress

**Priority:** LOW
**Added:** 2026-03-09
**Context:** Fast consecutive merges cancel each other's build jobs due to `concurrency: cancel-in-progress: true`. Could switch to queue mode for main branch to ensure every merge gets built and deployed.
