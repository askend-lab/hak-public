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
