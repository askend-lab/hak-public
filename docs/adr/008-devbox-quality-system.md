# ADR 008: Quality System with Pre-Commit Hooks

**Status:** Accepted  
**Date:** 2025-01

## Context

Code quality degraded during rapid prototyping. Manual code reviews and guidelines were insufficient — issues slipped through consistently. We needed an automated quality enforcement system that blocks commits unless all checks pass.

## Decision

Use **DevBox**, a custom pre-commit hook system that runs 12 automated checks on every commit. The commit is rejected if any check fails. There are no fallbacks — hooks must fail hard when tools are missing or misconfigured.

The methodology follows two principles:
1. Every quality rule has a verification tool in DevBox
2. If it's not enforced by DevBox, it doesn't exist

Current hooks: TYPE (TypeScript), RUN-LINT (ESLint), DEAD-CODE (knip), PLAYWRIGHT (E2E), SECURITY (pnpm audit), DEPS (unused/missing), CIRCULAR-DEPS (madge), JSCPD (copy-paste), SRC-SIZE (≤400L), MD-SIZE (≤200L), SECRET (gitleaks), LANG (language consistency).

For the public open-source repo (`hak-public`), DevBox is replaced by **Husky + lint-staged** since DevBox is an internal tool.

## Consequences

- **Positive:** Quality enforced at commit time — no broken code reaches the repository
- **Positive:** Works with AI-assisted development — agents must satisfy the same checks
- **Positive:** Fast feedback loop — all 12 hooks complete in ~18 seconds
- **Negative:** DevBox is a custom tool — requires maintenance and documentation
- **Negative:** Initial setup overhead for configuring thresholds and rules per package
- **Negative:** Public contributors use a different (lighter) hook system via Husky
