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

Current status (as of January 2026):

```
✅ Hardcoded colors: 0 instances
✅ Variable conflicts: 0 instances
✅ Inline styles: 2 (library-required exceptions)
✅ Token structure: Complete
✅ Documentation: Complete
✅ BEM naming: 100% compliant
✅ Build status: Passing

Overall Grade: A (Full Compliance)
```
