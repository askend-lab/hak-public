# Logging Analysis

Date: 2026-02-23

---

## Current State

### Logger Implementation

Single shared logger in `packages/shared/src/logger.ts`:
- Levels: `debug`, `info`, `warn`, `error`
- Format: `[ISO timestamp] [LEVEL] message`
- Level filtering via `LOG_LEVEL` env var (default: `info`)
- Plain text output to `console.*` — **not structured / not JSON**
- No correlation IDs, no request context, no metadata fields
- Singleton `logger` instance + `createLogger(minLevel)` factory

### Usage Per Package

| Package | logger calls | Files with logging | Files without logging | Notes |
|---------|-------------|-------------------|----------------------|-------|
| **auth** | 7 | 1 (`handler.ts`) | 5 (`cognito-triggers.ts`, `tara-client.ts`, `cookies.ts`, `middleware.ts`, `cognito-client.ts`) | Only error-level in catch blocks |
| **store** | 1 | 1 (`core/store.ts`) | 8 (`handler.ts`, `routes.ts`, `validation.ts`, `adapters/*`) | Handler swallows errors silently |
| **tts-api** | 0 | 0 | 9 (all files) | **Zero logging** — relies entirely on `createInternalError()` from shared |
| **morphology-api** | 3 | 3 (`handler.ts`, `vmetajson.ts`, `local-server.ts`) | 7 | Minimal — only errors |
| **shared** | 2 | 1 (`lambda.ts`) | — | `createInternalErrorResponse` logs errors |
| **tts-worker** (Python) | 18 | 1 (`worker.py`) | 0 | **Best logging** — info+error, structured, with context |
| **frontend** | 65 | ~29 source + ~25 test | — | Uses `logger` from `@hak/shared` extensively |

### Log Level Distribution (Backend TypeScript, excluding tests)

| Level | Count | Usage |
|-------|-------|-------|
| `error` | 11 | Catch blocks only |
| `warn` | 1 | ALLOWED_ORIGIN not set |
| `info` | 1 | "TARA authentication successful" |
| `debug` | 0 | Never used |

### Log Level Distribution (Frontend, excluding tests)

| Level | Count | Usage |
|-------|-------|-------|
| `error` | 51 | API errors, storage errors, synthesis failures |
| `warn` | 7 | Fallback behaviors, degraded states |
| `info` | 1 | Rare |
| `debug` | 6 | State transitions |

---

## Problems Found

### 🔴 CRITICAL: No structured logging (JSON)

**Problem:** Logger outputs plain text `[timestamp] [LEVEL] message`. CloudWatch Logs Insights, DataDog, and other log aggregators cannot parse fields, filter by metadata, or correlate requests.

**Impact:** Cannot search logs by userId, cacheKey, endpoint, duration, or any structured field. Debugging production issues requires manual grep through raw text.

**Fix:** Switch to JSON format: `{"timestamp":"...","level":"error","message":"...","requestId":"...","userId":"...","package":"auth"}`.

### 🔴 CRITICAL: No request correlation

**Problem:** Zero usage of `requestId`, `correlationId`, or `awsRequestId` in any Lambda handler. Each log line is isolated — impossible to trace a request across services.

**Impact:** When a user reports "my synthesis failed," we cannot trace the request from tts-api → SQS → tts-worker → S3. Each service logs independently with no shared identifier.

**Fix:** Pass `event.requestContext.requestId` (provided by API Gateway) into logger context for every Lambda invocation.

### 🔴 CRITICAL: tts-api has ZERO logging

**Problem:** The entire `tts-api` package (9 source files) contains no `logger.*` calls. The `synthesize` handler, `status` handler, SQS operations, S3 cache checks — all silent. Only `createInternalError()` from shared logs on 500 errors.

**Impact:** Cannot observe: how many synthesis requests, cache hit ratio, queue depth at request time, S3 lookup latency, validation failures. Flying blind in production.

### 🟡 HIGH: store handler swallows errors silently

**Problem:** `store/src/lambda/handler.ts` line 162 has a bare `catch {}` that returns 500 without logging the error. The only logging is in `core/store.ts` (1 call).

**Impact:** If DynamoDB throws, route matching fails, or validation crashes — no record in CloudWatch. Silent failures.

### 🟡 HIGH: auth Cognito triggers have no logging

**Problem:** `cognito-triggers.ts` (DefineAuthChallenge, CreateAuthChallenge, VerifyAuthChallengeResponse) — zero logging. These are security-critical Lambda triggers.

**Impact:** If authentication flow fails or behaves unexpectedly, no way to debug. Challenge state transitions are invisible.

### 🟡 HIGH: No log retention config for Lambda functions

**Problem:** No `logRetentionInDays` in any `serverless.yml`. Lambda auto-creates CloudWatch log groups with **never expire** retention by default.

**Impact:** Unbounded CloudWatch Logs storage costs. Only ECS (90 days) and WAF have explicit retention.

### 🟡 MEDIUM: Only error-level logging in backend

**Problem:** Backend TypeScript uses almost exclusively `logger.error()`. No `info`-level logging for successful operations, no `debug` for development troubleshooting.

**Impact:** Cannot observe normal system behavior — only failures. No request volume metrics from logs, no latency tracking, no business event audit trail.

### 🟡 MEDIUM: Inconsistent error context

**Problem:** Error logging patterns vary:
- auth: `logger.error('TARA start error:', error.message)` — string context
- store: `logger.error("[SimpleStore] Operation failed:", error)` — full error object
- morphology-api: `logger.error(PROCESSING_ERROR_PREFIX, error)` — constant prefix
- shared: `logger.error(\`${context}:\`, error.message)` — template literal

**Impact:** No standard for what context to include in error logs. Some log message only, some log full error, some log neither stack nor message.

### 🟢 LOW: Python worker has good logging (reference implementation)

`tts-worker/worker.py` is the **best-logged component**:
- Uses Python `logging` module with structured format
- Logs at multiple levels: info (start, progress, complete), error (failures), warning (missing tools)
- Includes context: cache_key, text preview, byte count, URL
- Has SIGTERM handling log

This should be the reference for TypeScript logging improvements.

### 🟢 LOW: Frontend logging is adequate

Frontend uses `logger` from `@hak/shared` in 29+ source files. Primarily error-level, but appropriate for a browser context where logs go to DevTools console only.

---

## Recommendations

### Phase 1: Structured JSON Logging (foundation)

1. **Upgrade `shared/src/logger.ts`** to output JSON in Lambda context, plain text in browser/dev
2. **Add `withContext(fields)` method** to attach request metadata per invocation
3. **Standard fields:** `timestamp`, `level`, `message`, `package`, `requestId`, `userId`, `duration`

### Phase 2: Add Logging to Silent Handlers

4. **tts-api:** Add info-level logging to `synthesize()` (cache hit/miss, queue send) and `status()` 
5. **store/handler.ts:** Replace bare `catch {}` with `logger.error()` + error details
6. **auth/cognito-triggers.ts:** Add debug-level logging for challenge state transitions

### Phase 3: Request Correlation

7. **Pass `awsRequestId`** from API Gateway event into logger context in every Lambda handler
8. **Include `cacheKey` in tts-api logs** — enables tracing synthesis flow across tts-api → SQS → tts-worker

### Phase 4: Infrastructure

9. **Add `logRetentionInDays: 30`** to all 4 serverless.yml files (auth, store, tts-api, morphology-api)
10. **CloudWatch Logs Insights saved queries** for common debug scenarios

---

## Statistics

| Metric | Value |
|--------|-------|
| Backend TS files with logging | 6 / 32 (19%) |
| Backend TS `logger.*` calls | 13 total |
| Backend error-only calls | 12 / 13 (92%) |
| Backend info/debug calls | 1 / 13 (8%) |
| Packages with zero logging | 1 (tts-api) |
| Structured/JSON logging | ❌ None |
| Request correlation | ❌ None |
| Log retention configured (Lambda) | ❌ None |
| Frontend logging | ✅ Adequate (65 calls) |
| Python worker logging | ✅ Good (18 calls, multi-level) |
