# Accessibility Remediation Backlog

**Created:** January 17, 2026  
**Last Updated:** January 17, 2026  
**Reference:** WCAG 2.1 Level AA

---

## Completed Items ✅

### Critical Priority (Fixed)

| ID | Issue | WCAG Criterion | Status |
|----|-------|----------------|--------|
| A-001 | Focus indicators removed by reset.scss | 2.4.7 Focus Visible | ✅ Fixed |
| A-002 | Modals missing role="dialog" | 4.1.2 Name, Role, Value | ✅ Fixed |
| A-003 | Modals missing focus trap | 2.1.2 No Keyboard Trap | ✅ Fixed |
| A-004 | HTML lang="en" instead of "et" | 3.1.1 Language of Page | ✅ Fixed |

### High Priority (Fixed)

| ID | Issue | WCAG Criterion | Status |
|----|-------|----------------|--------|
| A-005 | AddEntryModal inputs missing labels | 3.3.2 Labels | ✅ Fixed |
| A-006 | TaskEditModal inputs missing labels | 3.3.2 Labels | ✅ Fixed |
| A-007 | Error messages missing role="alert" | 3.3.1 Error Identification | ✅ Fixed |
| A-008 | Menus missing ARIA roles | 4.1.2 Name, Role, Value | ✅ Fixed |
| A-009 | Menu keyboard support | 2.1.1 Keyboard | ✅ Fixed |
| A-010 | No a11y testing infrastructure | - | ✅ Fixed |

---

## Remaining Items

### Medium Priority

| ID | Issue | WCAG Criterion | Location | Effort |
|----|-------|----------------|----------|--------|
| A-011 | Color contrast verification | 1.4.3 Contrast | All components | 2-3 hrs |
| A-012 | Skip-to-main-content link | 2.4.1 Bypass Blocks | App layout | 1 hr |
| A-013 | Live regions for dynamic content | 4.1.3 Status Messages | Notifications | 2 hrs |

### Low Priority

| ID | Issue | WCAG Criterion | Location | Effort |
|----|-------|----------------|----------|--------|
| A-014 | Landmark roles (main, nav, footer) | 1.3.1 Info and Relationships | App layout | 1 hr |
| A-015 | Heading hierarchy review | 1.3.1 Info and Relationships | All pages | 2 hrs |
| A-016 | Drag-and-drop keyboard alternative | 2.1.1 Keyboard | Sentence reordering | 4 hrs |
| A-017 | Touch target size (44x44px) | 2.5.5 Target Size | Mobile views | 2 hrs |
| A-018 | Reduced motion support | 2.3.3 Animation from Interactions | Animations | 2 hrs |
| A-019 | High contrast mode testing | 1.4.1 Use of Color | Theming | 2 hrs |

---

## Implementation Notes

### A-011: Color Contrast Verification

**Approach:**
1. Use WebAIM Contrast Checker or browser DevTools
2. Test all text/background combinations
3. Focus on:
   - Placeholder text colors
   - Disabled state colors
   - Error/warning states
   - Button text on colored backgrounds

**Priority Colors to Check:**
- `$color-text-placeholder` (#747676) - may fail on white
- `$color-text-disabled` (#999999) - may fail on light backgrounds
- `$color-gray` (#636B74) - verify on all backgrounds

### A-012: Skip Link

**Implementation:**
```tsx
// Add to App.tsx or layout component
<a href="#main-content" className="skip-link">
  Liigu põhisisu juurde
</a>

// On main element
<main id="main-content" tabIndex={-1}>
```

### A-016: Drag-and-Drop Keyboard Alternative

**Approach:**
1. Add keyboard shortcuts (e.g., Alt+Up/Down to reorder)
2. Add "Move up" / "Move down" buttons (visible on focus)
3. Use aria-describedby to announce keyboard instructions

---

## Testing Checklist

### Automated Testing
- [ ] `npm run test:a11y` passes
- [ ] axe-core console warnings reviewed
- [ ] jest-axe tests added to new components

### Manual Testing
- [ ] VoiceOver (macOS) navigation works
- [ ] Keyboard-only navigation works
- [ ] Color contrast verified
- [ ] Focus indicators visible

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Definition of Done for Accessibility

A component is accessibility-complete when:

1. ✅ All automated tests pass (`npm run test:a11y`)
2. ✅ No axe-core warnings in dev console
3. ✅ Keyboard navigation works
4. ✅ Focus indicators are visible
5. ✅ Screen reader announces correctly
6. ✅ Color contrast meets WCAG AA (4.5:1)
7. ✅ Labels associated with form inputs
8. ✅ Error states announced to screen readers

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

---

**Next Review:** After completing medium priority items
