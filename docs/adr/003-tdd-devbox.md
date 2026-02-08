# ADR 003: TDD Enforcement via DevBox Hooks

**Status:** Accepted  
**Date:** 2025-01

## Context

Code quality degraded rapidly during the prototype phase. We needed automated enforcement of testing discipline, not just guidelines.

## Decision

Use **DevBox pre-commit hooks** to enforce TDD: every `feat:` or `fix:` commit must include corresponding test files. Coverage thresholds are set per module.

## Consequences

- **Positive:** No code ships without tests — enforced at commit time
- **Positive:** Coverage thresholds prevent regression
- **Positive:** Works with AI-assisted development (agents must write tests too)
- **Negative:** Initial setup overhead for hook configuration
- **Negative:** DevBox is a custom tool — needs replacement with husky for OSS
