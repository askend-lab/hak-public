# ADR 001: Use pnpm Monorepo

**Status:** Accepted  
**Date:** 2024-12

## Context

HAK consists of multiple packages (frontend, APIs, shared libraries). We needed a way to manage them in a single repository with shared dependencies and consistent tooling.

## Decision

Use **pnpm workspaces** for monorepo management.

## Consequences

- **Positive:** Shared dependencies are deduplicated, reducing install size
- **Positive:** Cross-package imports via workspace protocol (`workspace:*`)
- **Positive:** Single lockfile (`pnpm-lock.yaml`) for reproducible installs
- **Positive:** Faster installs than npm/yarn due to content-addressable storage
- **Negative:** Docker builds need special handling (pnpm deploy or multi-stage)
- **Negative:** Some tools (e.g., license-checker) don't fully support pnpm workspaces
