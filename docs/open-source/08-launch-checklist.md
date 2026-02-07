# Phase 6: Launch Checklist

> All previous phases must be complete before launch.

## 1. Code Quality Gates (all must pass)

- [ ] `pnpm lint` — zero warnings, zero errors
- [ ] `pnpm typecheck` — zero errors across all packages
- [ ] `pnpm test` — all tests pass, coverage 90%+
- [ ] `pnpm audit` — zero high/critical vulnerabilities
- [ ] `gitleaks detect` — zero findings in full history
- [ ] `tsc --noEmit --strict` — zero errors
- [ ] Lighthouse — 90+ all categories
- [ ] WCAG 2.1 AA — zero violations
- [ ] Bundle size — within defined budgets
- [ ] Docker image scan — zero high/critical vulnerabilities

## 2. Documentation Gates

- [ ] README.md — complete, professional, with screenshots
- [ ] ARCHITECTURE.md — system diagrams and explanations
- [ ] CONTRIBUTING.md — complete contributor guide
- [ ] SECURITY.md — security policy and contact
- [ ] API documentation — all endpoints documented
- [ ] ADRs — all major decisions documented
- [ ] Inline code docs — all exported functions documented
- [ ] No internal references in any document

## 3. Licensing & Compliance

- [ ] **Verify MIT license** — Confirm with stakeholders for government-funded project.
- [ ] **Add license headers** — Standard copyright notice in every `.ts`/`.tsx` file.
- [ ] **Add `NOTICE` file** — List all third-party dependencies and licenses.
- [ ] **Verify Estonian government IP requirements** — Compliance with procurement rules.
- [ ] **Update copyright** — Correct holder, year range `2024-2026`.
- [ ] **Consider CLA** — Contributor License Agreement for external contributors.

## 4. Repository Setup

- [ ] Branch protection on `main` — require reviews, status checks, signed commits
- [ ] Enable GitHub Discussions
- [ ] Enable GitHub Pages for documentation
- [ ] Configure security alerts
- [ ] Add topics/tags for discoverability
- [ ] Social preview image
- [ ] Pinned "Good First Issue" issues

## 5. Launch Communication

- [ ] **Press release / blog post** — Announce open source release.
- [ ] **Technical blog post** — "Building a government platform with AI-assisted development".
- [ ] **Community guidelines** — Code of Conduct, governance model.
- [ ] **Public roadmap** — Planned features and improvements.
