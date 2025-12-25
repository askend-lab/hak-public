# SimpleStore

Universal key-value backend using AWS DynamoDB single-table design.

## How It Works

SimpleStore uses a single DynamoDB table to store any type of data. Each record has:
- **pk** (partition key) - entity identifier (e.g., "user-settings")
- **sk** (sort key) - sub-identifier (e.g., "theme")
- **type** - access level (public/shared/private)
- **data** - JSON payload
- **ttl** - expiration time (mandatory, max 1 year)

Data is isolated by app/tenant/environment. The "Iron Rule": only the owner can modify or delete their records.

## Features

- **Multi-tenancy** - Isolated data per app/tenant/environment
- **Access control** - Public, shared, private data types
- **Auto-expiration** - Mandatory TTL (max 1 year)
- **Iron Rule** - Only owners can modify/delete

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
| `public` | All authenticated users |
| `shared` | Same tenant |
| `private` | Owner only |

## Deploy

```bash
serverless deploy --stage dev
```

## Test

```bash
npm test
