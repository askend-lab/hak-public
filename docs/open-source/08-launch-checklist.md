# Phase 6: Launch Checklist

> All previous phases must be complete before launch.
> **All DevBox hooks must be green. All manual gates must be checked.**

## DevBox Hooks — ALL must pass on every commit

| 🔧 | ✅ | Hook | Status |
|---|---|------|--------|
| [x] | [x] | `run-tests` | ✅ active |
| [x] | [x] | `run-typecheck` | ✅ active |
| [x] | [x] | `run-build` | ✅ active |
| [x] | [ ] | `run-lint` | ⚠️ warnings remain |
| [x] | [ ] | `security-audit` | ⚠️ 16 vulns |
| [x] | [ ] | `no-console` | ⚠️ violations |
| [x] | [ ] | `language-check` | ⚠️ non-English |
| [x] | [ ] | `license-check` | needs verification |
| [ ] | [ ] | `prettier-check` | disabled |
| [ ] | [ ] | NEW hooks (tfsec, hadolint, etc.) | not yet added |

## Manual Gates

### Licensing & Compliance
- [ ] Verify MIT license with stakeholders (government IP)
- [ ] Add license headers to all `.ts`/`.tsx` files
- [ ] Add `NOTICE` file (third-party deps and licenses)

### Repository Setup
- [ ] Branch protection on `main` (reviews, status checks)
- [ ] Enable GitHub Discussions
- [ ] Add topics/tags, social preview image
- [ ] Pinned "Good First Issue" issues

### Launch Communication
- [ ] Press release / blog post
- [ ] Code of Conduct, governance model
- [ ] Public roadmap
