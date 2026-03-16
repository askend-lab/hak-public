# WCAG 2.1 AA Compliance Audit Report

**Initial Audit Date:** January 17, 2026  
**Re-Audit Date:** February 12, 2026  
**Auditor:** Automated Assessment with Manual Review  
**Scope:** Frontend UI (`packages/frontend`) - ~88 TSX components  
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

This audit assesses the frontend application for WCAG 2.1 Level AA compliance. The February 2026 re-audit built on the January 2026 initial fixes with comprehensive screen reader readiness improvements, expanded automated testing, and color contrast fixes.

### Compliance Status: SUBSTANTIALLY COMPLIANT

| Category        | Jan 2026 | Feb 2026 | Status            |
| --------------- | -------- | -------- | ----------------- |
| Critical Issues | 0        | 0        | All fixed         |
| High Priority   | 0        | 0        | All fixed         |
| Medium Priority | 3        | 0        | All fixed         |
| Low Priority    | 6        | 3        | 3 items deferred  |

### Key Improvements (February 2026)

1. **Screen Reader Readiness** - aria-labels on all icon-only buttons, form inputs, dropdown triggers
2. **Document Title** - Dynamic title updates per route via `useDocumentTitle` hook
3. **Color Contrast** - Fixed `$color-text-disabled` and `$color-text-placeholder` to meet 4.5:1 ratio
4. **Live Regions** - Loading states announce to assistive technology
5. **Accessible Modals** - BuildInfo modal now has dialog role and aria-labelledby
6. **Decorative Content** - SVGs hidden from assistive technology where appropriate
7. **Keyboard Access** - Clickable task rows now accessible via keyboard
8. **Estonian Labels** - All aria-labels translated from English to Estonian
9. **Testing** - Expanded E2E suite, enabled jsx-a11y ESLint rules

---

## Detailed Findings and Remediation

### 1. Perceivable (WCAG 1.x)

#### 1.1.1 Non-text Content — PASS

- Icons use `aria-hidden="true"` for decorative purposes
- Logo has proper `alt` text
- **Feb 2026:** Added `aria-hidden` to Google/TARA SVG icons in LoginModal and inline SVG in TaskDetailHeader

#### 1.3.1 Info and Relationships — PASS

- Forms have proper labels (explicit or aria-label)
- Landmark structure: `<header>`, `<nav>`, `<main>`, `<footer>`
- Heading hierarchy verified (h1 > h2 > h3)
- **Feb 2026:** Added `aria-label` to all unlabeled form inputs (search, tag edit, sentence input, phonetic textarea)

#### 1.4.3 Contrast (Minimum) — PASS

- **Feb 2026 Fix:** `$color-text-disabled` changed from #999999 (2.85:1) to #767676 (4.54:1)
- **Feb 2026 Fix:** `$color-text-placeholder` changed from #747676 (4.63:1) to #636B74 (5.24:1)
- All other text/background combinations meet 4.5:1 minimum

#### 1.4.4 Resize Text — PASS

- Typography uses `rem` units
- Responsive breakpoints properly handled

---

### 2. Operable (WCAG 2.x)

#### 2.1.1 Keyboard — PASS (one deferral)

- All interactive elements are keyboard accessible
- **Feb 2026:** Made task row clickable divs keyboard-accessible with `role="button"`, `tabIndex`, `onKeyDown`
- **Deferred (A-016):** Drag-and-drop keyboard alternative for sentence reordering

#### 2.1.2 No Keyboard Trap — PASS

- Modal focus trap works correctly
- Escape key closes all modals and dropdowns

#### 2.4.1 Bypass Blocks — PASS

- Skip-to-main-content link present on all main pages
- Main content has `id="main-content"` with `tabIndex={-1}`

#### 2.4.2 Page Titled — PASS

- **Feb 2026:** Created `useDocumentTitle` hook
- Title updates dynamically per route (e.g., "Hääldusabiline – Ülesanded")
- Shared task pages show task name in title

#### 2.4.3 Focus Order — PASS

- DOM order matches visual order
- Logical tab sequence

#### 2.4.7 Focus Visible — PASS

- `:focus-visible` styles applied to all interactive elements

#### 2.5.5 Target Size — OPEN (deferred)

- **Feb 2026:** Touch target enforcement (44x44px via `$spacing-touch-target`) was implemented but reverted — changes caused unintended visual regressions (oversized buttons and icons).
- **Status:** Deferred (A-017). Needs design review before re-implementation to ensure visual consistency.

---

### 3. Understandable (WCAG 3.x)

#### 3.1.1 Language of Page — PASS

- `<html lang="et">` set correctly
- **Feb 2026:** All aria-labels in Estonian (previously some were in English)

#### 3.2.1 On Focus — PASS

- No unexpected context changes on focus

#### 3.3.1 Error Identification — PASS

- Error messages have `role="alert"`

#### 3.3.2 Labels or Instructions — PASS

- All form fields have proper labels or aria-label

---

### 4. Robust (WCAG 4.x)

#### 4.1.1 Parsing — PASS

- Valid HTML structure, no duplicate IDs

#### 4.1.2 Name, Role, Value — PASS

- All modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Feb 2026:** BuildInfo modal added dialog ARIA attributes
- All dropdown triggers have `aria-expanded`
- All icon-only buttons have `aria-label`

#### 4.1.3 Status Messages — PASS

- Notification container has `aria-live="polite"`, `aria-atomic="true"`
- **Feb 2026:** Loading states have `role="status"`, `aria-live="polite"`

---

## Files Modified (February 2026)

### Phase B: Screen Reader Readiness

| File | Changes |
| --- | --- |
| `src/components/BuildInfo.tsx` | aria-label on buttons, dialog ARIA on modal |
| `src/components/PronunciationVariants/CustomVariantForm.tsx` | aria-label on play button, input, clear button |
| `src/components/PronunciationVariants/VariantItem.tsx` | aria-label on play button |
| `src/components/PronunciationVariants/PronunciationVariants.tsx` | Estonian aria-label on close |
| `src/components/PronunciationVariants/PhoneticGuide.tsx` | Estonian aria-label on close |
| `src/components/SentenceSynthesisItem.tsx` | Estonian aria-labels (drag, menu) |
| `src/components/SentenceSynthesis/TagsInput.tsx` | aria-labels on inputs, clear button |
| `src/components/SentencePhoneticPanel.tsx` | aria-label on textarea |
| `src/components/AddToTaskDropdown.tsx` | aria-label on search input |
| `src/components/TaskDetailView/TaskDetailHeader.tsx` | aria-expanded, aria-hidden on SVG |
| `src/components/UserProfile.tsx` | aria-expanded, aria-label |
| `src/components/TaskManager.tsx` | aria-expanded, keyboard access on task rows, Estonian labels |
| `src/components/LoginModal.tsx` | aria-hidden on decorative SVGs |
| `src/pages/SharedTaskPage.tsx` | useDocumentTitle, live region on loading |
| `src/pages/AuthCallbackPage.tsx` | live region on loading |
| `src/hooks/useDocumentTitle.ts` | New - route-based title updates |
| `src/hooks/index.ts` | Export useDocumentTitle |
| `src/App.tsx` | useDocumentTitle integration |

### Phase C: Touch Target Sizes — REVERTED

Touch target enforcement was implemented across 13 SCSS files but reverted due to visual regressions (oversized buttons/icons). This work is deferred as A-017 pending design review.

### Phase A: Testing & Linting

| File | Changes |
| --- | --- |
| `e2e/accessibility.spec.ts` | Comprehensive E2E accessibility test suite |
| `eslint.base.config.mjs` | 18 jsx-a11y rules enabled |

### Phase D: Color Contrast

| File | Changes |
| --- | --- |
| `src/styles/tokens/_colors.scss` | Fixed $color-text-disabled, $color-text-placeholder |

---

## Testing Infrastructure

### 1. Development Mode (axe-core)
- Automatically logs accessibility violations to console
- Manual audit: Call `window.runA11yAudit()` in browser console

### 2. Unit Tests (jest-axe)
- Import helpers from `@/test/a11y-helpers`
- Use `expectNoA11yViolations(container)` in tests

### 3. E2E Tests (Playwright + axe-core)
- Run: `npm run test:a11y`
- Tests: page-level audits, modals, keyboard navigation, touch targets, screen reader readiness, focus management

### 4. ESLint (jsx-a11y)
- 18 rules enabled for TSX/JSX files
- Catches accessibility issues at development time

---

## Remaining Work (Deferred)

| ID    | Issue                              | WCAG Criterion     | Priority |
| ----- | ---------------------------------- | ------------------ | -------- |
| A-016 | Drag-and-drop keyboard alternative | 2.1.1 Keyboard     | Low      |
| A-017 | Touch target size (44x44px)        | 2.5.5 Target Size  | Low      |
| A-019 | High contrast mode (forced-colors) | 1.4.1 Use of Color | Low      |

---

## Compliance Checklist

```
WCAG 2.1 AA Checklist (February 2026):

Perceivable:
  1.1.1 Non-text Content       — PASS (aria-hidden on decorative elements)
  1.3.1 Info and Relationships  — PASS (landmarks, labels, heading hierarchy)
  1.4.1 Use of Color           — PASS (errors use text+icon, not just color)
  1.4.3 Contrast (Minimum)     — PASS (all tokens verified ≥4.5:1)
  1.4.4 Resize Text            — PASS (rem units throughout)

Operable:
  2.1.1 Keyboard               — PASS* (drag-and-drop deferred)
  2.1.2 No Keyboard Trap       — PASS
  2.4.1 Bypass Blocks          — PASS (skip link implemented)
  2.4.2 Page Titled            — PASS (dynamic titles per route)
  2.4.3 Focus Order            — PASS
  2.4.7 Focus Visible          — PASS
  2.5.5 Target Size            — OPEN (deferred — needs design review)

Understandable:
  3.1.1 Language of Page        — PASS (lang="et", Estonian labels)
  3.2.1 On Focus               — PASS
  3.3.1 Error Identification   — PASS
  3.3.2 Labels or Instructions — PASS

Robust:
  4.1.1 Parsing                — PASS
  4.1.2 Name, Role, Value      — PASS (all ARIA attributes present)
  4.1.3 Status Messages        — PASS (live regions for notifications & loading)
```

---

## Recommendations

1. **Complete A-016** — Add keyboard alternative for drag-and-drop sentence reordering
2. **Complete A-017** — Enforce 44x44px touch targets with design-approved approach (avoid visual regressions)
3. **Complete A-019** — Test and support `forced-colors` (Windows High Contrast Mode)
3. **Screen Reader Testing** — Conduct manual testing with VoiceOver and NVDA
4. **CI Integration** — Add `npm run test:a11y` to CI pipeline
5. **Regular Re-audit** — Quarterly WCAG 2.1 AA audit

---

**Report Generated:** February 12, 2026  
**Next Review:** Quarterly or before major releases
