# Specifications

Gherkin BDD feature specifications for HAK. These `.feature` files serve as both documentation and executable tests — they describe expected behavior in a human-readable format and map to automated test implementations.

## Structure

```
├── auth/           # F07 — Authentication (login, profile, logout)
├── misc/           # F08, F10 — Onboarding, notifications
├── playlist/       # F04 — Playlist management (add, reorder, play all)
├── sharing/        # F06 — Task sharing (share, access shared)
├── synthesis/      # F01 — Speech synthesis (text input, synthesize, playback, download)
│                   # F02 — Pronunciation variants (view, preview, select, custom)
│                   # F03 — Sentence phonetic (view, edit)
├── tasks/          # F05 — Task management (create, view, edit, delete, add to task)
└── index.ts        # Re-exports parser and types from @hak/gherkin-parser
```

## Usage

### In Tests (Cucumber)

```bash
pnpm --filter @hak/frontend test:cucumber
```

Cucumber step definitions in `packages/frontend/` import `.feature` files and map Gherkin steps to test implementations.

### In UI

The frontend renders specifications in a Specs page (`SpecsPage.tsx`), loading and parsing `.feature` files at runtime via `@hak/gherkin-parser`.

### As Documentation

Feature files are readable by non-technical stakeholders. Each file follows the pattern:

```gherkin
Feature: Text Input
  Scenario: User enters text for synthesis
    Given the user is on the synthesis page
    When they enter "Tere päevast" in the text field
    Then the synthesize button should be enabled
```

## Dependencies

- `@hak/gherkin-parser` — lightweight Gherkin parser for runtime use

## Testing

Feature files are validated by CI lint checks and tested via Cucumber in the frontend package.
