# Task: Migrate from Mock Tasks to SimpleStore Database

## Issue Summary

The frontend currently uses **mock data and localStorage** for task management instead of the deployed **SimpleStore database backend**. This prevents data persistence across devices and makes the app non-functional for real users.

### Current Architecture (Broken)

```
┌─────────────────────────────────────────────────────────┐
│  Frontend                                               │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │ DataService     │───▶│ TaskRepository           │   │
│  └─────────────────┘    └──────────────────────────┘   │
│                                │                        │
│               ┌────────────────┼────────────────┐       │
│               ▼                ▼                ▼       │
│  ┌─────────────────┐  ┌───────────────┐  ┌───────────┐ │
│  │ MockDataLoader  │  │ LocalStorage  │  │ ShareSvc  │ │
│  │ (mock-tasks.json│  │ Adapter       │  │           │ │
│  └─────────────────┘  └───────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────┘
         ▲                      ▲
         │                      │
    Static JSON           Browser Only
    (4 fake tasks)        (no sync)
```

### Target Architecture (Fixed)

```
┌─────────────────────────────────────────────────────────┐
│  Frontend                                               │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │ DataService     │───▶│ TaskRepository           │   │
│  └─────────────────┘    └──────────────────────────┘   │
│                                │                        │
│                                ▼                        │
│                    ┌──────────────────────┐             │
│                    │ SimpleStoreClient    │             │
│                    │ (NEW - HTTP Client)  │             │
│                    └──────────────────────┘             │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼ HTTPS + Bearer Token
              ┌──────────────────────────────────┐
              │  SimpleStore API                 │
              │  hak-api-{stage}.askend-lab.com  │
              └──────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────────┐
              │  DynamoDB                        │
              │  (already deployed)              │
              └──────────────────────────────────┘
```

---

## Files to Modify

### Create (New Files)

| File | Purpose |
|------|---------|
| `src/services/api/SimpleStoreClient.ts` | HTTP client for SimpleStore API with auth |
| `src/services/api/config.ts` | API base URLs for dev/prod environments |
| `src/services/api/index.ts` | Exports |

### Update (Existing Files)

| File | Changes Needed |
|------|----------------|
| `src/services/repository/TaskRepository.ts` | Replace localStorage/mock calls with API calls |
| `src/services/storage/ShareService.ts` | Use API for shared tasks |
| `src/services/dataService.ts` | Remove MockDataLoader dependency |

### Delete (Remove)

| File | Reason |
|------|--------|
| `src/services/storage/MockDataLoader.ts` | No longer needed |
| `src/services/storage/LocalStorageAdapter.ts` | Replaced by API |
| `public/data/mock-tasks.json` | Static mock data |
| `public/data/mock-users.json` | Using Cognito users instead |

---

## Implementation Details

### 1. Create `SimpleStoreClient.ts`

The client needs to:

- **Base URLs:**
  - Dev: `https://hak-api-dev.askend-lab.com/api`
  - Prod: `https://hak-api.askend-lab.com/api`

- **Authentication:** 
  - Get access token from `AuthStorage.getAccessToken()`
  - Include header: `Authorization: Bearer {token}`
  - Handle 401 responses by refreshing token

- **Methods:**
  ```typescript
  save(pk: string, sk: string, type: DataType, data: object, ttl?: number): Promise<StoreItem>
  get(pk: string, sk: string, type: DataType): Promise<StoreItem | null>
  delete(pk: string, sk: string, type: DataType): Promise<boolean>
  query(prefix: string, type: DataType): Promise<StoreItem[]>
  ```

### 2. Key Structure for Tasks

Use this key structure in SimpleStore:

| Operation | PK | SK | Type |
|-----------|----|----|------|
| User's task | `task#{taskId}` | `meta` | `private` |
| Task entry | `task#{taskId}` | `entry#{entryId}` | `private` |
| Shared task | `task#{taskId}` | `meta` | `unlisted` |
| Task by user | Query prefix `task#` | - | `private` |

### 3. Update `TaskRepository.ts`

Replace each method's implementation:

| Method | Current | New |
|--------|---------|-----|
| `getUserTasks(userId)` | Merge mock + localStorage | `client.query('task#', 'private')` |
| `getTask(taskId, userId)` | Check mock then localStorage | `client.get('task#{taskId}', 'meta', 'private')` |
| `createTask(userId, data)` | Save to localStorage | `client.save('task#{id}', 'meta', 'private', data)` |
| `updateTask(userId, taskId, updates)` | Complex merge logic | `client.save(...)` |
| `deleteTask(userId, taskId)` | Soft delete / localStorage | `client.delete(...)` |

**Remove entirely:**
- All `mockLoader.loadBaselineTasks()` calls
- `baselineAdditions` logic
- `deletedTaskIds` logic (use real deletes)
- Baseline task merge logic

### 4. Update `ShareService.ts`

| Method | Current | New |
|--------|---------|-----|
| `getTaskByShareToken(token)` | Check mock then localStorage | `client.query('share#{token}', 'unlisted')` or use secondary index |
| `shareUserTask(task)` | Save to localStorage | `client.save(...)` with `type: 'unlisted'` |
| `getSharedTask(taskId)` | Check mock first | `client.get(...)` with `type: 'unlisted'` |

### 5. Update `dataService.ts`

Remove:
```typescript
// DELETE these lines
import { MockDataLoader } from './storage/MockDataLoader';
this.mockLoader = new MockDataLoader();
```

---

## Task Data Model Reference

**Task type (from `src/types/task.ts`):**

```typescript
interface Task {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  speechSequences: string[];
  entries: TaskEntry[];
  createdAt: Date;
  updatedAt: Date;
  shareToken: string;
}

interface TaskEntry {
  id: string;
  taskId: string;
  text: string;
  stressedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;  // Note: Blobs can't be stored in DynamoDB
  order: number;
  createdAt: Date;
}
```

**Note:** `audioBlob` cannot be stored in DynamoDB. For audio, either:
- Store only `audioUrl` pointing to S3
- Or use a separate audio storage service

---

## SimpleStore API Reference

The backend is already deployed. API documentation:

| Method | Endpoint | Body/Query |
|--------|----------|------------|
| Save | `POST /api/save` | `{ pk, sk, type, ttl, data }` |
| Get | `GET /api/get?pk=...&sk=...&type=...` | Query params |
| Delete | `DELETE /api/delete?pk=...&sk=...&type=...` | Query params |
| Query | `GET /api/query?prefix=...&type=...` | Query params |

**Data Types:**
- `private` - Only owner can read/modify
- `unlisted` - Anyone with key can read, owner modifies
- `public` - Everyone can search/read, owner modifies

**TTL:** Required, max 1 year (31536000 seconds)

---

## Testing

1. **Unit tests:** Update all TaskRepository tests to mock the API client instead of localStorage
2. **Integration tests:** Cucumber tests already use `InMemoryAdapter` - should still work
3. **Manual testing:** 
   - Create task → Verify in DynamoDB console
   - Refresh page → Task persists
   - Log in on different device → Same tasks appear

---

## Estimated Effort

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Create SimpleStoreClient with auth | 3-4 |
| 2 | Update TaskRepository | 3-4 |
| 3 | Update ShareService | 2-3 |
| 4 | Remove mock files, update DataService | 1 |
| 5 | Update tests | 3-4 |
| 6 | Manual testing + bug fixes | 2-3 |
| **Total** | | **14-19 hours** |

---

## Acceptance Criteria

- [ ] Tasks are saved to DynamoDB via SimpleStore API
- [ ] Tasks persist after page refresh
- [ ] Tasks sync across devices when logged in
- [ ] Shared tasks work via share token
- [ ] No references to `MockDataLoader` or `mock-tasks.json` remain
- [ ] All existing tests pass (with updated mocks)
- [ ] Authentication token is included in all API calls
