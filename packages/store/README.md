# SimpleStore

Universal key-value backend using AWS DynamoDB single-table design.

## How It Works

SimpleStore uses a single DynamoDB table to store any type of data. Client requests contain:
- **pk** — entity identifier (e.g., `"user-settings"`)
- **sk** — sub-identifier (e.g., `"theme"`)
- **type** — access level (`private` / `unlisted` / `public` / `shared`)
- **data** — JSON payload
- **ttl** — expiration in seconds (`0` = no expiration, max 1 year)

In DynamoDB, client keys are transformed into composite keys:
- **PK** = `app#tenant#env#type[#userId]` (userId appended for private)
- **SK** = `entityPk#entitySk`

Each stored item also includes `owner`, `createdAt`, `updatedAt`, and an optional `ttl` (DynamoDB TTL epoch).

Data is isolated by app/tenant/environment via a `ServerContext` (app, tenant, env, userId) extracted from authentication. The "Iron Rule": only the owner can modify or delete their records.

## Features

- **Multi-tenancy** — Isolated data per app/tenant/environment
- **Access control** — 4 data types: private, unlisted, public, shared
- **TTL** — `0` = no expiration, positive = auto-expire (max 1 year)
- **Iron Rule** — Only owners can modify/delete

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/save` | Create/update item |
| GET | `/get?pk=...&sk=...&type=...` | Get item |
| DELETE | `/delete?pk=...&sk=...&type=...` | Delete (owner only) |
| GET | `/query?prefix=...&type=...` | List by prefix |

## Data Types

| Type | Access |
|------|--------|
| `private` | Owner only — sees and modifies |
| `unlisted` | Owner modifies, anyone with key can read |
| `public` | Everyone sees/searches, owner modifies |
| `shared` | Everyone sees, everyone can modify |

## Deploy

```bash
serverless deploy --stage dev
```

## Test

```bash
pnpm test
