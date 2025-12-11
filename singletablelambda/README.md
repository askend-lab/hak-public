# Single Table Lambda

A universal backend module for rapid prototyping using AWS DynamoDB single-table design.

## Overview

Single Table Lambda provides a simple, secure key-value store with:
- **Multi-tenancy** - Isolated data per app/tenant/environment
- **Access control** - Public, shared, and private data types
- **Auto-expiration** - Mandatory TTL with 1-year maximum
- **Iron Rule** - Only owners can modify or delete their data

## Installation

```bash
npm install
npm run build
```

## Quick Start

### As a Lambda Function

Deploy using Serverless Framework:

```bash
serverless deploy --stage dev
```

### As a Module

```typescript
import { Store, DynamoDBAdapter, config } from 'single-table-lambda';

const store = new Store(
  new DynamoDBAdapter(),
  { app: 'myapp', tenant: 'acme', env: 'prod', userId: 'user123' }
);

// Save an item
await store.save({
  pk: 'settings',
  sk: 'theme',
  type: 'private',
  ttl: 86400,
  data: { color: 'dark' }
});

// Get an item
const result = await store.get('settings', 'theme', 'private');

// Query by prefix
const items = await store.query('settings', 'private');

// Delete an item (owner only)
await store.delete('settings', 'theme', 'private');
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/save` | Create or update an item |
| GET | `/get` | Retrieve an item by key |
| DELETE | `/delete` | Delete an item (owner only) |
| GET | `/query` | List items by prefix |

### POST /save

```json
{
  "pk": "user-settings",
  "sk": "theme",
  "type": "private",
  "ttl": 2592000,
  "data": { "color": "dark" }
}
```

### GET /get, DELETE /delete

Query parameters: `pk`, `sk`, `type`

### GET /query

Query parameters: `prefix`, `type`

## Data Types

| Type | Visibility | Use Case |
|------|------------|----------|
| `public` | All authenticated users | Shared resources, configs |
| `shared` | Same tenant | Team data, projects |
| `private` | Owner only | Personal settings, drafts |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `TABLE_NAME` | DynamoDB table name | `single-table-store` |
| `APP_NAME` | Application identifier | `default` |
| `TENANT` | Tenant identifier | `default` |
| `ENVIRONMENT` | Environment name | `dev` |

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

## Documentation

- [Architecture & Design Decisions](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Requirements Specification](./REQUIREMENTS.md)

## License

MIT
