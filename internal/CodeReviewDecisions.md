# Code Review — Decisions & Action Items

Decisions made during discussion with Alex on 2026-02-21.

---

## Action Items

Items that require work. Sorted by priority.

- [x] **1.3.6** (High) Add Auth, Security, Diagrams sections to ARCHITECTURE.md
- [x] **1.5.1** (Medium) Add "all deploys via CI/CD" section to ARCHITECTURE.md
- [x] **1.5.1.2** (Low) Consolidate design docs — move `frontend/src/styles/*.md` → `docs/02-DESIGN-SYSTEM/`
- [x] **infra** Remove orphaned `/api/warmup` from `infra/locals.tf`
- [x] **2.1** (Medium) Upgrade Node.js 20 → 22 — affects package.json, Dockerfile, CI, .nvmrc
- [ ] **1.4.1** (Medium) Zod → OpenAPI — auto-generate API specs from Zod schemas (`zod-to-openapi`)
- [ ] **4.16** (Medium) Run SonarQube once locally, review findings (no CI integration)
- [ ] **14.1** (Medium) Rename modules to domain names — try in separate PR, defer if too complex

## No Action Required (closed by decision)

- **1.5.1.1** — Leave as-is. 54 markdown files, structure is fine, no real duplication.
- **5.1 + 5.2 + 5.4** — Keep duplication (~50 lines). Price of standalone Lambda deploy simplicity.
- **12.2** — Leave as-is. WAF per-IP rate limit (100 req/5min) is sufficient.
- **15.4** — Won't fix. `/status/{cacheKey}` is public info, frontend needs it for polling.
