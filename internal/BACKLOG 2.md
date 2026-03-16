# Project Backlog

## Infrastructure

### Upgrade Lambda Node.js runtime to 20.x

**Priority:** HIGH
**Added:** 2026-02-15
**Context:** Infrastructure audit (see `internal/INFRA_AUDIT_PLAN.md`, item 3.4)

Lambda functions `merlin-api` and `simplestore` are running on `nodejs18.x` which reaches EOL. Need to upgrade to `nodejs20.x` (or `nodejs22.x` when available).

**Scope:**
- `packages/merlin-api/serverless.yml` — update `runtime: nodejs18.x` → `nodejs20.x`
- `packages/simplestore/serverless.yml` — update `runtime: nodejs18.x` → `nodejs20.x`
- Run full test suite after upgrade
- Deploy to dev first, verify, then prod

**Risk:** Low — Node.js 20.x is backward-compatible, but needs testing window to verify no regressions.

---

### ECS Fargate — move to private subnets

**Priority:** MEDIUM
**Added:** 2026-02-15
**Context:** Infrastructure audit (see `internal/INFRA_AUDIT_PLAN.md`, item 3.3)

Merlin worker ECS Fargate tasks run in the default VPC with public IPs. Should move to private subnets with NAT gateway for better security isolation.

**Cost impact:** ~$30/mo for NAT gateway.
**Decision:** Deferred — cost vs security tradeoff for a dev/small-scale project.
