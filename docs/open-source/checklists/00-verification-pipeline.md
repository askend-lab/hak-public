# Verification Pipeline — DevBox Implementation

> All checks run on **pre-commit** via DevBox hooks.
> Step-by-step: enable hook → configure in `devbox.yaml` → verify it catches violations.

## Step 1: Enable All Available DevBox Hooks

These hooks already exist in DevBox but are not yet active in `devbox.yaml`.
Just add them to the config with `mode: error`.

### 1.1 `no-any` — Zero `any` types
- **Standards**: Google TS Guide, NASA Rule 9
- **Config**: `no-any: { mode: error }`
- **Verify**: Add `: any` to a staged file → hook blocks commit
- **Current status**: 0 violations (safe to enable immediately)

### 1.2 `no-floating-promises` — All Promises handled
- **Standards**: NASA Rule 7, Node.js Best Practices
- **Config**: `no-floating-promises: { mode: error }`
- **Verify**: Add unhandled Promise → hook blocks commit

### 1.3 `no-console` — No console.log in production
- **Standards**: Node.js Best Practices, Clean Code
- **Config**: Already configured with `allow_warn: true, allow_error: true`
- **Currently**: mode not set → add `mode: error`
- **Caveat**: 20+ violations exist → fix first, then enable

### 1.4 `import-order` — Consistent import ordering
- **Standards**: Google TS Guide
- **Config**: `import-order: { mode: error }`
- **Verify**: Disorder imports → hook blocks commit

### 1.5 `prettier-check` — Consistent formatting
- **Standards**: Google TS Guide, Standard for Public Code
- **Config**: `prettier-check: { mode: error }` (already `{}`)
- **Prerequisite**: Install and configure Prettier first

### 1.6 `run-build` — Frontend build succeeds
- **Standards**: Build verification
- **Config**: Already `mode: error, command: pnpm --filter @hak/frontend build`
- **Move to pre-commit stage** (currently only used on-demand)

### 1.7 `broken-links` — No dead links in documentation
- **Standards**: Standard for Public Code
- **Config**: Already configured, add to `pre-commit` stage

### 1.8 `language-check` → upgrade to error
- **Standards**: Standard for Public Code (Criterion 10: Use Plain English)
- **Config**: Change `mode: warning` → `mode: error`
- **Caveat**: May have violations → fix first

### 1.9 `run-lint` → upgrade to error
- **Standards**: All code quality standards
- **Config**: Change `mode: warning` → `mode: error`
- **Caveat**: May have violations → fix first

## Step 2: Configure Stricter Thresholds

### 2.1 Coverage thresholds → 90%
- **File**: Each package's `jest.config.js`
- **Change**: `lines: 90, branches: 85, functions: 90, statements: 90`
- **Prerequisite**: Write tests to reach 90% first

### 2.2 Complexity → 8 (McCabe)
- **File**: `eslint.config.mjs`
- **Rule**: `complexity: ['error', 8]` (already default in defaults.yaml)
- **Verify**: Write complex function → ESLint blocks

### 2.3 Security audit level → high
- **File**: `devbox.yaml` → `security-audit.auditLevel: high`
- **Prerequisite**: Fix all 16 vulnerabilities first

## Step 3: Add New Hooks to DevBox

DevBox supports `CommandRunnerHook` — any shell command can be a hook.
Request these as new hooks or use `run-*` pattern.

### 3.1 Circular dependency detection
- **Command**: `madge --circular --extensions ts packages/*/src`
- **Implementation**: Add as `run-circular-deps` hook or request from DevBox team
- **Install**: `pnpm add -Dw madge`

### 3.2 Dead code detection
- **Command**: `ts-prune | grep -v '(used in module)' | grep -v '__tests__'`
- **Implementation**: Add as `run-dead-code` hook
- **Install**: `pnpm add -Dw ts-prune`

### 3.3 Dockerfile linting
- **Command**: `hadolint packages/*/Dockerfile`
- **Implementation**: Add as `run-docker-lint` hook
- **Install**: `brew install hadolint` or download binary

### 3.4 Terraform security scanning
- **Command**: `tfsec infra/ --minimum-severity HIGH`
- **Implementation**: Add as `run-tfsec` hook
- **Install**: `brew install tfsec` or download binary

### 3.5 License compliance
- **Command**: `license-checker --production --failOn 'GPL;AGPL;SSPL'`
- **Implementation**: Add as `run-license-check` hook
- **Install**: `pnpm add -Dw license-checker`

## Step 4: Commit-msg Hooks

### 4.1 Conventional Commits enforcement
- **Current**: `test-required` hook on commit-msg stage
- **Add**: commitlint hook for message format
- **Install**: `pnpm add -Dw @commitlint/cli @commitlint/config-conventional`
- **DevBox integration**: Add `commit-msg-format` hook

## Implementation Order

1. **Enable zero-violation hooks** (no-any, no-floating-promises) — safe, no fixes needed
2. **Fix violations, then enable** (no-console: fix 20+ logs, then mode: error)
3. **Upgrade warnings → errors** (run-lint, language-check)
4. **Raise thresholds** (coverage 90%, after writing tests)
5. **Add new hooks** (madge, ts-prune, hadolint, tfsec, license-checker)
6. **Fix vulnerabilities** (then set security-audit to strict)
