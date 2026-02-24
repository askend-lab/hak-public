# HAK Improvement Plan — 2026-02-24

Status legend: ⬜ not started | 🔄 in progress | ✅ done

---

## Block 1: Close Tracker Warnings (⚠️ items)

Small fixes from Mikk code review that are marked Fixed but have ⚠️ caveats.

- [ ] **1.1** `generate.mjs` references old package paths (`packages/merlin-api/` → `packages/tts-api/`, `packages/vabamorf-api/` → `packages/morphology-api/`) — ref: 1.4.1
- [ ] **1.2** ARCHITECTURE.md still uses old package names throughout (simplestore, merlin-api, merlin-worker, vabamorf-api, tara-auth) — ref: 1.3.2, 14.1
- [ ] **1.3** tts-api README still lists `/warmup` endpoint, warmup rate limit, and ECS env vars "for warmup" — ref: 15.1
- [ ] **1.4** Frontend textarea missing `maxLength` attribute + user-facing character limit message — ref: 15.5, PUB-5
- [ ] **1.5** `generate.py:73` still uses `shell=True` in `subprocess.Popen()` — ref: 12.4, 15.3
- [ ] **1.6** `run_process` dead import in `run_merlin.py:53` — ref: 15.3
- [ ] **1.7** `LoginModalProps.message` declared but unused in `LoginModal.tsx:14` — ref: 4.6
- [ ] **1.8** ESLint rule `no-unnecessary-type-arguments` not found in config — ref: 4.7
- [ ] **1.9** `pickle.load()` in `run_merlin.py:100` excluded from ruff rules (`merlin/**` = `["ALL"]` ignore) — ref: 12.5

---

## Block 2: Verify & Close Fixed Items

These items are marked Fixed but not yet Closed (need deploy verification on staging).

### Logging (PR #674, #675, #676)

- [ ] **2.1** LOG-1: Structured JSON logging in Lambda — verify JSON output in CloudWatch
- [ ] **2.2** LOG-2: `withContext(fields)` method — verify child logger fields appear
- [ ] **2.3** LOG-3: Request correlation — verify `requestId` in log lines
- [ ] **2.4** LOG-4: tts-api logging — verify cache hit/miss/queue logs
- [ ] **2.5** LOG-5: Store handler silent catch — verify error now logged
- [ ] **2.6** LOG-6: Cognito triggers logging — verify challenge flow logs
- [ ] **2.7** LOG-7: Store routes logging — BLOCKED (ESM transform coverage issue)
- [ ] **2.8** LOG-8: Auth supporting modules logging — verify OIDC/Cognito/cookie logs
- [ ] **2.9** LOG-9: `logRetentionInDays: 30` — verify in CloudWatch console
- [ ] **2.10** LOG-10: CloudWatch Insights saved queries — verify queries work
- [ ] **2.11** LOG-11: Standardized error logging format — spot-check consistency
- [ ] **2.12** LOG-12..14: Business + debug + correlation logging — spot-check

### Error Handling (PR #677)

- [ ] **2.13** ERR-1: `extractErrorMessage()` used everywhere — spot-check
- [ ] **2.14** ERR-2: `AppError` hierarchy — verify in shared
- [ ] **2.15** ERR-3: `wrapLambdaHandler()` — verify available in shared
- [ ] **2.16** ERR-4..6: Silent catches, error re-wrapping, morphology migration — spot-check

### Lauri Findings

- [ ] **2.17** LAURI-1: Store API field rename (`pk`/`sk` → `key`/`id`) — deploy to staging, verify frontend works
- [ ] **2.18** LAURI-2: Store API whitelist validation — deploy to staging, verify no legitimate keys rejected

---

## Block 3: Penetration Testing

Critical for production readiness. Requires k6 or Artillery scripts.

- [ ] **3.1** TEST-1: WAF rate limit — 100+ req/min from single IP to `/api/synthesize`, verify block after 20
- [ ] **3.2** TEST-2: ECS auto-scaling cap — flood `/synthesize`, verify ECS tasks don't exceed max_capacity
- [ ] **3.3** TEST-3: Lambda concurrency — 50+ concurrent requests, check for 429 (not 500)
- [ ] **3.4** TEST-4: Alert testing — trigger each CloudWatch alarm manually, verify Slack delivery < 5 min
- [ ] **3.5** TEST-5: Budget limit — set test budget to $0.01 in staging, verify alert fires
- [ ] **3.6** TEST-6: SQS queue depth — burst 60+ synthesis requests, verify 503 at queue depth 50 + recovery

---

## Block 4: Larger Improvements

### Accessibility

- [ ] **4.1** WCAG 2.1 AA audit — automated scan (axe-core) + manual keyboard/screen reader testing
- [ ] **4.2** Fix identified accessibility issues
- [ ] **4.3** Add accessibility CI check (axe-core in Playwright)

### E2E Testing

- [ ] **4.4** Expand Playwright test coverage — identify critical user flows not covered
- [ ] **4.5** Add visual regression testing (screenshot comparison)

### Performance

- [ ] **4.6** Frontend bundle size audit — identify large dependencies, code splitting opportunities
- [ ] **4.7** Lazy loading for non-critical routes
- [ ] **4.8** Lighthouse CI integration

### Security (Deferred from PUB)

- [ ] **4.9** Per-user/per-IP throttling (ref: 12.2) — requires auth decision
- [ ] **4.10** Anomaly detection + auto-ban (ref: PUB-7) — new Lambda + EventBridge
- [ ] **4.11** Request fingerprinting (ref: PUB-12) — frontend + backend changes

---

## Recommended Order

1. **Block 1** first — small fixes, cleans up technical debt, can be done in 1-2 sessions
2. **Block 2** next — verification pass, ensures everything actually works in production
3. **Block 3** before going to prod — security validation is mandatory
4. **Block 4** ongoing — larger efforts, can be parallelized
