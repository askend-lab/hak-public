# HAK — Estonian Language Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220.svg)](https://pnpm.io/)

A serverless language learning platform where teachers create interactive
Estonian lessons and students complete them. Built with React, TypeScript,
and AWS Lambda.

## Quick Start

```bash
pnpm install
pnpm test          # Run all tests
pnpm run dx        # Full quality check: tests + hooks
pnpm start         # Start dev server (http://localhost:5180)
```

**Prerequisites:** Node.js 20+, pnpm 9+

## Architecture

**Monorepo** (`pnpm` workspaces) with serverless backend on AWS — React frontend, Lambda APIs, DynamoDB, S3 audio, Docker-based TTS engine.

See [ARCHITECTURE.md](ARCHITECTURE.md) for monorepo structure, package dependencies, data flows, infrastructure, and quality system.

## Development

```bash
pnpm run dx        # Full DevBox quality check (tests + hooks)
pnpm lint          # ESLint
pnpm test          # All tests
pnpm test -- --full    # Full suite with coverage
```

Tests use **Jest** (backend packages) and **Vitest** (frontend).
Frontend packages use **co-located tests** (`*.test.ts` next to source files).
Backend packages use **separated tests** (`test/` directory).
BDD specifications in Gherkin live in `packages/specifications/`.

## Contributing

We welcome contributions! Please read:

1. [Contributing Guide](CONTRIBUTING.md)
2. [Code of Conduct](CODE_OF_CONDUCT.md)

```bash
# Fork, clone, then:
pnpm install
pnpm test          # Make sure everything passes
# Create a branch, make changes, open a PR
```

## Built With AI

This project is developed using an AI-assisted methodology with automated
quality enforcement. Human developers and AI agents collaborate through
structured workflows, TDD, and executable specifications.

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.
