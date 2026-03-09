# SEC-01: Closing All Endpoints Behind Authentication

**Date:** 2026-03-09
**Author:** Kate (Askend-lab Development Team)
**Status:** Analysis complete, ready for implementation
**Referenced in:** SLA.md §7.1 ("All endpoints (after SEC-01 fix)")

---

## 0. Implementation Checklist (TDD)

### Decisions (confirmed with Alex)
- [x] UI stays exactly as-is — all pages and buttons remain accessible without login
- [x] When user triggers synthesize/analyze/variants → redirect to login if not authenticated
- [x] After login, resume the original request (synthesize continues)
- [x] `/get-shared`, `/get-public` — stay open (sharing UX)
- [x] S3 audio (MP3/WAV) — stays open (if you have cacheKey, you can play it)
- [x] Demo synthesis in onboarding wizard — always from S3 cache, no login needed
- [x] Health endpoints — stay open (monitoring)

### Step 1: Frontend — Write Tests First (RED)

_Write failing tests that define the expected auth-gated behavior._

- [ ] **T-F1.** `synthesize.test.ts` — test: `synthesizeWithPolling()` throws/rejects when no access token (not authenticated)
- [ ] **T-F2.** `synthesize.test.ts` — test: `synthesizeWithPolling()` sends `Authorization: Bearer <token>` header when authenticated
- [ ] **T-F3.** `synthesize.test.ts` — test: `pollForAudio()` sends auth header in status polling requests
- [ ] **T-F4.** `synthesize.test.ts` — test: on 401 response from API, triggers login redirect (not error toast)
- [ ] **T-F5.** `analyzeApi.test.ts` — test: `analyzeText()` throws/rejects when no access token
- [ ] **T-F6.** `analyzeApi.test.ts` — test: `analyzeText()` sends `Authorization: Bearer <token>` header when authenticated
- [ ] **T-F7.** `analyzeApi.test.ts` — test: `postJSON()` to `/api/variants` sends auth header
- [ ] **T-F8.** `analyzeApi.test.ts` — test: on 401 response, triggers login redirect
- [ ] **T-F9.** Integration test: demo synthesis in onboarding works without login (plays from S3 cache)
- [ ] **T-F10.** Integration test: after login redirect, synthesis resumes

### Step 2: Frontend — Implement (GREEN)

_Make the failing tests pass._

- [ ] **F1.** `synthesize.ts` — if no access token, trigger login redirect instead of calling API
- [ ] **F2.** `synthesize.ts` — add auth header to `/api/status/{key}` polling calls
- [ ] **F3.** `analyzeApi.ts` — add `Authorization: Bearer <token>` header to `/api/analyze` and `/api/variants`
- [ ] **F4.** `analyzeApi.ts` — if no access token, trigger login redirect before calling analyze/variants
- [ ] **F5.** Add 401 response handler — show LoginModal, not error toast
- [ ] **F6.** Verify `buildSynthOpts()` already sends access token for `/api/synthesize` ✅ (confirmed)

### Step 3: Backend — Write Tests First (RED)

_Write failing tests for API Gateway auth rejection._

- [ ] **T-B1.** `handler.test.ts` (tts-api) — test: request without Authorization header is rejected (mock authorizer behavior)
- [ ] **T-B2.** `handler.test.ts` (tts-api) — test: request with valid JWT passes through
- [ ] **T-B3.** `handler.test.ts` (tts-api) — test: `/health` endpoint works without auth
- [ ] **T-B4.** `handler.test.ts` (morphology-api) — test: request without auth header is rejected
- [ ] **T-B5.** `handler.test.ts` (morphology-api) — test: request with valid JWT passes through
- [ ] **T-B6.** `handler.test.ts` (morphology-api) — test: `/health` works without auth

### Step 4: Backend — Implement (GREEN)

_Add JWT authorizers to make tests pass._

- [ ] **B1.** `packages/tts-api/serverless.yml` — add JWT Authorizer (Cognito) to `/synthesize` and `/status/{cacheKey}`
- [ ] **B2.** `packages/tts-api/serverless.yml` — remove `HttpApiRoutePostSynthesize` resource override (`AuthorizationType: NONE`)
- [ ] **B3.** `packages/morphology-api/serverless.yml` — add JWT Authorizer (Cognito) to `/analyze` and `/variants`
- [ ] **B4.** Both serverless.yml — add SSM references for `cognito-user-pool-id` and `cognito-client-id`

### Step 5: Infrastructure

- [ ] **I1.** `infra/locals.tf` — set `auth = true` for `/api/analyze`, `/api/variants`, `/api/synthesize`, `/api/status/*`

### Step 6: Existing Tests — Verify No Regressions (REFACTOR)

- [ ] **T-R1.** All existing synthesize tests still pass
- [ ] **T-R2.** All existing analyzeApi tests still pass
- [ ] **T-R3.** All existing store tests still pass (no changes to store)
- [ ] **T-R4.** `/get-shared`, `/get-public` tests still pass (no auth added)
- [ ] **T-R5.** Demo synthesis in onboarding still works

### Step 7: Deploy & Smoke Test

- [ ] **D1.** Deploy to dev (serverless deploy for TTS + Morphology)
- [ ] **D2.** Apply Terraform (CloudFront header forwarding)
- [ ] **D3.** Deploy frontend (build + S3 sync)
- [ ] **D4.** Manual smoke test on dev:
  - [ ] Unauthenticated user → try synthesize → redirected to login
  - [ ] After login → synthesis works
  - [ ] Cached audio plays without login
  - [ ] `/health` endpoints return 200
  - [ ] `/get-shared`, `/get-public` work without auth
  - [ ] Demo onboarding works without login
- [ ] **D5.** Deploy to prod
- [ ] **D6.** Update SLA.md §7.1 — remove "(after SEC-01 fix)"

---

## 1. Current State

### 1.1 Architecture Overview

All API traffic flows through **CloudFront** → API Gateway origins. There is no direct public access to API Gateways (no custom DNS, no public endpoints).

```
Browser → CloudFront (WAF) → /api/*   → API Gateway origins
                            → /auth/* → Auth API origin
                            → /*      → S3 (SPA)
```

CloudFront Function rewrites paths:
- `/api/save` → `/save` (to simplestore-api)
- `/api/analyze` → `/analyze` (to vabamorf-api)
- `/api/synthesize` → `/synthesize` (to merlin-api)
- `/auth/tara/start` → `/tara/start` (to auth-api)

### 1.2 Endpoint Auth Inventory

| Endpoint | Service | API Type | Auth at Gateway | Auth at App | Status |
|----------|---------|----------|-----------------|-------------|--------|
| `POST /api/save` | Store | REST v1 | ✅ Cognito Authorizer | ✅ userId from claims | **OK** |
| `GET /api/get` | Store | REST v1 | ✅ Cognito Authorizer | ✅ userId from claims | **OK** |
| `DELETE /api/delete` | Store | REST v1 | ✅ Cognito Authorizer | ✅ userId from claims | **OK** |
| `GET /api/query` | Store | REST v1 | ✅ Cognito Authorizer | ✅ userId from claims | **OK** |
| `GET /api/get-shared` | Store | REST v1 | ❌ None | ⚠️ App allows anonymous | **OPEN** |
| `GET /api/get-public` | Store | REST v1 | ❌ None | ⚠️ App allows anonymous | **OPEN** |
| `GET /api/health` (store) | Store | REST v1 | ❌ None | ✅ Returns `{status: ok}` | **OK** (health) |
| `POST /api/synthesize` | TTS | HTTP v2 | ❌ None | ❌ None | **🔴 OPEN** |
| `GET /api/status/{key}` | TTS | HTTP v2 | ❌ None | ❌ None | **🔴 OPEN** |
| `GET /api/health` (tts) | TTS | HTTP v2 | ❌ None | ✅ Returns `{status: ok}` | **OK** (health) |
| `POST /api/analyze` | Morphology | HTTP v2 | ❌ None | ❌ None | **🔴 OPEN** |
| `POST /api/variants` | Morphology | HTTP v2 | ❌ None | ❌ None | **🔴 OPEN** |
| `GET /api/health` (morph) | Morphology | HTTP v2 | ❌ None | ✅ Returns `{status: ok}` | **OK** (health) |
| `GET /auth/tara/start` | Auth | REST v1 | ❌ None | N/A (initiates flow) | **OK** (auth flow) |
| `GET /auth/tara/callback` | Auth | REST v1 | ❌ None | N/A (TARA redirect) | **OK** (auth flow) |
| `POST /auth/tara/refresh` | Auth | REST v1 | ❌ None | ✅ httpOnly cookie | **OK** (auth flow) |
| `POST /auth/tara/exchange-code` | Auth | REST v1 | ❌ None | ✅ CSRF + code verifier | **OK** (auth flow) |
| `GET /auth/tara/health` | Auth | REST v1 | ❌ None | ✅ Returns `{status: ok}` | **OK** (health) |

### 1.3 Summary of Issues

**4 endpoints are fully open** (no auth at any layer):
1. `POST /api/synthesize` — triggers ECS Fargate workers, costs real money
2. `GET /api/status/{key}` — reveals cache state
3. `POST /api/analyze` — runs native Vabamorf binary
4. `POST /api/variants` — runs native Vabamorf binary

**2 endpoints intentionally open** (by design):
5. `GET /api/get-shared` — read-only access to shared content
6. `GET /api/get-public` — read-only access to public content

### 1.4 Current Protections (partial)

Even without endpoint auth, these mitigations exist:
- **WAF rate limit**: 2000 req/5min per IP (general), 200 req/5min for `/synthesize`
- **WAF geo-blocking**: `/synthesize` restricted to Baltic/Nordic IPs
- **CORS**: `allowedOrigins` restricts browser-side cross-origin requests
- **No public DNS**: API Gateways only reachable through CloudFront

**These are insufficient** because:
- WAF rate limits are per-IP, not per-user (easily bypassed with rotating IPs)
- CORS only restricts browsers, not `curl`/scripts
- Geo-blocking is easily bypassed with VPN
- `/synthesize` costs real money per request (ECS Fargate)

---

## 2. Target State

All data and compute endpoints require a valid JWT token. Only health checks and auth flow endpoints remain open.

| Endpoint | Target Auth |
|----------|-------------|
| `POST /api/synthesize` | ✅ JWT required |
| `GET /api/status/{key}` | ✅ JWT required |
| `POST /api/analyze` | ✅ JWT required |
| `POST /api/variants` | ✅ JWT required |
| `GET /api/get-shared` | ❓ Decision needed (see §4) |
| `GET /api/get-public` | ❓ Decision needed (see §4) |
| Health endpoints | ❌ Stay open (monitoring) |
| Auth flow endpoints | ❌ Stay open (login requires no auth) |

---

## 3. Implementation Plan

### 3.1 Layer Analysis: Where to Add Auth

There are 3 possible layers to enforce auth:

| Layer | Mechanism | Pros | Cons |
|-------|-----------|------|------|
| **A. API Gateway** | Cognito Authorizer (REST v1) or JWT Authorizer (HTTP v2) | Rejects before Lambda runs → lowest cost; standard AWS pattern | REST v1 ≠ HTTP v2 config; need different setup per API type |
| **B. CloudFront** | Lambda@Edge or CF Function | Single point of enforcement | Complex; adds latency; hard to debug; CF Functions can't validate JWTs |
| **C. Application** | Middleware in Lambda handler | Easy to implement; full control | Lambda still invoked → cost; each service implements independently |

**Recommendation: Layer A (API Gateway) for all services.**
- Store API already uses this pattern (Cognito Authorizer on REST v1)
- TTS API and Morphology API use HTTP v2 → use JWT Authorizer

### 3.2 Changes by Service

#### 3.2.1 TTS API (merlin-api) — HTTP API v2

**File:** `packages/tts-api/serverless.yml`

Current state: `AuthorizationType: NONE` explicitly set in resources block.

Changes needed:
1. Add JWT authorizer referencing Cognito User Pool
2. Attach authorizer to `/synthesize` and `/status/{cacheKey}` routes
3. Exclude `/health` from auth
4. Forward `Authorization` header in CloudFront (`locals.tf`)

```yaml
# Add to provider.httpApi:
httpApi:
  authorizers:
    cognitoAuthorizer:
      type: jwt
      identitySource: $request.header.Authorization
      issuerUrl: https://cognito-idp.eu-west-1.amazonaws.com/${ssm:/hak/${self:provider.stage}/cognito-user-pool-id}
      audience:
        - ${ssm:/hak/${self:provider.stage}/cognito-client-id}

# Update function events:
functions:
  synthesize:
    events:
      - httpApi:
          path: /synthesize
          method: POST
          authorizer:
            name: cognitoAuthorizer
  status:
    events:
      - httpApi:
          path: /status/{cacheKey}
          method: GET
          authorizer:
            name: cognitoAuthorizer
  health:
    # No authorizer — stays open
```

Remove the `HttpApiRoutePostSynthesize` resource override that sets `AuthorizationType: NONE`.

#### 3.2.2 Morphology API (vabamorf-api) — HTTP API v2

**File:** `packages/morphology-api/serverless.yml`

Same pattern as TTS API:

```yaml
# Add to provider.httpApi:
httpApi:
  authorizers:
    cognitoAuthorizer:
      type: jwt
      identitySource: $request.header.Authorization
      issuerUrl: https://cognito-idp.eu-west-1.amazonaws.com/${ssm:/hak/${self:provider.stage}/cognito-user-pool-id}
      audience:
        - ${ssm:/hak/${self:provider.stage}/cognito-client-id}

# Update function events:
functions:
  api:
    events:
      - httpApi:
          path: /analyze
          method: POST
          authorizer:
            name: cognitoAuthorizer
      - httpApi:
          path: /variants
          method: POST
          authorizer:
            name: cognitoAuthorizer
      - httpApi:
          path: /health
          method: GET
          # No authorizer
```

#### 3.2.3 CloudFront (Terraform)

**File:** `infra/locals.tf`

Update `api_routes` to forward `Authorization` header for TTS and Morphology routes:

```hcl
# Change auth = false → auth = true for these routes:
{ path = "/api/analyze",    origin = "vabamorf-api",    rewrite = true, auth = true, ... },
{ path = "/api/variants",   origin = "vabamorf-api",    rewrite = true, auth = true, ... },
{ path = "/api/synthesize", origin = "merlin-api",      rewrite = true, auth = true, ... },
{ path = "/api/status/*",   origin = "merlin-api",      rewrite = true, auth = true, ... },
```

This makes CloudFront forward the `Authorization` header to the API Gateway origins (currently stripped for these routes).

#### 3.2.4 Frontend

**File:** `packages/frontend/src/features/synthesis/utils/analyzeApi.ts`

The `analyzeText()` and `postJSON()` calls to `/api/analyze` and `/api/variants` currently **don't send any auth token**. Need to add `Authorization: Bearer <token>` header.

The `synthesize.ts` already sends `Bearer ${token}` for `/api/synthesize` (via `buildSynthOpts`), so TTS is partially ready.

Changes needed:
1. Update `postJSON()` in `analyzeApi.ts` to include auth token for analyze/variants calls
2. Verify all callers of `/api/analyze` and `/api/variants` pass tokens
3. Update `pollForAudio()` to include auth token for `/api/status` calls

#### 3.2.5 SSM Parameters

Both TTS and Morphology APIs need access to Cognito parameters:
- `/hak/{stage}/cognito-user-pool-id` (already exists — used by Store and Auth)
- `/hak/{stage}/cognito-client-id` (already exists — used by Auth)

No new SSM parameters needed.

---

## 4. Decision Points

### 4.1 Should `/get-shared` and `/get-public` require auth?

**Current behavior:** These endpoints allow anonymous read access for:
- Shared task links (`/shared/task/:token`)
- Public content

**Options:**
- **A. Keep open** — shared links work without login (better UX for teachers sharing with students)
- **B. Close behind auth** — all data access requires login (stricter security, but breaks sharing UX)
- **C. Move to a separate signing mechanism** — signed URLs or short-lived tokens (complex but best of both)

**Recommendation: Option A** — keep open for now. These are read-only, and the `type` filter prevents accessing private data. The `PUBLIC_ALLOWED_TYPES` guard already restricts to `shared`, `unlisted`, `public` types only.

### 4.2 Which token: Access Token or ID Token?

**Current state in HAK:**
- Store API uses **ID Token** (Cognito REST v1 authorizer default)
- Synthesis API sends **Access Token** (via `AuthStorage.getAccessToken()`)

**For HTTP API v2 JWT Authorizer:**
- Can validate either token type
- Access Token is the standard OAuth2 choice for API access
- ID Token is what Cognito REST v1 authorizer uses

**Recommendation:** Use **Access Token** for HTTP v2 APIs (TTS, Morphology). This is the OAuth2 standard. Update the `audience` config to match the access token's audience (`aws.cognito.signin.user.admin` scope or client ID).

### 4.3 Per-user rate limiting (future)

With auth in place, we can implement per-user rate limits as defined in SLA §5.1:
- 10 synthesis/min per user
- 20 morphology/min per user

This is a **Phase 2** enhancement — can be done via:
- API Gateway usage plans + API keys (REST v1)
- Lambda middleware extracting `sub` from JWT (HTTP v2)
- WAF custom header-based rules

---

## 5. Rollout Plan

### Phase 1: Add auth to TTS and Morphology APIs
1. Update `serverless.yml` for both services (JWT authorizer)
2. Update `locals.tf` (forward Authorization header)
3. Update frontend to send tokens for analyze/variants/status calls
4. Test locally and in dev
5. Deploy to dev, verify all flows work
6. Deploy to prod

### Phase 2: Per-user rate limiting
1. Extract user ID from JWT in Lambda middleware
2. Implement rate counter (DynamoDB or in-memory)
3. Return 429 when limits exceeded

### Phase 3: Audit and monitoring
1. Add CloudWatch metrics for auth failures (401/403)
2. Add alarm for elevated auth failure rates
3. Review WAF rules — can reduce rate limits now that auth is in place

---

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token expiration during long synthesis polling | User gets 401 mid-flow | Frontend already has refresh logic; ensure polling retries with fresh token |
| Cognito outage blocks all API access | All endpoints return 401 | Health endpoints stay open; monitoring detects quickly |
| Breaking change for `/get-shared` | Shared links stop working | Keep `/get-shared` and `/get-public` open (Option A) |
| Frontend sends wrong token type | 401 from API Gateway | Test both token types in dev; verify audience config |

---

## 7. Files to Modify

| File | Change |
|------|--------|
| `packages/tts-api/serverless.yml` | Add JWT authorizer, attach to synthesize + status |
| `packages/morphology-api/serverless.yml` | Add JWT authorizer, attach to analyze + variants |
| `infra/locals.tf` | Set `auth = true` for 4 routes |
| `packages/frontend/src/features/synthesis/utils/analyzeApi.ts` | Add auth headers to analyze/variants calls |
| `packages/frontend/src/features/synthesis/utils/synthesize.ts` | Add auth headers to status polling |
| `internal/SLA.md` | Update §7.1 to remove "(after SEC-01 fix)" |
