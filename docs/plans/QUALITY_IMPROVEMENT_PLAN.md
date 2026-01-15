# Quality Improvement Plan

**Created:** 2026-01-15  
**Status:** Planning  
**Priority:** High

## Current State

All DevBox checks are **enabled and passing** ✅

### Test Coverage Summary

| Module | Line Coverage | Branch Coverage | Status |
|--------|--------------|-----------------|--------|
| simplestore | 92.9% | 84.9% | ✅ Excellent |
| audio-api | 97.0% | 95.8% | ✅ Excellent |
| merlin-worker | 98.4% | 75.9% | ⚠️ Branch coverage low |
| vabamorf-api | 97.4% | 85.0% | ✅ Excellent |
| gherkin-parser | 100% | 100% | ✅ Perfect |
| shared | 87.8% | 85.0% | ✅ Good |
| **frontend** | **80.2%** | **71.2%** | ⚠️ At minimum threshold |
| cucumber | 47.9% | 74.9% | ❌ Low (allow_failures=true) |

**Overall:** 314/314 tests passing, all hooks green

---

## Phase 1: Enforce Linting Standards

**Goal:** Zero tolerance for new lint warnings

### Current State
- `run-lint`: active but `blocking: false`
- Lint warnings present but not blocking commits
- Clean-up in progress

### Actions
1. **Audit current lint warnings**
   - Run `pnpm lint` and document all warnings
   - Categorize by severity and module
   - Create issues for each category

2. **Clean up existing warnings**
   - Fix all TypeScript lint warnings
   - Fix all ESLint warnings
   - Fix all Prettier formatting issues

3. **Enable blocking mode**
   - Set `blocking: true` in devbox.yaml
   - Verify all checks pass
   - Document in team guidelines

**Timeline:** 1-2 weeks  
**Priority:** High  
**Effort:** Medium

---

## Phase 2: Increase Test Coverage

**Goal:** Raise frontend coverage to 85% line / 75% branch

### Current State
- Frontend at minimum: 80% line / 70% branch
- Some UI components undertested
- Edge cases not fully covered

### Actions

#### 2.1 Frontend Unit Tests
1. **Identify untested components**
   - Run coverage report with `pnpm test:coverage`
   - List components below 80% coverage
   - Prioritize by usage frequency

2. **Add missing tests**
   - React component render tests
   - Hook behavior tests
   - Utility function tests
   - Edge case scenarios

3. **Increase thresholds**
   - Update devbox.yaml: `min_coverage_lines: 85`
   - Update devbox.yaml: `min_coverage_branches: 75`

#### 2.2 Branch Coverage Improvements
**Target modules:**
- merlin-worker: 75.9% → 80%
- frontend: 71.2% → 75%

**Actions:**
- Identify uncovered branches in coverage report
- Add tests for error paths
- Test conditional logic branches
- Test switch/case statements

**Timeline:** 2-3 weeks  
**Priority:** High  
**Effort:** High

---

## Phase 3: Enhance E2E Testing

**Goal:** Increase cucumber coverage from 47.9% to 70%+

### Current State
- 37 cucumber scenarios passing
- 47.9% coverage (very low)
- `allow_failures: true` (permissive)

### Actions

1. **Add missing user journey scenarios**
   - Authentication flows (login, logout, session)
   - Task management (create, edit, delete, share)
   - Synthesis workflows (basic, with variants, playlist)
   - Pronunciation variants panel
   - Phonetic editing

2. **Add edge case scenarios**
   - Error handling (network failures, API errors)
   - Invalid inputs (bad isikukood, empty forms)
   - Performance scenarios (large playlists, long texts)

3. **Increase coverage threshold**
   - Set `min_coverage_lines: 60` (gradual increase)
   - Remove `allow_failures: true` when stable

4. **Improve scenario quality**
   - Add more assertions
   - Verify visual feedback
   - Test accessibility features

**Timeline:** 3-4 weeks  
**Priority:** Medium  
**Effort:** High

---

## Phase 4: Add New Quality Checks

**Goal:** Expand automated quality gates

### 4.1 Performance Budgets

**Purpose:** Prevent bundle bloat and slow load times

**Implementation:**
```yaml
hooks:
  performance-budget:
    active: true
    budgets:
      - path: 'packages/frontend/dist/index.html'
        max_size: 300kb
      - path: 'packages/frontend/dist/assets/index-*.js'
        max_size: 500kb
      - path: 'packages/frontend/dist/assets/index-*.css'
        max_size: 100kb
```

**Benefits:**
- Early warning on bundle size increases
- Prevents accidental large dependency additions
- Maintains fast load times

**Timeline:** 1 week  
**Priority:** Medium  
**Effort:** Low

### 4.2 Accessibility Audit

**Purpose:** Ensure WCAG 2.1 AA compliance

**Implementation:**
- Add `@axe-core/playwright` to E2E tests
- Run accessibility scans on all pages
- Fail on critical violations

**Example:**
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('synthesis page should be accessible', async ({ page }) => {
  await page.goto('/synthesis');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

**Benefits:**
- Catches accessibility issues early
- Ensures inclusive design
- Required for public sector apps

**Timeline:** 2 weeks  
**Priority:** High (public sector requirement)  
**Effort:** Medium

### 4.3 Bundle Size Tracking

**Purpose:** Monitor and prevent bundle bloat

**Implementation:**
```yaml
hooks:
  bundle-size:
    active: true
    baseline_file: '.bundle-size-baseline.json'
    max_increase_percent: 5
```

**Tool:** `bundlesize` or `size-limit`

**Benefits:**
- Tracks bundle size over time
- Alerts on significant increases
- Forces conscious decision on large deps

**Timeline:** 1 week  
**Priority:** Low  
**Effort:** Low

### 4.4 Visual Regression Testing

**Purpose:** Catch unintended UI changes

**Implementation:**
- Add `@playwright/test` with screenshots
- Store baseline screenshots
- Compare on PR builds

**Benefits:**
- Prevents UI breakage
- Catches CSS issues
- Documents UI changes

**Timeline:** 2 weeks  
**Priority:** Low  
**Effort:** Medium

---

## Phase 5: Advanced Quality Gates

**Goal:** Production-ready quality standards

### 5.1 API Contract Testing

**Purpose:** Ensure API stability

**Tools:**
- Pact for contract testing
- OpenAPI schema validation

**Benefits:**
- Catches breaking API changes
- Documents API contracts
- Enables confident refactoring

### 5.2 Load Testing

**Purpose:** Ensure performance under load

**Tools:**
- k6 or Artillery for load tests
- Target: 100 concurrent users

**Scenarios:**
- Synthesis API load
- Task management under load
- Vabamorf/Merlin API stress

### 5.3 Mutation Testing

**Purpose:** Test the quality of tests

**Tool:** Stryker Mutator

**Benefits:**
- Finds weak tests
- Improves test quality
- Increases confidence

**Timeline:** 3-4 weeks  
**Priority:** Low  
**Effort:** High

---

## Implementation Roadmap

### Week 1-2: Linting Cleanup (Phase 1)
- Audit and fix all lint warnings
- Enable blocking mode
- Document standards

### Week 3-5: Coverage Increase (Phase 2)
- Add frontend unit tests
- Improve branch coverage
- Raise thresholds

### Week 6-9: E2E Enhancement (Phase 3)
- Add missing scenarios
- Improve coverage to 60%+
- Remove allow_failures flag

### Week 10-11: New Checks (Phase 4.1, 4.3)
- Add performance budgets
- Add bundle size tracking

### Week 12-13: Accessibility (Phase 4.2)
- Integrate axe-core
- Fix violations
- Add to CI

### Week 14+: Advanced (Phase 5)
- API contract testing
- Load testing
- Mutation testing

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Frontend line coverage | 80.2% | 85% | Week 5 |
| Frontend branch coverage | 71.2% | 75% | Week 5 |
| Cucumber coverage | 47.9% | 70% | Week 9 |
| Lint warnings | ~10 | 0 | Week 2 |
| Bundle size | ~800kb | <700kb | Week 11 |
| A11y violations | Unknown | 0 critical | Week 13 |

---

## Risk Mitigation

### Risk: Test writing takes longer than expected
**Mitigation:** Prioritize by usage frequency, do high-traffic features first

### Risk: Breaking changes during coverage increase
**Mitigation:** Small incremental changes, thorough code review

### Risk: Performance budget too strict
**Mitigation:** Set realistic baselines based on current state

### Risk: Team resistance to stricter checks
**Mitigation:** Gradual rollout, clear communication of benefits

---

## Maintenance

After implementation:
- **Weekly:** Review coverage reports
- **Monthly:** Review bundle size trends
- **Quarterly:** Audit and update thresholds
- **Annually:** Comprehensive quality assessment

---

## References

- [DevBox Configuration](../devbox.yaml)
- [Test Strategy](../01-SPECIFICATIONS/Test-Plan-Strategy.md)
- [Coverage Reports](../../coverage/)
- [CI/CD Pipeline](.github/workflows/)
