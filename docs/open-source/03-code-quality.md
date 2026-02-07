# Phase 3a: Code Quality & Architecture

> HIGH — code must be exemplary, diamond-clean.
> Every item: 🔧 = DevBox hook exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [x] | [x] | Zero `any` types | `no-any` | ESLint rule |
| [x] | [x] | All Promises handled | `no-floating-promises` | ESLint rule |
| [x] | [x] | Consistent import order | `import-order` | ESLint rule |
| [x] | [ ] | No `console.log` in production | `no-console` | grep |
| [x] | [ ] | ESLint zero warnings | `run-lint` | ESLint |
| [x] | [x] | No copy-paste (≤5%) | `jscpd` | jscpd |
| [x] | [x] | Source files ≤400 lines | `source-size` | wc -l |
| [x] | [x] | Strict TypeScript | `run-typecheck` | tsc --noEmit |
| [ ] | [ ] | No dead exports | NEW: `dead-code` | ts-prune |
| [ ] | [ ] | No circular dependencies | NEW: `circular-deps` | madge |

## Manual Gates

- [ ] Enable additional tsconfig strict flags (`noUncheckedIndexedAccess`, etc.)
- [ ] Eliminate remaining `eslint-disable` directives (9 files)
- [ ] Create `docs/ARCHITECTURE.md` with C4/Mermaid diagrams
- [ ] Create ADRs in `docs/adr/`
