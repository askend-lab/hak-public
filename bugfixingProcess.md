# Bug Fixing Process

This document describes the algorithm for fixing bugs in HAK project using TDD methodology.

## Algorithm Overview

```
For each bug in bug.md:
  1. ANALYZE → Deep analysis of the bug (prototype vs HAK)
  2. PLAN → Write fix plan in bug.md under the bug item
  3. TEST (RED) → Write failing test, run it, confirm it's RED
  4. IMPLEMENT (GREEN) → Minimal code to pass test
  5. REFACTOR → Clean up, minimize inline styles, use vendor styles
  6. VERIFY → Visual check against prototype screenshot
  7. COMMIT → Mark checkbox, commit, stay on branch
  8. NEXT → Move to next bug (or escalate if blocked)
```

## Detailed Steps

### Step 1: ANALYZE (Deep Investigation)

**Prototype analysis:**
1. Open prototype at `http://localhost:3000`
2. Inspect HTML structure using browser DevTools
3. Take screenshot of the element/feature
4. Look at prototype source code in `/home/alex/users/luna/eki/`

**HAK app analysis:**
1. Open HAK app at `http://localhost:5180`
2. Inspect HTML structure using browser DevTools
3. Take screenshot for comparison
4. Look at HAK source code in `packages/frontend/src/`

**Document findings:**
- What exactly differs (visual, behavior, functionality)
- Which files need to change
- CSS classes/styles involved

### Step 2: PLAN (Write Fix Plan)

Add a plan section under the bug in `bug.md`:

```markdown
- [ ] **Bug name**: Description
  - [ ] Failing test written
  - [ ] Test passes (bug fixed)
  
  **Fix plan:**
  1. Add [component/element] to [file]
  2. Style using [vendor class] or add to [css file]
  3. Test: [what to test]
```

### Step 3: TEST (RED)

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

### Step 4: IMPLEMENT (GREEN)

1. Locate the component that needs modification
2. Make the **minimal** change to pass the test
3. Run the test again to confirm it passes (GREEN)

**Key files:**
- Components: `packages/frontend/src/components/`
- Styles: `packages/frontend/src/styles/`
- Features: `packages/frontend/src/features/`

**Check the page if needed:**
- Refresh `http://localhost:5180` to see changes
- If server restart needed: `pnpm start` (kills previous, starts new)
- Don't restart unnecessarily — hot reload usually works

### Step 5: REFACTOR

**Run full test suite:**
```bash
pnpm test
```

**Code quality review:**
1. Look at new code together with existing code
2. Check for consistency and beauty
3. **Minimize inline styles** — avoid `style={{...}}` in JSX
4. **Minimize app-specific CSS** — prefer vendor styles
5. **Maximize vendor style usage** — check `packages/vendor/` for existing classes

### Step 6: VERIFY (Final Visual Check)

1. Open HAK app at `http://localhost:5180`
2. Compare with prototype screenshot
3. Confirm the bug is fixed correctly
4. If NOT fixed → go back to Step 3 (TDD cycle)

### Step 7: COMMIT

1. Update `bug.md` — mark checkbox as done:
   ```markdown
   - [x] **Bug name**: Description
     - [x] Failing test written
     - [x] Test passes (bug fixed)
   ```

2. Commit:
   ```bash
   git add .
   git commit -m "fix: [description]"
   ```

3. **Stay on branch** — continue with next bug

### Step 8: NEXT (Move to Next Bug or Escalate)

**If problem occurs:**
1. Try to solve it 3 times
2. If still not working → commit stable state
3. Document the problem in `bug.md` under the bug item
4. Move to next bug

**If critical blocker (server down, everything broken):**
- Stop immediately
- Report to user via Slack with `--critical` flag
- Wait for help

## Notes

- Always check prototype behavior before implementing
- Use browser dev tools to inspect prototype CSS if needed
- Keep commits small and focused on single bugs
- Run `pnpm run dx` before pushing to ensure all checks pass
