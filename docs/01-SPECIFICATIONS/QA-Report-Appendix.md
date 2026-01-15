# QA Report - Appendix

**Part 4 of 4:** Reference Data and Implementation Mapping

---

## Appendix A: Implementation File Mapping

| Feature | Test Case(s) | Primary Implementation Files |
|---------|--------------|------------------------------|
| F01 | TC-01 to TC-05 | `SynthesisView.tsx`, `useSynthesis.ts`, `SentenceSynthesisItem.tsx` |
| F02 | TC-06 to TC-08 | `PronunciationVariants.tsx`, `useVariantsPanel.ts` |
| F03 | TC-09 | `SentencePhoneticPanel.tsx` |
| F04 | TC-10, TC-11 | `Playlist.tsx`, `PlaylistItem.tsx`, `PlaylistAudioPlayer.tsx` |
| F05 | TC-12 to TC-14 | `TaskManager.tsx`, `TaskCreationModal.tsx`, `TaskDetailView.tsx`, `dataService.ts` |
| F06 | TC-15 | `ShareTaskModal.tsx`, `dataService.ts` |
| F07 | TC-16 | `AuthContext.tsx`, `LoginModal.tsx`, `UserProfile.tsx` |
| F08 | TC-17 | `OnboardingWizard.tsx`, `OnboardingContext.tsx`, `RoleSelectionPage.tsx` |
| F09 | TC-18 | `FeedbackModal.tsx`, `Footer.tsx` |
| F10 | TC-19 | `NotificationContext.tsx`, `Notification.tsx`, `NotificationContainer.tsx` |

---

## Appendix B: Test Files Location

### E2E Tests
- `packages/frontend/e2e/synthesis.spec.ts`
- `packages/frontend/e2e/tasks-crud.spec.ts`

### Unit Tests
- `packages/frontend/src/**/*.test.tsx`
- `packages/frontend/src/**/*.test.ts`
- Total: 74 files

### Gherkin Features
- `packages/specifications/**/*.feature`
- Total: 32 files

### Step Definitions
- `packages/frontend/src/features/steps-ts/*.steps.ts`
- Total: 10 files

---

## Appendix C: Existing Bug Fixes (Reference)

From `bug.md` - all marked as FIXED:
- **Bug #3:** Play button style
- **Bug #4:** Missing Isikukood in user dropdown
- **Bug #5:** Wrong reset button text
- **Bug #6:** Missing icons in user dropdown

---

## Appendix D: Test Data Resources

### Estonian Test Phrases
Location: `docs/01-SPECIFICATIONS/04-TEST-DATA/estonian-phrases.md`

Contains:
- Common greetings
- Everyday phrases
- Complex sentences
- Special characters (õäöü)
- Edge cases for synthesis testing

### Mock Users
Location: `/data/mock-users.json`

Contains test accounts for authentication testing.

---

## Appendix E: Related Documentation

### Test Cases
- Location: `docs/01-SPECIFICATIONS/02-TEST-CASES/`
- 19 test case files (TC-01.md to TC-19.md)

### Feature Specifications
- Location: `docs/01-SPECIFICATIONS/01-FEATURES/`
- 10 feature files (F01.md to F10.md)

### User Stories
- Embedded within feature files
- Total: 28 user stories across 10 features

### User Journeys
- Location: `docs/01-SPECIFICATIONS/03-USER-JOURNEYS/`
- 3 journey files

---

**Report End**

*Date: 2026-01-13*  
*Tool: Automated QA Analysis*

---

**See also:**
- [Summary](./QA-Report-Summary.md)
- [Feature Implementation](./QA-Report-Features.md)
- [Coverage Analysis](./QA-Report-Coverage.md)
- [Recommendations](./QA-Report-Recommendations.md)
