# OpenSSF Best Practices Badge — Checklist

> https://www.bestpractices.dev/
> Criteria for open source project quality. Target: Passing level.

## Basics
- [ ] Project has a publicly accessible website with description
- [ ] Project has a version control repository (Git on GitHub)
- [ ] Project has a unique version numbering scheme (SemVer)
- [ ] Project provides release notes for each release (CHANGELOG.md)

## Change Control
- [ ] Project uses a distributed version control system (Git)
- [ ] Project has a documented contribution process (CONTRIBUTING.md)
- [ ] Each major change is reviewed before merge (PR reviews)

## Reporting
- [ ] Project has a process for reporting bugs (GitHub Issues)
- [ ] Project has a process for reporting vulnerabilities (SECURITY.md)
- [ ] Bug reports are acknowledged within 14 days

## Quality
- [ ] Project has automated test suite that covers most functionality
- [ ] Test suite achieves ≥80% statement coverage (target 90%+)
- [ ] New functionality includes tests
- [ ] Project has a CI system that runs tests on each commit
- [ ] Warning flags enabled and warnings addressed (`strict: true` in tsconfig)

## Security
- [ ] Project lead knows how to design secure software (documented threat model)
- [ ] No unpatched publicly known vulnerabilities (pnpm audit clean)
- [ ] Project uses TLS for all external communications
- [ ] Cryptographic algorithms are well-known and not custom
- [ ] Project has a hardened authentication mechanism (Cognito/TARA)

## Analysis
- [ ] At least one static analysis tool runs on every commit (ESLint)
- [ ] Dynamic analysis (fuzzing or property-based testing) is used
- [ ] All identified security issues are fixed promptly
