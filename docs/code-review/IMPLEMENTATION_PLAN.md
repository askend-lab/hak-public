# Implementation Plan: Code Review Findings

**Total: 92 issues** | 🔴 Critical: 20 | 🟠 Medium: 43 | 🟡 Low: 29

---

## 🔴 CRITICAL (20) — Must fix before open source

### Security & Credentials
- [ ] **AUTH-01** `frontend/services/auth/config.ts` — Move Cognito config to env vars (userPoolId, clientId, domain)
- [ ] **AUTH-02** `frontend/services/auth/config.ts` — Remove duplicated `exchangeCodeForTokens()`, use only context version
- [ ] **INFRA-01** `.github/workflows/*.yml` — Move AWS Account ID to GitHub secrets
- [ ] **INFRA-02** `.github/workflows/*.yml` — Move S3 bucket names to env/secrets
- [ ] **INFRA-03** `infra/*.tf` — Move terraform state bucket to variable

### API & Backend
- [ ] **VABA-01** `vabamorf-api/src/vmetajson.ts` — Fix race condition: add request queue instead of single pending promise
- [ ] **VABA-02** `vabamorf-api/src/vmetajson.ts` — Rename `process` variable to `vmetajsonProcess` (shadows global)
- [ ] **VABA-03** `vabamorf-api/src/validation.ts` — Add CORS headers to `createResponse()`
- [ ] **MERL-01** `merlin-api/src/handler.ts` — Replace MD5 with SHA-256 for cache key generation
- [ ] **MERL-02** `merlin-api/src/handler.ts` — Remove hardcoded `eu-west-1` from S3 URL, use env var
- [ ] **MERL-03** `merlin-api/src/handler.ts` — Add CORS headers to all responses
- [ ] **AUDIO-01** `audio-api/src/handler.ts` — Remove hardcoded S3 URL format, use CloudFront or env
- [ ] **AUDIO-02** `audio-api/src/config.ts` — Delete dead `getConfig()` or use it consistently

### Shared & Core
- [ ] **SHARED-01** `shared/src/hash.ts` — Replace `require('crypto')` with dynamic import for ESM
- [ ] **SHARED-02** `shared/src/logger.ts` — Add runtime validation for LOG_LEVEL instead of unsafe cast
- [ ] **STORE-01** `simplestore/src/core/store.ts` — Add ownership check to `get()` for private items
- [ ] **STORE-02** `simplestore/src/adapters/dynamodb.ts` — Add pagination to `queryBySortKeyPrefix()`
- [ ] **STORE-03** `simplestore/src/lambda/handler.ts` — Replace global mutable adapter with proper DI

### Open Source Requirements
- [ ] **OSS-01** Root — Add LICENSE file (MIT recommended)
- [ ] **OSS-02** Root — Add CONTRIBUTING.md with setup instructions

---

## 🟠 MEDIUM (43) — Should fix for quality

### Architecture & Design
- [ ] **ARCH-01** `simplestore/src/core/types.ts` — Extract `StoreConfig` from `store.ts`, avoid duplication
- [ ] **ARCH-02** `simplestore/src/core/store.ts` — Preserve `createdAt` on update, only change `updatedAt`
- [ ] **ARCH-03** `frontend/services/repository/TaskRepository.ts` — Split into smaller classes (SRP violation)
- [ ] **ARCH-04** `vabamorf-api/src/handler.ts` — Use `TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH` from shared
- [ ] **ARCH-05** `vabamorf-api/src/vmetajson.ts` — Make timeout configurable via env var
- [ ] **ARCH-06** `audio-api/src/index.ts` — Extract CORS headers to shared helper
- [ ] **ARCH-07** `audio-api/src/hash.ts` — Delete file, use `@hak/shared` directly
- [ ] **ARCH-08** `merlin-api/src/handler.ts` — Add centralized `createResponse()` helper
- [ ] **ARCH-09** `gherkin-parser/src/index.ts` — Add Scenario Outline support

### Error Handling & Validation
- [ ] **ERR-01** `simplestore/src/core/validation.ts` — Add max length validation for pk/sk
- [ ] **ERR-02** `simplestore/src/lambda/routes.ts` — Return specific error for anonymous user ID
- [ ] **ERR-03** `audio-api/src/sqs.ts` — Add retry logic with exponential backoff
- [ ] **ERR-04** `audio-api/src/s3.ts` — Replace unsafe `as S3Error` cast with type guard
- [ ] **ERR-05** `frontend/services/auth/context.tsx` — Add JWT signature verification or server-side validation
- [ ] **ERR-06** `frontend/services/repository/TaskRepository.ts` — Use `crypto.randomUUID()` instead of Math.random

### Testing
- [ ] **TEST-01** `simplestore/test/setup.ts` — Reset env vars in afterEach to prevent test pollution
- [ ] **TEST-02** `simplestore/test/handler.test.ts` — Replace `expect([200,500]).toContain()` with deterministic assertions
- [ ] **TEST-03** `simplestore/test/store.test.ts` — Add test for update existing item behavior
- [ ] **TEST-04** `simplestore/test/mockDynamoDB.ts` — Unify with `InMemoryAdapter` from adapters
- [ ] **TEST-05** `simplestore/test/*.test.ts` — Add concurrent access tests
- [ ] **TEST-06** `shared/src/constants.test.ts` — Replace snapshot-like tests with meaningful assertions

### Documentation & Config
- [ ] **DOC-01** Root `package.json` — Add `repository`, `bugs`, `homepage` fields
- [ ] **DOC-02** `infra/` — Add `terraform.tfvars.example` with required variables
- [ ] **DOC-03** `.github/` — Add `dependabot.yml` for automated updates
- [ ] **DOC-04** `.github/` — Configure GitHub Environments for secrets isolation
- [ ] **DOC-05** Root — Add `.env.example` with all required env vars

### Frontend
- [ ] **FE-01** `frontend/services/auth/config.ts` — Move hardcoded ports (5181, 4001) to env
- [ ] **FE-02** `frontend/services/repository/TaskRepository.ts` — Don't mutate objects after creation
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
- [ ] **STYLE-03** `simplestore/test/store.test.ts` — Extract `3600` to `ONE_HOUR` constant
- [ ] **STYLE-04** `simplestore/test/store.test.ts` — Move `FailingDynamoDB` to mockDynamoDB.ts
- [ ] **STYLE-05** `simplestore/test/handler.test.ts` — Improve test names to be more specific
- [ ] **STYLE-06** `simplestore/test/handler.test.ts` — Remove duplicate tests for `{}` vs `null` params
- [ ] **STYLE-07** `audio-api/src/handler.ts` — Use `TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH` directly
- [ ] **STYLE-08** `vabamorf-api/src/handler.ts` — Read version from package.json
- [ ] **STYLE-09** `vabamorf-api/src/vmetajson.ts` — Log stderr instead of ignoring
- [ ] **STYLE-10** `gherkin-parser/src/index.ts` — Add semicolons for consistency
- [ ] **STYLE-11** `frontend/services/repository/TaskRepository.ts` — Be consistent with `|| []` vs `?? []`

### Testing Improvements
- [ ] **TEST-07** `simplestore/test/boundary.test.ts` — Add Estonian characters test (õ, ä, ö, ü)
- [ ] **TEST-08** `simplestore/test/boundary.test.ts` — Add emoji in data test
- [ ] **TEST-09** `simplestore/test/boundary.test.ts` — Add very long string test
- [ ] **TEST-10** `shared/src/hash.test.ts` — Add more edge case tests

### Documentation
- [ ] **DOC-06** Root — Add `.nvmrc` for Node version
- [ ] **DOC-07** Root — Add SECURITY.md for vulnerability reporting
- [ ] **DOC-08** Root — Add GitHub Issue templates
- [ ] **DOC-09** `README.md` — Remove internal URLs, add contributor-friendly instructions
- [ ] **DOC-10** `BACKLOG.md` — Review for internal/sensitive context

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
