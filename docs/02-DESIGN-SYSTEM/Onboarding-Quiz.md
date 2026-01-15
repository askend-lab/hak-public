# Design System Onboarding - Verification Quiz

**Test your understanding** (answers at bottom)

---

## Questions

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

## Answers

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

## Next Steps After Quiz

### For Regular Development
1. Keep [Quick Reference](./Quick-Reference-Common-Tasks.md) bookmarked
2. Run `npm run validate:design` before committing
3. Refer to [README.md](./README.md) when needed
4. Follow the quality standards checklist

### For Adding New Components
1. Check if it exists in storybook first
2. Follow [06-Development-Workflows.md](./06-Development-Workflows.md)
3. Use BEM naming consistently
4. Run validation to ensure compliance

### For Proposing to Storybook
1. Review [STORYBOOK-BACKLOG.md](./STORYBOOK-BACKLOG.md)
2. Ensure component meets all quality standards
3. Document thoroughly with examples
4. Follow the proposal process in [08-Migration-Patterns.md](./08-Migration-Patterns.md)

---

## Completion Checklist

Mark when done:

- [ ] Read all documentation (~75 min)
- [ ] Completed all practice exercises (~70 min)
- [ ] Passed verification quiz (8/8 correct)
- [ ] Bookmarked quick reference
- [ ] Understand three-layer architecture
- [ ] Can add a token correctly
- [ ] Can style a component with BEM
- [ ] Know when to use storybook vs app components
- [ ] Can run validation script

**Congratulations! You're ready to use the EKI Design System.**

---

## Resources

- **Documentation Index**: [README.md](./README.md)
- **Quick Reference**: [Quick-Reference-Common-Tasks.md](./Quick-Reference-Common-Tasks.md)
- **Token Governance**: `styles/tokens/README.md`
- **Style Guide**: `styles/README.md`
- **Validation Script**: `npm run validate:design`
