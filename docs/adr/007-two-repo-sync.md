# ADR 007: Two-Repository Model with Automated Sync

**Status:** Accepted  
**Date:** 2025-06

## Context

HAK contains both open-source-ready code and internal/sensitive content (infrastructure secrets, internal tooling, security audit details, agent communication). We needed a way to maintain a public open-source repository while keeping sensitive content private.

## Decision

Use a **two-repository model**:

- `hak` (private) — full monorepo with all packages, infrastructure, CI/CD, internal docs
- `hak-public` (public mirror) — filtered copy with sensitive content removed

An automated sync workflow (`.github/workflows/sync-to-public.yml`) runs on every push to `main` in the private repo. It clones, removes excluded paths (listed in `.opensource-exclude`), transforms `package.json` and config files, and force-pushes to the public repo.

The public repo uses **Husky + lint-staged** instead of DevBox for pre-commit hooks.

## Consequences

- **Positive:** Single source of truth — all changes flow from private to public
- **Positive:** Sensitive content (infra, tara-auth, internal docs) never reaches the public repo
- **Positive:** Public contributors get a clean, self-contained repo
- **Negative:** Force-push model means public repo history is rewritten on each sync
- **Negative:** Public repo cannot accept PRs that touch excluded content
- **Negative:** Sync script must be maintained when adding/removing packages
