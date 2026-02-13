# HAK — Estonian Language Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220.svg)](https://pnpm.io/)

An open-source language learning platform where teachers create interactive
Estonian lessons with text-to-speech audio, and students complete them.
Built with React and TypeScript.

## Quick Start

```bash
pnpm install
pnpm start         # Start dev server (http://localhost:5180)
```

**Prerequisites:** Node.js 20+, pnpm 9+

## Project Structure

| Package | Description |
|---------|-------------|
| `packages/frontend` | React SPA — Vite, SCSS/BEM, React Router |
| `packages/shared` | Shared types and utilities |
| `packages/simplestore` | REST API for lessons, users, progress (DynamoDB) |
| `packages/merlin-api` | TTS gateway — synthesis requests, caching (Lambda) |
| `packages/merlin-worker` | Estonian speech synthesis engine — Merlin TTS (Docker/ECS) |
| `packages/vabamorf-api` | Estonian morphological analysis — stress, variants (Lambda) |
| `packages/audio-api` | Audio file storage and playback (S3) |
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

### Code Quality

Quality is enforced via pre-commit hooks:

- **TypeScript** — strict mode, zero `any` types
- **ESLint** — zero warnings policy
- **Tests** — TDD enforced, coverage thresholds per module
- **Security** — dependency audit, secret detection

### Testing

```bash
cd packages/frontend
npx vitest              # Run frontend tests
npx vitest --coverage   # With coverage
```

BDD specifications in Gherkin live in `packages/specifications/`.

## API Documentation

- [API Reference](docs/API.md) — endpoint overview
- [Vabamorf API](docs/API-Vabamorf.md) — morphological analysis endpoints
- [Merlin TTS API](docs/API-Merlin.md) — speech synthesis endpoints
- [Architecture Decisions](docs/adr/) — ADRs

## Contributing

We welcome contributions! Please read:

1. [Contributing Guide](CONTRIBUTING.md)
2. [Security Policy](SECURITY.md)

```bash
# Fork, clone, then:
pnpm install
cd packages/frontend && npx vitest   # Make sure everything passes
# Create a branch, make changes, open a PR
```

## Built With AI

This project is developed using an AI-assisted methodology with automated
quality enforcement. Human developers and AI agents collaborate through
structured workflows, TDD, and executable specifications.

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.
