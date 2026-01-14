# Design System Onboarding

**Welcome to the EKI Design System!** This guide will help you get up to speed quickly.

---

## Reading List (in order)

Complete these readings to understand the system:

### 1. Architecture Overview (30 minutes)
- [ ] Read [DESIGN_SYSTEM_ARCHITECTURE.md](DESIGN_SYSTEM_ARCHITECTURE.md)
- Focus on: Three-layer architecture, ITCSS, Token system
- Understand: Why we use design tokens, BEM naming

### 2. Quick Reference (5 minutes)
- [ ] Read [DESIGN_SYSTEM_QUICK_REFERENCE.md](DESIGN_SYSTEM_QUICK_REFERENCE.md)
- Bookmark this page for quick lookups
- Note: Common tasks and token reference

### 2.5. Responsive Layout System (10 minutes)
- [ ] Read Layout System section in [DESIGN_SYSTEM_ARCHITECTURE.md](DESIGN_SYSTEM_ARCHITECTURE.md#responsive-layout-system)
- Focus on: 4 layout types, breakpoint strategy
- Understand: When to use each layout variant

### 3. Token Governance (15 minutes)
- [ ] Read [Token Governance](../styles/tokens/README.md)
- Learn: When to add tokens, naming conventions
- Understand: Dual-layer token system (CSS vars + SCSS)

### 4. Style Guide (10 minutes)
- [ ] Read [Style Guide](../styles/README.md)
- Focus on: BEM examples, component organization
- Note: Storybook vs app components

### 5. Storybook Backlog (5 minutes)
- [ ] Browse [STORYBOOK-BACKLOG.md](STORYBOOK-BACKLOG.md)
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
- [ ] Review the 4 layout types in architecture doc
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

## Verification Quiz

Test your understanding (answers at bottom):

### Question 1
What are the three layers of the design system architecture?

### Question 2
When should you use storybook components vs creating app-specific components?

### Question 3
How do you add a new color token? (List the steps)

### Question 4
What's the BEM naming pattern? Give an example with a component called `user-card` that has a title element and an active modifier.

### Question 5
How do you validate your work before committing?

### Question 6
What's the difference between CSS custom properties and SCSS variables in our token system?

### Question 7
Should you hardcode `padding: 16px` or use a token? If token, which one?

### Question 8
If you need a button, should you create `.my-button` in a new SCSS file or use storybook classes?

---

## Quiz Answers

### Answer 1
**Three layers:**
1. Layer 1: Design Tokens (styles/tokens/)
2. Layer 2: Storybook Components (imported, used as-is)
3. Layer 3: App-Specific Components (styles/components/)

### Answer 2
**Use storybook components when:**
- The component exists in storybook (Button, Input, Avatar, etc.)
- No additional functionality needed

**Create app-specific components when:**
- Component doesn't exist in storybook
- App-specific functionality required
- Consider proposing to storybook if reusable

### Answer 3
**Steps to add a color token:**
1. Open `styles/tokens/_colors.scss`
2. Add CSS custom property in `:root` section
3. Add SCSS alias below (references the CSS var)
4. Document usage with a comment
5. Run `npm run build` to verify

### Answer 4
**BEM pattern:**
- Block: `.user-card`
- Element: `.user-card__title`
- Modifier: `.user-card--active`
- Element modifier: `.user-card__title--highlighted`

### Answer 5
**Validation steps:**
```bash
npm run validate:design  # Runs all checks
npm run build           # Verifies build succeeds
```

### Answer 6
**Differences:**
- **CSS Custom Properties**: Runtime-changeable, enables theming, works in browser
- **SCSS Variables**: Compile-time only, IDE autocomplete, faster development

**Our approach:** Define CSS vars once, reference via SCSS aliases everywhere

### Answer 7
**Use token:** `padding: $spacing-md;`
- 16px = $spacing-md or $spacing-4
- Never hardcode spacing values

### Answer 8
**Use storybook:** `<button className="button button--primary">`
- Button exists in storybook
- Don't create duplicate button styles
- Use storybook classes directly

---

## Next Steps

After completing onboarding:

### For Regular Development
1. Keep [Quick Reference](DESIGN_SYSTEM_QUICK_REFERENCE.md) bookmarked
2. Run `npm run validate:design` before committing
3. Refer to [Architecture Overview](DESIGN_SYSTEM_ARCHITECTURE.md) when needed
4. Follow the quality standards checklist

### For Adding New Components
1. Check if it exists in storybook first
2. Follow the "Adding a New Component" workflow in Architecture docs
3. Use BEM naming consistently
4. Run validation to ensure compliance

### For Proposing to Storybook
1. Review [STORYBOOK-BACKLOG.md](STORYBOOK-BACKLOG.md)
2. Ensure component meets all quality standards
3. Document thoroughly with examples
4. Follow the proposal process

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

## Resources

- **Full Documentation**: [DESIGN_SYSTEM_ARCHITECTURE.md](DESIGN_SYSTEM_ARCHITECTURE.md)
- **Quick Reference**: [DESIGN_SYSTEM_QUICK_REFERENCE.md](DESIGN_SYSTEM_QUICK_REFERENCE.md)
- **Token Governance**: [../styles/tokens/README.md](../styles/tokens/README.md)
- **Style Guide**: [../styles/README.md](../styles/README.md)
- **Validation Script**: `npm run validate:design`

---

## Completion Checklist

Mark when done:

- [ ] Read all documentation (65 min)
- [ ] Completed all practice exercises (55 min)
- [ ] Passed verification quiz (8/8 correct)
- [ ] Bookmarked quick reference
- [ ] Understand three-layer architecture
- [ ] Can add a token correctly
- [ ] Can style a component with BEM
- [ ] Know when to use storybook vs app components
- [ ] Can run validation script

**Total Time Investment: ~2 hours**

**Welcome to the team! 🎉**
