# Bug Fixing Process

This document describes the algorithm for fixing bugs in HAK project using TDD methodology.

## Algorithm Overview

```
For each bug in bug.md:
  1. ANALYZE → Understand the bug by comparing prototype vs HAK
  2. TEST (RED) → Write a failing test that captures the expected behavior
  3. IMPLEMENT (GREEN) → Write minimal code to make the test pass
  4. REFACTOR → Clean up code while keeping tests green
  5. VERIFY → Check visually that fix matches prototype
  6. COMMIT → Mark checkboxes in bug.md, commit changes
```

## Detailed Steps

### Step 1: ANALYZE

1. Open prototype at `http://localhost:3000`
2. Open HAK app at `http://localhost:5180`
3. Locate the specific UI element/feature
4. Document exactly what differs:
   - Visual appearance (colors, sizes, spacing)
   - Behavior (interactions, animations)
   - Functionality (what it does)

### Step 2: TEST (RED)

Write a failing Cucumber test in `packages/frontend/src/features/`:

```gherkin
Feature: [Feature Name]
  
  Scenario: [Bug description]
    Given I am on the home page
    When [action]
    Then [expected result matching prototype]
```

Or write a unit test in the component's test file:

```typescript
it('should [expected behavior]', () => {
  render(<Component />)
  expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
})
```

**Run test to confirm it fails (RED):**
```bash
pnpm test -- --testPathPattern="[test-file]"
```

### Step 3: IMPLEMENT (GREEN)

1. Locate the component that needs modification
2. Make the minimal change to pass the test
3. Run the test again to confirm it passes

**Key files:**
- Components: `packages/frontend/src/components/`
- Styles: `packages/frontend/src/styles/`
- Features: `packages/frontend/src/features/`

### Step 4: REFACTOR

1. Review the code for clarity and consistency
2. Ensure it follows existing patterns in the codebase
3. Run full test suite to ensure no regressions:
```bash
pnpm test
```

### Step 5: VERIFY

1. Refresh HAK app at `http://localhost:5180`
2. Compare visually with prototype at `http://localhost:3000`
3. Test the interaction manually
4. Take screenshot if needed for documentation

### Step 6: COMMIT

1. Update `bug.md` - mark checkboxes:
   ```markdown
   - [x] **Bug name**: Description
     - [x] Failing test written
     - [x] Test passes (bug fixed)
   ```

2. Commit with conventional commit message:
   ```bash
   git add .
   git commit -m "fix: [description]

   - Added test for [behavior]
   - Implemented [change]
   
   Closes: [bug name from bug.md]"
   ```

3. Push and create PR

## Bug Priority Order

Fix bugs in this order (from bug.md):

### Critical (affects UX) - Fix First
1. **Drag & Drop** - Core interaction pattern
2. **Context menu missing options** - Feature gap
3. **Input example text** - User guidance
4. **Input hint text** - User guidance
5. **Clear button** - Usability

### Medium - Fix Second
6. **Section title** - Visual consistency
7. **Tags/chips display** - Visual feedback

### Styling - Fix Last
8. **Context menu dropdown styling** - Polish

## Example: Fixing "Clear button" bug

```bash
# 1. Create branch
git checkout -b fix/clear-button

# 2. Write failing test
# packages/frontend/src/components/synthesis/SentenceRow.test.tsx
it('shows clear button when text is entered', () => {
  render(<SentenceRow value="test" ... />)
  expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
})

# 3. Run test (should fail)
pnpm test -- --testPathPattern="SentenceRow"

# 4. Implement in SentenceRow.tsx
# Add ClearButton component

# 5. Run test (should pass)
pnpm test -- --testPathPattern="SentenceRow"

# 6. Update bug.md and commit
git add .
git commit -m "fix: add clear button to text input"
```

## Notes

- Always check prototype behavior before implementing
- Use browser dev tools to inspect prototype CSS if needed
- Keep commits small and focused on single bugs
- Run `pnpm run dx` before pushing to ensure all checks pass
