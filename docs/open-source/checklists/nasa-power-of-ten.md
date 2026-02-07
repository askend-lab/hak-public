# NASA JPL Power of Ten Rules — Checklist

> https://spinroot.com/gerard/pdf/P10.pdf
> 10 rules for safety-critical code, adapted for TypeScript/Node.js.

## Rule 1: Avoid Complex Flow Constructs
- [ ] No `goto` (N/A in TypeScript)
- [ ] No unstructured recursion — audit all recursive calls, ensure they have provable termination
- [ ] No deeply nested callbacks — use async/await consistently
- [ ] Maximum cyclomatic complexity per function enforced via ESLint (`complexity` rule)

## Rule 2: All Loops Must Have Fixed Upper Bounds
- [ ] All `for` loops have explicit bounds
- [ ] All `while` loops have a maximum iteration guard
- [ ] Async retry patterns have maximum retry count (audit Lambda handlers)
- [ ] `vmetajson` request queue has bounded size

## Rule 3: No Dynamic Memory Allocation After Initialization
- [ ] Lambda handlers initialize resources at module level (not per-request)
- [ ] No unbounded array growth during request processing
- [ ] S3/DynamoDB clients created once at module scope (verified)
- [ ] vmetajson process pool has fixed size

## Rule 4: No Function Longer Than 60 Lines
- [ ] Current ESLint limit: 50 lines (stricter than NASA — good)
- [ ] Verify zero violations: `SRC-SIZE` hook passes
- [ ] Every function fits on one printed page

## Rule 5: Minimum Two Assertions Per Function
- [ ] Input validation at function entry (parameter validation)
- [ ] Return value checks on all external calls (AWS SDK, child_process)
- [ ] Add runtime assertions for invariants in critical paths
- [ ] Consider `zod` schemas for runtime type validation at API boundaries

## Rule 6: Data Objects at Smallest Possible Scope
- [ ] Variables declared at point of first use (ESLint `no-var`, `prefer-const`)
- [ ] No global mutable state (all state in function scope or immutable constants)
- [ ] Module-level variables are `const` only (enforced by ESLint)

## Rule 7: Check Return Values of All Non-Void Functions
- [ ] All AWS SDK calls have error handling (try-catch or `.catch()`)
- [ ] All `JSON.parse()` calls wrapped in try-catch
- [ ] `child_process.spawn` exit codes checked
- [ ] No ignored Promise rejections (`@typescript-eslint/no-floating-promises`)

## Rule 8: Restrict Preprocessor Use
- [ ] No `#define` equivalent (N/A in TypeScript)
- [ ] Conditional compilation via environment variables is simple and documented
- [ ] Build-time constants use `VITE_*` env vars (not complex transforms)

## Rule 9: Restrict Pointer Use
- [ ] No raw pointer manipulation (N/A in TypeScript)
- [ ] TypeScript equivalent: no `as any` casts (currently 0 — maintain)
- [ ] No `as` type assertions without runtime validation
- [ ] No non-null assertions (`!`) — enforced by ESLint rule

## Rule 10: Compile with All Warnings Enabled, Zero Warnings
- [ ] `tsconfig.json` has `strict: true` (verified)
- [ ] ESLint runs with zero warnings, zero errors
- [ ] TypeScript `noEmit` compilation has zero errors
- [ ] All CI quality gates pass with zero tolerance
