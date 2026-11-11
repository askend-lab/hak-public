# ADR 004: Gherkin for BDD Specifications

**Status:** Accepted  
**Date:** 2025-01

## Context

Requirements were communicated informally, leading to misunderstandings between stakeholders and developers. We needed executable specifications that serve as both documentation and tests.

## Decision

Use **Gherkin** (`.feature` files) for behavior-driven specifications in `packages/specifications/`. A custom `gherkin-parser` maps features to test implementations.

## Consequences

- **Positive:** Specifications are readable by non-technical stakeholders
- **Positive:** Features map directly to test cases — specs are executable
- **Positive:** Single source of truth for expected behavior
- **Negative:** Extra tooling needed (gherkin-parser, cucumber runner)
- **Negative:** Writing good Gherkin requires discipline to avoid over-specification
