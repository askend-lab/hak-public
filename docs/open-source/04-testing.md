# Phase 3b: Testing & Coverage

> HIGH — tests must prove the code works and catch regressions.
> Every item: 🔧 = DevBox hook exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [x] | [x] | All tests pass | `run-tests` | jest/vitest |
| [x] | [ ] | Coverage ≥90% lines, ≥85% branches | `test-coverage` | v8/istanbul |
| [x] | [x] | TDD enforced (new code needs tests) | `test-required` | devbox |
| [x] | [x] | Unused deps detected | `dependency-check` | depcheck |

## Stretch Goals (NEW hooks needed)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [ ] | [ ] | E2E critical journeys | NEW: `run-e2e` | Playwright |
| [ ] | [ ] | Property-based tests | (in `run-tests`) | fast-check |
| [ ] | [ ] | Mutation score ≥80% | NEW: `run-mutation` | stryker |

## Manual Gates

- [ ] Raise all per-package coverage thresholds to 90%+ in devbox.yaml
- [ ] Add coverage badges to README
- [ ] Fix or remove broken cucumber BDD tests
