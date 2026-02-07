# Google TypeScript Style Guide — Checklist

> https://google.github.io/styleguide/tsguide.html
> Google's internal TypeScript conventions applied to HAK.

## Type System
- [ ] No `any` type (currently 0 in source — maintain with `@typescript-eslint/no-explicit-any: error`)
- [ ] No type assertions (`as`) without runtime validation — audit all `as` casts in codebase
- [ ] Use `unknown` instead of `any` for values of unknown type
- [ ] Prefer interfaces over type aliases for object shapes
- [ ] Use union types over enums (Google preference; evaluate for HAK)
- [ ] Enable `noUncheckedIndexedAccess` for safer array/object access

## Naming
- [ ] `PascalCase` for types, interfaces, classes, enums
- [ ] `camelCase` for variables, functions, methods, properties
- [ ] `UPPER_SNAKE_CASE` for constants and enum values
- [ ] No `I` prefix on interfaces (e.g., `Config` not `IConfig`)
- [ ] No `_` prefix for private members (use TypeScript `private`)

## Imports
- [ ] No default exports (prefer named exports for better refactoring)
- [ ] No barrel files (`index.ts` re-exporting everything) — or use sparingly
- [ ] Import paths use the module path, not relative `../../` chains
- [ ] No circular imports (verify with `madge --circular`)

## Functions
- [ ] Explicit return types on all exported functions
- [ ] Prefer arrow functions for callbacks
- [ ] No function overloads with different return types
- [ ] Default parameters preferred over optional parameters where appropriate

## Classes
- [ ] Explicit visibility modifiers (`public`, `private`, `protected`)
- [ ] `readonly` on properties that don't change after construction
- [ ] `override` keyword on overridden methods (already fixed for `ErrorBoundary`)
- [ ] Prefer composition over inheritance

## Error Handling
- [ ] Use custom error classes extending `Error` (not bare `throw 'message'`)
- [ ] Every `catch` block types the error as `unknown` (TS 4.4+ default with `useUnknownInCatchVariables`)
- [ ] No empty `catch` blocks
- [ ] All Promises have error handling (`catch` or try-catch with await)
- [ ] `@typescript-eslint/no-floating-promises: error` enforced

## Null Handling
- [ ] No non-null assertions (`!`) — use type narrowing or early return
- [ ] Prefer nullish coalescing (`??`) over `||` for default values
- [ ] Prefer optional chaining (`?.`) over manual null checks
- [ ] `strictNullChecks: true` in tsconfig (included in `strict: true`)

## Comments
- [ ] JSDoc on all exported functions with `@param`, `@returns`, `@throws`
- [ ] No commented-out code (use version control)
- [ ] TODO comments have associated issue numbers
- [ ] No `@ts-ignore` — use `@ts-expect-error` with explanation if absolutely necessary
