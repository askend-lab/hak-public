# Standard for Public Code — Checklist

> https://standard.publiccode.net/
> The primary standard for government open source projects. 15 criteria.
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Criterion 1: Code in the Open
- [ ] check · [ ] done — Repository is publicly accessible on GitHub (`GitHub settings`)
- [ ] check · [ ] done — All development happens in the open (`branch protection rules`)
- [ ] check · [ ] done — Issue tracker is public and used for all work items (`GitHub settings`)

## Criterion 2: Bundle Policy and Source Code
- [ ] check · [ ] done — Policy objectives documented in README (`manual review`)
- [ ] check · [ ] done — Link between policy goals and implementation is clear (`manual review`)
- [ ] check · [ ] done — Gherkin specs document behavioral requirements (`run-tests` hook)

## Criterion 3: Create Reusable and Portable Code
- [ ] check · [ ] done — Config externalized via env vars (`grep` for hardcoded values)
- [ ] check · [ ] done — No hardcoded hostnames/IPs/account IDs (`secret-detection` hook)
- [ ] check · [ ] done — Deployable to any AWS account (`terraform validate`)
- [ ] check · [ ] done — Docs explain how to adapt for other contexts (`manual review`)

## Criterion 4: Welcome Contributors
- [ ] check · [ ] done — `CONTRIBUTING.md` exists with clear guidelines (`broken-links` hook)
- [ ] check · [ ] done — `CODE_OF_CONDUCT.md` exists (`file existence check`)
- [ ] check · [ ] done — "Good First Issue" labels on beginner issues (`GitHub settings`)
- [ ] check · [ ] done — Response time commitment documented (`manual review`)

## Criterion 5: Require Review of Contributions
- [ ] check · [ ] done — Branch protection requires 1+ reviews (`GitHub branch rules`)
- [ ] check · [ ] done — CI checks must pass before merge (`GitHub branch rules`)
- [ ] check · [ ] done — Review guidelines in CONTRIBUTING.md (`manual review`)

## Criterion 6: Document Codebase Maturity
- [ ] check · [ ] done — Version follows SemVer (`package.json version field`)
- [ ] check · [ ] done — `CHANGELOG.md` documents all releases (`file existence check`)
- [ ] check · [ ] done — Maturity level stated (alpha/beta/stable) (`README check`)

## Criterion 7: Maintain Version Control
- [ ] check · [ ] done — Git used for all source code (`already satisfied`)
- [ ] check · [ ] done — Commit messages follow Conventional Commits (`commitlint` hook)
- [ ] check · [ ] done — Tags mark releases (`git tag verification`)

## Criterion 8: Require Review of All Changes
- [ ] check · [ ] done — All changes go through pull requests (`branch protection`)
- [ ] check · [ ] done — Automated tests run on every PR (`GitHub Actions CI`)
- [ ] check · [ ] done — No direct pushes to `main` (`branch protection`)

## Criterion 9: Document Your Objectives
- [ ] check · [ ] done — Project objectives in README (`manual review`)
- [ ] check · [ ] done — Public roadmap available (`file existence check`)
- [ ] check · [ ] done — ADRs explain technical choices (`file existence check`)

## Criterion 10: Use Plain English
- [ ] check · [ ] done — All docs in English (`language-check` hook)
- [ ] check · [ ] done — No internal jargon without explanation (`manual review`)
- [ ] check · [ ] done — No Russian-language internal documents (`language-check` hook)

## Criterion 11: Use Open Standards
- [ ] check · [ ] done — Data formats use open standards (JSON, UTF-8) (`manual review`)
- [ ] check · [ ] done — APIs follow REST conventions (`run-tests` hook)
- [ ] check · [ ] done — Auth uses standard protocols (OIDC via TARA) (`run-tests` hook)

## Criterion 12: Use Continuous Integration
- [ ] check · [ ] done — CI runs on every commit/PR (`GitHub Actions workflow`)
- [ ] check · [ ] done — CI includes lint, typecheck, test, security (`build.yml`)
- [ ] check · [ ] done — CI results are publicly visible (`GitHub Actions`)

## Criterion 13: Publish with an Open License
- [ ] check · [ ] done — MIT license applied (`license-checker` tool)
- [ ] check · [ ] done — `LICENSE` file at repository root (`file existence check`)
- [ ] check · [ ] done — All source files have SPDX headers (`reuse lint` tool)

## Criterion 14: Make the Codebase Findable
- [ ] check · [ ] done — Repository has descriptive topics/tags (`GitHub settings`)
- [ ] check · [ ] done — README starts with clear description (`manual review`)
- [ ] check · [ ] done — Listed in registries (publiccode.yml) (`file existence check`)

## Criterion 15: Use a Coherent Style
- [ ] check · [ ] done — ESLint enforces code style (`run-lint` hook)
- [ ] check · [ ] done — Prettier formats consistently (`prettier-check` hook)
- [ ] check · [ ] done — EditorConfig for editor-agnostic settings (`file existence check`)
- [ ] check · [ ] done — Style guide in CONTRIBUTING.md (`manual review`)
