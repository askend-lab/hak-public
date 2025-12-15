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
- [ ] Run US-020 feature tests
- [ ] Fix failing scenarios (Green)
- [ ] Refactor if needed

### 7.2 Coverage Verification
- [ ] Run coverage report
- [ ] Verify 80% line/branch coverage
- [ ] Add missing tests if needed

### 7.3 Manual Testing
- [ ] Test full flow in dev, error scenarios, edge cases

---

## Phase 8: Documentation

### 8.1 Code Documentation
- [ ] Add JSDoc, component props, README

### 8.2 Architecture Documentation
- [ ] Document state/API/testing patterns
- [ ] Create golden use case guide

---

## Checkpoints

| Phase | Status |
|-------|--------|
| 5 | ✅ |
| 6 | ✅ |
| 7 | ⬜ |
| 8 | ⬜ |

---

## Notes

- Backend: SingleTableLambda (DynamoDB single-table)
- Audio: Vabamorf + Merlin + S3 cache
- Auth: AWS Cognito via Amplify
