# Error Handling Analysis

**Date:** 2026-02-23
**Scope:** All 7 backend packages + frontend service layer

---

## Current Patterns

### Pattern 1: Handler try/catch → log + HTTP response (auth, tts-api, store)

```typescript
try { /* business logic */ }
catch (error) {
  log.error('Context:', error instanceof Error ? error.message : UNKNOWN_ERROR);
  return createLambdaResponse(500, { error: 'User-friendly message' }, headers);
}
```

**Used in:** auth/handler.ts (4×), tts-api/handler.ts (2×), store/handler.ts (1×)

### Pattern 2: wrapAsync with Result type (store/core)

```typescript
private async wrapAsync(fn): Promise<StoreResult> {
  try { return await fn(); }
  catch (error) {
    logger.error("[SimpleStore] Operation failed:", error);
    return { success: false, error: extractErrorMessage(error, "Unknown error") };
  }
}
```

**Used in:** store/core/store.ts — wraps all CRUD operations

### Pattern 3: Throw + let caller handle (cognito-client, tara-client)

```typescript
if (!response.ok) {
  logger.error('TARA token exchange failed', { status: response.status });
  throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
}
```

**Used in:** auth/tara-client.ts (2×), auth/cognito-client.ts (3×)

### Pattern 4: createInternalErrorResponse helper (shared → tts-api)

```typescript
// shared/lambda.ts
export function createInternalErrorResponse(context: string, error: unknown): LambdaResponse {
  logger.error(`${context}:`, error instanceof Error ? error.message : String(error));
  return createApiResponse(500, { error: "Internal server error" });
}
```

**Used in:** tts-api via `createInternalError()` alias. Closest to a unified pattern.

### Pattern 5: Custom error classes (store, tts-api)

```typescript
export class VersionConflictError extends Error { name = "VersionConflictError"; }
export class QueueFullError extends Error { name = "QueueFullError"; }
```

**Used in:** store/adapters/dynamodb.ts, tts-api/sqs.ts — only 2 custom errors in entire backend

### Pattern 6: AWS SDK error type narrowing (shared/s3.ts)

```typescript
function isS3Error(error: unknown): error is S3Error { ... }
export function isNotFoundError(error: unknown): boolean { ... }
```

**Used in:** shared/s3.ts — custom type guard for AWS S3 errors

### Pattern 7: Silent catch with null return (cognito-client)

```typescript
private async findUserByPersonalCode(code: string): Promise<string | null> {
  try { ... }
  catch { return null; } // silently swallows ALL errors
}
```

**Used in:** cognito-client.ts (findUserByPersonalCode, findUserByEmail)

### Pattern 8: Local handleError function (morphology-api)

```typescript
function handleError(error: unknown): APIGatewayProxyResult {
  logger.error(PROCESSING_ERROR_PREFIX, error instanceof Error ? error.message : String(error));
  return createResponse(500, { error: `Processing error: Unknown error` });
}
```

**Used in:** morphology-api/handler.ts — local pattern, doesn't use shared utilities

---

## Issues Found

### ERR-I1: Inconsistent error message extraction (3 variants)

| Variant | Location |
|---------|----------|
| `error instanceof Error ? error.message : UNKNOWN_ERROR` | auth/handler.ts |
| `error instanceof Error ? error.message : String(error)` | store, tts-api, morphology-api, cognito-client |
| `extractErrorMessage(error, "Unknown error")` | store/core/store.ts |

`extractErrorMessage()` already exists in `shared/lambda.ts` but is only used in 1 place.

### ERR-I2: Error re-wrapping loses stack traces

```typescript
// cognito-client.ts:191 — wraps error, loses original stack
throw new Error(`Token generation failed: ${error}`);
```

`${error}` calls `.toString()` on the Error object which gives `Error: original message` but the new Error gets a fresh stack trace pointing to the throw site, not the original failure.

### ERR-I3: Silent error swallowing (2 locations)

- `cognito-client.ts:findUserByPersonalCode` — catches all errors, returns null
- `cognito-client.ts:findUserByEmail` — catches all errors, returns null

Network errors, permission errors, throttling — all silently swallowed.

### ERR-I4: No unified error response format

| Package | Error response shape |
|---------|---------------------|
| auth | `{ error: 'string' }` |
| store | `{ error: 'string' }` or `{ errors: ['string'] }` |
| tts-api | `{ error: 'string' }` |
| morphology-api | `{ error: 'Processing error: Unknown error' }` |

Mostly consistent `{ error: 'string' }` but store validation uses `{ errors: [...] }`.

### ERR-I5: Response construction varies by package

| Package | Response helper |
|---------|----------------|
| auth | `createLambdaResponse()` from shared + manual headers |
| store | local `createResponse()` in routes.ts |
| tts-api | `createApiResponse()` from shared (via alias) |
| morphology-api | local `createResponse()` in validation.ts |

### ERR-I6: No custom error hierarchy

Only 2 custom error classes: `VersionConflictError`, `QueueFullError`. No base `AppError` class. No way to distinguish operational errors (expected failures) from programmer errors (bugs).

### ERR-I7: morphology-api duplicates shared utilities

morphology-api has its own `HTTP_STATUS`, `createResponse()`, `LambdaResponse` type instead of using shared versions.

---

## Best Practices (Lambda/serverless)

1. **Operational vs programmer errors** — Operational errors (bad input, not found, auth failure) should return appropriate HTTP status. Programmer errors (null reference, type error) should return 500 and alert.
2. **Never expose internal errors to clients** — Always return generic "Internal server error" for 500s. Log the real error server-side.
3. **Error extraction utility** — Single function to safely extract error message from `unknown`.
4. **Handler wrapper** — Higher-order function that catches unhandled errors, logs them, and returns 500.
5. **Custom error classes with HTTP status** — `AppError` base class with `statusCode` and `code` fields.
6. **Never silently swallow errors** — At minimum log a warning when catching and returning null/default.
7. **Preserve error chains** — Use `cause` option: `throw new Error('context', { cause: originalError })`.

---

## Recommendations

### ERR-1: Use extractErrorMessage everywhere (QUICK WIN)

Replace all 3 variants of error message extraction with the existing `extractErrorMessage()` from shared. Currently only used in store/core/store.ts.

### ERR-2: Add AppError base class to shared

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}
```

Subclasses: `ValidationError(400)`, `NotFoundError(404)`, `AuthError(401/403)`, `ExternalServiceError(502)`.

### ERR-3: Create wrapLambdaHandler() in shared

```typescript
export function wrapLambdaHandler(
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>,
  handlerName: string,
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event) => {
    const log = logger.withContext({ handler: handlerName, requestId: event.requestContext?.requestId });
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof AppError && error.isOperational) {
        log.warn(error.message, { code: error.code });
        return createApiResponse(error.statusCode, { error: error.message });
      }
      log.error('Unhandled error', extractErrorMessage(error, 'Unknown error'));
      return createApiResponse(500, { error: 'Internal server error' });
    }
  };
}
```

### ERR-4: Fix silent catches in cognito-client

Add warning-level logging to `findUserByPersonalCode` and `findUserByEmail`.

### ERR-5: Fix error re-wrapping in cognito-client

```typescript
// Before (loses stack trace):
throw new Error(`Token generation failed: ${error}`);
// After (preserves chain):
throw new Error('Token generation failed', { cause: error });
```

### ERR-6: Migrate morphology-api to shared response utilities

Replace local `HTTP_STATUS`, `createResponse()`, `LambdaResponse` with imports from `@hak/shared`.

---

## Statistics

| Metric | Count |
|--------|-------|
| Backend try/catch blocks | 17 |
| Error extraction variants | 3 |
| Custom error classes | 2 |
| Silent error swallowing | 2 locations |
| Error re-wrapping (loses stack) | 1 location |
| Packages using shared response utils | 2/4 (tts-api, auth partially) |
| Packages with local response utils | 2/4 (store, morphology-api) |

---

## Implementation Priority

1. **ERR-1** (QUICK WIN) — Use `extractErrorMessage` everywhere
2. **ERR-4** (QUICK WIN) — Fix silent catches in cognito-client
3. **ERR-5** (QUICK WIN) — Fix error re-wrapping
4. **ERR-2** (MEDIUM) — Add `AppError` base class to shared
5. **ERR-6** (MEDIUM) — Migrate morphology-api to shared response utils
6. **ERR-3** (LARGER) — Create `wrapLambdaHandler()` — requires updating all 4 packages
