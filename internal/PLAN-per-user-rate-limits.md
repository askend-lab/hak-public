# Per-User Rate Limits — Implementation Plan

**Date:** 2026-03-09
**Author:** Kate
**Branch:** `kate/per-user-rate-limits`
**Approach:** AWS WAF rate-based rules with custom aggregate keys (Authorization header)

---

## Background

SLA §5.1 defines per-user rate limits, but they are **not implemented** (LIMITS-AND-MONITORING.md §2).
AWS WAF supports custom aggregate keys on headers, enabling per-JWT-token rate limiting
without any custom backend code — pure infrastructure.

**WAF constraints:**
- Minimum rate limit: 10 requests per evaluation window
- Evaluation windows: 1 min, 2 min, 5 min, 10 min
- Custom response: can return 429 instead of default 403

**SLA §5.1 target values vs WAF limits:**

| Operation | Target | WAF rule | Effective | Notes |
|-----------|--------|----------|-----------|-------|
| Synthesis (/synthesize) | 5/min | 10 req / 2 min | 5/min | ✅ WAF min=10, window=2min |
| Morphology (/analyze, /variants) | 20/min | 20 req / 1 min | 20/min | ✅ Direct match |
| Status polling (/status) | 100/min | 100 req / 1 min | 100/min | ✅ Direct match |

---

## Checklist

### Infrastructure (`infra/waf.tf`)

- [x] 1. Add `custom_response_body` to WAF ACL — JSON body for 429 responses
- [x] 2. Update Rule 1 (per-IP general 2000/5min) — return 429 via `custom_response` instead of 403
- [x] 3. Update Rule 2 (per-IP /synthesize 200/5min) — return 429 via `custom_response` instead of 403
- [x] 4. Add Rule 5 — per-user synthesis limit (10 req/2min per Authorization header, scope `/api/synthesize` → 429, effective 5/min)
- [x] 5. Add Rule 6 — per-user morphology limit (20 req/1min per Authorization header, scope `/api/analyze` + `/api/variants` → 429)
- [x] 6. Add Rule 7 — per-user status polling limit (30 req/1min per Authorization header, scope `/api/status` → 429)

### Frontend (`packages/frontend`)

- [x] 7. Handle WAF 403 — show toast for geo-block/forbidden (rate limits now return 429, 403 = non-rate-limit block)

### Documentation

- [x] 8. Update `LIMITS-AND-MONITORING.md` §2 — mark per-user limits as implemented via WAF custom keys
- [x] 9. Update `SLA.md` §5.1 — confirm values match WAF rules (10/min synthesis = original SLA)

### CI/CD

- [ ] 10. Create branch, commit, push, create PR
- [x] 11. Verify frontend 429 handling works with WAF `custom_response` format

---

## Notes

- All rate-limit WAF rules will return **429** (not 403) via `custom_response`
- **403** remains only for geo-block (Rule 3) and AWS Managed Common Rules (Rule 4)
- Custom aggregate key = `Authorization` header → each unique JWT = separate rate limit bucket
- JWT refresh (~1hr) resets the rate limit bucket — acceptable for 1-minute evaluation windows
- Frontend already handles 429 → shows warning toast "Liiga palju päringuid" (PR #758)
