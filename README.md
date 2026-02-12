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

**Monorepo** (`pnpm` workspaces) with serverless backend on AWS.

| Package | Description |
|---------|-------------|
| `packages/frontend` | React SPA — Vite, SCSS/BEM, React Router |
| `packages/simplestore` | REST API — Lambda + DynamoDB |
| `packages/audio-api` | Audio processing — Lambda + S3 |
| `packages/merlin-api` | Estonian TTS gateway — Lambda |
| `packages/merlin-worker` | TTS synthesis engine — SQS + Docker |
| `packages/vabamorf-api` | Morphological analysis — Lambda + native binary |
| `packages/shared` | Shared types and utilities |
| `packages/specifications` | Gherkin specs (BDD) |
| `packages/tara-auth` | Estonian eID (TARA) authentication |
| `packages/gherkin-parser` | Gherkin → test mapping |

## Development

### Code Quality

Quality is enforced automatically via pre-commit hooks:

- **TypeScript** — strict mode, zero `any` types
- **ESLint** — zero warnings policy
- **Tests** — TDD enforced, coverage thresholds per module
- **Security** — dependency audit, secret detection
- **Architecture** — file size limits, no copy-paste, import order

Run all checks manually:

```bash
pnpm run dx        # Full DevBox quality check
pnpm lint          # ESLint
pnpm -r exec tsc --noEmit   # TypeScript check
```

### Testing

```bash
pnpm test              # All tests
pnpm test -- --full    # Full suite with coverage
```

Tests use **Jest** (backend packages) and **Vitest** (frontend).
BDD specifications in Gherkin live in `packages/specifications/`.

## Infrastructure

Serverless on AWS, managed with Terraform.

- **Frontend** — S3 + CloudFront
- **APIs** — Lambda behind API Gateway
- **Database** — DynamoDB
- **Audio** — S3 + Lambda processing
- **TTS** — ECS/Docker (Merlin synthesis engine)

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture and [`docs/`](docs/) for more documentation.

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
