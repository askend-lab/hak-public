# Feature Map - User Management & System Features

**Features F05-F10:** Tasks, sharing, auth, onboarding, feedback, notifications

---

## F05: Task Management (Ülesannete haldamine)

**Description:** Authenticated users can create, view, edit, and delete tasks containing speech synthesis entries. Tasks persist in localStorage.

**Components:** `TaskManager.tsx`, `TaskDetailView.tsx`, `TaskCreationModal.tsx`, `TaskEditModal.tsx`, `DataService.ts`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-15](01-USER-STORIES/F05-task-management/US-15-create-task.md) | Create new task | Critical |
| [US-16](01-USER-STORIES/F05-task-management/US-16-view-tasks.md) | View task list | Critical |
| [US-17](01-USER-STORIES/F05-task-management/US-17-edit-task.md) | Edit task metadata | High |
| [US-18](01-USER-STORIES/F05-task-management/US-18-delete-task.md) | Delete task | High |
| [US-19](01-USER-STORIES/F05-task-management/US-19-add-to-task.md) | Add sentences to task | Critical |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-12](02-TEST-CASES/F05-task-management/TC-12-create-task.md) | Create task | Happy Path |
| [TC-13](02-TEST-CASES/F05-task-management/TC-13-task-crud.md) | Task CRUD operations | Functional |
| [TC-14](02-TEST-CASES/F05-task-management/TC-14-add-entries.md) | Add entries to task | Functional |

---

## F06: Task Sharing (Ülesande jagamine)

**Description:** Users can share tasks via unique links. Recipients can view shared tasks read-only and copy entries to their playlist.

**Components:** `ShareTaskModal.tsx`, `DataService.ts`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-20](01-USER-STORIES/F06-task-sharing/US-20-share-task.md) | Generate shareable link | High |
| [US-21](01-USER-STORIES/F06-task-sharing/US-21-access-shared.md) | Access shared task | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-15](02-TEST-CASES/F06-task-sharing/TC-15-share-task.md) | Share and access task | Functional |

---

## F07: Authentication (Autentimine)

**Description:** User authentication via Estonian eID (isikukood). Supports Smart-ID, Mobiil-ID, and ID-kaart authentication methods.

**Components:** `LoginModal.tsx`, `AuthContext.tsx`, `UserProfile.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-22](01-USER-STORIES/F07-authentication/US-22-login.md) | Login with eID | Critical |
| [US-23](01-USER-STORIES/F07-authentication/US-23-profile.md) | View user profile | Medium |
| [US-24](01-USER-STORIES/F07-authentication/US-24-logout.md) | Logout | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-16](02-TEST-CASES/F07-authentication/TC-16-authentication.md) | Authentication flow | Functional |

---

## F08: Onboarding (Tutvustus)

**Description:** First-time users select their role (learner, teacher, specialist) and receive guided onboarding with tooltips.

**Components:** `RoleSelectionPage.tsx`, `OnboardingWizard.tsx`, `OnboardingContext.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-25](01-USER-STORIES/F08-onboarding/US-25-role-selection.md) | Select user role | High |
| [US-26](01-USER-STORIES/F08-onboarding/US-26-wizard.md) | Complete onboarding wizard | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-17](02-TEST-CASES/F08-onboarding/TC-17-onboarding.md) | Onboarding flow | Functional |

---

## F09: Feedback (Tagasiside)

**Description:** Users can submit feedback about the application through a modal form in the footer.

**Components:** `FeedbackModal.tsx`, `Footer.tsx`, `/api/feedback`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-27](01-USER-STORIES/F09-feedback/US-27-submit-feedback.md) | Submit feedback | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-18](02-TEST-CASES/F09-feedback/TC-18-feedback.md) | Feedback submission | Functional |

---

## F10: Notifications (Teated)

**Description:** Global notification system displaying success, error, info, and warning messages with auto-dismiss and optional action buttons.

**Components:** `NotificationContext.tsx`, `NotificationContainer.tsx`, `Notification.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-28](01-USER-STORIES/F10-notifications/US-28-notifications.md) | Display and dismiss notifications | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-19](02-TEST-CASES/F10-notifications/TC-19-notifications.md) | Notification display | Functional |

---

**See also:**
- [Feature Map Index](./Feature-Map-Index.md)
- [Core Features](./Feature-Map-Core.md)
