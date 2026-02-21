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

- [ ] [tool] [ ] [green] — **`curly: 'all'`** — require curly brackets on all if/else/for/while (fixes 4.1)
- [ ] [tool] [ ] [green] — **`no-nested-ternary`** — ban nested ternary expressions (fixes 4.4)
- [ ] [tool] [ ] [green] — **`react/no-array-index-key`** — ban array index as React keys (fixes 4.5) — requires `eslint-plugin-react`
- [ ] [tool] [ ] [green] — **`@typescript-eslint/consistent-type-assertions`** — ban `as unknown as X` double casts (fixes 4.3)
- [ ] [tool] [ ] [green] — **`@typescript-eslint/no-unnecessary-type-arguments`** — catch redundant `?` and `| undefined` (fixes 4.7)
- [ ] [tool] [ ] [green] — **`import/no-deprecated`** — already `'error'` but verify it catches `execCommand` usage (fixes 4.8)

### Python (Ruff)

- [ ] [tool] [ ] [green] — **Add `ruff` to DevBox** with rules: `UP` (pyupgrade), `B` (bugbear), `SIM` (simplify), `PIE` (misc), `RUF` (ruff-specific)
- [ ] [tool] [ ] [green] — **`PLW0117`** (unnecessary-list-call) — fixes 4.12
- [ ] [tool] [ ] [green] — **`PLR2004`** (magic-value-comparison) — catches float equality like `speed == 1.0` (fixes 4.18)

### Unused Dependencies

- [ ] [tool] [ ] [green] — **Expand `knip` scope** — currently ignores `packages/frontend/**` and several other paths. Remove unnecessary ignores so it catches unused deps (fixes 11.1)

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

Current state: `eslint-plugin-security` is configured and active for TypeScript. `security-audit` hook is `mode: off`. No Python security scanner.

- [ ] [tool] [ ] [green] — **Enable `security-audit` hook** — change from `mode: off` to `mode: error` in devbox.yaml (already exists, just disabled)
- [ ] [tool] [ ] [green] — **Add `bandit` for Python** — catches `shell=True` (B602), `pickle.load` (B301), `subprocess` without shell (B603)
- [ ] [tool] [ ] [green] — **Enable `iac-security` hook** — already configured, verify it catches Terraform/serverless misconfigs
- [ ] [tool] [ ] [green] — **Input validation consistency test:** test that API and Worker validate the same fields with same constraints (catches 12.7 — worker missing cacheKey regex)

---

## 5. CI Must Fail on Skipped Tests

Would have prevented: 6.1 (1 finding, but HIGH severity)

Current state: `pnpm test:all` silently skips merlin-worker Python tests if venv not set up. DevBox `run-tests` hook runs tests but depends on each package's `test` script being correct.

- [ ] [tool] [ ] [green] — **Test suite completeness check:** hook verifies that every package in `test_modules` (devbox.yaml) actually produced test results (no silent skips)
- [ ] [tool] [ ] [green] — **merlin-worker test script fix:** change `test` script to fail (exit 1) if venv missing, instead of echoing a skip message

---

## 6. Dead Code & Deprecation Detection

Would have prevented: 4.6, 4.8, 4.11, 5.3, 2.3 (5 findings)

Current state: `dead-code` hook exists. `no-warning-comments` not enabled. No `eslint-plugin-deprecation`.

- [ ] [tool] [ ] [green] — **`no-warning-comments`** ESLint rule — flags TODO/FIXME/HACK comments so they don't accumulate (fixes 4.11)
- [ ] [tool] [ ] [green] — **Expand `dead-code` hook** — verify it catches unused exports like `LoginModalProps.message` (fixes 4.6)
- [ ] [tool] [ ] [green] — **Ruff `ERA001`** — detect commented-out code in Python (fixes 5.3 `if True:` hack and commented blocks)
- [ ] [tool] [ ] [green] — **Ruff `UP`** (pyupgrade) — catches deprecated Python APIs like `np.random.RandomState` (fixes 4.8 Python part)

---

## Implementation Order

1. **Items 2 + 4** first — ESLint rules + security scanning. Highest signal-to-noise, catches the most serious issues (security + style).
2. **Item 5** — CI test completeness. Small change, prevents silent regressions.
3. **Item 6** — Dead code detection. Prevents tech debt accumulation.
4. **Item 1** — Doc-code sync. Most complex to implement but covers the most findings.
5. **Item 3** — Cross-package consistency. Requires architectural decisions about shared package strategy.
