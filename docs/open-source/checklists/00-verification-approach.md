# Verification Approach

> **Principle**: Before fixing anything, define HOW we verify each requirement.
> Every standard must have a measurable, repeatable verification method.
> If we can't verify it, we can't claim compliance.

## Verification Methods

| Method | Type | When | Blocks |
|--------|------|------|--------|
| **CI Gate** | Automated, in pipeline | Every PR | Merge |
| **CLI Tool** | Automated, run locally | Pre-commit / on-demand | Commit |
| **Scheduled Scan** | Automated, periodic | Weekly/monthly | Nothing (alerts) |
| **Manual Review** | Human checklist | Per-release | Release |
| **External Audit** | Third-party assessment | Pre-launch | Launch |

## Standard → Verification Mapping

### Security Standards

| Standard | Verification Tool | CI Gate? | Command |
|----------|------------------|----------|---------|
| OWASP Top 10 | `semgrep` + custom rules | ✅ | `semgrep --config=p/owasp-top-ten` |
| OWASP Serverless | Manual review + `semgrep` | ✅ | Custom semgrep rules for Lambda patterns |
| OWASP ASVS L2 | `zap` (DAST) + manual | ❌ | `zap-baseline.py` on staging |
| CWE Top 25 | `CodeQL` + `semgrep` | ✅ | GitHub CodeQL Action |
| NIST SSDF | Process checklist | ❌ | Manual review per-release |
| SLSA | `slsa-verifier` | ✅ | Provenance verification in release workflow |
| Secret scanning | `gitleaks` | ✅ | `gitleaks detect --source .` |
| Dependency vulns | `pnpm audit` | ✅ | `pnpm audit --audit-level=high` |
| License compliance | `license-checker` | ✅ | `license-checker --production --failOn` |
| Docker security | `trivy` | ✅ | `trivy image <image>` |
| IaC security | `tfsec` + `checkov` | ✅ | `tfsec infra/ && checkov -d infra/` |
| CIS AWS Benchmark | AWS Security Hub | ❌ | AWS Console / CLI scheduled |

### Code Quality Standards

| Standard | Verification Tool | CI Gate? | Command |
|----------|------------------|----------|---------|
| TypeScript strict | `tsc --noEmit` | ✅ | `tsc --noEmit --strict` |
| Google TS Guide | `ESLint` custom config | ✅ | `pnpm lint` |
| NASA Power of Ten | ESLint `complexity` + `max-lines-per-function` | ✅ | `pnpm lint` |
| Node.js Best Practices | ESLint + custom rules | ✅ | `pnpm lint` |
| No `any` types | `@typescript-eslint/no-explicit-any` | ✅ | `pnpm lint` |
| No `console.log` | `no-console` ESLint rule | ✅ | `pnpm lint` |
| No dead code | `ts-prune` | ✅ | `ts-prune \| grep -v used` |
| Circular deps | `madge` | ✅ | `madge --circular --extensions ts packages/` |
| Bundle size | `size-limit` | ✅ | `size-limit` |
| Conventional Commits | `commitlint` | ✅ | `commitlint --from=HEAD~1` |

### Testing Standards

| Standard | Verification Tool | CI Gate? | Command |
|----------|------------------|----------|---------|
| Coverage 90%+ | Jest `--coverage` | ✅ | `pnpm test -- --coverage` |
| Mutation score 80%+ | `stryker-mutator` | ❌ | `npx stryker run` (scheduled) |
| E2E tests | Playwright | ✅ | `npx playwright test` |
| a11y tests | `@axe-core/playwright` | ✅ | Part of Playwright suite |
| Property-based | `fast-check` (in Jest) | ✅ | Part of `pnpm test` |
| BDD specs | Cucumber / Playwright | ✅ | Part of test suite |
| Test isolation | Jest `--randomize` | ✅ | `pnpm test -- --randomize` |

### Accessibility Standards

| Standard | Verification Tool | CI Gate? | Command |
|----------|------------------|----------|---------|
| WCAG 2.2 AA | `axe-core` + Lighthouse | ✅ | `npx playwright test --grep a11y` |
| EN 301 549 | `axe-core` + manual | Partial | Automated ~60%, manual ~40% |
| Keyboard nav | Playwright keyboard tests | ✅ | `npx playwright test --grep keyboard` |
| Screen reader | Manual testing (NVDA/VO) | ❌ | Manual checklist per-release |
| Color contrast | `axe-core` + Lighthouse | ✅ | Automated in a11y tests |
| Lighthouse 90+ | `lighthouse-ci` | ✅ | `lhci autorun` |

### Infrastructure Standards

| Standard | Verification Tool | CI Gate? | Command |
|----------|------------------|----------|---------|
| AWS Well-Architected | AWS WA Tool | ❌ | Manual review, scheduled |
| Twelve-Factor | Process checklist | ❌ | Manual review per-release |
| CIS AWS | AWS Security Hub | ❌ | Scheduled scan |
| Terraform fmt | `terraform fmt -check` | ✅ | `terraform fmt -check -recursive infra/` |
| Terraform validate | `terraform validate` | ✅ | `cd infra && terraform validate` |
| Docker best practices | `hadolint` | ✅ | `hadolint packages/*/Dockerfile` |
