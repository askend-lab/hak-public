# OpenSSF Scorecard — Checklist

> https://securityscorecards.dev/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Binary-Artifacts
- [ ] check · [ ] done — No compiled binaries in repo (`scorecard` CLI check)
- [ ] check · [ ] done — Vendor directory reviewed for binaries (`manual review`)

## Branch-Protection
- [ ] check · [ ] done — `main` requires PR reviews ≥1 (`GitHub branch rules`)
- [ ] check · [ ] done — `main` requires status checks (`GitHub branch rules`)
- [ ] check · [ ] done — `main` prohibits force pushes (`GitHub branch rules`)
- [ ] check · [ ] done — `main` requires signed commits (`GitHub branch rules`)

## CI-Tests
- [ ] check · [ ] done — CI runs on every PR (`GitHub Actions build.yml`)
- [ ] check · [ ] done — CI includes unit tests, lint, typecheck (`build.yml`)

## Code-Review
- [ ] check · [ ] done — All changes go through code review (`GitHub branch rules`)
- [ ] check · [ ] done — At least one reviewer besides author (`GitHub branch rules`)

## Contributors
- [ ] check · [ ] done — Multiple contributors (`git log --format='%ae' | sort -u`)

## Dangerous-Workflow
- [ ] check · [ ] done — No `pull_request_target` with checkout (`workflow audit`)
- [ ] check · [ ] done — No untrusted input in scripts (`workflow audit`)

## Dependency-Update-Tool
- [ ] check · [ ] done — Dependabot configured for npm, docker, actions (`dependabot.yml`)

## Fuzzing
- [ ] check · [ ] done — Property-based testing with fast-check (`run-tests`)

## License
- [ ] check · [ ] done — `LICENSE` file at root (`file existence check`)
- [ ] check · [ ] done — SPDX identifier in package.json (`package-json-validation`)

## Maintained
- [ ] check · [ ] done — Recent commits within 90 days (`git log`)
- [ ] check · [ ] done — Issues responded to timely (`GitHub metrics`)

## Pinned-Dependencies
- [ ] check · [ ] done — Actions use SHA pins, not `@v3` (`workflow audit`)
- [ ] check · [ ] done — Docker base images use digest (`hadolint`)
- [ ] check · [ ] done — npm deps use exact versions (`dependency-check`)

## SAST
- [ ] check · [ ] done — ESLint with security rules in CI (`run-lint` hook)
- [ ] check · [ ] done — CodeQL analysis configured (`codeql.yml`)

## Security-Policy
- [ ] check · [ ] done — `SECURITY.md` exists (`file existence check`)
- [ ] check · [ ] done — Contact email monitored (`manual review`)

## Signed-Releases
- [ ] check · [ ] done — Git tags are signed (`release workflow`)
- [ ] check · [ ] done — Release artifacts have checksums (`release workflow`)

## Token-Permissions
- [ ] check · [ ] done — Workflows use minimal `permissions:` block (`workflow audit`)

## Vulnerabilities
- [ ] check · [ ] done — Zero high/critical dep vulnerabilities (`security-audit` hook)
- [ ] check · [ ] done — GitHub security advisories addressed (`GitHub alerts`)
