# HAK — Estonian Language Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220.svg)](https://pnpm.io/)

A serverless language learning platform where teachers create interactive
Estonian lessons and students complete them. Built with React, TypeScript,
and AWS Lambda.

## Quick Start

**Prerequisites:** Node.js 20+ (see `.nvmrc`), pnpm 10+

```bash
git clone https://github.com/askend-lab/hak.git
cd hak
pnpm install
pnpm test          # Run all tests
pnpm run dx        # Full quality check: tests + hooks
pnpm start         # Start dev server (http://localhost:5181)
```

**tts-worker** (Python TTS engine) requires additional setup:

```bash
cd packages/tts-worker
python3 -m venv .venv
.venv/bin/pip install -r requirements-test.txt
.venv/bin/pytest tests/ -v    # Run Python tests
```

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

## Security Considerations

Some aspects of HAK's architecture are **intentionally open by design** and should not be treated as vulnerabilities:

- **Merlin API (TTS) and Vabamorf API (NLP) are public endpoints** — no authentication is required. These APIs serve the core learning experience and must be accessible without login. Protection is via API Gateway throttling and AWS WAF rate limiting only.
- **S3 audio storage is publicly readable** — synthesized audio files are served directly via CloudFront/S3. Content is non-sensitive educational material. Access is by content-hash URL; there is no authorization layer by design.
- **Lambda deployment** — Lambda functions are deployed via direct `aws lambda update-function-code` CLI calls. Infrastructure (IAM roles, env vars, API Gateway) is managed by Terraform. There is no Serverless Framework dependency.

For the full security audit and current findings, see `internal/SECURITY-AUDIT-2026-02.md`.

## Language

The user interface is in **Estonian only**. This is intentional — HAK is designed for Estonian language learners and the Estonian education market. There are no plans for English or other language interfaces.

UI strings are centralized in `packages/frontend/src/config/ui-strings.ts` for maintainability.

## Built With AI

This project is developed using an AI-assisted methodology with automated
quality enforcement. Human developers and AI agents collaborate through
structured workflows, TDD, and executable specifications.

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.
