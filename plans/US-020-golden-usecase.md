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
- [x] Create US-020-add-synthesis-to-task.feature
- [x] Define Background, Scenarios (add to existing, create new, unauth, errors)

### 1.2 Step Definitions (Red Phase)
- [x] Create step definitions file
- [x] Implement auth/synthesis/task/action/assertion steps
- [x] Verify all tests fail (Red)

---

## Phase 2: Core Logic Layer

### 2.1 Type Definitions (Zod Schemas)
- [x] Define SynthesisEntry, Task, TaskEntry schemas
- [x] Define API request/response schemas
- [x] Export TypeScript types

### 2.2 Pure Logic Functions
- [x] Create audio hash, text normalization, task entry builder
- [x] Write unit tests (23 test cases)

---

## Phase 3: Audio Pipeline

### 3.1 Vabamorf Integration
- [x] Define client interface, implement /api/analyze, write tests

### 3.2 Merlin TTS Integration
- [x] Define client interface, implement /api/synthesize
- [x] Implement voice model selection (efm_s/efm_l), write tests

### 3.3 S3 Audio Cache
- [x] Define cache key format, implement GET/PUT, failover logic, tests

---

## Phase 4: Authentication Layer

### 4.1 Cognito Setup
- [x] Configure Amplify Auth, create AuthContext

### 4.2 Auth Hooks
- [x] Create useAuth (login/logout/refresh/userId)

### 4.3 Protected Routes
- [x] Create ProtectedRoute, redirect logic, useRequireAuth

---

## Checkpoints

| Phase | Status |
|-------|--------|
| 0-4 | ✅ |
| 5-8 | ⬜ |

**TDD:** Red → Green → Refactor
