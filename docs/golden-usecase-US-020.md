# US-020 Golden Use Case: Add Synthesis Entries to Task

## Overview

This document describes the implementation of US-020 as a "golden use case" - a reference implementation demonstrating the full HAK architecture stack.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  features/           │  services/           │  core/        │
│  ├─ synthesis/       │  ├─ audio/           │  ├─ schemas   │
│  ├─ tasks/           │  ├─ auth/            │  └─ utils     │
│  └─ ui/              │  └─ tasks/           │               │
├─────────────────────────────────────────────────────────────┤
│                     State Management                         │
│         Zustand (UI state) + React Query (server state)     │
├─────────────────────────────────────────────────────────────┤
│                        Backend                               │
│  SingleTableLambda (DynamoDB) │ Vabamorf │ Merlin TTS │ S3  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
packages/frontend/src/
├── core/
│   ├── schemas.ts      # Zod schemas for data validation
│   ├── utils.ts        # Pure utility functions
│   └── index.ts
├── services/
│   ├── audio/
│   │   ├── types.ts    # Audio pipeline types
│   │   ├── vabamorf.ts # Text analysis API client
│   │   ├── merlin.ts   # TTS API client
│   │   ├── cache.ts    # Audio caching service
│   │   ├── synthesis.ts # Main synthesis orchestration
│   │   └── index.ts
│   ├── auth/
│   │   ├── types.ts    # Auth types
│   │   ├── context.tsx # AuthProvider + useAuth
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   └── tasks/
│       ├── types.ts    # Task API types
│       ├── api.ts      # SingleTableLambda client
│       └── index.ts
└── features/
    ├── synthesis/
    │   └── store.ts    # Zustand store for synthesis state
    ├── tasks/
    │   └── store.ts    # Zustand store for tasks
    ├── ui/
    │   └── store.ts    # Zustand store for modals/notifications
    └── index.ts
```

## Key Patterns

### 1. Zod Schema Validation
```typescript
import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  entries: z.array(TaskEntrySchema),
  // ...
});

export type Task = z.infer<typeof TaskSchema>;
```

### 2. Zustand Store
```typescript
export const useTasksStore = create<TasksState & TasksActions>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  // ...
}));
```

### 3. Auth Context
```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  // localStorage persistence, login/logout handlers
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 4. API Client (SingleTableLambda)
```typescript
export async function createTask(userId: string, request: CreateTaskRequest) {
  return apiRequest<Task>('/save', {
    method: 'POST',
    body: JSON.stringify({
      pk: `USER#${userId}`,
      sk: `TASK#${Date.now()}`,
      data: task,
      type: 'private',
    }),
  });
}
```

## Testing Strategy

### BDD with Jest-Cucumber
```gherkin
Feature: Add synthesis entries to task (US-020)
  Scenario: Add synthesized text to existing task
    Given I am authenticated as "teacher@test.com"
    And I have entered text "Tere päevast"
    And the audio has been synthesized successfully
    When I click "Add to task" button
    And I select task "Lesson 1"
    Then the entry is added to task "Lesson 1"
```

### Unit Tests
- `core/utils.test.ts` - Pure function tests
- Feature stores can be tested in isolation

## Data Flow

1. **User enters text** → `synthesisStore.setText()`
2. **Synthesize** → `synthesizeText()` → Vabamorf → Merlin → Cache
3. **Add to task** → Auth check → `addEntryToTask()` → SingleTableLambda
4. **Success** → `uiStore.addNotification()`

## Environment Variables

```
VITE_API_URL=/api
VITE_VABAMORF_URL=/api/analyze
VITE_MERLIN_URL=/api/synthesize
VITE_CACHE_URL=/api/audio-cache
```

## PRs

| Phase | PR | Description |
|-------|-----|-------------|
| 0 | #20 | Project Setup |
| 1 | #21 | BDD Gherkin Specs |
| 2 | #22 | Core Logic (Zod, utils) |
| 3 | #23 | Audio Pipeline |
| 4 | #24 | Auth Layer |
| 5 | #25 | Data Layer |
| 6 | #26 | Zustand Stores |
| 7 | #27 | Integration Testing |
| 8 | #28 | Documentation |
