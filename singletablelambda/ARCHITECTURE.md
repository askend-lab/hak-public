# Architecture & Design Decisions

This document explains the architectural choices and their rationale.

## Why Single-Table Design?

DynamoDB single-table design was chosen for:

1. **Cost Efficiency** - One table, one set of capacity units
2. **Simplified Operations** - Single backup, single monitoring
3. **Flexibility** - Store any entity type without schema changes
4. **Query Efficiency** - Related data co-located for efficient access

## Key Structure

### Partition Key (PK)

```
{app}#{tenant}#{env}#{type}[#{userId}]
```

**Why this structure?**

- **app** - Isolates different applications sharing the table
- **tenant** - Multi-tenancy support without separate tables
- **env** - Separate dev/staging/prod data in same table
- **type** - Groups data by visibility (public/shared/private)
- **userId** - Only for private type, ensures user-level isolation

**Why `#` delimiter?**

- Unlikely to appear in natural identifiers
- Visually clear separation
- Configurable via `config.keyDelimiter`

### Sort Key (SK)

```
{entityPk}#{entitySk}
```

**Why compound sort key?**

- Enables `begins_with` queries (DynamoDB requirement)
- `begins_with` only works on sort key, not partition key
- Allows prefix queries like "all user settings"

### Why Not Entity PK in Partition Key?

Initial design had entity PK in partition key:
```
{app}#{tenant}#{env}#{type}#{entityPk}  // WRONG
```

**Problem**: DynamoDB `begins_with` only works on sort key.

**Solution**: Move entity identifier to sort key, keep context in partition key.

## Access Control

### Data Types

| Type | PK Structure | Access |
|------|--------------|--------|
| `public` | `app#tenant#env#public` | Any authenticated user |
| `shared` | `app#tenant#env#shared` | Same tenant |
| `private` | `app#tenant#env#private#userId` | Owner only |

**Why three types?**

- `public` - Shared configurations, resources
- `shared` - Team collaboration within tenant
- `private` - Personal data, drafts, settings

### The Iron Rule

> Only the owner can modify or delete records.

**Why?**

- Prevents data corruption from unauthorized users
- Simple, auditable security model
- Owner stored in `owner` field, set at creation time

**Implementation**:
```typescript
if (!this.isOwner(existing)) {
  return this.failure(ERRORS.ACCESS_DENIED);
}
```

## TTL (Time-To-Live)

### Mandatory TTL

Every item must have a TTL. **Why?**

- Prevents data accumulation
- Automatic cleanup by DynamoDB
- Forces users to think about data lifecycle
- Reduces storage costs

### Maximum 1 Year

TTL cannot exceed 31,536,000 seconds (1 year). **Why?**

- Prevents "forever" data in a prototype system
- Encourages data refresh patterns
- Aligns with typical retention policies

## Error Handling

### Result Objects vs Exceptions

We return `StoreResult` objects instead of throwing exceptions:

```typescript
interface StoreResult {
  success: boolean;
  item?: StoreItem;
  items?: StoreItem[];
  error?: string;
}
```

**Why?**

- Explicit success/failure handling
- No try/catch boilerplate in calling code
- Error messages are data, not control flow
- Easier to test

### Error Constants

```typescript
export const ERRORS = {
  NOT_FOUND: 'Item not found',
  ACCESS_DENIED: 'Access denied: not owner'
} as const;
```

**Why constants?**

- Single source of truth (DRY)
- Type-safe error checking
- Easy to update error messages
- Maps cleanly to HTTP status codes

## Handler Architecture

### Router Pattern

```typescript
const routes: Route[] = [
  { method: 'POST', path: '/save', handler: handleSave },
  { method: 'GET', path: '/get', handler: handleGet },
  // ...
];
```

**Why?**

- Declarative routing
- Easy to add/remove endpoints
- Clear mapping of method+path to handler
- Replaces verbose if/else chains

### Factory Function

```typescript
export function createStore(userId: string): Store {
  return new Store(new DynamoDBAdapter(), createServerContext(userId));
}
```

**Why?**

- Enables dependency injection for testing
- Encapsulates Store creation
- Single place to change DynamoDB client

## Configuration

### Centralized Config

All configuration in `config.ts`:

```typescript
export const config = loadConfig();
```

**Why?**

- Single source of truth
- Easy to mock in tests
- Environment variables in one place
- Type-safe configuration interface

### Environment Variables

Server-side values (app, tenant, env) come from environment, not client.

**Why?**

- Security - client cannot spoof context
- Simplicity - less validation needed
- Deployment flexibility - same code, different config

## Testing Strategy

### In-Memory Mock

`InMemoryDynamoDB` implements `DynamoDBClient` interface:

**Why mock, not real DynamoDB?**

- Fast unit tests (no network)
- Isolated tests (no shared state)
- Free (no AWS costs)
- Predictable (no eventual consistency)

### Interface-Based Testing

Store depends on `DynamoDBClient` interface, not `DynamoDBAdapter`:

**Why?**

- Dependency Inversion Principle
- Easy to swap implementations
- Production uses AWS SDK, tests use mock
- Same Store code, different backends
