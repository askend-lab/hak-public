# Frontend

React SPA for the HAK Estonian language learning platform. Teachers create interactive lessons with text-to-speech audio, students complete them.

## Stack

- **React 19** + TypeScript (strict mode)
- **Vite** — build tool and dev server
- **SCSS/BEM** — styling with design tokens
- **Vitest** — unit tests (co-located `*.test.ts` next to source)
- **Cucumber** — BDD tests from Gherkin specifications
- **Playwright** — E2E browser tests

## Development

```bash
pnpm start              # Dev server at http://localhost:5181
pnpm test               # Run changed tests
pnpm test:full          # Run all tests
pnpm test:cucumber      # Run BDD/Cucumber tests
pnpm lint               # ESLint (zero warnings)
pnpm build              # Production build
```

## Project Structure

```
src/
├── components/         # Shared UI components (ErrorBoundary, Dashboard, etc.)
├── features/
│   ├── auth/           # Authentication (TARA, Cognito, login/callback)
│   ├── sharing/        # Task sharing (share links, shared task view)
│   └── synthesis/      # Speech synthesis UI (main feature)
├── hooks/              # Shared React hooks
├── pages/              # Route pages (NotFoundPage, etc.)
├── services/           # API clients, data services
├── styles/             # SCSS design tokens and global styles
└── utils/              # Utility functions
```

## Features

- **Speech synthesis** — text input, voice selection, speed/pitch control, audio playback
- **Morphological analysis** — word stress markers, pronunciation variants (Vabamorf)
- **Task management** — create, edit, share, download lessons as ZIP
- **Authentication** — Estonian eID (TARA) via Smart-ID/Mobile-ID + social login via Cognito
- **Responsive design** — desktop and mobile layouts
- **Accessibility** — axe-core dev mode, skip links, ARIA attributes, focus traps
- **i18n** — Estonian language UI

## Dependencies

- `@hak/shared` — shared types, utilities, constants
- `@hak/specifications` — Gherkin BDD specs (rendered in UI)
- `@hak/simplestore` — SimpleStore types (dev only, for Cucumber tests)

## Testing

```bash
pnpm test               # Changed files only
pnpm test:full          # All tests with coverage
pnpm test:cucumber      # BDD tests
```

Tests are co-located: `Component.test.tsx` sits next to `Component.tsx`. Coverage thresholds are enforced by Jest and CI.
