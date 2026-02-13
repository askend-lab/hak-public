# Contributing to HAK

Thank you for your interest in contributing to HAK — the Estonian language learning platform!

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/askend-lab/hak.git
cd hak

# Install dependencies
pnpm install

# Start the development server
pnpm start
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
3. Run tests: `cd packages/frontend && npx vitest`
4. Open a PR with a clear description

## Project Structure

```
packages/
  frontend/       - React frontend application
  shared/         - Shared utilities and types
  simplestore/    - REST API for lessons, users, progress
  merlin-api/     - TTS gateway (synthesis requests, caching)
  merlin-worker/  - Estonian speech synthesis engine (Docker)
  vabamorf-api/   - Estonian morphological analysis
  audio-api/      - Audio file storage and playback
  gherkin-parser/ - Gherkin specification parser
  specifications/ - BDD specifications

docs/             - Documentation and API reference
```

## Code Style

- TypeScript strict mode
- ESLint with zero warnings policy
- No `any` types without justification
- Tests required for new functionality (TDD)

## Testing

```bash
# Run frontend tests
cd packages/frontend
npx vitest

# Run with coverage
npx vitest --coverage
```

## Questions?

Open an issue or reach out to the maintainers.
