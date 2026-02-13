# Contributing to HAK

Thank you for your interest in contributing to HAK - the Estonian language learning platform!

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- AWS CLI (for deployment)

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
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Open a PR with a clear description

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full monorepo structure, package dependencies, and data flows.

## Code Style

See the Quality System section in [ARCHITECTURE.md](ARCHITECTURE.md) for the full list of enforced checks.

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @hak/frontend test
```

## Questions?

Open an issue or reach out to the maintainers.
