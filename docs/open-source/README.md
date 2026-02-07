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

## Phase Order

1. **Security & Secrets** — must be done before any public access
2. **Internal Decoupling** — code must be self-contained, no references to internal tools
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
