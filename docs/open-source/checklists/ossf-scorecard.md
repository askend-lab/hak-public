# OpenSSF Scorecard — Checklist

> https://securityscorecards.dev/
> Automated security assessment for open source projects. 18 checks.

## Binary-Artifacts
- [ ] No compiled binaries checked into the repository
- [ ] No `.exe`, `.dll`, `.so`, `.wasm` files in source tree
- [ ] Vendor directory (`packages/vendor/eki-storybook`) reviewed for binaries

## Branch-Protection
- [ ] `main` branch requires pull request reviews (≥1 reviewer)
- [ ] `main` branch requires status checks to pass
- [ ] `main` branch prohibits force pushes
- [ ] `main` branch requires signed commits (GPG or SSH)
- [ ] Admin override disabled (admins also follow rules)

## CI-Tests
- [ ] CI runs on every pull request
- [ ] CI includes unit tests, lint, typecheck
- [ ] CI results visible in PR checks

## CII-Best-Practices
- [ ] OpenSSF Best Practices badge obtained (see [ossf-best-practices.md](./ossf-best-practices.md))

## Code-Review
- [ ] All changes go through code review (PR-based workflow)
- [ ] At least one reviewer besides the author
- [ ] Review policy documented in CONTRIBUTING.md

## Contributors
- [ ] Project has multiple contributors (not single-person bus factor)
- [ ] Contribution history shows active development

## Dangerous-Workflow
- [ ] No `pull_request_target` with checkout of PR code in CI
- [ ] No `workflow_run` triggered by untrusted PRs
- [ ] CI workflows do not use `${{ github.event.*.body }}` in scripts

## Dependency-Update-Tool
- [ ] Dependabot or Renovate configured and active
- [ ] `.github/dependabot.yml` covers all package ecosystems (npm, docker, github-actions)

## Fuzzing
- [ ] Consider adding fuzz testing for input parsers (vmetajson, gherkin-parser)
- [ ] Property-based testing with `fast-check` as alternative to traditional fuzzing

## License
- [ ] `LICENSE` file exists at repository root
- [ ] License is OSI-approved (MIT)
- [ ] SPDX identifier in `package.json` (`"license": "MIT"`)

## Maintained
- [ ] Repository shows recent commits (within last 90 days)
- [ ] Issues are responded to within reasonable timeframe
- [ ] No unaddressed security advisories

## Pinned-Dependencies
- [ ] GitHub Actions use pinned SHA versions (not `@v3`, use `@sha256:...`)
- [ ] Docker base images use digest pins (`node:18@sha256:...`)
- [ ] npm dependencies use exact versions (no `^` or `~`)

## Packaging
- [ ] Project uses standard packaging (npm/pnpm for Node.js)
- [ ] Build process is documented and reproducible

## SAST
- [ ] Static analysis runs in CI (ESLint with security rules)
- [ ] Consider adding CodeQL for deeper analysis
- [ ] Consider adding `semgrep` for security-specific patterns

## Security-Policy
- [ ] `SECURITY.md` exists with vulnerability reporting instructions
- [ ] Contact email for security reports is monitored
- [ ] Response timeline is defined

## Signed-Releases
- [ ] Git tags are signed (GPG or SSH)
- [ ] Release artifacts have checksums
- [ ] Consider using Sigstore for keyless signing

## Token-Permissions
- [ ] GitHub Actions workflows use minimal token permissions
- [ ] `permissions:` block set at workflow level (not relying on defaults)
- [ ] Read-only permissions where write is not needed

## Vulnerabilities
- [ ] Zero known high/critical vulnerabilities in dependencies
- [ ] `pnpm audit` passes in CI
- [ ] GitHub security advisories are addressed promptly
