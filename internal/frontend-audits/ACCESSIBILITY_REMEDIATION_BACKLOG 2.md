# Accessibility Remediation Backlog

**Created:** January 17, 2026  
**Last Updated:** February 12, 2026  
**Reference:** WCAG 2.1 Level AA

---

## Completed Items

### Critical Priority (Fixed — January 2026)

| ID    | Issue                                  | WCAG Criterion          | Status  |
| ----- | -------------------------------------- | ----------------------- | ------- |
| A-001 | Focus indicators removed by reset.scss | 2.4.7 Focus Visible     | Fixed   |
| A-002 | Modals missing role="dialog"           | 4.1.2 Name, Role, Value | Fixed   |
| A-003 | Modals missing focus trap              | 2.1.2 No Keyboard Trap  | Fixed   |
| A-004 | HTML lang="en" instead of "et"         | 3.1.1 Language of Page  | Fixed   |

### High Priority (Fixed — January 2026)

| ID    | Issue                               | WCAG Criterion             | Status  |
| ----- | ----------------------------------- | -------------------------- | ------- |
| A-005 | AddEntryModal inputs missing labels | 3.3.2 Labels               | Fixed   |
| A-006 | TaskEditModal inputs missing labels | 3.3.2 Labels               | Fixed   |
| A-007 | Error messages missing role="alert" | 3.3.1 Error Identification | Fixed   |
| A-008 | Menus missing ARIA roles            | 4.1.2 Name, Role, Value    | Fixed   |
| A-009 | Menu keyboard support               | 2.1.1 Keyboard             | Fixed   |
| A-010 | No a11y testing infrastructure      | -                          | Fixed   |

### Medium Priority (Fixed — February 2026)

| ID    | Issue                            | WCAG Criterion        | Status  |
| ----- | -------------------------------- | --------------------- | ------- |
| A-011 | Color contrast verification      | 1.4.3 Contrast        | Fixed   |
| A-012 | Skip-to-main-content link        | 2.4.1 Bypass Blocks   | Fixed   |
| A-013 | Live regions for dynamic content | 4.1.3 Status Messages | Fixed   |

### Low Priority (Fixed — February 2026)

| ID    | Issue                              | WCAG Criterion               | Status  |
| ----- | ---------------------------------- | ---------------------------- | ------- |
| A-014 | Landmark roles (main, nav, footer) | 1.3.1 Info and Relationships | Fixed   |
| A-015 | Heading hierarchy review           | 1.3.1 Info and Relationships | Fixed   |
| A-018 | Reduced motion support             | 2.3.3 Animation              | Fixed   |

### Screen Reader Readiness (Fixed — February 2026)

| ID    | Issue                                    | WCAG Criterion          | Status  |
| ----- | ---------------------------------------- | ----------------------- | ------- |
| A-020 | Icon-only buttons missing aria-label     | 4.1.2 Name, Role, Value | Fixed   |
| A-021 | Form inputs missing labels/aria-label    | 3.3.2 Labels            | Fixed   |
| A-022 | Dropdowns missing aria-expanded          | 4.1.2 Name, Role, Value | Fixed   |
| A-023 | BuildInfo modal missing dialog ARIA      | 4.1.2 Name, Role, Value | Fixed   |
| A-024 | Decorative SVGs not hidden from AT       | 1.1.1 Non-text Content  | Fixed   |
| A-025 | document.title not updated on navigation | 2.4.2 Page Titled       | Fixed   |
| A-026 | Loading states not announced to AT       | 4.1.3 Status Messages   | Fixed   |
| A-027 | Clickable divs without button role       | 4.1.2 Name, Role, Value | Fixed   |
| A-028 | English aria-labels in Estonian app       | 3.1.1 Language          | Fixed   |
| A-029 | jsx-a11y ESLint rules not enabled        | -                       | Fixed   |

---

## Remaining Items

### Deferred

| ID    | Issue                              | WCAG Criterion       | Effort | Notes                       |
| ----- | ---------------------------------- | -------------------- | ------ | --------------------------- |
| A-016 | Drag-and-drop keyboard alternative | 2.1.1 Keyboard       | 4 hrs  | Needs design decision       |
| A-017 | Touch target size (44x44px)        | 2.5.5 Target Size    | 2 hrs  | Reverted — needs design review |
| A-019 | High contrast mode testing         | 1.4.1 Use of Color   | 2 hrs  | Needs forced-colors support |

---

## Implementation Summary (February 2026 Audit)

### Phase B: Screen Reader Readiness
- Added `aria-label` to all icon-only buttons (BuildInfo, play buttons, clear buttons, drag handles, menu buttons)
- Added `aria-label` to all form inputs without visible labels (search, tag edit, sentence input, custom variant input, phonetic textarea)
- Added `aria-expanded` to all dropdown triggers (TaskDetailHeader, UserProfile, TaskManager)
- Made BuildInfo modal a proper dialog with `role="dialog"`, `aria-modal`, `aria-labelledby`
- Added `aria-hidden="true"` to decorative SVGs (Google/TARA icons in LoginModal, inline SVG in TaskDetailHeader)
- Created `useDocumentTitle` hook for route-based title updates
- Added live regions (`role="status"`, `aria-live="polite"`) to loading states
- Made clickable TaskRow keyboard-accessible with `role="button"`, `tabIndex`, `onKeyDown`
- Translated all English aria-labels to Estonian

### Phase A: Testing Infrastructure
- Expanded E2E accessibility tests to cover all major pages, modals, keyboard navigation, touch targets, screen reader landmarks, heading hierarchy, button names, input labels, document language, title updates, and live regions
- Enabled 18 jsx-a11y ESLint rules for TSX/JSX files

### Phase D: Color Contrast
- Fixed `$color-text-disabled` from #999999 to #767676 (4.54:1 ratio on white)
- Fixed `$color-text-placeholder` from #747676 to #636B74 (5.24:1 ratio on white)

---

## Testing Checklist

### Automated Testing

- [x] axe-core E2E tests cover all major pages
- [x] jest-axe helpers available for component tests
- [x] jsx-a11y ESLint rules enabled and enforced
- [ ] Touch target size verification (A-017 — deferred)
- [x] Screen reader readiness checks in E2E tests

### Manual Testing

- [ ] VoiceOver (macOS) navigation works
- [ ] Keyboard-only navigation works
- [x] Color contrast verified
- [x] Focus indicators visible
- [ ] NVDA (Windows) testing

### Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Definition of Done for Accessibility

A component is accessibility-complete when:

1. All automated tests pass (`npm run test:a11y`)
2. No axe-core warnings in dev console
3. Keyboard navigation works
4. Focus indicators are visible
5. Screen reader announces correctly
6. Color contrast meets WCAG AA (4.5:1)
7. Labels associated with form inputs
8. Error states announced to screen readers
9. All aria-labels in Estonian

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

---

**Next Review:** After completing A-016 (drag-and-drop keyboard alternative), A-017 (touch targets), and A-019 (high contrast mode)
