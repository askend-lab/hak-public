# Specifications

BDD specifications and tests for HAK.

## Structure

```
packages/specifications/
├── *.feature           # Gherkin specifications (source of truth)
├── parser/             # Parser for .feature files (visualization)
├── e2e/                # E2E tests (current implementation)
└── user-stories/       # User story descriptions
```

## Current Status

**E2E tests (`e2e/`):**
- Use `jest-cucumber` to link Gherkin to steps
- Steps manipulate `TestWorld` object in memory
- **Do NOT render React components**
- Test business logic without real UI

## Migration Plan

### Goal
Gherkin tests should:
- Render real React components
- Simulate button clicks via Testing Library
- Mock HTTP requests (stay in-memory)
- Run fast, without servers

### Architecture

```
┌─────────────────────────────────────────────┐
│           Gherkin test (in-memory)          │
├─────────────────────────────────────────────┤
│  React component (@testing-library/react)   │
│       ↓ userEvent.click()                   │
│  Store (zustand)                            │
│       ↓ API call                            │
│  Mock HTTP (msw / jest.mock)                │ ← cut off here
│       ↓                                     │
│  [X Real backend]                           │
└─────────────────────────────────────────────┘
```

### File Placement

| What | Where | Why |
|------|-------|-----|
| `.feature` files | `specifications/` | Single source of truth |
| Step definitions | `frontend/steps/` | Import React components |
| Parser | `specifications/parser/` | Reused for visualization |

### Technologies

- `jest-cucumber` - link Gherkin to steps
- `@testing-library/react` - render components
- `@testing-library/user-event` - simulate clicks
- `msw` or `jest.mock` - mock HTTP requests

### Known Issue: ESM + jsdom

When combining `jest-cucumber` with `jsdom` environment (required for React Testing Library), Jest fails to parse ESM modules from `uuid` and `@cucumber/*` dependencies. 

**Workarounds being explored:**
1. Use Vitest instead of Jest (better ESM support)
2. Mock jest-cucumber dependencies
3. Run Gherkin tests separately from React tests

**Current status:** POC test in `frontend/src/steps/synthesis-poc.test.tsx` demonstrates React Testing Library approach works. Gherkin integration pending ESM resolution.

## Usage

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

## Exports

```typescript
import { parseFeatureContent, ParsedFeature } from '@hak/specifications';
```
