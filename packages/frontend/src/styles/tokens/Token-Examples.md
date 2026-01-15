# Design Token Examples

## Good Token Usage

```scss
.my-component {
  color: $color-primary;
  background: $color-soft-primary-bg;
  padding: $spacing-md;
  border-radius: $border-radius;
  
  &:hover {
    background: $color-soft-primary-bg-hover;
  }
}
```

## Bad Token Usage

```scss
.my-component {
  color: #173148; // ❌ Hardcoded - use $color-primary
  background: #E3EFFB; // ❌ Hardcoded - use $color-soft-primary-bg
  padding: 16px; // ❌ Hardcoded - use $spacing-md
  border-radius: 8px; // ❌ Hardcoded - use $border-radius
}
```

## Migration from Hardcoded Values

When refactoring existing code:

1. **Identify the semantic meaning** of the hardcoded value
2. **Find or create the appropriate token**
3. **Replace the hardcoded value** with the token
4. **Test visually** to ensure no regressions

## Token Updates

When updating token values:

1. **Update the CSS custom property** in the token file
2. **The SCSS alias automatically references the new value**
3. **Build and test** to ensure changes propagate correctly
4. **Document the change** if it affects multiple components

## Relationship to EKI Storybook

These app tokens extend the EKI Storybook design system:

- **Storybook tokens**: Imported from storybook (read-only)
- **App tokens**: Defined here, follow same conventions
- **Future migration**: App tokens may be proposed to storybook

See `docs/02-DESIGN-SYSTEM/STORYBOOK-BACKLOG.md` for components/tokens to propose to central storybook.

## Validation

Run the design system validation script to check compliance:

```bash
npm run validate:design
```

This checks:
- No hardcoded colors in components
- No inline styles in React components
- All tokens properly documented
- Build succeeds

---

**See also:**
- [Token Governance](./Token-Governance.md) - Rules and conventions
- [Token Categories](./Token-Categories.md) - Complete list of categories
