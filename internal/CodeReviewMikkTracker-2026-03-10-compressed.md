# Code Review Tracker — Compressed (2026-03-10)

Only items that are **NOT fully resolved**. All items with four ✅ are omitted.

Re-verified 2026-03-10: checked every "Fixed, not Closed" item against actual code.
Result: **25 items closed**, **21 items remain open**.

---

## ⚠️ Known Risks (external lib, accepted)

- **12.4** (Medium) `shell=True` in `generate.py:73` — external `merlin/` lib, excluded from ruff
- **12.5** (Medium) `pickle.load` in `run_merlin.py:99` — external `merlin/` lib, no checksum

## ⚠️ Deferred Fix

- **LOG-7** (MEDIUM) Store routes logging — zero logger calls in `routes.ts`. Blocked by ESM transform issue in store tests.

## 🧪 Needs Penetration Testing

Code verified present, but needs live testing to confirm behavior under load/attack.

- **PUB-1** (CRITICAL) AWS Budgets — `infra/budgets.tf` ✅. Needs TEST-5.
- **PUB-2** (CRITICAL) ECS max_capacity=3 — `infra/merlin/main.tf` ✅. Needs TEST-2.
- **PUB-4** (HIGH) SQS queue depth cap=50 — `tts-api/src/sqs.ts` ✅. Needs TEST-6.
- **PUB-6** (HIGH) CloudWatch alerts — `infra/cloudwatch-alarms.tf` ✅. Needs TEST-4.
- **PUB-10** (MEDIUM) Geo-blocking — `infra/waf.tf` geo-restrict rule ✅. Needs pen test.

## ❓ Cannot Verify Locally

- **PUB-14** (CRITICAL) Account-level budget + alerts — separate infra repo
- **PUB-15** (HIGH) Daily Cost Digest Lambda — separate infra repo

## ❌ Reverted (by design)

- **PUB-3** (CRITICAL) Lambda concurrency limits — reverted (AWS account limit). Protected by WAF + geo-blocking + SQS cap.

## ⏸️ Deferred Features

- **PUB-7** (HIGH) Anomaly detection + auto-ban
- **PUB-8** (MEDIUM) Audit and forensics
- **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work
- **PUB-12** (MEDIUM) Request fingerprinting

## ⏸️ Penetration Tests — All Pending

- **TEST-1** (CRITICAL) Load testing (10 users + 100+ req/min attack)
- **TEST-2** (CRITICAL) Auto-scaling testing (ECS max_capacity behavior)
- **TEST-3** (CRITICAL) Lambda concurrency testing (429 vs 500)
- **TEST-4** (HIGH) Alert testing (Slack delivery < 5 min)
- **TEST-5** (HIGH) Budget limit testing ($0.01 test budget)
- **TEST-6** (HIGH) SQS queue depth testing (60+ burst → 503 + recovery)

---

## What was closed today (2026-03-10)

Verified by code inspection and closed:

- **LAURI-P1** — `toClientItem()` strips PK/SK/version/owner/ttl
- **LAURI-P2** — Zod schemas in `validation.ts` for all endpoints
- **LAURI-1** — `createApiResponse` from `@hak/shared` in store, tts-api, morphology-api
- **LAURI-2** — Atomic upsert (single DynamoDB call, `if_not_exists` + version++)
- **LAURI-5** — No `X-User-Id`; uses `Cognito claims.sub` exclusively
- **PUB-5** — All 3 synthesis inputs have `maxLength={100}`
- **LOG-1..6, LOG-8..14** — All logger code verified in place (13 items)
- **ERR-1..6** — All error handling code verified in place (6 items)

---

## Summary

| Category | Count | Items |
|----------|-------|-------|
| ⚠️ Known risks (external lib) | 2 | 12.4, 12.5 |
| ⚠️ Deferred fix | 1 | LOG-7 |
| 🧪 Needs pen testing | 5 | PUB-1, 2, 4, 6, 10 |
| ❓ Separate infra repo | 2 | PUB-14, 15 |
| ❌ Reverted (by design) | 1 | PUB-3 |
| ⏸️ Deferred features | 4 | PUB-7, 8, 11, 12 |
| ⏸️ Pen tests pending | 6 | TEST-1..6 |
| **Total open** | **21** | |
| **Closed today** | **25** | LAURI ×5, PUB-5, LOG ×13, ERR ×6 |
| **Previously resolved** | **~80** | All with four ✅ |
