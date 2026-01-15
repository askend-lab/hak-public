# QA Report - Issues & Recommendations

**Part 3 of 4:** Priority Gaps and Recommended Actions

---

## Critical Gaps (Priority 1)

### 1. E2E Tests Missing for Pronunciation Variants (TC-06 to TC-08)
- **Impact:** Critical feature with no automated regression testing
- **Risk:** Breaking changes in variant panel could go unnoticed
- **Recommendation:** Create `variants.spec.ts` covering:
  - Panel opening from tag menu
  - Variant preview and selection
  - Custom variant creation with phonetic markers
  - Guide navigation

### 2. E2E Tests Missing for Authentication (TC-16)
- **Impact:** Login flow not tested end-to-end
- **Risk:** Auth regressions could break entire task workflow
- **Recommendation:** Create `auth.spec.ts` with:
  - Mock credential login
  - Session persistence verification
  - Protected route redirect testing
  - Logout functionality

### 3. No E2E Tests for Play All / Sequential Playback (TC-11)
- **Impact:** Core playlist feature untested
- **Risk:** Audio playback bugs in production
- **Recommendation:** Add to `synthesis.spec.ts` or create `playlist.spec.ts`:
  - Play All button functionality
  - Sequential playback verification
  - Stop/Pause functionality
  - Empty sentence handling

---

## High Priority Gaps (Priority 2)

### 4. E2E Tests Missing for Add Entries to Task (TC-14)
- **Impact:** Critical workflow from synthesis to tasks untested
- **Risk:** Integration between features could break
- **Recommendation:** Extend `tasks-crud.spec.ts`:
  - Add from sentence menu
  - Task selection dropdown
  - Create new task flow
  - Notification verification

### 5. E2E Tests Missing for Task Sharing (TC-15)
- **Impact:** Sharing flow including anonymous access untested
- **Risk:** Share URLs could break without detection
- **Recommendation:** Create `sharing.spec.ts`:
  - Share modal and URL generation
  - Copy to clipboard functionality
  - Anonymous access in incognito context
  - Read-only restrictions

### 6. Incomplete TC-01 E2E Coverage
- **Current:** Test only checks typing and clicking play
- **Missing:** Cache verification, voice model selection, loading states
- **Recommendation:** Expand `synthesis.spec.ts`:
  - Verify audio caching behavior
  - Test voice model switching (efm_s vs efm_l)
  - Validate all loading/playing/error states

---

## Medium Priority Gaps (Priority 3)

### 7. No E2E for Onboarding (TC-17)
- **Impact:** First-run experience untested
- **Recommendation:** Create `onboarding.spec.ts`:
  - Role selection flow
  - Wizard tooltip progression
  - Skip functionality
  - Help button restart

### 8. No E2E for Feedback (TC-18)
- **Impact:** User feedback mechanism untested
- **Recommendation:** Create `feedback.spec.ts`:
  - Modal opening from footer
  - Form validation
  - Submission handling

### 9. No E2E for Input Behaviors (TC-02)
- **Impact:** Tag creation mechanics untested
- **Recommendation:** Add to `synthesis.spec.ts`:
  - Space creates tags
  - Backspace edits last tag
  - Paste multi-word handling

---

## Recommended E2E Test Implementation Order

Based on priority and effort:

| Priority | Test File to Create | Test Cases | Effort |
|----------|---------------------|------------|--------|
| 1 | `variants.spec.ts` | TC-06, TC-07, TC-08 | Medium |
| 2 | `auth.spec.ts` | TC-16 | Low |
| 3 | `playlist.spec.ts` | TC-10, TC-11 | Medium |
| 4 | Extend `synthesis.spec.ts` | TC-02, TC-03, TC-04, TC-05 | High |
| 5 | Extend `tasks-crud.spec.ts` | TC-14 | Low |
| 6 | `sharing.spec.ts` | TC-15 | Medium |
| 7 | `onboarding.spec.ts` | TC-17 | Low |
| 8 | `feedback.spec.ts` | TC-18, TC-19 | Low |
| 9 | `phonetic-panel.spec.ts` | TC-09 | Medium |

**Estimated Total Effort:** 3-4 developer weeks

---

## Action Items

### Immediate (This Sprint)
1. Create `variants.spec.ts` - critical feature protection
2. Create `auth.spec.ts` - protect login flow
3. Expand `synthesis.spec.ts` - complete TC-01 coverage

### Next Sprint
4. Create `playlist.spec.ts` - test sequential playback
5. Extend `tasks-crud.spec.ts` - add TC-14 coverage
6. Create `sharing.spec.ts` - test share functionality

### Future Sprints
7. Complete remaining E2E tests
8. Implement missing Gherkin steps
9. Add visual regression testing

---

**See also:**
- [Feature Implementation](./QA-Report-Features.md)
- [Coverage Analysis](./QA-Report-Coverage.md)
- [Implementation Mapping](./QA-Report-Appendix.md)
