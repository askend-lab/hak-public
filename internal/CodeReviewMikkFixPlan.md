# Fix Plan — Mikk Merimaa Code Review

Items that can be fixed immediately without discussion, split into 3 independent groups.

Items marked ⏸️ DISCUSS are listed at the bottom — they need an architectural or product decision first.

---

## Group 1: Documentation & Config

Touches: `.md` files, `ARCHITECTURE.md`, READMEs, CI workflow docs. **No source code changes.**

- [x] **1.1.1** (Low) Fix README inconsistencies: React version 18→19, dev port 5180→5181
- [x] **1.1.3** (Low) Sync vabamorf-api README deps with package.json (or vice versa)
- [x] **1.2.1** (Low) Create INSTALL.md (or merge install steps into README)
- [x] **1.3.1** (Low) ~~Remove duplicate architecture line in README~~ — not real duplication
- [x] **1.3.2** (Low) ~~Remove tech stack duplication~~ — intentional for navigation
- [x] **1.3.3** (Medium) Fix ARCHITECTURE.md: merlin-worker does NOT depend on shared
- [x] **1.3.4** (Medium) Fix ARCHITECTURE.md: vabamorf-api does NOT depend on shared at runtime
- [x] **1.3.5** (Medium) Fix ARCHITECTURE.md: merlin-worker is Python only, not Python + TypeScript
- [x] **1.5.1.2** (Low) ~~Consolidate design docs~~ — no duplication found (docs/design-systems/ doesn't exist)
- [x] **9.3** (Medium) Document deploy workflows — added CI/CD section to ARCHITECTURE.md
- [x] **10.1** (Low) Fix merlin-api README: remove wrong Cognito/auth references
- [x] **15.2** (Medium) Fix merlin-api README: says "Cognito JWT" but code has AuthorizationType: NONE

---

## Group 2: Frontend + Shared + Simplestore

Touches: `packages/frontend/`, `packages/shared/`, `packages/simplestore/`, `packages/tara-auth/`. **No merlin/vabamorf changes.**

- [x] **2.2** (Low) Remove Jest, consolidate on Vitest (frontend + shared + simplestore)
- [x] **4.8** (Medium) Replace deprecated `execCommand` clipboard fallback with Clipboard API
- [x] **4.9** (Low) Merge duplicate CSS selectors (.marker-tooltip--align-center)
- [x] **7.1** (Low) Make simplestore use `extractErrorMessage` from shared
- [x] **8.2.1** (Medium) ~~Remove test duplications in simplestore~~ — complementary testing, not true duplication

---

## Group 3: Merlin API + Merlin Worker + Vabamorf API

Touches: `packages/merlin-api/`, `packages/merlin-worker/`, `packages/vabamorf-api/`, `infra/merlin/`. **No frontend/shared/simplestore changes.**

- [x] **2.3** (Low) Fix bug in generate.py: ERB branch calls `bark_alpha` instead of `erb_alpha`
- [x] **4.2** (Medium) Fix getCorsOrigin behavior difference: shared returns `"null"`, merlin/vabamorf return `"*"`
- [x] **5.3** (Low) Remove `if True:` indentation hack in run_merlin.py
- [x] **7.2** (Low) Replace `console.error` with proper logger in merlin-api and vabamorf-api
- [x] **9.1** (Low) Replace `RUN cd` with `WORKDIR` in Dockerfile
- [x] **10.2** (Medium) Replace empty-string fallbacks in ECS env vars with throw/validation
- [x] **12.3** (Medium) Unify CORS behavior across all packages (consistent origin handling)
- [x] **12.7** (Medium) Add cacheKey validation in worker.py (match API-side regex)
- [x] **13.1** (Medium) Cache DNN model in memory instead of loading from disk every request
- [x] **15.1** (Medium) Remove /warmup endpoint entirely from merlin-api
- [x] **15.3** (Low) Apply shell injection fix (TDD tests already exist)
- [ ] **15.4** (Medium) Remove /status/{cacheKey} from direct public access — DEFERRED (needs architectural discussion)

---

## ⏸️ Needs Discussion Before Fixing

These items require an architectural or product decision:

| # | Finding | Question |
|---|---------|----------|
| **1.3.6** | Architecture doc missing auth, security, diagrams | What sections to add? How detailed? |
| **1.4.1** | No OpenAPI/Swagger | Which tool? Auto-generate or manual? |
| **1.5.1** | No deployment guide | What level of detail? Which environments? |
| **1.5.1.1** | Too many markdown files (~46) | Which to consolidate? What structure? |
| **2.1** | Node.js 20 → latest LTS | Upgrade to 22? Affects all packages + Docker + CI |
| **4.16** | SonarQube issues | Install SonarQube? Or use existing linters? |
| **5.1** | S3 utils duplicated (shared ↔ merlin-api) | Who owns the canonical version? Import strategy? |
| **5.2** | LambdaResponse duplicated (shared ↔ merlin/vabamorf) | Same question — consolidate where? |
| **5.4** | HTTP_STATUS duplicated | Same — single source of truth location? |
| **12.2** | Shared API Gateway throttling | Per-route WAF rules? Per-user limiting? |
| **14.1** | Rename modules to reflect domain | What names? Breaking change for CI/infra |

---

## Recommended Fix Order (within each group)

**Group 1:** Start top-to-bottom — all are independent.

**Group 2:** Fix in this order:
1. **2.2** (Jest → Vitest — changes test infrastructure)
2. **4.8, 4.9** (code style)
3. **7.1, 8.2.1** (logic changes)

**Group 3:** Fix in this order:
1. **15.1** (remove /warmup — reduces code surface)
2. **15.3** (shell injection — tests ready)
3. **12.3 + 4.2** (CORS unification — related fixes)
4. **12.7** (security hardening)
5. **5.3** (code quality)
6. **9.1, 10.2, 7.2** (infra/config)
7. **2.3, 13.1** (merlin engine fixes)
8. **15.4** (status endpoint — may depend on 12.2 discussion)
