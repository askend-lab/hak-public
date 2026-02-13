# HAK Refactoring Plan (Round 3)

## Overview

Deep analysis of the entire HAK project — documentation, architecture, all 10 packages, CI/CD pipelines, Terraform infrastructure, frontend patterns, and security posture. Compared architecture docs against actual implementation. Found 10 significant refactoring candidates.

## Candidates

### 🔴 CRITICAL (CI/CD / Security)

#### 1. CI Build Change Detection Ignores @hak/shared — Dependent Packages Not Rebuilt
- **File:** `.github/workflows/build.yml:96-113`
- **Problem:** Change detection only checks `packages/frontend/`, `packages/simplestore/`, `packages/audio-api/`, `packages/merlin-api/`, `packages/vabamorf-api/`. Changes to `packages/shared/` (lambda utils, CORS headers, constants, logger) do NOT trigger rebuilds of any dependent package. A breaking change to `@hak/shared` will deploy stale artifacts.
- **Also missing:** `packages/tara-auth/`, `packages/merlin-worker/` are not in the change matrix at all.
- **Fix:** Add `shared` change detection. If shared changes, rebuild all packages that depend on it (frontend, audio-api, merlin-worker, simplestore, vabamorf-api, tara-auth). Consider using a dependency graph approach.

#### 2. build-merlin-worker.yml Deploys to Both Dev AND Prod Without Approval Gate
- **File:** `.github/workflows/build-merlin-worker.yml:59-73`
- **Problem:** Every push to `main` that touches `packages/merlin-worker/` force-deploys to BOTH `hak-merlin-dev` AND `hak-merlin-prod` ECS clusters simultaneously. No environment separation, no approval step, no smoke test between environments. A broken worker goes straight to production.
- **Fix:** Split into dev deploy (automatic) + prod deploy (manual approval or separate workflow dispatch). Add health check between environments.

#### 3. S3 Website Bucket Publicly Accessible Despite CloudFront OAC
- **File:** `infra/website.tf:38-64`
- **Problem:** The website bucket has `block_public_acls = false` and a bucket policy granting `s3:GetObject` to `Principal = "*"`. This means ALL content is accessible directly via S3 URL, bypassing CloudFront entirely. CloudFront OAC is configured (cloudfront.tf:19-25) but the public policy makes it redundant — anyone can skip the CDN.
- **Impact:** Bypasses CloudFront security headers, caching, and access controls. Also applies to audio bucket (`infra/audio.tf:30-53`) and merlin audio bucket (`infra/merlin/main.tf:94-119`).
- **Fix:** Block all public access on website/audio buckets. Use OAC-only bucket policy (`aws:SourceArn` condition for CloudFront distribution). For audio buckets, use CloudFront signed URLs or OAC.

### 🟡 HIGH (Architecture / Quality)

#### 4. CloudFront Terraform: ~250 Lines of Copy-Pasted Cache Behaviors
- **File:** `infra/cloudfront.tf:78-331`
- **Problem:** 10 nearly identical `ordered_cache_behavior` blocks, each ~25 lines, differing only in `path_pattern`, `target_origin_id`, and minor header variations. This is ~250 lines of pure copy-paste. Adding a new API route requires copying another 25-line block.
- **Fix:** Define a `locals` map of `{ path_pattern → origin_id }` and use `dynamic "ordered_cache_behavior"` block with `for_each`. Reduces 250 lines to ~30.

#### 5. vabamorf-api Handler Redefines HTTP_STATUS and MAX_TEXT_LENGTH Locally
- **File:** `packages/vabamorf-api/src/handler.ts:29-36`
- **Problem:** Defines a local `HTTP_STATUS` with `INTERNAL_ERROR: 500` (key differs from shared's `INTERNAL_SERVER_ERROR: 500`). Also duplicates `MAX_TEXT_LENGTH = 10_000` with a comment "Kept in sync with @hak/shared TEXT_LIMITS" — but it's not in sync, it's manually duplicated. If the shared constant changes, this stays stale.
- **Fix:** Import `HTTP_STATUS` and `TEXT_LIMITS` from `@hak/shared`. Rename usage of `INTERNAL_ERROR` to `INTERNAL_SERVER_ERROR`.

#### 6. Response Utility Boilerplate Duplicated Across 4 Backend Packages
- **Files:**
  - `packages/audio-api/src/response.ts:14-19` — `createResponse(statusCode, body)`
  - `packages/merlin-api/src/response.ts:14-19` — `createResponse(statusCode, body)`
  - `packages/vabamorf-api/src/validation.ts:10-15` — `createResponse(statusCode, body)`
  - `packages/simplestore/src/lambda/routes.ts:39-48` — `createResponse(statusCode, body)`
- **Problem:** All 4 packages define their own `createResponse()` that does the same thing: `createLambdaResponse(statusCode, body, { ...CORS_HEADERS })`. Plus `createBadRequest()`, `createErrorResponse()`, `createSuccessResponse()` variants in individual packages. The pattern `import from shared → wrap → re-export` is repeated everywhere.
- **Fix:** Add `createApiResponse()`, `createBadRequest()`, `createInternalError()` to `@hak/shared/lambda.ts`. Remove per-package response wrappers.

#### 7. Merlin ECR: Mutable Image Tags + Security Scanning Disabled
- **File:** `infra/merlin/main.tf:126-135`
- **Problem:** Merlin ECR repository has `image_tag_mutability = "MUTABLE"` and `scan_on_push = false`. Meanwhile, vabamorf-api ECR (`infra/ecr.tf:4,7`) correctly uses `IMMUTABLE` tags and `scan_on_push = true`. Mutable tags allow image replacement (`:latest` can be overwritten), and disabled scanning means vulnerabilities go undetected.
- **Fix:** Set `image_tag_mutability = "IMMUTABLE"`, `scan_on_push = true`. Stop pushing `:latest` tag in `build-merlin-worker.yml`.

#### 8. DynamoDB IAM Policy: "agent-readonly" User Has Full Write Permissions
- **File:** `infra/dynamodb.tf:37-61`
- **Problem:** IAM policy is attached to user `agent-readonly` but grants `PutItem`, `UpdateItem`, `DeleteItem`, `Scan` — full CRUD access. Name implies read-only but permissions are read-write. Violates principle of least privilege and is misleading.
- **Fix:** Either rename the user to reflect actual permissions, or split into separate read-only and read-write policies with appropriate user assignments.

### 🟢 CODE QUALITY

#### 9. Frontend: 47 console.log/error/warn Calls Instead of Shared Logger
- **Files:** 24 frontend source files (biggest offenders: `useTaskHandlers.ts` 8 calls, `useSentenceState.ts` 4 calls, `SimpleStoreAdapter.ts` 4 calls)
- **Problem:** The project has a structured `logger` in `@hak/shared` that's imported in `dataService.ts`, but 47 other call sites use raw `console.error()` / `console.log()`. No structured logging, no log levels, inconsistent error reporting. The quality system docs say "no console.log" but it's not enforced in frontend.
- **Fix:** Replace all `console.error/warn/log` with `logger.error/warn/debug` from `@hak/shared`. Add ESLint rule `no-console` for frontend package.

#### 10. useTaskHandlers is a 344-Line God Hook
- **File:** `packages/frontend/src/hooks/useTaskHandlers.ts` (344 lines, returns 20+ functions/state values)
- **Problem:** Single hook handles: task CRUD (create, update, delete), modal state management, task sharing, notifications with actions, navigation, auth guards, dropdown state, and sentence-to-task operations. Violates single responsibility — any change to sharing logic requires reading through 344 lines of unrelated CRUD code.
- **Fix:** Split into focused hooks: `useTaskCRUD` (create/update/delete), `useTaskSharing` (share flow), `useTaskEntries` (add sentences to tasks). Keep `useTaskHandlers` as a thin composition layer.

## Priority Order

1. **#1** — CI shared package detection (build correctness)
2. **#2** — Merlin worker dual-env deploy (prod safety)
3. **#3** — S3 bucket public access (security)
4. **#7** — Merlin ECR security (security)
5. **#8** — DynamoDB IAM naming (security hygiene)
6. **#4** — CloudFront Terraform DRY (maintainability)
7. **#5** — vabamorf-api shared imports (architecture)
8. **#6** — Response utility consolidation (architecture)
9. **#9** — Frontend logger migration (code quality)
10. **#10** — useTaskHandlers split (code quality)
