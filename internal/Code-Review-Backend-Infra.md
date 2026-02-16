# Code Review: Backend & Infrastructure (excluding Frontend)

**Reviewer:** Luna  
**Date:** 2026-02-16  
**Scope:** All packages except `frontend` — merlin-api, merlin-worker, tara-auth, simplestore, vabamorf-api, shared, gherkin-parser, specifications, infra (Terraform), CI/CD (GitHub Actions)  
**Baseline:** Previous audit `internal/Audit-hak-public.md` (83 findings, 81 resolved). This review focuses on **new findings** not covered by the previous audit.  
**Documentation reviewed:** ADR 001–008, ARCHITECTURE.md, SECURITY.md, API.md, AUTHENTICATION.md, DEPLOYMENT.md, HAK-PUBLIC-SECURITY-PLAN.md, HAK-SECURITY-REMAINING-TASKS.md

---

## Summary

30 new findings. Items from the previous audit that are documented design decisions (ADRs) are **not repeated** here.

**Acknowledged design decisions (NOT findings):**
- Public S3 audio bucket → ADR 006 + prev audit #15, by design
- Non-HttpOnly access/id token cookies → ADR 005, mitigated by CSP
- Inlined CORS/response utilities in merlin-api and vabamorf-api → ARCHITECTURE.md ("inlines shared utilities for Lambda bundling") + prev audit #27
- Per-container warmup rate limit → prev audit #50, httpApi throttle protects
- handleGet returns 200 for not-found → prev audit #29, CloudFront SPA fallback workaround
- loadVersion() via require() → prev audit #52, necessary for CJS Docker builds
- calculateHashSync uses require() → prev audit #53, already @deprecated
- Module-level singleton adapters → prev audit #51, Lambda reuse pattern

Severity scale: 🔴 Critical · 🟠 High · 🟡 Medium  
💥 = fix is **dangerous** — unit tests won't catch regression, requires manual/integration testing  
✅ Tests added for #1, #3, #4, #5 — reduced dangerous from 9 to 4
✅ Fixed in this PR: #2, #3, #4, #5, #6, #11, #12, #13, #14, #19, #20, #24, #25, #28 (14 of 30)

---

## 🔴 CRITICAL

- [ ] **1. run_merlin.py — Shell Injection via `run_process`** (residual from prev audit #20/#21)  
  **File:** `packages/merlin-worker/merlin/run_merlin.py:316-323`  
  **Issue:** Previous audit fixed `worker.py` SOX injection and `generate.py` shell=True. However, `run_merlin.py` still calls `run_process()` with string-concatenated commands: `"rm -f " + TempDir + "/gen-lab/*.*"` and the genlab command on line 322 that concatenates paths without quoting. `run_process` uses `subprocess.Popen(args, shell=True)`. If TempDir contains shell metacharacters, arbitrary command execution is possible.  
  **Fix:** Convert to `subprocess.run()` with argument lists. Since this is third-party Merlin code, wrap calls through a safe helper.  
  **Tests:** `tests/test_safe_subprocess.py` — 15 tests covering safe wrappers for all run_merlin.py commands, including path injection, glob handling, and special characters.

- [x] **2. merlin-worker Fallback Cache Key Uses MD5**  
  **File:** `packages/merlin-worker/worker.py:113`  
  **Issue:** `cache_key=body.get("cacheKey", hashlib.md5(text.encode()).hexdigest())`. MD5 is collision-prone. Two different texts could collide → user hears wrong audio. The API always sends cacheKey (SHA-256), but a manual/malformed SQS message triggers this fallback.  
  **Fix:** Change to `hashlib.sha256`, or reject messages without `cacheKey` entirely.

- [x] **3. simplestore: No Ownership Check on `save` for `public`/`unlisted` Types**  
  **File:** `packages/simplestore/src/core/store.ts:88-105`  
  **Issue:** `save` performs no ownership check. Any authenticated user can overwrite any item including `public` and `unlisted` by sending the same PK/SK. `delete` has `isOwner` check, but `save` does not. Previous audit #18 only fixed delete ownership for shared.  
  **Fix:** For `public` and `unlisted` types, check `isOwner` on upsert when the item already exists. `shared` type should remain open for anyone to modify (by design per API.md).  
  **Tests:** `test/ownership.save.test.ts` — 12 tests (3 currently failing = TDD). Covers public/unlisted rejection, owner update allowed, shared overwrite allowed, new item creation, data preservation after rejected overwrite.

- [x] **4. simplestore: `delete` Has TOCTOU Race Condition**  
  **File:** `packages/simplestore/src/core/store.ts:128-149`  
  **Issue:** `delete` performs `get` (ownership check) then `delete` as two separate DynamoDB operations. Between these calls, another request could change the item. No transactional guarantee.  
  **Fix:** Use `DeleteItem` with `ConditionExpression: "owner = :expectedOwner"` in a single atomic call.  
  **Tests:** `test/delete.atomic.test.ts` — 4 tests with OperationSpyAdapter that records call sequence. Documents current get→delete pattern. After fix, change assertion to expect single `conditionalDelete` call.

- [x] **5. merlin-worker: No Graceful Shutdown on SIGTERM**  
  **File:** `packages/merlin-worker/worker.py:268-283`  
  **Issue:** Worker catches only `KeyboardInterrupt`. On Fargate Spot interruption (SIGTERM), the currently-processing message won't be finished or returned to the queue. It becomes visible again after `VisibilityTimeout` (5 min) and gets re-processed, generating duplicate audio and wasting compute.  
  **Fix:** Register `signal.signal(signal.SIGTERM, handler)` that sets a shutdown flag. Finish the current message before exiting.  
  **Tests:** `tests/test_sigterm.py` — 3 tests (2 xfail = TDD). Subprocess-based SIGTERM test verifies clean exit. Checks for `_shutdown_requested` flag. KeyboardInterrupt backward-compat test.

- [x] **6. tara-auth: `findUserByEmail` Has No Input Validation (Cognito Filter Injection)**  
  **File:** `packages/tara-auth/src/cognito-client.ts:65-77`  
  **Issue:** `findUserByPersonalCode` validates format with regex `^[A-Z]{2}\d{11}$`, but `findUserByEmail` uses the email directly in Cognito `Filter: email = "${email}"`. TARA is a government IdP (trusted), but defense-in-depth suggests validating email format. A crafted email with `"` characters could manipulate the filter expression.  
  **Fix:** Add email format validation (regex or dedicated library) before using in filter string.

- [ ] **7. CloudWatch Alarms Only Monitor SimpleStore**  
  **File:** `infra/cloudwatch-alarms.tf`  
  **Issue:** All CloudWatch alarms (5XX errors, 4XX errors, Lambda errors, latency) monitor only the `simplestore` API. No alarms exist for `merlin-api`, `vabamorf-api`, or `tara-auth`. A complete outage of TTS, morphological analysis, or authentication goes unnoticed.  
  **Fix:** Add alarms for all API Gateway endpoints and Lambda functions. At minimum: 5XX rate and Lambda error rate per service.

- [ ] **8. No DLQ Alarm — Failed Messages Pile Up Silently**  
  **File:** `infra/merlin/main.tf:32-38`  
  **Issue:** The SQS dead letter queue (`merlin_dlq`) has no CloudWatch alarm. Failed synthesis messages silently accumulate for 14 days with no notification. Teachers won't know why their audio wasn't generated.  
  **Fix:** Add `ApproximateNumberOfMessagesVisible > 0` alarm on the DLQ, connected to the existing SNS alert topic.

- [ ] � **9. Terraform: `terraform apply` Runs for Both Environments Without Approval Gate**  
  **File:** `.github/workflows/terraform.yml:110-119`  
  **Issue:** On merge to main, `terraform apply` runs for both `dev` and `prod` environments with `max-parallel: 1`. DEPLOYMENT.md says app deployments to prod are manual, but infra changes auto-apply to both. No environment protection rules or manual approval for prod infra.  
  **Fix:** Add GitHub environment protection rules requiring manual approval for prod, or gate prod terraform apply behind workflow_dispatch.  
  **💥 Why dangerous:** CI/CD workflow change, not unit-testable. Misconfigured approval rules could block urgent infra fixes.

- [ ] 💥 **10. Terraform: Stale Lock Force-Unlock in CI**  
  **File:** `.github/workflows/terraform.yml:147-165`  
  **Issue:** The workflow automatically force-unlocks "stale" state locks before apply. If two workflows overlap (despite max-parallel=1, trigger-time races exist), one could force-unlock the other's active lock → state corruption.  
  **Fix:** Remove auto-unlock. Fail the job and alert. Manual unlock is safer.  
  **💥 Why dangerous:** CI/CD workflow change, not unit-testable. Removing auto-unlock means stale locks require manual intervention — could block all infra deploys until resolved.

---

## 🟡 MEDIUM

- [x] **11. merlin-api: `isValidCacheKey` Doesn't Enforce Length**  
  **File:** `packages/merlin-api/src/s3.ts:72-76`  
  **Issue:** Regex `/^[a-f0-9]+$/` accepts hex of any length. A 100,000-char cache key passes validation and is used in S3 `HeadObject`. SHA-256 hex is exactly 64 chars.  
  **Fix:** Change to `/^[a-f0-9]{64}$/`.

- [x] **12. merlin-worker: `MAX_TEXT_LENGTH` Mismatch (10000 vs 1000)**  
  **Files:** `worker.py:74` (10000), `merlin-api/handler.ts:90` (1000)  
  **Issue:** API validates 1000 chars, worker accepts 10000. Direct SQS messages bypass API validation → 10× longer texts consume disproportionate compute.  
  **Fix:** Align to 1000, or make both configurable from a shared constant.

- [x] **13. merlin-api: `sendToQueue` Returns `""` on Missing MessageId — Silent Failure**  
  **File:** `packages/merlin-api/src/sqs.ts:22`  
  **Issue:** `return result.MessageId ?? ""`. If SQS fails to return a MessageId, the caller returns "processing" to the user, but no message was actually queued. User polls forever.  
  **Fix:** Throw if `MessageId` is falsy.

- [x] **14. simplestore: Double Error Catch Swallows Stack Traces**  
  **Files:** `simplestore/src/core/store.ts` (wrapAsync), `simplestore/src/lambda/handler.ts:162`  
  **Issue:** `wrapAsync` catches all errors and converts to `{ success: false, error: String(error) }`, losing the stack trace. Handler also catches. No logging at the store layer. Debugging production issues is very difficult.  
  **Fix:** Log the full error in `wrapAsync`, or let the store throw and centralize logging at the handler layer.

- [ ] 💥 **15. merlin-worker Dockerfile: boto3 Installed in Wrong Environment**  
  **File:** `packages/merlin-worker/Dockerfile:45,67`  
  **Issue:** Line 45 installs `awscli` (system pip), line 67 installs `boto3` (system pip). But the worker runs in the `mrln_et` conda env. `boto3` from system pip may not be available when conda activates a different Python.  
  **Fix:** Install `boto3` into the conda env: `conda run -n mrln_et pip install boto3`.  
  **💥 Why dangerous:** Dockerfile change, no unit tests. Changing pip target could break import paths. If current setup works by accident (conda inherits system packages), "fixing" it could break the worker.

- [ ] 💥 **16. Terraform: Merlin Worker Uses Default VPC with Public IP**  
  **File:** `infra/merlin/main.tf:381-390,350-354`  
  **Issue:** ECS Fargate service runs in the default VPC with `assign_public_ip = true`. No network segmentation. The worker only needs outbound internet for SQS/S3. tara-auth Lambda already uses a private VPC.  
  **Fix:** Deploy in a private subnet with NAT gateway, or at minimum, restrict the security group to egress-only.  
  **💥 Why dangerous:** Infrastructure change, not unit-testable. VPC/subnet change could break network connectivity to SQS/S3/ECR. Requires NAT gateway (additional cost). Test with actual ECS deploy in dev first.

- [ ] **17. merlin-worker: `pickle.load` on Model Files — Deserialization Risk**  
  **File:** `packages/merlin-worker/merlin/run_merlin.py:93`  
  **Issue:** `pickle.load(open(nnets_file_name, 'rb'))` deserializes neural network model files. Pickle deserialization can execute arbitrary code. If model files in S3 are tampered with (supply chain attack), the worker executes attacker code.  
  **Fix:** Since this is third-party Merlin code, mitigate by: (1) verifying model file checksums on download, (2) restricting S3 model bucket write access.

- [ ] **18. S3 Audio CORS Allows All Origins**  
  **File:** `infra/merlin/main.tf:82-92`  
  **Issue:** `allowed_origins = ["*"]` on the audio bucket CORS. While audio is public by design (ADR 006), wildcard CORS means any third-party site can embed audio and make credentialed cross-origin requests.  
  **Fix:** Restrict `allowed_origins` to the frontend domain(s) only.

- [x] **19. tara-auth: Secrets Manager Fallback to Env Vars in Non-Dev**  
  **File:** `packages/tara-auth/src/tara-client.ts:70-85`  
  **Issue:** If Secrets Manager fetch fails, the code falls back to `process.env.TARA_CLIENT_ID` / `TARA_CLIENT_SECRET`. The fallback has a comment "for local development" but there's no check that this only happens in dev. In prod, if Secrets Manager is temporarily unavailable, plain-text env var secrets would be used (if set), weakening the security posture.  
  **Fix:** Only fall back to env vars when `STAGE=dev` or `IS_OFFLINE=true`.

- [x] **20. tara-auth: `generateTokens` Returns Empty Strings on Missing Tokens**  
  **File:** `packages/tara-auth/src/cognito-client.ts:173-178`  
  **Issue:** `accessToken: authResponse.AuthenticationResult.AccessToken || ''`. If Cognito returns a null AccessToken, the user gets an empty string token set as a cookie. This creates a broken session that's hard to debug.  
  **Fix:** Throw if any required token (accessToken, idToken, refreshToken) is falsy.

- [x] **21. No CI Testing for tara-auth (prev audit #72 — still open)**
  **File:** `.github/workflows/build.yml`
  **Note:** Already fixed — `Test tara-auth` step exists in build.yml (line 181). False positive.

- [ ] **22. No Backend Integration/Smoke Tests (prev audit #73 — still open)**  
  **File:** `scripts/smoke-test.sh`  
  **Issue:** smoke-test.sh exists but only tests HTTP reachability of endpoints. No integration test verifies the SQS→Worker→S3 flow or the TARA→Cognito flow end-to-end. Unit tests pass but the system can still be broken at integration points.  
  **Fix:** Add integration tests for critical paths: (1) synthesize → SQS → worker → S3, (2) TARA callback → Cognito user creation.

- [x] **23. ECS Container Insights Disabled**
  **File:** `infra/merlin/main.tf:166-168`
  **Note:** Already fixed — `containerInsights = "enabled"` in current code. False positive.

- [x] **24. ECR Lifecycle Keeps Only 10 Images**  
  **File:** `infra/merlin/main.tf:137-156`  
  **Issue:** `countNumber = 10`. With immutable tags, once 10 images exist, older ones are deleted. If a rollback is needed beyond 10 deploys, the image is gone. With frequent CI builds, 10 images could cover only a few weeks.  
  **Fix:** Increase to 25-30, or add a "keep tagged with `release-*`" rule.

- [x] **25. vabamorf-api: Queued Requests Not Rejected on Process Exit**  
  **File:** `packages/vabamorf-api/src/vmetajson.ts:103-108`  
  **Issue:** On process exit, only `currentRequest` is failed. Items remaining in `requestQueue` are not rejected — they wait until their individual timeout (default: likely several seconds). Users experience a slow timeout instead of an immediate error.  
  **Fix:** In the `exit` handler, drain `requestQueue` and reject all pending requests immediately.

- [ ] **26. gherkin-parser: State Machine Lacks Max Nesting Depth**  
  **File:** `packages/gherkin-parser/src/parser.ts`  
  **Issue:** The parser has no limit on nesting depth (Rules containing Scenarios containing Examples with deep docstrings). A malicious or malformed .feature file could cause excessive memory usage or stack issues.  
  **Fix:** Add a MAX_DEPTH constant and reject files exceeding it.

- [ ] **27. specifications Package Is a Pure Re-Export — Unnecessary Indirection**  
  **File:** `packages/specifications/index.ts`  
  **Issue:** The entire package re-exports `parseFeatureContent` and types from `@hak/gherkin-parser` with zero added logic. This adds a dependency hop, a build step, and a package.json to maintain.  
  **Fix:** Have consumers import directly from `@hak/gherkin-parser`. Remove the `specifications` package or add actual spec content to justify its existence.  
  **Safety:** TypeScript compiler catches broken imports at build time. All consumers are in the monorepo.

- [x] **28. merlin-api: S3 Bucket URL Built from Env Var Without Validation**  
  **File:** `packages/merlin-api/src/s3.ts:37-39`  
  **Issue:** `buildAudioUrl` constructs an S3 URL from `getS3Bucket()` (env var) and the cache key. If the env var is misconfigured (empty or contains special chars), the returned URL is malformed, but no validation occurs. The user gets a broken audio URL.  
  **Fix:** Validate bucket name format on Lambda cold start. Fail fast if misconfigured.

- [ ] **29. Terraform: CloudFront Cache Invalidation Not Managed**  
  **File:** `infra/cloudfront.tf`  
  **Issue:** Terraform manages the CloudFront distribution but has no invalidation mechanism. After infrastructure changes (e.g., origin path changes), stale cached content can persist for up to 24h (default TTL). The deploy workflow handles invalidation, but Terraform changes don't.  
  **Fix:** Add a `null_resource` with `local-exec` provisioner for invalidation after relevant changes, or document this as a manual step.

- [ ] **30. merlin-worker: No Health Check or Liveness Probe**  
  **File:** `infra/merlin/main.tf:298-332`  
  **Issue:** The ECS task definition has no health check. If the worker process hangs (e.g., stuck in TTS processing), ECS considers it healthy indefinitely. Messages accumulate in SQS with no recovery.  
  **Fix:** Add a container-level health check that verifies the worker process is responsive, or use SQS `ApproximateAgeOfOldestMessage` alarm as a proxy health signal.

---

Previous audit items still open: prev #72 (= #21 above), prev #73 (= #22 above).
