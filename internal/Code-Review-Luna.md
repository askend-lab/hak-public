# Code Review — All Packages Except Frontend

**Reviewer:** Luna
**Date:** 2026-02-15
**Scope:** simplestore, merlin-api, merlin-worker, vabamorf-api, tara-auth, shared, gherkin-parser, specifications, CI/CD workflows

### Status Legend
- ✅ FIXED — implemented in PR
- 📝 DOCUMENTED — acknowledged, not fixing now (build complexity)
- 🏗️ BY DESIGN — intentional architectural choice

---

## 🔴 Architecture / DRY / SOLID (10 items)

### 1. 📝 DRY: CORS/response utilities duplicated in 3 packages
`merlin-api/response.ts`, `vabamorf-api/validation.ts`, and `shared/lambda.ts` all define identical `getCorsOrigin()`, `CORS_HEADERS`, `createResponse()`, `LambdaResponse`. Comment says "Inlined from @hak/shared" — every bug fix needs 3 edits.
**Status:** DOCUMENTED — merlin-api and vabamorf-api are standalone Lambda/Docker packages that cannot use workspace dependencies at deploy time. Consolidating would require a published npm package or bundler changes that risk breaking deployments.

### 2. 📝 DRY: S3 utilities duplicated
`merlin-api/s3.ts` has its own `isNotFoundError()`, `buildS3Url()`, `checkFileExists()` — exact same code as `shared/s3.ts`.
**Status:** DOCUMENTED — same reason as #1. Both packages deploy independently without workspace resolution.

### 3. merlin-api VERSION hardcoded
`handler.ts:18` has `export const VERSION = "0.1.0"` hardcoded. Will drift from package.json. `vabamorf-api` does it correctly with `loadVersion()` reading from package.json.
**Fix:** Read from package.json like vabamorf-api does.

### 4. tara-auth handler.ts is a 377-line file with 5 responsibilities
Contains cookie management, CSRF validation, redirect logic, token exchange, and 5 Lambda handlers. Violates Single Responsibility Principle.
**Fix:** Extract cookie utilities, CSRF middleware, and split handlers.

### 5. simplestore: mutable module-level singleton adapter
`handler.ts:35` uses `let sharedAdapter` + `setAdapter()` as hidden global state. Cross-test contamination risk; makes parallel testing impossible.
**Fix:** Use dependency injection via constructor or factory function.

### 6. merlin-api: mutable module-level rate limiter
`handler.ts:93` `let lastWarmupTime = 0` — persists across Lambda invocations within same container. Rate limit is non-deterministic (depends on container reuse).
**Fix:** Use DynamoDB atomic counter or API Gateway throttling for reliable rate limiting.

### 7. vabamorf-api: stateful process singleton
`vmetajson.ts` uses module-level `vmetajsonProcess`, `requestQueue`, `currentRequest`, `buffer`. Impossible to test in parallel; no graceful recovery if process crashes mid-request.
**Fix:** Wrap in a class with proper lifecycle management and auto-restart.

### 8. merlin-api: AWS clients created at module load time
`s3.ts:64`, `sqs.ts:7`, `ecs.ts:11` create clients at import time. Config (region, etc.) is captured once. If env vars change in tests, clients won't reflect it.
**Fix:** Lazy-initialize clients or use factory functions.

### 9. simplestore Store.save() read-before-write race condition
`store.ts:96-102` does GET then PUT. Between read and write, another request could modify the item (TOCTOU). Optimistic locking helps but the read+conditional write should be atomic.
**Fix:** Use DynamoDB UpdateExpression with ConditionExpression in a single call.

### 10. tara-auth: duplicated env validation
Both `refreshHandler` (line 282-286) and `exchangeCodeHandler` (line 345-349) have identical `if (!cognitoDomain || !clientId) throw` blocks.
**Fix:** Extract to a shared `requireCognitoConfig()` helper.

---

## 🔴 Security (8 items)

### 11. tara-auth: TARA_CLIENT_SECRET in plain env var, not Secrets Manager
`tara-client.ts:21` reads `TARA_CLIENT_SECRET` from `process.env`. serverless.yml has `TARA_SECRETS_ARN` but code doesn't use it. Secret is in a plain environment variable visible in AWS Console.
**Fix:** Read secret from Secrets Manager at runtime using the ARN.

### 12. tara-auth: no rate limiting on auth endpoints
`startHandler`, `callbackHandler`, `refreshHandler`, `exchangeCodeHandler` have no rate limiting. Attackers could brute-force refresh or flood TARA.
**Fix:** Add API Gateway throttling or WAF rate rules per endpoint.

### 13. tara-auth: cookie domain `.hostname` includes all subdomains
`handler.ts:31` does `'.' + url.hostname`. Widest possible cookie scope — any compromised subdomain gets access to auth cookies.
**Fix:** Use exact hostname without leading dot, or limit to specific subdomain.

### 14. tara-auth: exchangeCodeHandler leaks tokens in response body
`handler.ts:370` returns `access_token` and `id_token` in JSON body. These can be captured by XSS. The TARA callback handler correctly uses cookies only.
**Fix:** Return tokens only in HttpOnly cookies, not in body. Or accept the risk and document it.

### 15. simplestore: no delimiter validation in user keys
PK/SK are built with `#` delimiter but user input (`pk`, `sk`) isn't checked for `#` character. `pk="foo#bar"` creates ambiguous keys.
**Fix:** Reject or escape delimiter character in user-provided keys.

### 16. vabamorf-api: CORS_HEADERS has hardcoded wildcard
`validation.ts:11` has `"Access-Control-Allow-Origin": "*"` in the constant. `createResponse()` overrides it, but if someone imports `CORS_HEADERS` directly, they get wildcard CORS.
**Fix:** Remove origin from CORS_HEADERS constant; always set it dynamically.

### 17. simplestore: /get-shared anonymous access too broad
`handler.ts:120-123` allows any GET with type `shared|unlisted|public` without auth. Combined with `/get` route (not just `/get-public`), authenticated users could also misuse this.
**Fix:** Anonymous access should only work on `/get-public` endpoint, not `/get`.

### 18. deploy.yml: NPM_TOKEN written to plaintext .npmrc
`deploy.yml:67` writes secret to file. Could leak through `npm config list`, build logs, or error messages.
**Fix:** Use `NODE_AUTH_TOKEN` env var instead of writing to file.

---

## 🟡 Efficiency / Performance (5 items)

### 19. simplestore: Store.save() always reads before write
`store.ts:97` does GET on every save to preserve `createdAt` and manage versions. Doubles DynamoDB costs.
**Fix:** Use DynamoDB `UpdateExpression` with `SET createdAt = if_not_exists(createdAt, :now)`.

### 20. vabamorf-api: serial request queue with no backpressure
`vmetajson.ts` processes one request at a time. Under load, queue grows unbounded → memory leak and timeouts.
**Fix:** Add max queue size; reject requests when full (return 503).

### 21. merlin-api: env vars read on every function call
`s3.ts:77` calls `getS3Bucket()` and `getAwsRegion()` per invocation. These read `process.env` each time. Values don't change during Lambda lifetime.
**Fix:** Cache env values at module load time.

### 22. shared/hash.ts: browser detection in Node.js Lambda context
`hash.ts:37` checks for `window.crypto.subtle`. This is dead code in Lambda. Adds unnecessary complexity and import cost.
**Fix:** Create separate browser/node entry points, or use conditional exports in package.json.

### 23. simplestore DynamoDB: queryBySortKeyPrefix default limit 1000
`dynamodb.ts:102` defaults `maxItems` to 1000 but `Store.query()` passes `MAX_QUERY_ITEMS = 100`. The adapter default is misleading.
**Fix:** Align defaults or remove the adapter default.

---

## 🟡 Code Quality / KISS (5 items)

### 24. vabamorf-api: "No variants found" returns 500
`handler.ts:126` returns `INTERNAL_SERVER_ERROR` for a valid "word not in dictionary" result. Should be 200 with empty array or 404.
**Fix:** Return 200 with `{ word, variants: [] }`.

### 25. simplestore: GET returns 200 for not-found items
`routes.ts:139-141` returns `{ item: null }` with HTTP 200 as a CloudFront workaround. Violates REST semantics.
**Fix:** Configure CloudFront error pages correctly; use proper 404.

### 26. merlin-api: parseRequestBody conflates missing body with bad JSON
`handler.ts:54-63` returns null for both cases. Caller can't provide specific error messages.
**Fix:** Return discriminated union: `{ type: 'missing' } | { type: 'invalid' } | { type: 'ok', data }`.

### 27. gherkin-parser: array mutation via splice in drainTags
`parser.ts:71-72` mutates input array as side effect. Functional approach (return new array, assign empty) would be clearer.
**Fix:** Minor — document or refactor to immutable pattern.

### 28. simplestore: handleGetPublic only blocks "private" type
`routes.ts:186` checks `type === "private"` but doesn't validate type is actually public-readable. Non-existent type strings pass through.
**Fix:** Whitelist allowed types: `shared`, `unlisted`, `public`.

---

## 🟡 CI/CD (4 items)

### 29. No tests for merlin-worker in CI
Build workflow skips merlin-worker. `test:full = echo`. Python tests never run in CI.
**Fix:** Add Python test step in CI or at minimum validate merlin-worker builds.

### 30. build.yml: fork PRs fail on NPM_TOKEN
`secrets.NPM_TOKEN` not available for fork PRs → `pnpm install` fails for external contributors.
**Fix:** Use conditional npm auth or public registry fallback.

### 31. deploy.yml: smoke test failure doesn't fail deployment
`continue-on-error: true` on smoke test means broken deployments are marked as successful.
**Fix:** Remove `continue-on-error` or add a separate alerting step.

### 32. Trivy scan only for vabamorf-api Docker image
merlin-worker Docker image (separate build workflow) has no container vulnerability scanning.
**Fix:** Add Trivy scan to build-merlin-worker.yml.

---

## Summary

| Category | Count | Critical |
|----------|-------|----------|
| Architecture / DRY / SOLID | 10 | #1, #2, #9 |
| Security | 8 | #11, #13, #14 |
| Efficiency | 5 | #19 |
| Code Quality | 5 | #24 |
| CI/CD | 4 | #29, #30 |
| **Total** | **32** | |
