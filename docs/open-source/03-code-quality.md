# Phase 3a: Code Quality & Architecture

> HIGH — code must be exemplary, diamond-clean. Zero tolerance for shortcuts.

## 1. TypeScript Strictness

- [ ] **Enable additional strict flags** in `tsconfig.json`:
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noPropertyAccessFromIndexSignature: true`
  - `noImplicitOverride: true`
- [ ] **Zero `eslint-disable` directives** — Currently 16 in source. Each must be fixed or justified.
- [ ] **Maintain zero `any` types** — Add `@typescript-eslint/no-explicit-any: error` to prevent regression.
- [ ] **Enforce explicit return types** — `@typescript-eslint/explicit-function-return-type` for exports.
- [ ] **Per-package `tsconfig.json`** — Each package should extend a shared base with proper paths/references.

## 2. Code Cleanup

- [ ] **Remove all debug `console.log`** — 20+ in `ShareService.ts`, `SimpleStoreAdapter.ts`, `MockDataLoader.ts`, `dataService.ts`. Use structured logger from `@hak/shared`.
- [ ] **Audit error handling** — Every `catch` must re-throw, log with context, or return typed error. No silent swallowing.
- [ ] **Unify response helpers** — `audio-api` and `simplestore` have duplicate `createResponse()`. Extract to `@hak/shared`.
- [ ] **Unify HTTP status constants** — Multiple packages define their own. Centralize in `@hak/shared`.
- [ ] **Remove dead code** — Run `ts-prune` to find unused exports.
- [ ] **Audit `as` type assertions** — Replace with type guards or runtime validation.
- [ ] **Replace `require()` calls** — Use proper ESM imports or `createRequire`.
- [ ] **Audit magic numbers** — No unexplained numeric literals. Use named constants.
- [ ] **Enforce immutability** — `as const` + `Object.freeze()` for shared constants.

## 3. Architecture

- [ ] **Create `docs/ARCHITECTURE.md`** with C4 diagrams (context, container, component levels).
- [ ] **Audit package boundaries** — Use `madge` or `dependency-cruiser` to find circular deps.
- [ ] **Audit `@hak/shared`** — Must only contain truly shared code, no package-specific logic.
- [ ] **Audit Lambda cold starts** — Bundle sizes, tree-shaking, initialization patterns.
- [ ] **Evaluate esbuild bundling** — Smaller, faster Lambda deployments.
- [ ] **Create Architecture Decision Records (ADRs)** — `docs/adr/` directory:
  - ADR-001: Monorepo with pnpm workspaces
  - ADR-002: Serverless on AWS Lambda
  - ADR-003: DynamoDB single-table design
  - ADR-004: React + TypeScript frontend
  - ADR-005: Estonian TTS via Merlin
  - ADR-006: Estonian morphology via vabamorf
  - ADR-007: BDD with Gherkin specifications
  - ADR-008: AI-assisted development methodology
