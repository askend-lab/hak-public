# TDD Workflow for Gherkin + Vitest

## Requirements Sources

- `.design/04-SPECIFICATIONS/01-USER-STORIES/` - Detailed user stories
- `packages/specifications/**/*.feature` - Gherkin scenarios

## One Commit Contains

1. **Gherkin step definition** - BDD level (cucumber coverage)
2. **Unit test (.test.tsx)** - failing test (vitest coverage)
3. **Implementation** - minimal code to make both tests pass

## Action Order

```
1. RED:      Write Gherkin step definition - test fails
2. RED:      Write Unit test (.test.tsx) - test fails
3. GREEN:    Implement minimal code - both tests pass
4. REFACTOR: Improve code if needed
5. COMMIT + PUSH
```

## Guarantees

- Gherkin scenario passes (BDD)
- Vitest coverage does not drop (unit tests)
- TDD followed (RED - GREEN - REFACTOR)
- Lint passes (code quality)

## Commit Example

```
feat: implement US-004 scenario "Display phonetic markers"

- Add step definitions in synthesis.steps.ts
- Add unit test in StressedText.test.tsx
- Implement phonetic marker display in StressedText.tsx
```
