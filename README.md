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
| **Prototype** | http://localhost:3000/ | Visual/functional reference (code: `/home/alex/users/luna/eki`) |
| **HAK App** | http://localhost:5180/ | Our production app with hot reload |

```bash
pnpm install
pnpm run dx    # Full check: tests + hooks
pnpm start     # Run frontend + backend (kills previous server, starts new)
```

## Development with DevBox

Built for AI-assisted development using [DevBox](devbox.yaml) — enforces TDD, coverage thresholds, and code quality through git hooks.
