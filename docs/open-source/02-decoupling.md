# Phase 2: Internal Tooling Decoupling

> HIGH — code must be fully self-contained, no references to internal development tools.

## 1. DevBox Removal

- [ ] **Replace `devbox` wrapper script** — Currently at project root, references `/home/alex/users/boxer/devbox/cli.js`. Replace with standard npm/pnpm scripts.
- [ ] **Replace `devbox.yaml`** — Move test configuration to standard Jest/Vitest configs and `package.json` scripts.
- [ ] **Replace `node devbox test`** — Change `npm test` to run Jest/Vitest directly.
- [ ] **Replace `node devbox dx`** — Create a `dx` script running lint + typecheck + test with standard tools.
- [ ] **Make ESLint config self-contained** — `eslint.config.mjs` imports from `../../boxer/devbox/eslint.config.js`. Inline all rules or create a standalone config.
- [ ] **Replace git hooks** — `.githooks/` delegates to devbox. Replace with `husky` + `lint-staged` (industry standard).
- [ ] **Remove `defaults.yaml`** — Internal devbox configuration.
- [ ] **Remove `babel.config.js`** if unused after migration.

## 2. Test Infrastructure

- [ ] **Standardize test runners** — Jest (backend) + Vitest (frontend) is fine but document clearly.
- [ ] **Remove `jest-results.json` pattern** — Internal devbox result collection. Use standard Jest reporters.
- [ ] **Fix or remove cucumber tests** — Currently broken (collection error). Either fix BDD infrastructure or convert to unit/integration tests.
- [ ] **Remove `.test-runner-state.json`** from repository.

## 3. Build System

- [ ] **Remove `packages/vabamorf-api/package-lock.json`** — 3851-line npm lock file alongside pnpm workspace. Standardize on pnpm.
- [ ] **Update all Dockerfiles to use pnpm** — Currently vabamorf-api Dockerfile uses `npm ci`.
- [ ] **Evaluate turborepo or nx** — Better monorepo task orchestration, caching, dependency graph.

## 4. Verification

After decoupling, verify:
- [ ] `pnpm install` works from clean clone
- [ ] `pnpm test` runs all tests without devbox
- [ ] `pnpm lint` runs ESLint without external config
- [ ] `pnpm build` builds all packages
- [ ] Git hooks work with husky + lint-staged
- [ ] No file in the repository references paths outside the repo
