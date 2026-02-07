# 10 Critical Code Quality Problems (SOLID/DRY/KISS)

## 1. **State Explosion (KISS Violation)**

**File**: `TasksPage.tsx` lines 83-95
**Problem**: 13 useState hooks in one component

```tsx
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [prevActiveModal, setPrevActiveModal] = useState<string | null>(null);
const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(
  null,
);
const [isDeleting, setIsDeleting] = useState(false);
const [editingTask, setEditingTask] = useState<Task | null>(null);
const [editName, setEditName] = useState("");
const [editDescription, setEditDescription] = useState("");
const [isEditing, setIsEditing] = useState(false);
const [editError, setEditError] = useState<string | null>(null);
```

**Fix**: Extract to useReducer or custom hooks (useTaskEdit, useTaskDelete)

## 2. **Hardcoded Fallback User (DRY Violation)**

**Files**: TaskSelectModal.tsx, CreateTaskModal.tsx, StandardizedCreateTaskModal.tsx
**Problem**: Same pattern repeated 4 times

```tsx
const userId = user?.id ?? "test-user";
```

**Fix**: Create useUserId() hook or add to auth context

## 3. **God Component (SRP Violation)**

**File**: `TasksPage.tsx` (335 lines)
**Problem**: Handles list, detail view, create, edit, delete, menu
**Fix**: Split into TaskList, TaskEditModal, TaskDeleteConfirm

## 4. **Inline Component Definition (KISS Violation)**

**File**: `TasksPage.tsx` lines 22-78
**Problem**: TaskRow defined inside TasksPage file
**Fix**: Move to separate file `TaskRow.tsx`

## 5. **Duplicate Form Logic (DRY Violation)**

**Files**: TaskForm.tsx, StandardizedTaskForm.tsx, TaskSelectModal.tsx
**Problem**: Same validation and submit patterns

```tsx
if (!name.trim()) {
  setError("...");
  return;
}
```

**Fix**: Create useTaskForm() hook with validation

## 6. **Mixed Concerns in Modal (SRP Violation)**

**File**: `TaskSelectModal.tsx` (259 lines)
**Problem**: Modal handles API calls, form state, task creation, entry adding
**Fix**: Split into presentation + container components

## 7. **Utility Function Inside Component (DRY)**

**File**: `TasksPage.tsx` line 23-26
**Problem**: formatDate defined inside component, not reusable

```tsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('et-EE', ...);
};
```

**Fix**: Move to `utils/formatDate.ts`

## 8. **Implicit Dependencies (DIP Violation)**

**File**: `SentenceRow.tsx` lines 93-96
**Problem**: Mock data embedded in component

```tsx
const getMockVariants = (word: string): Variant[] => [
  { id: "1", phonetic: word, type: "nimisõna" },
  { id: "2", phonetic: word, type: "tegusõna" },
];
```

**Fix**: Inject via props or service

## 9. **Magic Strings (KISS Violation)**

**Multiple files**
**Problem**: Hardcoded Estonian text everywhere

```tsx
setError("Ülesande nimi on kohustuslik");
setError("Võrgu viga");
addNotification("success", `Lisatud ${entries.length} lauset...`);
```

**Fix**: Use i18n translation keys consistently

## 10. **Prop Drilling (OCP Violation)**

**File**: `SentenceRow.tsx` line 27
**Problem**: 15 props passed to component

```tsx
function SentenceRow({
  value,
  onChange,
  onPlay,
  onRemove,
  onExplorePhonetic,
  onAddToTask,
  isLoading,
  isLast,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
});
```

**Fix**: Use context or compose smaller components

## Summary Table

| #   | Problem               | Principle | Severity | Effort |
| --- | --------------------- | --------- | -------- | ------ |
| 1   | State Explosion       | KISS      | Critical | Medium |
| 2   | Hardcoded Fallback    | DRY       | High     | Low    |
| 3   | God Component         | SRP       | Critical | High   |
| 4   | Inline Component      | KISS      | Medium   | Low    |
| 5   | Duplicate Form Logic  | DRY       | High     | Medium |
| 6   | Mixed Modal Concerns  | SRP       | High     | High   |
| 7   | Inline Utility        | DRY       | Low      | Low    |
| 8   | Implicit Dependencies | DIP       | Medium   | Medium |
| 9   | Magic Strings         | KISS      | Medium   | Medium |
| 10  | Prop Drilling         | OCP       | High     | High   |

## Quick Wins (Low Effort, High Impact)

1. Extract `useUserId()` hook
2. Move `formatDate` to utils
3. Move `TaskRow` to separate file
4. Replace hardcoded strings with i18n keys

## Recommended Refactoring Order

1. Fix #2 (useUserId) - 10 min
2. Fix #7 (formatDate) - 5 min
3. Fix #4 (TaskRow) - 15 min
4. Fix #1 (useTaskEdit hook) - 30 min
5. Fix #3 (split TasksPage) - 1 hour
