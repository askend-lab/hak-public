# NASA JPL Power of Ten Rules — Checklist

> https://spinroot.com/gerard/pdf/P10.pdf
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Rule 1: Avoid Complex Flow Constructs
- [ ] check · [ ] done — No unstructured recursion (`run-lint` — ESLint `no-restricted-syntax`)
- [ ] check · [ ] done — No deeply nested callbacks — async/await (`run-lint` — `max-depth`)
- [ ] check · [ ] done — Cyclomatic complexity enforced (`run-lint` — `complexity: 8`)

## Rule 2: All Loops Must Have Fixed Upper Bounds
- [ ] check · [ ] done — All loops have explicit bounds (`run-lint` + code review)
- [ ] check · [ ] done — Retry patterns have max retry count (`run-tests`)
- [ ] check · [ ] done — vmetajson queue has bounded size (`run-tests`)

## Rule 3: No Dynamic Memory Allocation After Init
- [ ] check · [ ] done — Lambda resources init at module level (`code review`)
- [ ] check · [ ] done — No unbounded array growth per-request (`code review`)
- [ ] check · [ ] done — AWS clients created once at module scope (`run-tests`)

## Rule 4: No Function Longer Than 60 Lines
- [ ] check · [ ] done — ESLint max 50 lines (stricter than NASA) (`source-size` hook)
- [ ] check · [ ] done — Zero violations in `SRC-SIZE` hook (`run-tests` — devbox output)

## Rule 5: Minimum Two Assertions Per Function
- [ ] check · [ ] done — Input validation at function entry (`run-tests`)
- [ ] check · [ ] done — Return value checks on external calls (`run-lint` + `run-tests`)
- [ ] check · [ ] done — Consider zod schemas at API boundaries (`code review`)

## Rule 6: Data Objects at Smallest Possible Scope
- [ ] check · [ ] done — `prefer-const`, no `var` (`run-lint` — ESLint rules)
- [ ] check · [ ] done — No global mutable state (`run-lint` — `no-var`)
- [ ] check · [ ] done — Module-level variables are `const` only (`run-lint`)

## Rule 7: Check Return Values of All Non-Void Functions
- [ ] check · [ ] done — All AWS SDK calls have error handling (`no-floating-promises` hook)
- [ ] check · [ ] done — All `JSON.parse` in try-catch (`run-tests`)
- [ ] check · [ ] done — `child_process` exit codes checked (`run-tests`)
- [ ] check · [ ] done — No ignored Promise rejections (`no-floating-promises` hook)

## Rule 8: Restrict Preprocessor Use
- [ ] check · [ ] done — Build-time constants via `VITE_*` env vars only (`code review`)

## Rule 9: Restrict Pointer Use (TypeScript equivalent)
- [ ] check · [ ] done — No `as any` casts — currently 0 (`no-any` hook)
- [ ] check · [ ] done — No `as` assertions without runtime validation (`run-lint`)
- [ ] check · [ ] done — No non-null assertions `!` (`run-lint` — `no-non-null-assertion`)

## Rule 10: Compile with All Warnings Enabled, Zero Warnings
- [ ] check · [ ] done — `tsconfig.json` has `strict: true` (`run-typecheck` hook)
- [ ] check · [ ] done — ESLint zero warnings, zero errors (`run-lint` hook)
- [ ] check · [ ] done — All CI quality gates pass with zero tolerance (`run-tests` hook)
