# Google TypeScript Style Guide — Checklist

> https://google.github.io/styleguide/tsguide.html
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Type System
- [ ] check · [ ] done — No `any` type (`no-any` DevBox hook)
- [ ] check · [ ] done — No `as` assertions without runtime validation (`run-lint`)
- [ ] check · [ ] done — Use `unknown` instead of `any` for unknowns (`no-any` hook)
- [ ] check · [ ] done — Prefer interfaces for object shapes (`run-lint` — style rule)
- [ ] check · [ ] done — Enable `noUncheckedIndexedAccess` (`run-typecheck`)

## Naming
- [ ] check · [ ] done — PascalCase for types/interfaces/classes (`run-lint` — naming convention)
- [ ] check · [ ] done — camelCase for variables/functions/methods (`run-lint`)
- [ ] check · [ ] done — UPPER_SNAKE_CASE for constants (`run-lint`)
- [ ] check · [ ] done — No `I` prefix on interfaces (`run-lint`)

## Imports
- [ ] check · [ ] done — No default exports — prefer named (`run-lint` — import rule)
- [ ] check · [ ] done — No circular imports (`madge --circular`)
- [ ] check · [ ] done — Consistent import order (`import-order` DevBox hook)

## Functions
- [ ] check · [ ] done — Explicit return types on exported functions (`run-lint`)
- [ ] check · [ ] done — Prefer arrow functions for callbacks (`run-lint`)

## Classes
- [ ] check · [ ] done — Explicit visibility modifiers (`run-lint`)
- [ ] check · [ ] done — `readonly` on immutable properties (`run-lint`)
- [ ] check · [ ] done — `override` on overridden methods (`run-typecheck` — noImplicitOverride)
- [ ] check · [ ] done — Prefer composition over inheritance (`code review`)

## Error Handling
- [ ] check · [ ] done — Custom error classes extend `Error` (`run-lint`)
- [ ] check · [ ] done — `catch` types error as `unknown` (`run-typecheck` — strict)
- [ ] check · [ ] done — No empty `catch` blocks (`run-lint` — `no-empty`)
- [ ] check · [ ] done — All Promises have error handling (`no-floating-promises` hook)

## Null Handling
- [ ] check · [ ] done — No non-null assertions `!` (`run-lint` — `no-non-null-assertion`)
- [ ] check · [ ] done — Use `??` over `||` for defaults (`run-lint`)
- [ ] check · [ ] done — Use `?.` for optional chaining (`run-lint`)
- [ ] check · [ ] done — `strictNullChecks: true` (`run-typecheck` — `strict: true`)

## Comments
- [ ] check · [ ] done — JSDoc on all exported functions (`run-lint` — jsdoc rule)
- [ ] check · [ ] done — No commented-out code (`run-lint`)
- [ ] check · [ ] done — TODOs have issue numbers (`run-lint` — custom rule)
- [ ] check · [ ] done — No `@ts-ignore` — use `@ts-expect-error` (`run-lint`)
