# US-020 Golden Use Case - Part 1 (Phases 0-4)

**Goal:** Implement "Add synthesis entries to task" as golden reference  
**Status:** 🚧 In Progress | **Created:** 2025-12-15  
**State:** Zustand (UI) + React Query (server)  
**See also:** [Part 2](US-020-golden-usecase-part2.md)

---

## Phase 0: Project Setup ✅

- [x] Add Zustand, TanStack Query, Zod, Cucumber, Vitest
- [x] Create src/core/, features/, services/, components/
- [x] Create test/features/ for E2E Gherkin

---

## Phase 1: Gherkin Specifications (BDD First)

### 1.1 Feature Files
- [ ] Create US-020-add-synthesis-to-task.feature
- [ ] Define Background, Scenarios (add to existing, create new, unauth, errors)

### 1.2 Step Definitions (Red Phase)
- [ ] Create step definitions file
- [ ] Implement auth/synthesis/task/action/assertion steps
- [ ] Verify all tests fail (Red)

---

## Phase 2: Core Logic Layer

### 2.1 Type Definitions (Zod Schemas)
- [ ] Define SynthesisEntry, Task, TaskEntry schemas
- [ ] Define API request/response schemas
- [ ] Export TypeScript types

### 2.2 Pure Logic Functions
- [ ] Create audio hash (SHA-256), text normalization, task entry builder
- [ ] Write unit tests (80% coverage)

---

## Phase 3: Audio Pipeline

### 3.1 Vabamorf Integration
- [ ] Define client interface, implement /api/analyze, write tests

### 3.2 Merlin TTS Integration
- [ ] Define client interface, implement /api/synthesize
- [ ] Implement voice model selection (efm_s/efm_l), write tests

### 3.3 S3 Audio Cache
- [ ] Define cache key format, implement GET/PUT, failover logic, tests

---

## Phase 4: Authentication Layer

### 4.1 Cognito Setup
- [ ] Configure Amplify Auth, create AuthContext

### 4.2 Auth Hooks
- [ ] Create useAuth (login/logout/refresh/userId)

### 4.3 Protected Routes
- [ ] Create ProtectedRoute, redirect logic, tests

---

## Checkpoints

| Phase | Status |
|-------|--------|
| 0 | ✅ |
| 1-4 | ⬜ |

**TDD:** Red → Green → Refactor
