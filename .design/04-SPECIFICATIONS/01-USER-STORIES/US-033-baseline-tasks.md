# US-033: Baseline tasks access

**Feature:** F-005  
**Status:** [✅] Implemented in Prototype  
**Priority:** Medium (Onboarding)

## User Story

As a **new user**  
I want to **see example tasks when I first log in**  
So that **I understand how to use the application and can practice immediately**

## Context

Baseline tasks are pre-loaded demonstration tasks that help new users understand the platform's functionality. They provide ready-to-use learning materials and serve as examples for creating own tasks.

## Acceptance Criteria

[✅] **AC-1:** Baseline tasks visible to all users  
GIVEN I am a newly authenticated user  
WHEN I navigate to the Tasks view  
THEN I see pre-loaded example tasks  
_Verified by:_ Prototype - mock-tasks.json loaded for all users

[✅] **AC-2:** Baseline tasks marked distinctly  
GIVEN I am viewing the task list  
WHEN baseline tasks are displayed  
THEN they are visually distinguished from user-created tasks  
_Verified by:_ Prototype - DataService.getTasksForUser() merges baseline and user tasks

[✅] **AC-3:** Can play baseline task entries  
GIVEN I open a baseline task  
WHEN the task detail view loads  
THEN I can play all entries and hear pronunciations  
_Verified by:_ Prototype - full playback functionality available

[✅] **AC-4:** Can add entries to baseline tasks  
GIVEN I am viewing a baseline task  
WHEN I add new entries  
THEN entries are stored separately per user  
_Verified by:_ Prototype - eki_baseline_additions_{userId} storage

[✅] **AC-5:** Can hide baseline tasks  
GIVEN I don't want to see a baseline task  
WHEN I delete it  
THEN it is hidden from my view (soft delete)  
_Verified by:_ Prototype - eki_deleted_tasks_{userId} tracking

[✅] **AC-6:** Cannot edit baseline task metadata  
GIVEN I open a baseline task  
WHEN I try to edit task name or description  
THEN only user-created tasks can be edited  
_Verified by:_ Prototype - edit functionality checks task ownership

[✅] **AC-7:** Can copy baseline tasks  
GIVEN I want to customize a baseline task  
WHEN I copy it  
THEN a new user-owned task is created with same content  
_Verified by:_ Prototype - copy functionality creates new task ID

[✅] **AC-8:** Baseline tasks persist across sessions  
GIVEN baseline tasks are available  
WHEN I log out and log back in  
THEN the same baseline tasks are available  
_Verified by:_ Prototype - loaded from static JSON file

## Baseline Task Structure

**Source:** `public/mock-tasks.json`

```typescript
interface BaselineTask {
  id: string;              // Unique identifier (e.g., "baseline-1")
  name: string;           // Task title
  description: string;    // Task description
  entries: TaskEntry[];   // Pre-created entries
  createdAt: string;      // ISO date string
  isBaseline: true;       // Flag for baseline identification
}
```

**Example Baseline Tasks:**
1. **Välted ja rõhud** - Focus on Estonian quantity degrees
2. **Palatalisatsioon** - Palatalization practice
3. **Liitsõnad** - Compound word pronunciation
4. **Igapäevased fraasid** - Common everyday phrases

## Technical Implementation

**Loading Baseline Tasks:**
```typescript
class DataService {
  private baselineTasks: Task[] = [];
  
  constructor() {
    // Load from static JSON
    this.baselineTasks = require('/public/mock-tasks.json');
  }
  
  async getTasksForUser(userId: string): Promise<TaskSummary[]> {
    // Get user tasks
    const userTasks = this.getUserTasks(userId);
    
    // Get baseline tasks (with userId assigned)
    const baselineTasks = this.baselineTasks.map(task => ({
      ...task,
      userId: userId,
      isBaseline: true
    }));
    
    // Filter out deleted baseline tasks
    const deletedIds = this.getDeletedTaskIds(userId);
    const visibleBaseline = baselineTasks.filter(t => !deletedIds.includes(t.id));
    
    // Merge and return
    return [...visibleBaseline, ...userTasks];
  }
}
```

**Soft Delete Tracking:**
```typescript
// Store deleted baseline task IDs per user
localStorage.setItem(
  `eki_deleted_tasks_${userId}`,
  JSON.stringify(['baseline-2', 'baseline-5'])
);
```

**Baseline Additions:**
```typescript
// Store additional entries added to baseline tasks
localStorage.setItem(
  `eki_baseline_additions_${userId}`,
  JSON.stringify({
    'baseline-1': [
      { id: 'entry-123', text: 'New entry', stressedText: '...' }
    ]
  })
);
```

## User Flow

```
New User Logs In
  ↓
Navigates to Tasks View
  ↓
Sees Baseline Tasks + Any User Tasks
  ↓
Opens Baseline Task "Välted ja rõhud"
  ↓
Plays entries to hear examples
  ↓
[Option A] Practice with baseline as-is
  └─ Can add own entries to it
  
[Option B] Hide if not relevant
  └─ Soft delete (can be restored)
  
[Option C] Copy and customize
  └─ Create own version to fully edit
```

## Screenshot

_See Tasks View with baseline tasks labeled with "Näidis" tag_

## Notes

**Reference prototype:** EKI2 - DataService baseline task management  
**Benefits:**
- **Onboarding:** New users have immediate content to explore
- **Examples:** Shows how tasks should be structured
- **Learning:** Provides curated pronunciation practice
- **Engagement:** Increases likelihood of feature adoption

**Edge cases:**
- User deletes all baseline tasks (can be restored by clearing storage)
- Baseline task updates (requires app update)
- Conflicting IDs between baseline and user tasks (prefix prevents)

## Baseline Task Content Guidelines

**Criteria for baseline tasks:**
1. **Pedagogically sound:** Focus on key pronunciation challenges
2. **Progressive difficulty:** From basic to advanced
3. **Diverse examples:** Cover different phonetic categories
4. **Clear descriptions:** Explain learning objective
5. **Audio quality:** High-quality synthesis
6. **Appropriate length:** 5-10 entries per task

## Maintenance

**Updating baseline tasks:**
1. Edit `public/mock-tasks.json`
2. Test with fresh user account
3. Verify all entries synthesize correctly
4. Deploy with app update

**Adding new baseline task:**
```json
{
  "id": "baseline-new",
  "name": "Task Name",
  "description": "Learning objective",
  "entries": [
    {
      "id": "entry-1",
      "text": "Example text",
      "stressedText": "Phonetic form",
      "order": 0
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "shareToken": "demo-token"
}
```

## Related User Stories

- US-016: View list of all tasks
- US-017: View task details with entries
- US-019: Delete task (soft delete for baseline)
- US-023: Access shared task via link
