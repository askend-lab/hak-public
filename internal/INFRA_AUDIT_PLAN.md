# Infrastructure Audit Plan

**Date:** 2026-02-15
**Author:** Sam (DevOps Audit)
**Status:** Phase 1 DONE, Phase 3 partial (CloudTrail + GuardDuty configs ready)

---

## Summary

Audited all Terraform files, Serverless configs, Dockerfiles, GitHub Actions workflows, and validated actual AWS state via CLI. Found 16 actionable issues (excluded S3 public access — intentional design).

---

## Phase 1 — Sam does independently (code/config changes) ✅ DONE

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1.1 | WAF rules COUNT → BLOCK | CRITICAL | ✅ Done (waf.tf) |
| 1.2 | Slack notifier Python 3.9 → 3.12 | MEDIUM | ✅ Done (slack-notifications.tf) |
| 1.3 | DynamoDB PITR enabled | HIGH | ✅ Done (dynamodb.tf) |
| 1.4 | CSP Report-Only → enforcing | MEDIUM | ✅ Done (cloudfront.tf) |
| 1.5 | ECR merlin-worker drift | HIGH | ⚠️ Terraform code correct, needs `terraform apply` |
| 1.6 | CloudFront access logging | MEDIUM | ✅ Done (cloudfront.tf + website.tf, new log bucket) |
| 1.7 | S3 website versioning | MEDIUM | ✅ Done (website.tf) |

---

## Phase 2 — Requires Alex (AWS console / credentials / IAM)

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 2.1 | askendadmin: AdministratorAccess + access key + no MFA | CRITICAL | Enable MFA, rotate/remove access key |
| 2.2 | anton.anikin@askend.com has no MFA | CRITICAL | Enable MFA |
| 2.3 | No IAM password policy | CRITICAL | Set account password policy |
| 2.4 | agent-readonly has 2 active access keys | HIGH | Delete older key (AKIAWYTRTBZ4L4M7BOVF) |
| 2.5 | agent-readonly name is misleading | MEDIUM | Has full DynamoDB write on production |

---

## Phase 3 — Architecture decisions (Terraform configs READY)

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 3.1 | No CloudTrail | CRITICAL | ✅ Terraform config ready (infra/cloudtrail.tf) — multi-region, S3 log bucket with 365-day retention, transitions to IA after 90 days |
| 3.2 | No GuardDuty | CRITICAL | ✅ Terraform config ready (infra/guardduty.tf) — basic detector with S3 monitoring |
| 3.3 | ECS Fargate in default VPC with public IP | MEDIUM | Needs discussion — private subnets + NAT = ~$30/mo |
| 3.4 | Prod Lambda functions on nodejs18.x | HIGH | Needs coordinated deploy + testing window |

---

## Phase 4 — Cleanup (orphaned resources investigation)

### Bug found during investigation

**CloudWatch monitoring was watching the WRONG DynamoDB table!**
- Alarms and dashboard referenced `single-table-lambda-${env}` (old table name)
- Actual active table is `simplestore-${env}` (created by Serverless)
- **Fixed:** Updated `cloudwatch-alarms.tf` and `cloudwatch-dashboard.tf`
- **Fixed:** Updated agent-readonly IAM policy to reference `simplestore-*` tables

### Investigation results from AWS CLI + CloudWatch metrics

| # | Resource | Type | Status | Invocations (30d) | Recommendation |
|---|----------|------|--------|-------------------|----------------|
| 4.1 | `single-table-lambda-dev` | DynamoDB | 2 items, 378 bytes | N/A | ⚠️ Old table, has stale data. Managed by Terraform. Need `terraform state rm` then delete. |
| 4.2 | `single-table-lambda-prod` | DynamoDB | 0 items, empty | N/A | ✅ Empty. Same removal process. |
| 4.3 | `single-table-lambda-dev` | CF Stack + API GW + Lambda | Last updated 2025-12-17 | 0 | ✅ Dead. `serverless remove --stage dev` in old repo. |
| 4.4 | `audio-api-dev` | CF Stack (3 Lambdas) | Updated 2026-02-14 | **0** | ✅ Deployed by CI but NEVER called. `serverless remove --stage dev`. |
| 4.5 | `audio-api-prod` | CF Stack (3 Lambdas) | Updated 2026-02-09 | **0** | ✅ Deployed by CI but NEVER called. `serverless remove --stage prod`. |
| 4.6 | `dev-audio-api` / `prod-audio-api` | REST API Gateway | Active but unused | 140 (dev) / 0 (prod) | Part of audio-api stacks, removed together. |
| 4.7 | `hak-audio-dev` | S3 | `cache/` prefix only, 0 objects | N/A | ✅ Empty. Safe to delete. |
| 4.8 | `hak-audio-prod` | S3 | 0 objects, public read on `cache/*` | N/A | ✅ Empty. Safe to delete. |
| 4.9 | `hak-audio-generation-dev` + DLQ | SQS | 0 messages | N/A | Part of audio-api, removed together. |
| 4.10 | `hak-audio-generation-prod` + DLQ | SQS | 0 messages | N/A | Part of audio-api, removed together. |
| 4.11 | `eki/merlin` | ECR | 15 images, no scan, MUTABLE | N/A | Legacy. Not referenced in code. Delete after confirming. |
| 4.12 | `eki/vabamorf` | ECR | 9 images, no scan, MUTABLE | N/A | Legacy. Not referenced in code. Delete after confirming. |
| 4.13 | `single-table-lambda-dev-users` | Cognito Pool | 0 users | N/A | ✅ Empty. Safe to delete. |
| 4.14 | `serverless-vabamorf-api-dev/prod` | ECR | No scan, MUTABLE | N/A | Created by Serverless. Low priority. |
| 4.15 | `exams-backend-dev` | CF Stack (2 Lambdas) | Created 2025-10-28 | **0** | ✅ Dead. Not part of HAK project. |
| 4.16 | `askendmcp-trello-mcp` | Lambda | Active | **0** | Not HAK project. Separate concern. |
| 4.17 | `packages/audio-api/` | Directory | Only coverage artifacts, no source | N/A | ✅ Ghost directory. Delete from repo. |

### Key insight: audio-api is NOT orphaned by accident
- `audio-api` is the **predecessor** of `merlin-api` (same pattern: SQS queue, S3 bucket, Lambda)
- It's deployed by some CI process (stacks updated Feb 9-14) but NOT in `deploy.yml`
- Zero invocations confirms nobody uses it — the frontend calls `merlin-api` now
- Safe to remove: `serverless remove` for both stacks will clean up Lambdas, API Gateway, SQS, and S3

---

## Execution Order

1. ~~Phase 1: Sam implements terraform changes~~ ✅ DONE
2. ~~Phase 3 partial: CloudTrail + GuardDuty configs~~ ✅ DONE
3. ~~Phase 4 partial: Investigation + cleanup code~~ ✅ DONE
4. **Now:** Merge PR → CI/CD auto-applies Terraform changes + deploys simplestore PITR
5. **Then:** Run `cleanup-orphaned.yml` workflow (type DELETE to confirm)
6. **Phase 2:** Alex handles IAM/MFA items (AWS console)
