# Verification Pipeline — Implementation Plan

> Step-by-step: install each tool, configure it, add to CI, verify it catches violations.

## Tier 1: Already Available (just wire into CI)

### 1.1 TypeScript Strict (`tsc --noEmit`)
- **Status**: ✅ `strict: true` in tsconfig.json
- **Add to CI**: `pnpm -r exec tsc --noEmit`
- **Verify**: Introduce a type error → CI fails

### 1.2 ESLint (`pnpm lint`)
- **Status**: ✅ Configured, runs locally
- **Add to CI**: `pnpm lint` in build workflow
- **Verify**: Introduce a lint violation → CI fails

### 1.3 Jest Coverage (`pnpm test`)
- **Status**: ✅ Configured with thresholds
- **Add to CI**: Already runs; add `--coverage` flag
- **Verify**: Lower a threshold → CI fails

### 1.4 pnpm audit
- **Status**: ⚠️ 16 vulnerabilities exist
- **Add to CI**: `pnpm audit --audit-level=high`
- **First**: Fix all 16 vulnerabilities, THEN enable gate

### 1.5 Terraform fmt
- **Status**: ✅ Terraform installed in CI
- **Add to CI**: `terraform fmt -check -recursive infra/`
- **Verify**: Misformat a `.tf` file → CI fails

## Tier 2: Install & Configure (standard npm packages)

### 2.1 gitleaks (secret scanning)
- **Install**: Download binary or use GitHub Action `gitleaks/gitleaks-action@v2`
- **Config**: `.gitleaks.toml` already exists; expand rules
- **CI**: Add step after checkout: `gitleaks detect --source . --verbose`
- **Pre-commit**: Add to husky hooks
- **Verify**: Add a fake AWS key to a test file → gitleaks catches it

### 2.2 commitlint (commit message format)
- **Install**: `pnpm add -Dw @commitlint/cli @commitlint/config-conventional`
- **Config**: `commitlint.config.js` → `{ extends: ['@commitlint/config-conventional'] }`
- **Hook**: `npx commitlint --edit $1` in commit-msg hook
- **Verify**: Bad commit message → hook rejects

### 2.3 license-checker (dependency licenses)
- **Install**: `pnpm add -Dw license-checker`
- **CI**: `license-checker --production --failOn 'GPL;AGPL;SSPL'`
- **Verify**: Confirms all deps are MIT/Apache/BSD compatible

### 2.4 madge (circular dependencies)
- **Install**: `pnpm add -Dw madge`
- **CI**: `madge --circular --extensions ts packages/*/src`
- **Verify**: Create circular import → madge catches it

### 2.5 ts-prune (dead code)
- **Install**: `pnpm add -Dw ts-prune`
- **CI**: `ts-prune | grep -v '(used in module)'`
- **Verify**: Add unused export → ts-prune catches it

### 2.6 hadolint (Dockerfile linting)
- **Install**: GitHub Action `hadolint/hadolint-action@v3`
- **CI**: `hadolint packages/*/Dockerfile packages/frontend/src/services/*/Dockerfile`
- **Verify**: Add `RUN apt-get install` without version pin → hadolint catches it

### 2.7 size-limit (bundle size)
- **Install**: `pnpm add -Dw size-limit @size-limit/preset-app`
- **Config**: `.size-limit.json` with budget per entry point
- **CI**: `npx size-limit`
- **Verify**: Import a large library → size-limit fails

### 2.8 Prettier (formatting)
- **Install**: `pnpm add -Dw prettier`
- **Config**: `.prettierrc` with project settings
- **CI**: `prettier --check .`
- **Verify**: Misformat a file → prettier --check fails

## Tier 3: Advanced Tools (require more setup)

### 3.1 CodeQL (deep static analysis)
- **Setup**: `.github/workflows/codeql.yml` using `github/codeql-action`
- **Languages**: `javascript-typescript`
- **Schedule**: On every PR + weekly full scan
- **Verify**: Review CodeQL alerts in GitHub Security tab

### 3.2 semgrep (pattern-based security scanning)
- **Setup**: `.github/workflows/semgrep.yml` or in build workflow
- **Config**: `semgrep --config=p/owasp-top-ten --config=p/typescript`
- **Verify**: Add `eval()` call → semgrep catches it

### 3.3 trivy (container + dependency scanning)
- **Setup**: `aquasecurity/trivy-action@master` in CI
- **Targets**: Docker images + filesystem (node_modules)
- **CI**: `trivy image --severity HIGH,CRITICAL --exit-code 1`
- **Verify**: Use image with known CVE → trivy catches it

### 3.4 tfsec / checkov (IaC security)
- **Setup**: `aquasecurity/tfsec-action@v1` or `bridgecrewio/checkov-action@v2`
- **CI**: `tfsec infra/ --minimum-severity HIGH`
- **Verify**: Add S3 bucket without encryption → tfsec catches it

### 3.5 Lighthouse CI (performance + a11y)
- **Install**: `pnpm add -Dw @lhci/cli`
- **Config**: `lighthouserc.json` with assertions (scores ≥ 90)
- **CI**: `lhci autorun` against deployed preview
- **Verify**: Add blocking script → Lighthouse performance drops

### 3.6 Playwright + axe-core (E2E + accessibility)
- **Install**: `pnpm add -Dw @playwright/test @axe-core/playwright`
- **Config**: `playwright.config.ts`
- **CI**: `npx playwright test`
- **Verify**: Add image without alt → axe catches it

### 3.7 Stryker (mutation testing)
- **Install**: `pnpm add -Dw @stryker-mutator/core @stryker-mutator/jest-runner`
- **Config**: `stryker.config.mjs`
- **Schedule**: Weekly (too slow for every PR)
- **Verify**: Mutation score report shows test suite quality
