# Phase 5a: CI/CD & Dependencies

> MEDIUM — robust pipeline and healthy dependencies for sustainable maintenance.

## 1. Build Consistency

- [ ] **Standardize on pnpm everywhere** — Remove `packages/vabamorf-api/package-lock.json` (3851 lines). Update all Dockerfiles to use pnpm.
- [ ] **Add build caching** — pnpm cache + GitHub Actions cache for node_modules and build outputs.
- [ ] **Add typecheck step to CI** — `tsc --noEmit` for every package.
- [ ] **Add lint step to CI** — ESLint + gherkin-lint in pipeline.

## 2. CI Quality Gates

- [ ] **Coverage enforcement** — Fail CI if coverage drops below threshold.
- [ ] **Bundle size check** — Track and enforce frontend bundle size limits.
- [ ] **Dependency audit** — `pnpm audit` in CI, fail on high severity.
- [ ] **License check** — Verify all deps have MIT/Apache-2.0/BSD-compatible licenses.
- [ ] **Secret scanning** — Run gitleaks in CI on every PR.
- [ ] **Docker image scanning** — `trivy` on built images.

## 3. CI Workflow Improvements

- [ ] **Add PR template** — `.github/PULL_REQUEST_TEMPLATE.md` with checklist.
- [ ] **Verify issue templates** — Bug report and feature request completeness.
- [ ] **Verify Dependabot config** — `.github/dependabot.yml` properly configured.
- [ ] **Add CodeQL analysis** — GitHub code scanning for security.
- [ ] **Add OSSF Scorecard** — Automated security assessment for OSS projects.
- [ ] **Add automated changelog** — Generate from conventional commits on release.

## 4. Release Process

- [ ] **Define versioning strategy** — Semantic versioning with automated releases.
- [ ] **Create release workflow** — GitHub Actions for creating releases with changelog.
- [ ] **Document release-to-environment mapping**.

## 5. Dependency Health

### Vulnerability Remediation
- [ ] **Fix all 16 npm vulnerabilities** — 3 low, 4 moderate, 9 high. Every one resolved.
- [ ] **Set up automated monitoring** — Dependabot + GitHub security alerts.
- [ ] **Pin all production dependency versions** — No `^` or `~` ranges.

### Dependency Audit
- [ ] **Remove deprecated deps** — 25 deprecated subdependencies found.
- [ ] **License audit** — Run `license-checker`, verify MIT compatibility.
- [ ] **Minimize dependency count** — Audit each dep: necessary? replaceable with native APIs?
- [ ] **Add `engines` field to all packages** — Required Node.js version.
- [ ] **Create dependency policy** — Criteria for adding new deps (size, maintenance, license).

### Freshness
- [ ] **Update all deps to latest stable** — TypeScript, React, AWS SDK, Jest/Vitest, ESLint.
- [ ] **Remove unused deps** — Run `depcheck` to find unused packages.
