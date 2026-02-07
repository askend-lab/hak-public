# Standard for Public Code — Checklist

> https://standard.publiccode.net/
> The primary standard for government open source projects. 15 criteria.

## Criterion 1: Code in the Open
- [ ] Repository is publicly accessible on GitHub
- [ ] All development happens in the open (no private forks for features)
- [ ] Issue tracker is public and used for all work items

## Criterion 2: Bundle Policy and Source Code
- [ ] Policy objectives (Estonian language learning) are documented in README
- [ ] Link between policy goals and technical implementation is clear
- [ ] Gherkin specifications document behavioral requirements alongside code

## Criterion 3: Create Reusable and Portable Code
- [ ] All configuration is externalized via environment variables
- [ ] No hardcoded hostnames, IPs, or account IDs in source code
- [ ] Components can be deployed to any AWS account (parameterized Terraform)
- [ ] Documentation explains how to adapt for other languages/contexts

## Criterion 4: Welcome Contributors
- [ ] `CONTRIBUTING.md` exists with clear contribution guidelines
- [ ] `CODE_OF_CONDUCT.md` exists (Contributor Covenant)
- [ ] "Good First Issue" labels on beginner-friendly issues
- [ ] Response time commitment for issues/PRs is documented

## Criterion 5: Require Review of Contributions
- [ ] Branch protection requires at least 1 review before merge
- [ ] CI checks must pass before merge
- [ ] Review guidelines documented in CONTRIBUTING.md

## Criterion 6: Document Codebase Maturity
- [ ] Version follows Semantic Versioning
- [ ] `CHANGELOG.md` documents all releases
- [ ] Maturity level explicitly stated (alpha/beta/stable)

## Criterion 7: Maintain Version Control
- [ ] Git is used for all source code (already done)
- [ ] Commit messages follow Conventional Commits format
- [ ] Tags mark releases

## Criterion 8: Require Review of All Changes
- [ ] All code changes go through pull requests
- [ ] Automated tests run on every PR
- [ ] No direct pushes to `main` branch

## Criterion 9: Document Your Objectives
- [ ] Project objectives documented in README
- [ ] Roadmap is publicly available
- [ ] Architecture Decision Records explain technical choices

## Criterion 10: Use Plain English
- [ ] All documentation is in English (or bilingual English/Estonian)
- [ ] No internal jargon without explanation
- [ ] Remove all Russian-language internal documents or translate

## Criterion 11: Use Open Standards
- [ ] Data formats use open standards (JSON, UTF-8)
- [ ] APIs follow REST conventions with proper HTTP methods/status codes
- [ ] Authentication uses standard protocols (OIDC via TARA)

## Criterion 12: Use Continuous Integration
- [ ] CI runs on every commit/PR
- [ ] CI includes lint, typecheck, test, security scan
- [ ] CI results are publicly visible

## Criterion 13: Publish with an Open License
- [ ] MIT license is applied (verify appropriateness for government project)
- [ ] `LICENSE` file exists at repository root
- [ ] All source files have SPDX license headers

## Criterion 14: Make the Codebase Findable
- [ ] Repository has descriptive topics/tags on GitHub
- [ ] README starts with a clear description of what the project does
- [ ] Listed in relevant registries/catalogs (e.g., publiccode.yml)

## Criterion 15: Use a Coherent Style
- [ ] ESLint enforces consistent code style
- [ ] Prettier formats all files consistently
- [ ] EditorConfig ensures editor-agnostic settings
- [ ] Style guide is documented or referenced in CONTRIBUTING.md
