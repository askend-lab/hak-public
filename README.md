# HAK

Estonian language learning platform — serverless LMS where teachers create interactive lessons and students complete them.

## Project Background

The Estonian Institute of Language requested a helper application for learning Estonian. We built a quick **prototype** using vibe coding — it looks exactly how the client wants but has terrible internal architecture and no tests.

**What we're doing now**: Rewriting the prototype properly with TDD, clean architecture, and production-ready AWS infrastructure. We compare screens and functionality between the prototype and our new app, find differences, and fix them.

**The prototype is NOT an architecture reference** — it's a visual and functional reference only. The client has already approved the prototype's look and feel.

## Dual Purpose

1. **Build the HAK app** — production-ready Estonian language learning platform
2. **Test our development methodology** — this project is a testing ground for agent-based development with DevBox, TDD, and executable specifications (Gherkin)

## Running Locally

| Service | URL | Description |
|---------|-----|-------------|
| **Prototype** | http://localhost:3000/ | Visual/functional reference |
| **HAK App** | http://localhost:5180/ | Our production app with hot reload |

```bash
pnpm install
pnpm run dx    # Full check: tests + hooks
pnpm start     # Run frontend + backend (kills previous server, starts new)
```

## Development with DevBox

Built for AI-assisted development using [DevBox](devbox.yaml) — enforces TDD, coverage thresholds, and code quality through git hooks.

## CI/CD

**Incremental builds** — only changed modules are built and deployed.

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `build-v2.yml` | Push to main | Detects changes, builds affected modules, uploads to S3, auto-deploys to dev |
| `deploy-v2.yml` | Manual / Called | Deploys specified modules from S3 to any environment |

### Modules
- `frontend` — React app → S3 + CloudFront
- `simplestore` — Lambda API → Serverless
- `audio-api` — Audio processing Lambda
- `merlin-api` — Estonian TTS API
- `vabamorf-api` — Morphology API (Docker + Lambda)

### Commands

```bash
# Compare dev vs prod deployments
./scripts/compare-deployments.sh

# Manual deploy to prod
gh workflow run deploy-v2.yml -f environment=prod -f build_id=<BUILD_ID>
```

### URLs

URLs are configured per environment in the deployment workflow. See `.env.example` for local configuration.
