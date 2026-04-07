# Contributing to HAK

Thank you for your interest in contributing to HAK — the Estonian language learning platform!

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ (see `.nvmrc`)
- [pnpm](https://pnpm.io/) 10+
- [Git](https://git-scm.com/)

No Docker, AWS CLI, or environment variables required. The dev server proxies API calls to deployed services.

### Setup

```bash
git clone https://github.com/askend-lab/hak-public.git
cd hak-public
pnpm install
pnpm start              # Dev server at http://localhost:5181
```

## Development Workflow

### Branch Naming

- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation updates
- `refactor/` - code refactoring

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance

### Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Run checks: `pnpm check`
4. Open a PR with a clear description

## Project Structure

```
packages/
  frontend/       - React frontend application
  shared/         - Shared utilities and types
  store/          - REST API for lessons, users, progress
  tts-api/        - TTS gateway (synthesis requests, caching)
  tts-worker/     - Estonian speech synthesis engine (Docker)
  morphology-api/ - Estonian morphological analysis
  auth/           - Estonian eID (TARA) authentication
  api-client/     - Shared API client configuration
  gherkin-parser/ - Gherkin specification parser
  specifications/ - BDD specifications

docs/             - Documentation and API reference
```

## Code Style

- TypeScript strict mode
- ESLint with zero warnings policy
- No `any` types without justification
- Tests required for new functionality (TDD)

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Start frontend dev server (port 5181) |
| `pnpm check` | Run all checks: lint + typecheck + tests |
| `pnpm lint` | ESLint with zero warnings policy |
| `pnpm typecheck` | TypeScript type checking (frontend + shared) |
| `pnpm test:all` | Run all tests across all packages |

## Questions?

Open an issue or reach out to the maintainers.
