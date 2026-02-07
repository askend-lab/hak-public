# Phase 3b: Testing & Coverage

> HIGH — tests must prove the code works and catch regressions.

## 1. Coverage Targets

- [ ] **Raise all coverage thresholds to 90%+** — Current lowered values:
  - `simplestore` functions: 75% → 90%
  - `merlin-worker` branches: 75% → 90%
  - Target: lines 90%, branches 85%, functions 90%, statements 90%
- [ ] **Achieve 90%+ for `vabamorf-api`** — Currently 83% lines, 77% branches.
- [ ] **Measure and improve frontend coverage** — Set and enforce thresholds.
- [ ] **Add coverage badges to README** — Per-package coverage display.

## 2. Test Quality

- [ ] **Audit test descriptions** — Every `describe`/`it` must describe behavior, not implementation.
- [ ] **Audit test isolation** — No test depends on another's state. Verify with `--randomize`.
- [ ] **Add integration tests** — Lambda handlers with realistic event payloads.
- [ ] **Add E2E tests** — Playwright for critical user journeys:
  - Login via TARA/Cognito
  - Create a task
  - Complete an exercise
  - Audio synthesis playback
- [ ] **Fix or replace cucumber BDD tests** — Currently broken. Either fix infrastructure or convert to Playwright.
- [ ] **Add property-based tests** — `fast-check` for input validation, parsers, text processing.
- [ ] **Add mutation testing** — `stryker-mutator` for test suite quality (>80% mutation score).
- [ ] **Add load tests** — `artillery` or `k6` for Lambda API load testing.
- [ ] **Add contract tests** — Frontend API calls match backend contracts (consider `pact` or `zod` sharing).

## 3. Test Infrastructure

- [ ] **Standardize mock patterns** — `simplestore` has both `mockDynamoDB.ts` and `InMemoryAdapter`. Pick one.
- [ ] **Add test data factories** — `fishery` or similar instead of manual object construction.
- [ ] **Review snapshot usage** — Ensure snapshots are meaningful and reviewed.
