# Prototype-to-Implementation Alignment

## Overview

This document describes the TDD workflow for aligning HAK implementation with EKI prototype features.

**Prototype:** http://localhost:3000 (source: `/home/alex/users/luna/eki`)  
**Implementation:** http://localhost:5180 (source: `/home/alex/users/kate/hak`)

---

## Workflow

### 1. Visual Analysis

1. Open both systems in browser (via MCP browser preview)
2. Navigate to the feature in question
3. Document differences:
   - UI behavior (modal vs inline, animations, positioning)
   - User interactions (click, keyboard, drag)
   - Data flow (what happens on submit, cancel, etc.)

### 2. Gherkin Specification

Write Gherkin scenarios describing **desired behavior** (matching prototype):

```gherkin
@skip
Feature: Add to Task Modal

  @skip
  Scenario: Open modal when clicking "Lisa Ülesandesse"
    Given I am on the synthesis page
    When I click "Lisa Ülesandesse" button
    Then I should see a modal dialog
    And the background should be dimmed
```

All scenarios start with `@skip` tag.

**Location:** `packages/specifications/features/`

### 3. TDD Cycle

For each `@skip` scenario:

1. **RED Gherkin** - Remove `@skip`, run `pnpm test` → scenario fails
2. **Unit Tests** - Write failing unit tests for required functionality
3. **Implementation** - Write minimal code to pass unit tests
4. **GREEN Gherkin** - Run cucumber tests → scenario passes
5. **Refactor** - Clean up, maintain coverage

### 4. Commit & Report

1. Create feature branch: `git checkout -b feat/feature-name`
2. Commit with conventional message: `feat: add task modal functionality`
3. Push branch: `git push -u origin feat/feature-name`
4. Report completion in Slack, wait for next task

---

## File Locations

| Type | Location |
|------|----------|
| Gherkin features | `packages/specifications/features/` |
| Step definitions | `packages/frontend/src/test/steps/` |
| Components | `packages/frontend/src/components/` |
| Unit tests | `packages/frontend/src/*.test.tsx` |

---

## Commands

```bash
# Run all tests (modules + hooks)
pnpm test

# Run only cucumber tests
pnpm --filter @hak/frontend test:cucumber

# Run specific feature
pnpm --filter @hak/frontend test:cucumber -- --name "Add to Task"
```

---

## Checklist Template

When aligning a feature:

- [ ] Opened prototype in browser, documented behavior
- [ ] Opened HAK in browser, documented current state
- [ ] Listed all differences
- [ ] Written Gherkin scenarios with @skip
- [ ] For each scenario:
  - [ ] Removed @skip
  - [ ] Written unit tests (RED)
  - [ ] Implemented feature (GREEN)
  - [ ] Verified Gherkin passes
- [ ] All tests pass (`pnpm test`)
- [ ] **Visual verification via MCP browser preview** - compare both systems side by side
- [ ] Committed to feature branch
- [ ] Pushed and reported to Slack

---

## Completion Criteria

**A task is ONLY considered complete when:**

1. All tests pass (`pnpm test`)
2. **Visual verification performed** - using MCP browser preview, confirmed that HAK behavior matches prototype
3. Changes committed and pushed

**Do NOT report task as complete without visual verification!**

The browser preview tool must be used to:
- Open prototype (localhost:3000)
- Open HAK (localhost:5180)
- Visually confirm the feature works identically in both systems
