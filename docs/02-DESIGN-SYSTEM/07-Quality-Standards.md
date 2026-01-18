# Quality Standards

## Mandatory Standards

All code must meet these **non-negotiable** requirements:

### 1. All Colors from Tokens
✅ **Required:** Zero hardcoded color values  
❌ **Forbidden:** `color: #173148`, `background: #D7E5F2`  
✅ **Correct:** `color: $color-primary`, `background: $color-secondary`

**Verification:**
```bash
grep -r -E ":\s*#[0-9a-fA-F]" styles/components/
# Should return 0 matches
```

### 2. All Spacing from Tokens
✅ **Required:** Use spacing tokens  
❌ **Forbidden:** `padding: 16px`, `margin: 24px`  
✅ **Correct:** `padding: $spacing-md`, `margin: $spacing-lg`

### 3. BEM Naming for All Components
✅ **Required:** `.block__element--modifier` pattern  
❌ **Forbidden:** `.myComponent`, `.my-component-header`  
✅ **Correct:** `.my-component__header`, `.my-component--active`

### 4. No Inline Styles
✅ **Required:** All styles in SCSS files  
❌ **Forbidden:** `<div style={{ color: 'red', padding: 16 }}>`  
✅ **Correct:** `<div className="alert alert--error">`

**Exceptions:** Library-required styles only:
- DnD library transforms: `style={transform}`
- Dynamic tooltip positioning: `style={{ top, left }}`

### 5. Build Must Succeed
✅ **Required:** `npm run build` completes without errors  
⚠️ **Acceptable:** Deprecation warnings from SCSS (will be addressed)  
❌ **Forbidden:** Compilation errors, missing imports

### 6. Validation Script Must Pass
✅ **Required:** `npm run validate:design` passes all checks  
❌ **Forbidden:** Committing code that fails validation

## Code Quality Checklist

**Before submitting a component:**

```markdown
Design System Compliance:
- [ ] Uses design tokens exclusively ($color-*, $spacing-*, etc.)
- [ ] Follows BEM naming convention (.block__element--modifier)
- [ ] No hardcoded colors or spacing values
- [ ] No inline styles (except library-required)
- [ ] Imports tokens at the top of SCSS file

Implementation Quality:
- [ ] Responsive design implemented (mobile-first)
- [ ] Hover/focus/active states defined
- [ ] Loading and error states handled
- [ ] Accessibility attributes added (ARIA, roles)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

Documentation:
- [ ] Component purpose documented (if reusable)
- [ ] BEM class structure clear and consistent
- [ ] Added to STORYBOOK-BACKLOG.md (if proposable)

Verification:
- [ ] `npm run validate:design` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` shows component correctly
- [ ] Visual regression check performed
```

## Accessibility Standards (WCAG 2.1 AA)

All components must meet WCAG 2.1 Level AA requirements:

### Perceivable

| Requirement | Implementation |
|-------------|----------------|
| **Non-text Content (1.1.1)** | All images need `alt` text; decorative icons use `aria-hidden="true"` |
| **Info & Relationships (1.3.1)** | Form inputs must have associated `<label>` with `htmlFor`; use semantic HTML |
| **Color Contrast (1.4.3)** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Resize Text (1.4.4)** | Use relative units (`rem`); page must work at 200% zoom |

### Operable

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard (2.1.1)** | All interactive elements must be keyboard accessible |
| **Focus Visible (2.4.7)** | Use `:focus-visible` styles; never use `outline: none` without replacement |
| **Focus Order (2.4.3)** | Tab order must be logical; use proper DOM order |
| **Focus Trap** | Modals must trap focus; Escape key must close them |

### Understandable

| Requirement | Implementation |
|-------------|----------------|
| **Language (3.1.1)** | Set `lang="et"` on `<html>` element |
| **Error Identification (3.3.1)** | Error messages must use `role="alert"` for screen reader announcement |
| **Labels (3.3.2)** | All form fields need visible labels, not just placeholders |

### Robust

| Requirement | Implementation |
|-------------|----------------|
| **Name, Role, Value (4.1.2)** | Custom controls need ARIA: `role`, `aria-label`, `aria-expanded`, etc. |
| **Modals** | Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| **Menus** | Use `role="menu"`, `role="menuitem"`, `aria-haspopup` |

### Accessibility Checklist

```markdown
Before submitting a component:

Perceivable:
- [ ] Images have alt text (or aria-hidden if decorative)
- [ ] Form inputs have proper <label> elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information is not conveyed by color alone

Operable:
- [ ] All functionality available via keyboard
- [ ] Focus indicators are visible (:focus-visible styles)
- [ ] No keyboard traps
- [ ] Modals trap focus and close with Escape

Understandable:
- [ ] Error messages announce to screen readers (role="alert")
- [ ] Labels are descriptive and associated with inputs
- [ ] Page language is set correctly

Robust:
- [ ] Custom controls have appropriate ARIA attributes
- [ ] Valid HTML structure
- [ ] Tested with axe-core (npm run test:a11y)
```

### Accessibility Testing

```bash
# Run automated accessibility tests
npm run test:a11y

# Run unit tests with accessibility assertions
npm run test:full

# Check for a11y issues in development (enabled automatically)
# Console will show axe-core warnings
```

## Industry Standards Compliance

Our design system achieves **Grade A** compliance with:

### ITCSS (Inverted Triangle CSS)
- ✅ Settings layer (tokens) defined first
- ✅ Base layer (resets) applied globally  
- ✅ Components layer (BEM) organized by specificity
- ✅ Import order enforced and documented

### W3C Design Token Format
- ✅ CSS custom properties in `:root`
- ✅ Semantic naming conventions
- ✅ Categorized by purpose (color, spacing, etc.)
- ✅ Runtime-changeable for theming

### BEM (Block Element Modifier)
- ✅ Consistent naming across all components
- ✅ Flat specificity (no deep nesting)
- ✅ Self-documenting class names
- ✅ Portable and reusable components

### Single Source of Truth
- ✅ All design values in tokens
- ✅ No hardcoded values in components
- ✅ Changes propagate through token updates
- ✅ Validated automatically

## Validation Results

Current status (as of January 17, 2026):

```
❌ Hardcoded colors: 97 instances (56 hex + 41 white keywords)
❌ RGBA shadows: 84 instances (need shadow tokens)
❌ Font sizes: 220 instances (need typography tokens)
❌ Breakpoints: 54 instances (need breakpoint mixins)
❌ Missing imports: 14 files (token imports needed)
✅ Inline styles: 3 (+ library-required exceptions)
✅ Token structure: Complete
✅ Documentation: Complete
✅ BEM naming: 100% compliant
✅ React Architecture: Properly refactored
✅ Build status: Passing

Overall Grade: F (Token Compliance Work Needed)

Run: npm run validate:design
See: packages/frontend/DESIGN_SYSTEM_COMPLIANCE_REPORT.md
```

**Note:** The design system architecture and documentation are complete. The remaining work is migrating existing SCSS files to use tokens consistently. See the compliance report for a prioritized remediation backlog.
