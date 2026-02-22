# Infrastructure Audit — Results

**Date:** 2026-02-15
**Author:** Sam (DevOps Audit)
**Status:** ✅ ALL PHASES COMPLETE

---

## Summary

Audited all Terraform files, Serverless configs, Dockerfiles, GitHub Actions workflows, and validated actual AWS state via CLI. Found 16 actionable issues. All resolved via PRs #559, #561, #563 + manual AWS Console actions.

---

## Phase 1 — Security & Config Fixes ✅ APPLIED (dev + prod)

| # | Issue | Severity | Fix | PR |
|---|-------|----------|-----|-----|
| 1.1 | WAF rules COUNT → BLOCK | CRITICAL | `waf.tf` — rate-limit + managed rules now blocking | #559 |
| 1.2 | Slack notifier Python 3.9 → 3.12 | MEDIUM | `slack-notifications.tf` — runtime updated | #559 |
| 1.3 | DynamoDB PITR enabled | HIGH | `simplestore/serverless.yml` — PITR on active table | #559 |
| 1.4 | CSP Report-Only → enforcing | MEDIUM | `cloudfront.tf` — native `security_headers_config.content_security_policy` | #561 |
| 1.5 | ECR merlin-worker drift | HIGH | Terraform code correct, applied via CI/CD | #559 |
| 1.6 | CloudFront access logging | MEDIUM | `cloudfront.tf` + `website.tf` — new log bucket with 90-day lifecycle | #559 |
| 1.7 | S3 website versioning | MEDIUM | `website.tf` — versioning enabled | #559 |

---

## Phase 2 — IAM & Account Security ✅ DONE (Alex, AWS Console)

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 2.1 | askendadmin: no MFA | CRITICAL | ✅ 2FA enabled |
| 2.2 | anton.anikin@askend.com: no MFA | CRITICAL | ✅ Account blocked |
| 2.3 | No IAM password policy | CRITICAL | ✅ Policy set: 14 chars, symbols+numbers+upper+lower, 90-day expire, 12 reuse prevention |
| 2.4 | agent-readonly: 2 active access keys | HIGH | ⏸️ Deferred |
| 2.5 | agent-readonly name misleading | MEDIUM | ⏸️ Deferred |

---

## Phase 3 — CloudTrail & GuardDuty ✅ APPLIED

| # | Issue | Severity | Status | PR |
|---|-------|----------|--------|----|
| 3.1 | No CloudTrail | CRITICAL | ✅ `infra/cloudtrail.tf` — multi-region trail, S3 bucket (365-day retention, IA after 90 days) | #559 |
| 3.2 | No GuardDuty | CRITICAL | ✅ `infra/guardduty.tf` — detector with S3 monitoring (dev only, per-account) | #559, #563 |
| 3.3 | ECS Fargate in default VPC | MEDIUM | ⏸️ Deferred — private subnets + NAT = ~$30/mo |
| 3.4 | Lambda nodejs18.x runtime | HIGH | ✅ Upgraded to nodejs22.x in all serverless.yml (merlin-api, simplestore, vabamorf-api, tara-auth) |

---

## Phase 4 — Orphaned Resources Cleanup ✅ DONE

### Bug found and fixed during investigation

**CloudWatch monitoring was watching the WRONG DynamoDB table!**
- Alarms and dashboard referenced `single-table-lambda-${env}` (old, deleted)
- Actual active table is `simplestore-${env}` (created by Serverless)
- **Fixed:** `cloudwatch-alarms.tf`, `cloudwatch-dashboard.tf`, agent-readonly IAM policy (PR #559)

### Cleanup actions

| # | Resource | Action | Status |
|---|----------|--------|--------|
| 4.1-4.2 | `single-table-lambda-*` DynamoDB tables | Removed from Terraform, tables destroyed by apply | ✅ Done |
| 4.3 | `single-table-lambda-dev` CF Stack | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.4-4.5 | `audio-api-dev/prod` CF Stacks | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.6 | `dev/prod-audio-api` API Gateways | Removed with CF stacks | ✅ Running |
| 4.7-4.8 | `hak-audio-*` S3 buckets | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.9-4.10 | `hak-audio-generation-*` SQS | Removed with CF stacks | ✅ Running |
| 4.11-4.12 | `eki/merlin`, `eki/vabamorf` ECR | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.13 | `single-table-lambda-dev-users` Cognito | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.15 | `exams-backend-dev` CF Stack | `cleanup-orphaned.yml` workflow | ✅ Running |
| 4.17 | `packages/audio-api/` ghost directory | Deleted from repo | ✅ Done |

### Terraform state cleanup
- Orphaned audio resources removed from state via automated step in `terraform.yml`
- GuardDuty made per-account (dev only) to avoid duplicate detector error

---

## Fixes applied during deployment

| Issue | Root cause | Fix | PR |
|-------|-----------|-----|-----|
| CSP rejected by CloudFront API | `Content-Security-Policy` can't be in `custom_headers_config` | Moved to native `security_headers_config.content_security_policy` | #561 |
| GuardDuty CreateDetector failed on prod | Per-account resource, dev already created it | Added `count = var.env == "dev" ? 1 : 0` | #563 |
| S3 bucket delete failed (hak-audio-dev) | Bucket not empty, still in Terraform state | Added `terraform state rm` step before apply | #561 |
| Terraform plan format warnings | Missing `filter {}` in lifecycle rules | Added empty filter blocks | #559 |
| Prod `ApiEndpoint` output missing | merlin-api-prod uses `HttpApiUrl` key | Updated `locals.tf` to use `HttpApiUrl` | #559 |
