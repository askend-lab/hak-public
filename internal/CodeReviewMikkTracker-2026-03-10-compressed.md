# Code Review Tracker — Compressed (2026-03-10)

Only items that are **NOT fully resolved**. All items with four ✅ are omitted.

---

## Security — ⚠️ Known risks (external lib)

- ⚠️ **12.4** (Medium) OS Command Injection via shell=True — `generate.py:73` still has `shell=True`. External `merlin/` lib excluded from ruff.
- ⚠️ **12.5** (Medium) pickle.load — `run_merlin.py:99` still uses `pickle.load` without checksum. External `merlin/` lib excluded from ruff.

## Public API — ⚠️ Issues

- ⚠️ **PUB-5** (HIGH) MAX_TEXT_LENGTH — Backend enforced (100), but frontend `maxLength` attribute still missing on some inputs.

## Public API — 🧪 Needs Penetration Testing

- 🧪 **PUB-1** (CRITICAL) AWS Budgets — `infra/budgets.tf` present. Needs TEST-5.
- 🧪 **PUB-2** (CRITICAL) ECS max_capacity — `infra/merlin/main.tf` present. Needs TEST-2.
- 🧪 **PUB-4** (HIGH) SQS queue depth cap — `sqs.ts` checkQueueDepth present. Needs TEST-6.
- 🧪 **PUB-6** (HIGH) CloudWatch alerts — `infra/cloudwatch-alarms.tf` present. Needs TEST-4.
- 🧪 **PUB-10** (MEDIUM) Geo-blocking — `infra/waf.tf` geo-restrict rule present. Needs pen test from non-allowed country.

## Public API — ❓ Cannot verify locally

- ❓ **PUB-14** (CRITICAL) Account-level budget + alerts — in separate infra repo.
- ❓ **PUB-15** (HIGH) Daily Cost Digest Lambda — in separate infra repo.

## Public API — ❌ Reverted

- ❌ **PUB-3** (CRITICAL) Lambda concurrency limits — reverted (AWS account limit). Protection via WAF + geo-blocking + SQS cap.

## Public API — ⏸️ Deferred

- ⏸️ **PUB-7** (HIGH) Anomaly detection + auto-ban
- ⏸️ **PUB-8** (MEDIUM) Audit and forensics
- ⏸️ **PUB-11** (MEDIUM) Bot-detection / Proof-of-Work
- ⏸️ **PUB-12** (MEDIUM) Request fingerprinting

## Lauri — Needs staging verification

- ✅ Fixed, not Closed — **LAURI-P1** (Medium) Store API leaks DynamoDB terminology — code fix in place, needs staging deploy.
- ✅ Fixed, not Closed — **LAURI-P2** (Medium) Store API input validation — code fix in place, needs staging deploy.
- ✅ Fixed, not Closed — **LAURI-1** (High) No architecture pattern — code fix in place, needs staging deploy.
- ✅ Fixed, not Closed — **LAURI-2** (High) Write skew on first insert — code fix in place, needs staging deploy.
- ✅ Fixed, not Closed — **LAURI-5** (High) Risky authentication — code fix in place, needs staging deploy.

## Logging — Fixed, not yet Closed

All LOG items are fixed (code merged) but not yet Closed (needs staging verification).

- **LOG-1** (CRITICAL) Structured JSON logger
- **LOG-2** (CRITICAL) withContext(fields)
- **LOG-3** (HIGH) Request correlation
- **LOG-4** (CRITICAL) Logging in tts-api
- **LOG-5** (HIGH) Store handler silent catch fix
- **LOG-6** (HIGH) Auth Cognito trigger logging
- ⚠️ **LOG-7** (MEDIUM) Store routes logging — **deferred** (ESM transform issue)
- **LOG-8** (MEDIUM) Auth module logging
- **LOG-9** (HIGH) logRetentionInDays: 30
- **LOG-10** (MEDIUM) CloudWatch Insights queries
- **LOG-11** (MEDIUM) Standardize error logging
- **LOG-12** (MEDIUM) Business event logging
- **LOG-13** (LOW) Debug-level logging
- **LOG-14** (LOW) tts-api → tts-worker correlation

## Error Handling — Fixed, not yet Closed

All ERR items are fixed (code merged) but not yet Closed (needs staging verification).

- **ERR-1** (HIGH) extractErrorMessage() everywhere
- **ERR-2** (MEDIUM) AppError hierarchy
- **ERR-3** (LARGER) wrapLambdaHandler()
- **ERR-4** (HIGH) Silent catches in cognito-client
- **ERR-5** (MEDIUM) Error re-wrapping with cause
- **ERR-6** (MEDIUM) morphology-api shared response

## Penetration Tests — ⏸️ All Pending

- ⏸️ **TEST-1** (CRITICAL) Load testing
- ⏸️ **TEST-2** (CRITICAL) Auto-scaling testing
- ⏸️ **TEST-3** (CRITICAL) Lambda concurrency testing
- ⏸️ **TEST-4** (HIGH) Alert testing
- ⏸️ **TEST-5** (HIGH) Budget limit testing
- ⏸️ **TEST-6** (HIGH) SQS queue depth testing

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| ⚠️ Known risks (external lib) | 2 | 12.4 shell=True, 12.5 pickle.load |
| ⚠️ Frontend issue | 1 | PUB-5 maxLength attribute |
| 🧪 Needs pen testing | 5 | PUB-1, 2, 4, 6, 10 |
| ❓ Separate infra repo | 2 | PUB-14, 15 |
| ❌ Reverted (by design) | 1 | PUB-3 |
| ⏸️ Deferred features | 4 | PUB-7, 8, 11, 12 |
| Needs staging deploy | 5 | LAURI-P1, P2, 1, 2, 5 |
| Fixed, not Closed (LOG) | 14 | LOG-1..14 (incl. LOG-7 deferred) |
| Fixed, not Closed (ERR) | 6 | ERR-1..6 |
| ⏸️ Pen tests pending | 6 | TEST-1..6 |
| **Total open items** | **46** | |
| **Fully resolved (omitted)** | **~80** | All with four ✅ |
