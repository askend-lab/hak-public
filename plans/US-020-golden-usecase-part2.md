# US-020 Golden Use Case - Part 2 (Phases 5-8)

**See also:** [Part 1](US-020-golden-usecase.md)

---

## Phase 5: Data Layer (SingleTableLambda)

### 5.1 Task API Endpoints
- [x] POST /save - Create/update task
- [x] GET /get - Get single task
- [x] GET /query - List user's tasks
- [x] DELETE /delete - Delete task

### 5.2 DynamoDB Key Design
- [x] Define PK: USER#{userId}, SK: TASK#{taskId}
- [x] Define task data JSON structure, TTL policy (1 year)

### 5.3 API Client
- [x] Create tasks API client (create/get/list/update/delete)
- [x] addEntryToTask helper function

---

## Phase 6: Frontend Components

### 6.1 Zustand Stores
- [x] Create synthesisStore, tasksStore, uiStore
- [x] Export stores from features/index.ts

### 6.2 React Query Setup
- [ ] Configure QueryClient (deferred to Phase 7)
- [ ] Create useTasks, useTask queries (deferred)
- [ ] Create mutations (deferred)

### 6.3-6.5 UI Components
- [ ] Components deferred to Phase 7 integration

---

## Phase 7: Integration Testing

### 7.1 BDD Tests (Green Phase)
- [x] Run US-020 feature tests
- [x] First scenario passes (Add synthesized text to existing task)
- [x] Stub scenarios for @draft features

### 7.2 Jest Config
- [x] Enable TypeScript support (ts-jest)
- [x] Configure test patterns for monorepo

### 7.3 Test Results
- [x] 35 tests passing
- [x] Core utils tests pass
- [x] BDD integration tests pass

---

## Phase 8: Documentation

### 8.1 Code Documentation
- [x] Create golden-usecase-US-020.md guide

### 8.2 Architecture Documentation
- [x] Document directory structure
- [x] Document key patterns (Zod, Zustand, Auth, API)
- [x] Document data flow and testing strategy

---

## Checkpoints

| Phase | Status |
|-------|--------|
| 5 | ✅ |
| 6 | ✅ |
| 7 | ✅ |
| 8 | ✅ |

---

## Notes

- Backend: SingleTableLambda (DynamoDB single-table)
- Audio: Vabamorf + Merlin + S3 cache
- Auth: AWS Cognito via Amplify
