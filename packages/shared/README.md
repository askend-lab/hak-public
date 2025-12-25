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
