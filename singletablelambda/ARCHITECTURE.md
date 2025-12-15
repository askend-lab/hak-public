# Architecture & Design Decisions

## Why Single-Table Design?

- **Cost Efficiency** - One table, one set of capacity units
- **Simplified Operations** - Single backup, single monitoring
- **Flexibility** - Store any entity type without schema changes

## Key Structure

**Partition Key (PK):** `{app}#{tenant}#{env}#{type}[#{userId}]`
- Isolates apps, tenants, environments
- `userId` only for private type

**Sort Key (SK):** `{entityPk}#{entitySk}`
- Enables `begins_with` queries (DynamoDB requirement)
- `begins_with` only works on SK, not PK

**Critical Decision:** Entity identifier in SK, not PK.
Initial wrong design put entityPk in PK, but `begins_with` requires SK.

## Access Control

| Type | PK Structure | Access |
|------|--------------|--------|
| `public` | `app#tenant#env#public` | Any authenticated user |
| `shared` | `app#tenant#env#shared` | Same tenant |
| `private` | `app#tenant#env#private#userId` | Owner only |

**Iron Rule:** Only owner can modify/delete records.
- Prevents unauthorized data corruption
- Owner set at creation, stored in `owner` field

## TTL (Time-To-Live)

- **Mandatory** - Prevents data accumulation, forces lifecycle thinking
- **Max 1 year** - No "forever" data in prototype system

## Error Handling

**Result Objects** instead of exceptions:
- Explicit success/failure, no try/catch boilerplate
- `StoreResult { success, item?, items?, error? }`

**Error Constants** (`ERRORS.NOT_FOUND`, `ERRORS.ACCESS_DENIED`):
- Single source of truth (DRY)
- Maps cleanly to HTTP status codes

## Handler Architecture

**Router Pattern:** Declarative `routes[]` array maps method+path to handler.
- Replaces verbose if/else chains
- Easy to add/remove endpoints

**Factory Function:** `createStore(userId)` enables DI for testing.

## Configuration

**Centralized:** All config in `config.ts`, single source of truth.

**Server-side values** (app, tenant, env) from environment, not client.
- Security: client cannot spoof context
- Flexibility: same code, different config per deployment

## Testing Strategy

**In-Memory Mock:** `InMemoryDynamoDB` implements `DynamoDBClient` interface.
- Fast (no network), isolated, free, predictable

**Interface-Based:** Store depends on interface, not concrete adapter.
- Dependency Inversion Principle
- Production uses AWS SDK, tests use mock
