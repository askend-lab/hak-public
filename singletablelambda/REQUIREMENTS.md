# Single Table Lambda - Universal Backend Specification

## 1. Overview

**Purpose:** Lightweight, universal backend for rapid prototyping and MVPs.

**Problem:** Setting up full SQL databases for each prototype is expensive and overkill.

**Solution:** Single Table DynamoDB pattern - simple storage that saves, retrieves, queries, and deletes objects.

---

## 2. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| Save | POST | Create/update an object |
| Get | GET | Retrieve object by key |
| Delete | DELETE | Remove an object |
| Query | GET | List objects by prefix |

---

## 3. Request/Response Format

### Client Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pk` | String | Yes | Entity identifier (last part of partition key) |
| `sk` | String | Yes | Sort key (client-defined) |
| `type` | String | Yes | Access type: `public`, `shared`, `private` |
| `data` | Object | Save only | JSON payload |
| `ttl` | Number | Yes | Time-to-live in seconds (mandatory, has upper limit) |

### Server-Side Parameters (not from client)

| Parameter | Source | Description |
|-----------|--------|-------------|
| `app` | Hardcoded | Application identifier |
| `tenant` | Hardcoded | Tenant/organization ID |
| `env` | Hardcoded | Environment (dev/staging/prod) |
| `user` | Cognito JWT | Authenticated user ID |

---

## 4. DynamoDB Schema

### Table Configuration

- **Table name:** `single-table-store`
- **Billing:** On-demand (for prototypes)
- **TTL:** Enabled on `ttl` attribute

### Key Structure (UPDATED)

**Partition Key (PK):** Context-based grouping
```
{app}#{tenant}#{env}#{type}[#{userId}]
```
- `userId` included only for `private` type
- Enables exact match queries per user/type context

**Sort Key (SK):** Entity identifier  
```
{entityPk}#{entitySk}
```
- Combines client's pk and sk into compound sort key
- Enables `begins_with` queries for prefix matching

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `PK` | String | Context partition key |
| `SK` | String | Compound sort key (entityPk#entitySk) |
| `data` | Map | JSON payload |
| `owner` | String | Creator's user ID |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `ttl` | Number | Unix timestamp for expiration |

---

## 5. Access Control Rules

### Read Access (by type)

| Type | Who can read |
|------|--------------|
| `public` | Anyone authenticated |
| `shared` | Anyone in same tenant |
| `private` | Only the owner |

### Write/Delete Access

**IRON RULE:** Only the `owner` can modify or delete a record.

- Regardless of `type` (public/shared/private)
- `owner` is set at creation time from JWT
- Cannot be changed

---

## 6. Security Implementation

### Authentication
- AWS Cognito + API Gateway
- User ID extracted from JWT token (cannot be spoofed)

### Data Isolation
- `app`, `tenant`, `env` are server-side (hardcoded)
- User cannot manipulate these values
- Private data includes user hash in PK → inaccessible via other type queries

### TTL Constraints
- Mandatory field (client must specify)
- Upper limit enforced (no eternal data)

---

## 7. Infrastructure

| Component | Technology |
|-----------|------------|
| Compute | AWS Lambda |
| Database | DynamoDB |
| Auth | Cognito + API Gateway |
| Deployment | Serverless Framework |

---

## 8. Example Usage

### Save Object
```json
{
  "pk": "user-settings",
  "sk": "theme",
  "type": "private",
  "ttl": 2592000,
  "data": { "color": "dark", "fontSize": 14 }
}
```

### Query by Prefix
```json
{
  "pk": "user-",
  "type": "private"
}
```
Returns all private records starting with "user-" for current user.

---

*Specification created: 2025-12-11*
