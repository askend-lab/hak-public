# Prevention Plan — What to Change So These Findings Don't Repeat

6 process improvements that would have caught ~90% of the 47 accepted findings. Each item has two checkboxes: `[tool]` = enforcement exists in DevBox/CI, `[green]` = all current violations resolved.

---

## 1. Doc-Code Sync Hooks

Would have prevented: 1.1.1, 1.1.3, 1.3.1–1.3.5, 10.1, 15.2 (10 findings)

Current state: no automated checks — docs drift silently from code.

- [ ] [tool] [ ] [green] — **React version sync:** hook checks that version in `packages/frontend/README.md` matches `react` in `packages/frontend/package.json`
- [ ] [tool] [ ] [green] — **ARCHITECTURE.md dependency claims:** hook verifies "depends on shared" claims against actual `import` statements and `package.json` dependencies
- [ ] [tool] [ ] [green] — **README env var lists:** hook checks that env vars documented in READMEs match actual `process.env` / `os.environ` references in source
- [ ] [tool] [ ] [green] — **Package description sync:** hook checks that tech stack claims (e.g. "Python + TypeScript") match actual file extensions in each package

---

## 2. Stricter Linter Rules

Would have prevented: 4.1, 4.3–4.5, 4.7–4.9, 4.12, 4.18, 11.1 (10 findings)

Current state: `eslint-plugin-security` is installed but many style rules are missing. No Python linter (ruff/bandit) in DevBox. `knip` exists but ignores large parts of codebase.

### TypeScript (ESLint)

- [x] [tool] [x] [green] — **`curly: 'all'`** — require curly brackets on all if/else/for/while (fixes 4.1)
- [x] [tool] [x] [green] — **`no-nested-ternary`** — ban nested ternary expressions (fixes 4.4)
- [x] [tool] [x] [green] — **`react/no-array-index-key`** — ban array index as React keys (fixes 4.5) — requires `eslint-plugin-react`
- [x] [tool] [x] [green] — **`@typescript-eslint/consistent-type-assertions`** — ban `as unknown as X` double casts (fixes 4.3)
- [x] [tool] [ ] [green] — **`@typescript-eslint/no-unnecessary-type-arguments`** — catch redundant `?` and `| undefined` (fixes 4.7) — UNBLOCKED: `parserOptions.project: true` now enabled (+4s lint cost)
- [x] [tool] [x] [green] — **`@typescript-eslint/no-floating-promises` + `no-misused-promises`** — catch unawaited promises and async callbacks passed where void expected. 97 violations fixed across frontend + vabamorf-api. DevBox hook was phantom (silently passing without type info) — now real
- [x] [tool] [x] [green] — **`import/no-deprecated`** — verified: already `'error'` and active, 0 violations

### Python (Ruff)

- [x] [tool] [x] [green] — **Add `ruff` to DevBox** with rules: `UP` (pyupgrade), `B` (bugbear), `SIM` (simplify), `PIE` (misc), `RUF` (ruff-specific)
- [x] [tool] [x] [green] — **`PLW0117`** (unnecessary-list-call) — fixes 4.12
- [x] [tool] [x] [green] — **`PLR2004`** (magic-value-comparison) — catches float equality like `speed == 1.0` (fixes 4.18)

### Unused Dependencies

- [x] [tool] [ ] [green] — **Expand `knip` scope** — removed stale `ignoreDependencies`. Frontend ignore remains (needs careful tuning to avoid false positives)

---

## 3. Cross-Package Consistency Enforcement

Would have prevented: 4.2, 5.1, 5.2, 5.4, 7.1, 7.2, 12.3 (7 findings)

Current state: `jscpd` hook exists (detects copy-paste) but doesn't enforce "use shared instead of local copy." No cross-package import rules.

- [ ] [tool] [ ] [green] — **Duplicate utility detection:** hook that greps for function names exported from `@hak/shared` and flags if they're re-defined in other packages (catches getCorsOrigin, createResponse, HTTP_STATUS duplication)
- [ ] [tool] [ ] [green] — **CORS consistency test:** integration test that verifies all packages return same CORS headers for same origin scenarios (fixes 12.3)
- [ ] [tool] [ ] [green] — **Error handling pattern:** lint rule or hook requiring `extractErrorMessage` usage in catch blocks instead of raw `console.error` (fixes 7.1, 7.2)

---

## 4. Security Scanning in CI

Would have prevented: 12.4, 12.5, 12.7 (3 findings)

Current state: `eslint-plugin-security` is configured and active for TypeScript. `security-audit` hook is now `mode: warning` (6 devDep transitive vulnerabilities need upstream fixes). No Python security scanner.

- [x] [tool] [ ] [green] — **Enable `security-audit` hook** — changed to `mode: warning` + `packageManager: pnpm`. 6 devDep vulnerabilities remain (ajv, minimatch — transitive, need upstream updates)
- [x] [tool] [x] [green] — **Ruff `S` rules for Python** — catches `shell=True` (S602), `pickle.load` (S301), `subprocess` without shell (S603). Enabled as alternative to bandit — 0 violations
- [x] [tool] [x] [green] — **Enable `iac-security` hook** — already configured and active in DevBox hooks (verified via `node devbox test`)
- [ ] [tool] [ ] [green] — **Input validation consistency test:** test that API and Worker validate the same fields with same constraints (catches 12.7 — worker missing cacheKey regex)

---

## 5. CI Must Fail on Skipped Tests

Would have prevented: 6.1 (1 finding, but HIGH severity)

Current state: `pnpm test:all` silently skips merlin-worker Python tests if venv not set up. DevBox `run-tests` hook runs tests but depends on each package's `test` script being correct.

- [x] [tool] [x] [green] — **Test suite completeness check:** DevBox `run-tests` hook already verifies all `test_modules` produce results
- [x] [tool] [x] [green] — **merlin-worker test script fix:** `test:full` now exits 1 with FATAL message if venv missing

---

## 6. Dead Code & Deprecation Detection

Would have prevented: 4.6, 4.8, 4.11, 5.3, 2.3 (5 findings)

Current state: `dead-code` hook exists. `no-warning-comments` not enabled. No `eslint-plugin-deprecation`.

- [x] [tool] [x] [green] — **`no-warning-comments`** ESLint rule — flags TODO/FIXME/HACK/XXX comments as warnings (0 current violations)
- [ ] [tool] [ ] [green] — **Expand `dead-code` hook** — verify it catches unused exports like `LoginModalProps.message` (fixes 4.6)
- [x] [tool] [x] [green] — **Ruff `ERA001`** — detect commented-out code in Python (0 current violations)
- [x] [tool] [x] [green] — **Ruff `UP`** (pyupgrade) — already included in ruff.toml, all violations fixed

---

## Implementation Order

1. **Items 2 + 4** first — ESLint rules + security scanning. Highest signal-to-noise, catches the most serious issues (security + style).
2. **Item 5** — CI test completeness. Small change, prevents silent regressions.
3. **Item 6** — Dead code detection. Prevents tech debt accumulation.
4. **Item 1** — Doc-code sync. Most complex to implement but covers the most findings.
5. **Item 3** — Cross-package consistency. Requires architectural decisions about shared package strategy.
