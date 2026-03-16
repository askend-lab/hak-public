# Migration Patterns

## Migrating Legacy Components

**Step-by-step migration process:**

```
Step 1: Audit hardcoded values
  ↓
  Use: grep "#[0-9a-fA-F]" styles/components/_component.scss
  ↓
  Document all hardcoded colors found

Step 2: Find or create matching tokens
  ↓
  Check styles/tokens/_colors.scss for existing tokens
  ↓
  If needed, add new tokens following governance rules

Step 3: Replace values systematically
  ↓
  Replace #173148 → $color-primary
  Replace #D7E5F2 → $color-secondary
  ↓
  Work through file section by section

Step 4: Test visual regression
  ↓
  npm run dev
  ↓
  Compare visually with original
  ↓
  Adjust if colors don't match exactly

Step 5: Validate with script
  ↓
  npm run validate:design
  ↓
  Fix any issues found
  ↓
  Run validation again until passing
```

**Example Migration:**

```scss
// BEFORE: Legacy code with hardcoded values
.task-card {
  background: #FFFFFF;
  border: 1px solid #CDD7E1;
  padding: 16px;
  margin-bottom: 12px;
  color: #173148;
}

.task-card:hover {
  border-color: #0B6BCB;
  box-shadow: 0 2px 8px rgba(23, 49, 72, 0.12);
}

// AFTER: Migrated to tokens
@import '../tokens/colors';
@import '../tokens/spacing';

.task-card {
  background: $color-white;
  border: 1px solid $color-outlined-neutral;
  padding: $spacing-4;
  margin-bottom: $spacing-3;
  color: $color-primary;
}

.task-card:hover {
  border-color: $color-outlined-primary;
  box-shadow: 0 2px 8px $color-shadow-light;
}
```

## Proposing Components to Storybook

When an app component becomes valuable for other EKI apps, propose it to central storybook.

**Criteria for Proposal:**

1. **Reusability**: Component solves a common problem
2. **Quality**: Meets all design system standards
3. **Documentation**: Well-documented with examples
4. **Flexibility**: Configurable through props/modifiers
5. **Testing**: Thoroughly tested and stable

**Proposal Process:**

```
1. Verify component meets all quality standards
   ├─ Zero hardcoded values
   ├─ BEM naming compliant
   ├─ Fully documented
   └─ Validation passes

2. Add to STORYBOOK-BACKLOG.md
   ├─ Description and features
   ├─ Current location and usage stats
   ├─ BEM class structure
   └─ Implementation quality notes

3. Create proposal documentation
   ├─ Component purpose and use cases
   ├─ API/props documentation
   ├─ Code examples
   ├─ Visual examples (screenshots)
   └─ Dependencies and requirements

4. Submit to storybook maintainers
   └─ Follow central storybook proposal process

5. After approval and implementation
   ├─ Remove duplicated styles from app
   ├─ Import from storybook instead
   └─ Update components to use storybook classes
```

**Current Proposal-Ready Components:**

See [`docs/STORYBOOK-BACKLOG.md`](STORYBOOK-BACKLOG.md) for 6 components ready to propose:
- Textarea (fully implemented with validation)
- Modal (dialog variant, different from toast modal)
- Panel (sliding drawer with animations)
- Paper (dropdown/popover surface)
- Audio Player (with playback controls)
- Playlist (batch audio management)

## Handling Breaking Changes

**Token Renames:**

```
1. Announce change in advance
2. Create migration guide
3. Provide both old and new tokens temporarily
4. Update documentation
5. Deprecate old token with warning
6. Remove after grace period
```

**Component Restructuring:**

```
1. Document the change and reasons
2. Provide clear before/after examples
3. Create migration script if possible
4. Update all internal uses first
5. Announce externally with migration path
6. Support old structure for one version
```

**Communication Protocol:**

1. **Internal Changes**: Update this documentation
2. **Storybook Proposals**: Follow storybook process
3. **Breaking Changes**: Announce to team, document migration
4. **Version Bumps**: Follow semantic versioning
