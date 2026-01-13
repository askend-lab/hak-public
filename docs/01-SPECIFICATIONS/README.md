# EKI Hääldusabiline - Test Specifications

**Version:** 2.0  
**Created:** 2026-01-08  
**Source:** Derived from working prototype

## Purpose

This documentation provides a complete specification for testing the EKI Hääldusabiline (Pronunciation Helper) application. It serves as:

- **Requirements specification** for production implementation
- **Acceptance testing guide** for QA verification
- **Feature reference** for developers and stakeholders

All specifications were derived exclusively from the working prototype codebase, ensuring accuracy and completeness.

---

## Folder Structure

```
04-SPECIFICATIONS/
│
├── 00-FEATURE-MAP.md      # Feature index with links to all documents
├── 00-TEST-PLAN.md        # Test strategy, scope, and approach
├── README.md              # This file
│
├── 01-USER-STORIES/       # What the system should do
│   ├── F01-speech-synthesis/
│   ├── F02-pronunciation-variants/
│   ├── F03-sentence-phonetic/
│   ├── F04-playlist/
│   ├── F05-task-management/
│   ├── F06-task-sharing/
│   ├── F07-authentication/
│   ├── F08-onboarding/
│   ├── F09-feedback/
│   └── F10-notifications/
│
├── 02-TEST-CASES/         # How to verify each feature
│   └── (mirrors user stories structure)
│
├── 03-USER-JOURNEYS/      # End-to-end workflows
│   ├── UJ-01-teacher-workflow.md
│   ├── UJ-02-learner-workflow.md
│   └── UJ-03-shared-task-flow.md
│
└── 04-TEST-DATA/          # Test inputs and sample data
    └── estonian-phrases.md
```

---

## How to Navigate

### New to the project?

1. Start with **[00-FEATURE-MAP.md](00-FEATURE-MAP.md)** - overview of all 10 features
2. Review **[00-TEST-PLAN.md](00-TEST-PLAN.md)** - understand the testing approach
3. Explore features of interest in `01-USER-STORIES/`

### Running acceptance tests?

1. Review **[00-TEST-PLAN.md](00-TEST-PLAN.md)** - prerequisites and test order
2. Follow test cases in `02-TEST-CASES/` - start with Critical priority
3. Use **[04-TEST-DATA/estonian-phrases.md](04-TEST-DATA/estonian-phrases.md)** for test inputs

### End-to-end validation?

Run the three user journeys in `03-USER-JOURNEYS/`:
1. **UJ-01** - Teacher creates and shares exercise
2. **UJ-02** - Learner practices pronunciation
3. **UJ-03** - Student accesses shared task

### Understanding a specific feature?

1. Find the feature in **[00-FEATURE-MAP.md](00-FEATURE-MAP.md)**
2. Read the user stories for requirements
3. Read the test cases for verification steps

---

## Naming Conventions

| Prefix | Meaning | Example |
|--------|---------|---------|
| `F01-F10` | Feature identifier | F01 = Speech Synthesis |
| `US-XX` | User Story | US-01 = Text Input |
| `TC-XX` | Test Case | TC-01 = Basic Synthesis |
| `UJ-XX` | User Journey | UJ-01 = Teacher Workflow |

---

## Document Summary

| Category | Count | Description |
|----------|-------|-------------|
| Features | 10 | Core application capabilities |
| User Stories | 28 | Detailed requirements with acceptance criteria |
| Test Cases | 19 | Step-by-step verification procedures |
| User Journeys | 3 | End-to-end workflow validations |

---

## Priority Levels

| Priority | Meaning | Test Frequency |
|----------|---------|----------------|
| **Critical** | Core functionality, must work | Every build |
| **High** | Important features | Daily builds |
| **Medium** | Supporting features | Weekly / Release |

---

## Quick Start for Testers

1. **Environment Setup**
   - Application running at localhost
   - Backend services: Vabamorf (8001), Merlin TTS (8002)
   - Browser with audio enabled

2. **Smoke Test (5 min)**
   - TC-01: Basic Synthesis Flow
   - Verify: Enter text → Press Enter → Audio plays

3. **Critical Tests (1 hour)**
   - All test cases marked "Critical" priority
   - Focus on F01, F02, F05, F07

4. **Full Regression (4-6 hours)**
   - All test cases
   - All user journeys

---

## Archived Documentation

Previous prototype documentation is preserved at:

```
docs/_ARCHIVE/prototype-2025/
```

This includes the original 34 user stories and screenshots from earlier development phases. Use for historical reference only.

---

## Contact

For questions about these specifications, contact the development team.
