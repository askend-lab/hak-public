# Phase 4: Documentation

> MEDIUM — essential for community adoption and contributor onboarding.

## 1. README.md Rewrite

- [ ] **Rewrite for open source audience** — New structure:
  1. Project description and purpose (what HAK is, who it's for)
  2. Live demo link (if available)
  3. Screenshots/GIFs of the application
  4. Architecture overview with diagram
  5. Quick start guide (prerequisites, install, run)
  6. Development guide (testing, linting, hooks)
  7. Deployment guide (AWS setup, Terraform)
  8. Contributing (link to CONTRIBUTING.md)
  9. License
  10. Acknowledgments (Estonian Institute of Language)
- [ ] **Add project status badges** — Build, coverage, license, Node.js version, PRs welcome.
- [ ] **Add "Built with AI" section** — Transparent about AI-assisted methodology. Unique selling point.

## 2. Architecture Documentation

- [ ] **Create `docs/ARCHITECTURE.md`** — Full system architecture with C4 diagrams.
- [ ] **Create ADRs** — Architecture Decision Records in `docs/adr/` (see code-quality plan).
- [ ] **Create `docs/DEPLOYMENT.md`** — Step-by-step AWS deployment guide.
- [ ] **Create `docs/API.md`** — API documentation for all Lambda endpoints (consider OpenAPI).

## 3. Code Documentation

- [ ] **JSDoc on all exported functions** — Purpose, parameters, return value, exceptions.
- [ ] **Module-level comments** — Every source file explains its role.
- [ ] **Inline comments for complex logic** — Especially `vmetajson.ts`, `parser.ts`, `gherkin-parser`.
- [ ] **Document error codes** — Central error code reference for API responses.

## 4. Specification Documentation

- [ ] **Create `specifications/README.md`** — Explain Gherkin BDD approach and how specs relate to tests.
- [ ] **Format all `.feature` files** — Proper Gherkin syntax, meaningful names, appropriate tags.
- [ ] **Add specification-to-test mapping** — Which features are tested where.

## 5. Cleanup

- [ ] **Remove or translate Russian-language documents** — English for international audience.
- [ ] **Convert internal audit findings to GitHub issues**.
- [ ] **Convert internal plans to public roadmap**.
