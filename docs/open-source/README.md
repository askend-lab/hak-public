# Open Source Preparation Plan

> **Goal**: Transform HAK into a diamond-quality open source project that withstands the most rigorous public scrutiny.
>
> **Context**: HAK is a government-commissioned Estonian language learning platform built entirely with AI-assisted development. When open-sourced, every line will be examined under a microscope.
>
> **Principle**: No shortcuts. Every criterion that can be applied to production open source code must be met at 100%.

## Plan Documents

| # | Document | Phase | Priority |
|---|----------|-------|----------|
| 1 | [Security & Secrets](./01-security.md) | Phase 1 | CRITICAL |
| 2 | [Internal Decoupling](./02-decoupling.md) | Phase 2 | HIGH |
| 3 | [Code Quality & Architecture](./03-code-quality.md) | Phase 3 | HIGH |
| 4 | [Testing & Coverage](./04-testing.md) | Phase 3 | HIGH |
| 5 | [Documentation](./05-documentation.md) | Phase 4 | MEDIUM |
| 6 | [CI/CD & Dependencies](./06-cicd.md) | Phase 5 | MEDIUM |
| 7 | [Infrastructure & DevEx](./07-infra-devex.md) | Phase 5 | MEDIUM |
| 8 | [Launch Checklist](./08-launch-checklist.md) | Phase 6 | HIGH |

## Approach: Verify First, Fix Second

> **Before fixing anything, define HOW we verify each requirement.**
> If we can't verify it, we can't claim compliance.

**All checks run on pre-commit via DevBox hooks.** No bad code enters the repository.

See: [Verification Approach](./checklists/00-verification-approach.md) — maps every standard to its DevBox hook.
See: [Verification Pipeline](./checklists/00-verification-pipeline.md) — step-by-step DevBox hook enablement.

**Phase 0** (before all other phases):
1. Enable all available DevBox hooks (no-any, no-console, prettier, etc.)
2. Verify each hook catches violations (negative test)
3. Baseline current state (how many violations per standard)
4. Fix violations, then upgrade hook modes from `warning` → `error`

## Phase Order

0. **Verification Pipeline** — set up all tools and CI gates first
1. **Security & Secrets** — must be done before any public access
2. **Internal Decoupling** — code must be self-contained
3. **Code Quality** — code must be exemplary, diamond-clean
4. **Documentation** — essential for community adoption
5. **Polish** — CI/CD, DevEx, accessibility, performance
6. **Launch** — final checklist, licensing, communication

## Current Codebase Stats

- **313** TypeScript source files across 10 packages
- **136** test files, **32** Gherkin feature specifications
- **830+** git commits
- **16** npm vulnerabilities (9 high)
- **16** `eslint-disable` directives in source
- **0** `any` types in source (good!)
- **20+** debug `console.log` in production code

*This is a living plan. Update checkboxes as items are completed.*
