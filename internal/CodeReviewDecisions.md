# Code Review — Architectural Decisions

Decisions made during discussion with Alex on 2026-02-21.

These items from the Code Review required a product/architectural decision before fixing.

---

| # | Finding | Decision | Notes |
|---|---------|----------|-------|
| **1.3.6** | Architecture doc missing auth, security, diagrams | ✅ Add full sections: Authentication & Authorization, Security Model, System Diagrams (Mermaid) | |
| **1.4.1** | No OpenAPI/Swagger | ✅ Use Zod → OpenAPI (`zod-to-openapi`) to auto-generate specs from existing Zod schemas | Alex: "не очень в него верю, посмотрим" |
| **1.5.1** | No deployment guide | ✅ Add section to ARCHITECTURE.md — all deploys via CI/CD, no manual deploy | Not a separate file — just a section |
| **1.5.1.1** | Too many markdown files (~46) | ✅ Leave as-is — structure is fine, no real duplication | 54 files total, all justified |
| **1.5.1.2** | Design docs in two places | ✅ Consolidate — move `frontend/src/styles/*.md` into `docs/02-DESIGN-SYSTEM/` | Single source of truth |
| **2.1** | Node.js 20 → LTS | ✅ Upgrade to Node.js 22 | Node 20 LTS expires April 2026 |
| **4.16** | SonarQube issues | ✅ Run SonarQube once locally, review findings. No CI integration | One-time scan only |
| **5.1 + 5.2 + 5.4** | Code duplication (shared ↔ merlin/vabamorf) | ✅ Keep duplication (~50 lines) — price of standalone Lambda deploy simplicity | Extracting a shared module breaks standalone deploy |
| **12.2** | Shared API throttling | ✅ Leave as-is — WAF per-IP rate limit (100 req/5min) is sufficient | No per-route rules needed |
| **14.1** | Rename modules to domain names | ✅ Try in separate PR — if too complex, defer | merlin→speech/tts, vabamorf→morphology, etc. |
| **15.4** | Remove /status/{cacheKey} from public | ❌ Won't fix — public info, frontend needs it for polling | cacheKey=SHA-256, data is public anyway |
