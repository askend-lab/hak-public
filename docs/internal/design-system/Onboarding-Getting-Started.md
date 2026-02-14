# Design System Onboarding - Getting Started

**Welcome to the EKI Design System!** This guide will help you get up to speed quickly.

---

## Reading List (in order)

Complete these readings to understand the system:

### 1. Architecture Overview (30 minutes)
- [ ] Read [README.md](./README.md) - Documentation index
- [ ] Read [02-Architecture-Overview.md](./02-Architecture-Overview.md)
- Focus on: Three-layer architecture, ITCSS, Token system
- Understand: Why we use design tokens, BEM naming

### 2. Quick Reference (5 minutes)
- [ ] Read [Quick-Reference-Common-Tasks.md](./Quick-Reference-Common-Tasks.md)
- Bookmark this page for quick lookups
- Note: Common tasks and token reference

### 3. Responsive Layout System (10 minutes)
- [ ] Read [05-Responsive-Layout.md](./05-Responsive-Layout.md)
- Focus on: 4 layout types, breakpoint strategy
- Understand: When to use each layout variant

### 4. Token Governance (15 minutes)
- [ ] Read [Token Governance](../styles/tokens/README.md)
- Learn: When to add tokens, naming conventions
- Understand: Dual-layer token system (CSS vars + SCSS)

### 5. Style Guide (10 minutes)
- [ ] Read [Style Guide](../styles/README.md)
- Focus on: BEM examples, component organization
- Note: Storybook vs app components

### 6. Storybook Backlog (5 minutes)
- [ ] Browse [STORYBOOK-BACKLOG.md](./STORYBOOK-BACKLOG.md)
- See: Components ready for storybook proposal
- Understand: Quality standards for proposals

**Total Reading Time: ~75 minutes**

---

## Hands-On Practice

Apply what you've learned:

### Exercise 1: Run Validation (5 min)
```bash
# Run the validation script
npm run validate:design
```

**Expected Output:**
- ✅ All checks should pass
- Familiarize yourself with what's being checked

### Exercise 2: Explore a Component (10 min)
- [ ] Open `styles/components/_panel.scss`
- [ ] Identify the BEM structure (block, elements, modifiers)
- [ ] Note how tokens are imported and used
- [ ] Find the mixins and see how they're used

### Exercise 3: Add a Test Color Token (15 min)
```scss
// 1. Open styles/tokens/_colors.scss
// 2. Add (at the end of :root):
:root {
  --color-test-onboarding: #FF6B6B;
}

// 3. Add SCSS alias (at the end):
$color-test-onboarding: var(--color-test-onboarding);

// 4. Use it in a test file
// 5. Run: npm run build
// 6. Clean up: Remove the test token
```

### Exercise 4: Style a Test Component (20 min)
```scss
// 1. Create: styles/components/_test-card.scss

@import '../tokens/colors';
@import '../tokens/spacing';
@import '../tokens/borders';

.test-card {
  background: $color-white;
  border: 1px solid $color-outlined-neutral;
  border-radius: $border-radius;
  padding: $spacing-4;
}

.test-card__header {
  font-weight: 600;
  margin-bottom: $spacing-2;
  color: $color-primary;
}

.test-card__content {
  color: $color-text-secondary;
}

.test-card--highlighted {
  border-color: $color-primary;
  background: $color-soft-primary-bg;
}

// 2. Import in main.scss:
@import 'components/test-card';

// 3. Build: npm run build
// 4. Clean up: Remove test-card files
```

### Exercise 5: Create a Test Page Layout (15 min)
- [ ] Review the 4 layout types in [05-Responsive-Layout.md](./05-Responsive-Layout.md)
- [ ] Choose appropriate layout for your use case
- [ ] Copy usage example from quick reference
- [ ] Apply classes to a test component
- [ ] Resize browser to see responsive behavior

### Exercise 6: Run Validation Again (5 min)
```bash
npm run validate:design
```

**Verify:** All checks still pass after your changes

**Total Practice Time: ~70 minutes**

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Hardcode colors (`#173148`) - use tokens (`$color-primary`)
- Hardcode spacing (`16px`) - use tokens (`$spacing-md`)
- Use inline styles - add classes to SCSS
- Skip validation - always run before committing
- Create duplicate components - check storybook first
- Use non-BEM naming - follow `.block__element--modifier`

✅ **Do:**
- Import tokens at top of SCSS files
- Follow BEM naming consistently
- Use existing storybook components
- Run validation frequently
- Document reusable components
- Ask questions when uncertain

---

## Next Steps

After completing this guide, proceed to:

- **[Verification Quiz](./Onboarding-Quiz.md)** - Test your understanding
- **[Quick Reference](./Quick-Reference-Common-Tasks.md)** - Bookmark for daily use
- **[Development Workflows](./06-Development-Workflows.md)** - Start building

**Total Time Investment: ~2 hours**
