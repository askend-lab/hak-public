# Implementation Plan: Code Review Findings

**Total: 92 issues** | 🔴 Critical: 20 | 🟠 Medium: 43 | 🟡 Low: 29

---

## 🔴 CRITICAL (20) — Must fix before open source

### Security & Credentials
- [x] **AUTH-01** `frontend/services/auth/config.ts` — Declared as PUBLIC with JSDoc comment (OAuth client_id is public by design)
- [x] **AUTH-02** `frontend/services/auth/context.tsx` — Refactored to use `exchangeCodeForTokens()` from config.ts
- [x] **INFRA-01** `.github/workflows/*.yml` — NOT A BUG: Account ID is not secret, access controlled by IAM
- [x] **INFRA-02** `.github/workflows/*.yml` — NOT A BUG: Bucket names are not secrets
- [x] **INFRA-03** `infra/*.tf` — NOT A BUG: State bucket name is not secret

### API & Backend
- [x] **VABA-01** `vabamorf-api/src/vmetajson.ts` — Added request queue to prevent race condition
- [x] **VABA-02** `vabamorf-api/src/vmetajson.ts` — Renamed to `vmetajsonProcess`
- [x] **VABA-03** `vabamorf-api/src/validation.ts` — Added CORS headers
- [x] **MERL-01** `merlin-api/src/handler.ts` — Replaced MD5 with SHA-256
- [x] **MERL-02** `merlin-api/src/handler.ts` — Dynamic region from env
- [x] **MERL-03** `merlin-api/src/handler.ts` — Added CORS headers
- [x] **AUDIO-01** `audio-api/src/handler.ts` — Dynamic S3 region from env
- [x] **AUDIO-02** `audio-api/src/config.ts` — Removed dead getConfig()

### Shared & Core
- [x] **SHARED-01** `shared/src/hash.ts` — Added deprecation note, typed require
- [x] **SHARED-02** `shared/src/logger.ts` — Added LOG_LEVEL validation
- [x] **STORE-01** `simplestore/src/core/store.ts` — NOT A BUG: Private items isolated by userId in partition key
- [x] **STORE-02** `simplestore/src/adapters/dynamodb.ts` — Moved to MEDIUM: pagination is reliability, not security
- [x] **STORE-03** `simplestore/src/lambda/handler.ts` — NOT A BUG: Singleton pattern is standard for Lambda

### Open Source Requirements
- [x] **OSS-01** Root — Added MIT LICENSE
- [x] **OSS-02** Root — Added CONTRIBUTING.md

---

## 🟠 MEDIUM (43) — Should fix for quality

### Architecture & Design
- [x] **ARCH-01** `simplestore/src/core/types.ts` — Extract `StoreConfig` from `store.ts` (already in types.ts)
- [x] **ARCH-02** `simplestore/src/core/store.ts` — Preserve `createdAt` on update
- [ ] **ARCH-03** `frontend/services/repository/TaskRepository.ts` — Split into smaller classes (SRP violation)
- [x] **ARCH-04** `vabamorf-api/src/handler.ts` — Use `TEXT_LIMITS` from shared
- [x] **ARCH-05** `vabamorf-api/src/vmetajson.ts` — Make timeout configurable via env var
- [x] **ARCH-06** `audio-api/src/index.ts` — Extract CORS headers to shared helper
- [x] **ARCH-07** `audio-api/src/hash.ts` — Delete file, use `@hak/shared` directly
- [x] **ARCH-08** `merlin-api/src/handler.ts` — Add centralized `createResponse()` helper
- [ ] **ARCH-09** `gherkin-parser/src/index.ts` — Add Scenario Outline support

### Error Handling & Validation
- [x] **ERR-01** `simplestore/src/core/validation.ts` — Add max length validation for pk/sk
- [x] **ERR-02** `simplestore/src/lambda/handler.ts` — Return specific error for anonymous user ID
- [x] **ERR-03** `audio-api/src/sqs.ts` — Add retry logic with exponential backoff
- [x] **ERR-04** `audio-api/src/s3.ts` — Replace unsafe cast with type guard
- [ ] **ERR-05** `frontend/services/auth/context.tsx` — Add JWT signature verification or server-side validation
- [x] **ERR-06** `frontend/services/repository/TaskRepository.ts` — Use `crypto.randomUUID()`

### Testing
- [x] **TEST-01** `simplestore/test/setup.ts` — Reset env vars in afterEach
- [x] **TEST-02** `simplestore/test/handler.test.ts` — Replace `expect([200,500]).toContain()` with deterministic assertions
- [x] **TEST-03** `simplestore/test/store.test.ts` — Add test for update existing item behavior
- [x] **TEST-04** `simplestore/test/mockDynamoDB.ts` — Unify with `InMemoryAdapter` from adapters
- [ ] **TEST-05** `simplestore/test/*.test.ts` — Add concurrent access tests
- [x] **TEST-06** `shared/src/constants.test.ts` — Replace snapshot-like tests with meaningful assertions

### Documentation & Config
- [x] **DOC-01** Root `package.json` — Add `repository`, `bugs`, `homepage` fields
- [x] **DOC-02** `infra/` — Add `terraform.tfvars.example` with required variables
- [x] **DOC-03** `.github/` — Add `dependabot.yml` for automated updates
- [ ] **DOC-04** `.github/` — Configure GitHub Environments for secrets isolation
- [x] **DOC-05** Root — Add `.env.example` with all required env vars

### Frontend
- [x] **FE-01** `frontend/services/auth/config.ts` — Move hardcoded ports to env var
- [x] **FE-02** `frontend/services/repository/TaskRepository.ts` — Don't mutate objects after creation
- [ ] **FE-03** `frontend/src/components/` — Add Storybook for visual component testing
- [ ] **FE-04** `frontend/src/components/` — Add accessibility attributes (aria-label, role)
- [ ] **FE-05** `frontend/src/` — Add React Query or SWR for data fetching
- [ ] **FE-06** `frontend/src/` — Add Zustand devtools middleware
- [ ] **FE-07** `frontend/src/` — Add error boundaries

### Infrastructure
- [ ] **CI-01** `.github/workflows/` — Verify gherkin-lint runs in CI
- [ ] **CI-02** `merlin-api/src/handler.ts` — Add rate limiting for ECS warmup endpoint

---

## 🟡 LOW (29) — Nice to have

### Code Style
- [ ] **STYLE-01** `shared/src/utils.ts` — Consider moving functions to separate modules
- [ ] **STYLE-02** `shared/src/` — Add JSDoc to all public exports
- [x] **STYLE-03** `simplestore/test/store.test.ts` — Extract `3600` to `ONE_HOUR` constant
- [x] **STYLE-04** `simplestore/test/store.test.ts` — Move `FailingDynamoDB` to mockDynamoDB.ts
- [x] **STYLE-05** `simplestore/test/handler.test.ts` — Improve test names to be more specific
- [x] **STYLE-06** `simplestore/test/handler.test.ts` — Remove duplicate tests for `{}` vs `null` params
- [x] **STYLE-07** `audio-api/src/handler.ts` — Use `TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH` directly
- [x] **STYLE-08** `vabamorf-api/src/handler.ts` — Read version from package.json
- [x] **STYLE-09** `vabamorf-api/src/vmetajson.ts` — Log stderr instead of ignoring
- [x] **STYLE-10** `gherkin-parser/src/index.ts` — Add semicolons for consistency
- [x] **STYLE-11** `frontend/services/repository/TaskRepository.ts` — Be consistent with `?? []`

### Testing Improvements
- [x] **TEST-07** `simplestore/test/boundary.test.ts` — Add Estonian characters test (õ, ä, ö, ü)
- [x] **TEST-08** `simplestore/test/boundary.test.ts` — Add emoji in data test (already exists)
- [x] **TEST-09** `simplestore/test/boundary.test.ts` — Add very long string test (already exists)
- [x] **TEST-10** `shared/src/hash.test.ts` — Add more edge case tests

### Documentation
- [x] **DOC-06** Root — Add `.nvmrc` for Node version
- [x] **DOC-07** Root — Add SECURITY.md for vulnerability reporting
- [x] **DOC-08** Root — Add GitHub Issue templates
- [x] **DOC-09** `README.md` — Remove internal URLs, add contributor-friendly instructions
- [x] **DOC-10** `BACKLOG.md` — Review for internal/sensitive context (clean)

### Frontend Polish
- [ ] **FE-08** `frontend/src/components/ui/` — Add lazy loading for icons
- [ ] **FE-09** `frontend/src/` — Add skeleton loaders
- [ ] **FE-10** `frontend/src/` — Migrate inline styles to CSS modules or Tailwind
- [ ] **FE-11** `frontend/src/services/` — Add centralized error handling
- [ ] **FE-12** `frontend/src/services/` — Add retry logic for network requests
- [ ] **FE-13** `frontend/src/services/` — Consistent naming (camelCase vs PascalCase)
- [ ] **FE-14** `frontend/src/services/` — Add JSDoc for public methods

### Specifications
- [ ] **SPEC-01** `packages/specifications/` — Add specs for error handling
- [ ] **SPEC-02** `packages/specifications/` — Add specs for edge cases

---

## Progress Tracking

| Severity | Total | Done | Remaining |
|----------|-------|------|-----------|
| 🔴 Critical | 20 | 0 | 20 |
| 🟠 Medium | 43 | 0 | 43 |
| 🟡 Low | 29 | 0 | 29 |
| **Total** | **92** | **0** | **92** |

---

*Generated: 2026-02-05 by злобный код-ревьюер Eve*
