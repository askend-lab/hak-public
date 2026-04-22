# Shared

Shared utilities and functions used across HAK packages.

## Exports

### Hash Functions

```typescript
import { calculateHash, calculateHashSync } from '@hak/shared';

// Async (works in browser and Node.js)
const hash = await calculateHash('text');

// Sync (Node.js only)
const hash = calculateHashSync('text');
```

Both functions return SHA-256 hash as hex string.

### Logger

```typescript
import { createLogger, logger } from '@hak/shared';

// Pre-configured default logger
logger.info('message');

// Custom logger instance
const log = createLogger('my-service');
log.warn('something happened');
```

### Constants

```typescript
import { TEXT_LIMITS, TIMING } from '@hak/shared';

TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH;    // max characters for audio synthesis
TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH; // max characters for morphology
TIMING.POLL_INTERVAL_MS;             // default polling interval
```

### Utility Functions

```typescript
import { sleep, isNonEmpty, isEmpty } from '@hak/shared';

await sleep(1000);          // delay in ms
isNonEmpty('hello');        // true — non-null, non-empty string
isEmpty(null);              // true — null, undefined, or empty string
```

### Lambda Helpers

```typescript
import {
  CORS_HEADERS,
  HTTP_STATUS,
  createLambdaResponse,
  createApiResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
  extractErrorMessage,
} from '@hak/shared';

// Standard Lambda responses with CORS headers
createApiResponse(200, { data: '...' });
createBadRequestResponse('Missing field');
createInternalErrorResponse('Unexpected error');

// Extract message from unknown error
const msg = extractErrorMessage(err, 'fallback message');
```

### Types

```typescript
import type { LambdaResponse, HttpStatusCode } from '@hak/shared';
import type { Logger, LogLevel, LogMethod } from '@hak/shared';
import type { TextLimitKey, TimingKey } from '@hak/shared';
import type { NullableString } from '@hak/shared';
```

## Usage

Add as workspace dependency:

```json
{
  "dependencies": {
    "@hak/shared": "workspace:*"
  }
}
```

## Testing

```bash
pnpm test
```
