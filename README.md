# HAK — Estonian Language Learning Platform

[![Build & Test](https://github.com/askend-lab/hak-public/actions/workflows/build.yml/badge.svg)](https://github.com/askend-lab/hak-public/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220.svg)](https://pnpm.io/)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

An open-source language learning platform where teachers create interactive
Estonian lessons with text-to-speech audio, and students complete them.
Built with React and TypeScript.

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org/) 20+, [pnpm](https://pnpm.io/) 10+, [Git](https://git-scm.com/)

```bash
git clone https://github.com/askend-lab/hak-public.git
cd hak-public
pnpm install
pnpm start              # Dev server at http://localhost:5181
```

No Docker, AWS CLI, or environment variables needed — the dev server proxies API calls to deployed services.

## Project Structure

| Package | Description |
|---------|-------------|
| `packages/frontend` | React SPA — Vite, SCSS/BEM, React Router |
| `packages/shared` | Shared types and utilities |
| `packages/simplestore` | REST API for lessons, users, progress (DynamoDB) |
| `packages/merlin-api` | TTS gateway — synthesis requests, caching (Lambda) |
| `packages/merlin-worker` | Estonian speech synthesis engine — Merlin TTS (Docker/ECS) |
| `packages/vabamorf-api` | Estonian morphological analysis — stress, variants (Lambda) |
| `packages/specifications` | Gherkin BDD specifications |
| `packages/gherkin-parser` | Gherkin-to-test mapping |

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a system overview.

**Frontend** → React SPA served via CDN.
**Backend** → Serverless Lambda functions + Docker-based TTS engine.
**Storage** → DynamoDB for data, S3 for audio files.

## Features

- **Interactive lessons** — Teachers create text-based lessons with audio
- **Text-to-speech** — Estonian speech synthesis (Merlin TTS engine)
- **Morphological analysis** — Word stress and pronunciation variants (Vabamorf)
- **Audio pipeline** — Synthesis queue, caching, playback
- **Responsive design** — Works on desktop and mobile
- **Accessibility** — WCAG-compliant UI components

## Development

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Start frontend dev server (port 5181) |
| `pnpm check` | Run all checks: lint + typecheck + tests |
| `pnpm lint` | ESLint + Gherkin lint |
| `pnpm typecheck` | TypeScript type checking across all packages |
| `pnpm test:all` | Run all tests across all packages |

### Code Quality

- **TypeScript** — strict mode, zero `any` types
- **ESLint** — zero warnings policy
- **Tests** — TDD enforced, coverage thresholds per module

BDD specifications in Gherkin live in `packages/specifications/`.

## API Documentation

- [API Reference](docs/API.md) — all endpoint documentation
- [Architecture Decisions](docs/adr/) — ADRs

## Contributing

We welcome contributions! Please read:

1. [Code of Conduct](CODE_OF_CONDUCT.md)
2. [Contributing Guide](CONTRIBUTING.md)
3. [Security Policy](SECURITY.md)
4. [Support](SUPPORT.md)

```bash
pnpm install
pnpm check          # Make sure everything passes
# Create a branch, make changes, open a PR
```

## Built With AI

This project is developed using an AI-assisted methodology with automated
quality enforcement. Human developers and AI agents collaborate through
structured workflows, TDD, and executable specifications.

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.
