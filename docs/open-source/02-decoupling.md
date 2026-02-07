# Phase 2: Internal Tooling Decoupling

> HIGH — code must be fully self-contained, no references to internal tools.
> Every item: 🔧 = DevBox hook exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [ ] | [ ] | No external config imports | NEW: `no-external-imports` | grep |
| [ ] | [ ] | No paths outside repo | NEW: `no-internal-refs` | grep |
| [x] | [x] | Build succeeds | `run-build` | pnpm build |
| [x] | [x] | All tests pass | `run-tests` | jest/vitest |
| [x] | [x] | TypeScript compiles | `run-typecheck` | tsc --noEmit |

## Manual Gates (one-time pre-launch)

### DevBox → Standard Tools
- [ ] Replace `devbox` wrapper → pnpm scripts
- [ ] Replace `.githooks/` → `husky` + `lint-staged`
- [ ] Make ESLint config standalone (inline rules from boxer)
- [ ] Remove `defaults.yaml`, `babel.config.js` if unused

### Build System
- [ ] Remove `packages/vabamorf-api/package-lock.json` (use pnpm)
- [ ] Update Dockerfiles to use pnpm
- [ ] Fix or remove broken cucumber BDD tests

### Final Verification
- [ ] `pnpm install && pnpm test && pnpm build` from clean clone
- [ ] No file references paths outside the repo
