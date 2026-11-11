# Gherkin Parser

Lightweight, zero-dependency Gherkin parser (~320 lines) for runtime use in the browser.

## Why Not `@cucumber/gherkin`?

The official Cucumber parser is designed for Node.js test runners and pulls in heavy dependencies. This package is a minimal alternative built specifically for parsing `.feature` files at runtime in the browser — used by the frontend to display BDD specifications in the UI.

## Usage

```typescript
import { parseFeatureContent } from '@hak/gherkin-parser';

const feature = parseFeatureContent(`
Feature: Login
  Scenario: Valid credentials
    Given the user is on the login page
    When they enter valid credentials
    Then they should see the dashboard
`);

// feature.name → "Login"
// feature.scenarios[0].name → "Valid credentials"
// feature.scenarios[0].steps[0] → { keyword: "Given", text: "the user is on the login page" }
```

Returns `ParsedFeature | null` — `null` if no `Feature:` keyword is found.

## Supported Gherkin Constructs

- **Feature** — name, description, tags
- **Scenario / Scenario Outline** — name, tags, steps
- **Background** — shared steps before scenarios
- **Rule** — grouping scenarios with their own background
- **Examples** — data tables for Scenario Outlines
- **Steps** — `Given`, `When`, `Then`, `And`, `But`
- **Data Tables** — pipe-delimited rows attached to steps
- **Doc Strings** — triple-quoted blocks attached to steps
- **Tags** — `@tag` annotations on features, scenarios, rules, examples

## Exports

```typescript
// Main parser
export { parseFeatureContent } from './parser';

// Types
export type {
  ParsedFeature,
  ParsedScenario,
  ParsedStep,
  ParsedBackground,
  ParsedExamples,
  ParsedRule,
  ParseError,
} from './types';

// Constants
export { KEYWORDS, STEP_KEYWORDS } from './constants';
export type { StepKeyword } from './constants';
```

## Where It's Used

- `packages/specifications/` — re-exports parser and types
- `packages/frontend/src/components/SpecsPage.tsx` — renders BDD specs in the UI
- `packages/frontend/src/services/specs/` — loads and parses `.feature` files

## Testing

```bash
pnpm test
```
