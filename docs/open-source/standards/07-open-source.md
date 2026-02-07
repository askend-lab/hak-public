# Open Source & Governance Standards

Standards for open source project quality, community health, and governance.

## 1. OpenSSF Scorecard
- **Link**: https://securityscorecards.dev/
- **Scope**: Automated security assessment for open source projects
- **Checks**: Branch protection, CI tests, code review, dependency updates, fuzzing, license, pinned dependencies, SAST, signed releases, token permissions, vulnerabilities
- **HAK action**: Run `scorecard --repo=github.com/askend-lab/hak` and fix all findings

## 2. OpenSSF Best Practices Badge
- **Link**: https://www.bestpractices.dev/
- **Levels**: Passing → Silver → Gold
- **Criteria**: FLOSS license, working build, test suite, security policy, code review, documentation
- **HAK target**: At least Passing badge before launch

## 3. CHAOSS — Community Health Analytics
- **Link**: https://chaoss.community/
- **Metrics**: Code velocity, contributor diversity, issue resolution time, bus factor, release frequency
- **HAK action**: Set up CHAOSS metrics dashboard after launch

## 4. REUSE — Software Freedom Conservancy
- **Link**: https://reuse.software/
- **Scope**: Standard for declaring copyright and licensing information
- **Practice**: Every file has a license header or `.reuse/dep5` declaration
- **HAK action**: Add SPDX headers to all source files

## 5. SPDX — Software Package Data Exchange
- **Link**: https://spdx.dev/
- **Scope**: Standard format for communicating software bill of materials (SBOM)
- **HAK action**: Generate SBOM with `spdx-sbom-generator` or `syft`

## 6. Keep a Changelog
- **Link**: https://keepachangelog.com/
- **Format**: `CHANGELOG.md` with Added, Changed, Deprecated, Removed, Fixed, Security sections
- **Versioning**: Based on Semantic Versioning
- **HAK action**: Create `CHANGELOG.md` before first public release

## 7. Contributor Covenant — Code of Conduct
- **Link**: https://www.contributor-covenant.org/
- **Scope**: Standard Code of Conduct for open source communities
- **HAK action**: Add `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)

## 8. All Contributors
- **Link**: https://allcontributors.org/
- **Scope**: Recognize all types of contributions (code, docs, design, ideas, testing)
- **HAK action**: Add `.all-contributorsrc` and contributor table in README

## 9. Semantic Release
- **Link**: https://semantic-release.gitbook.io/
- **Scope**: Automated version management and package publishing based on commit messages
- **HAK action**: Configure for automated releases from `main`

## 10. GitHub Community Standards
- **Link**: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions
- **Checklist**: README, CODE_OF_CONDUCT, CONTRIBUTING, LICENSE, SECURITY, issue templates, PR templates, CODEOWNERS
- **HAK status**: README ✓, CONTRIBUTING ✓, LICENSE ✓, SECURITY ✓, issue templates ✓; missing CODE_OF_CONDUCT, CODEOWNERS

## 11. TODO Group — Open Source Program Office
- **Link**: https://todogroup.org/guides/
- **Guides**: Starting an open source project, shutting down, measuring success, recruiting contributors
- **HAK action**: Follow "Starting an Open Source Project" guide
