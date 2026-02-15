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

Investigation results from AWS CLI:

| # | Resource | Type | Status | Recommendation |
|---|----------|------|--------|----------------|
| 4.1 | `single-table-lambda-dev` | DynamoDB | 2 items, 378 bytes, created 2025-12-16 | ⚠️ Has data. Verify before deleting. |
| 4.2 | `single-table-lambda-prod` | DynamoDB | 0 items, 0 bytes, created 2026-01-05 | ✅ Empty. Safe to delete. |
| 4.3 | `dev-single-table-lambda` | REST API Gateway | Last modified unknown | Legacy. Verify no traffic, delete. |
| 4.4 | `audio-api-dev-*` (3 functions) | Lambda | Last modified 2026-02-14, nodejs20.x | ⚠️ Recently updated! May still be active. |
| 4.5 | `audio-api-prod-*` (3 functions) | Lambda | Last modified 2026-02-09, nodejs18.x | ⚠️ Recently updated! May still be active. |
| 4.6 | `dev-audio-api` / `prod-audio-api` | REST API Gateway | Active | ⚠️ Goes with audio-api Lambdas. |
| 4.7 | `hak-audio-dev` | S3 | Has `cache/` prefix, 0 objects | Likely safe to delete. |
| 4.8 | `hak-audio-prod` | S3 | 0 objects, public read on `cache/*` | Likely safe to delete. |
| 4.9 | `eki/merlin` | ECR | 15 images, no scan, MUTABLE | Legacy repo. Check if referenced anywhere. |
| 4.10 | `eki/vabamorf` | ECR | 9 images, no scan, MUTABLE | Legacy repo. Check if referenced anywhere. |
| 4.11 | `single-table-lambda-dev-users` | Cognito Pool | 0 users, created 2025-12-16 | ✅ Empty. Safe to delete. |
| 4.12 | `hak-audio-generation-prod` + DLQ | SQS | 0 messages, created 2025-01-07 | Legacy queues from old audio-api. |
| 4.13 | `serverless-vabamorf-api-dev/prod` | ECR | No scan, MUTABLE | Created by Serverless. Unmanaged. |

**⚠️ Important:** Items 4.4-4.6 (audio-api-*) were updated as recently as Feb 14, 2026. These may NOT be orphaned — verify with team before deleting.

---

## Execution Order

1. ~~Phase 1: Sam implements terraform changes~~ ✅ DONE
2. **Now:** Alex reviews PR with Phase 1 + Phase 3 configs
3. **Phase 2:** Alex handles IAM/MFA items
4. **Phase 3:** `terraform apply` for CloudTrail + GuardDuty after review
5. **Phase 4:** Team discusses cleanup list, deletes confirmed orphans
