# Phase 5a: CI/CD & Dependencies

> MEDIUM — robust pipeline and healthy dependencies.
> Every item: 🔧 = DevBox hook or CI step exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [x] | [ ] | No vulnerable deps | `security-audit` | pnpm audit |
| [x] | [ ] | License compatibility | `license-check` | license-checker |
| [x] | [x] | Unused deps detected | `dependency-check` | depcheck |
| [ ] | [ ] | Prettier formatting | `prettier-check` (disabled) | prettier |
| [ ] | [ ] | Bundle size budget | NEW: `bundle-size` | size-limit |
| [ ] | [ ] | Docker image scan | NEW: CI `trivy` step | trivy |
| [ ] | [ ] | CodeQL scanning | GitHub Actions | CodeQL |

## Manual Gates

### Dependencies
- [ ] Fix all 16 npm vulnerabilities (3 low, 4 mod, 9 high)
- [ ] Remove deprecated subdependencies
- [ ] Update all deps to latest stable

### CI/CD
- [ ] Add PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
- [ ] Add CodeQL analysis workflow
- [ ] Define semver + automated release workflow

### Infrastructure
- [ ] Parameterize all env-specific values in Terraform
- [ ] Add `infra/README.md`
