# OpenSSF Best Practices Badge — Checklist

> https://www.bestpractices.dev/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Basics
- [ ] check · [ ] done — Public website with description (`GitHub repo settings`)
- [ ] check · [ ] done — Version control repository (`GitHub — already satisfied`)
- [ ] check · [ ] done — Unique version numbering — SemVer (`package.json version`)
- [ ] check · [ ] done — Release notes for each release — CHANGELOG.md (`file check`)

## Change Control
- [ ] check · [ ] done — Distributed VCS — Git (`already satisfied`)
- [ ] check · [ ] done — Documented contribution process (`CONTRIBUTING.md check`)
- [ ] check · [ ] done — Major changes reviewed before merge (`branch protection`)

## Reporting
- [ ] check · [ ] done — Process for reporting bugs — GitHub Issues (`GitHub settings`)
- [ ] check · [ ] done — Process for reporting vulns — SECURITY.md (`file check`)
- [ ] check · [ ] done — Bug reports acknowledged within 14 days (`manual review`)

## Quality
- [ ] check · [ ] done — Automated test suite covers most functionality (`run-tests` hook)
- [ ] check · [ ] done — Test suite ≥80% statement coverage (`run-tests` — thresholds)
- [ ] check · [ ] done — New functionality includes tests (`test-required` hook)
- [ ] check · [ ] done — CI runs tests on each commit (`GitHub Actions build.yml`)
- [ ] check · [ ] done — Warnings enabled and addressed (`run-typecheck` — strict)

## Security
- [ ] check · [ ] done — Secure software design knowledge (`threat model docs`)
- [ ] check · [ ] done — No unpatched known vulnerabilities (`security-audit` hook)
- [ ] check · [ ] done — TLS for all external comms (`tfsec`)
- [ ] check · [ ] done — Well-known crypto algorithms only (`code review`)
- [ ] check · [ ] done — Hardened auth mechanism (`run-tests` — auth tests)

## Analysis
- [ ] check · [ ] done — Static analysis on every commit (`run-lint` hook)
- [ ] check · [ ] done — Dynamic analysis used (`run-tests` — property-based tests)
- [ ] check · [ ] done — Security issues fixed promptly (`manual review`)
