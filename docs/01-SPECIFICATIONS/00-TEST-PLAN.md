# Test Plan - EKI Hääldusabiline

**Version:** 2.0  
**Last Updated:** 2026-01-08  
**Status:** Active

## 1. Introduction

### 1.1 Purpose

This document defines the testing strategy for the EKI Hääldusabiline (Pronunciation Helper) application. It serves as a guide for acceptance testing the production implementation against the prototype functionality.

### 1.2 Scope

This test plan covers:
- All 10 features implemented in the prototype
- 28 user stories with acceptance criteria
- 19 test cases covering happy paths and edge cases
- 3 end-to-end user journeys

### 1.3 References

- [Feature Map](00-FEATURE-MAP.md) - Complete feature inventory
- [User Stories](01-USER-STORIES/) - Detailed requirements
- [Test Cases](02-TEST-CASES/) - Step-by-step verification procedures
- [User Journeys](03-USER-JOURNEYS/) - End-to-end workflows

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Description | Coverage |
|-------|-------------|----------|
| **Functional Testing** | Verify each feature works as specified | All user stories |
| **Integration Testing** | Verify features work together | User journeys |
| **Edge Case Testing** | Verify handling of unusual inputs | Edge case test cases |
| **Regression Testing** | Verify fixes don't break existing features | All test cases |

### 2.2 Test Types

| Type | Description |
|------|-------------|
| **Happy Path** | Standard successful user flow |
| **Edge Case** | Boundary conditions and unusual inputs |
| **Negative** | Invalid inputs and error handling |
| **Integration** | Cross-feature workflows |

### 2.3 Test Priorities

| Priority | Description | When to Run |
|----------|-------------|-------------|
| **Critical** | Core functionality must work | Every build |
| **High** | Important features | Daily builds |
| **Medium** | Supporting features | Weekly / Release |

---

## 3. Test Environment

### 3.1 Prerequisites

| Component | Requirement |
|-----------|-------------|
| **Browser** | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| **Audio** | Browser audio enabled, speakers/headphones connected |
| **Network** | Stable internet connection for API calls |
| **Backend Services** | Vabamorf (port 8001), Merlin TTS (port 8002) |

### 3.2 Test Data

Estonian test phrases are documented in [04-TEST-DATA/estonian-phrases.md](04-TEST-DATA/estonian-phrases.md).

Key test phrases:
- Single word: `Tere`, `kooli`, `peeti`
- Simple sentence: `Tere päevast`, `Noormees läks kooli`
- Palatalization: `Mees peeti kinni`
- Compound word: `kolmapäeval`
- Long text: Poems or paragraphs (>100 words)

### 3.3 Test Accounts

| Account Type | Isikukood | Purpose |
|--------------|-----------|---------|
| Test User 1 | `39901010011` | Standard user testing |
| Test User 2 | `49901010012` | Multi-user testing |
| Invalid | `12345678901` | Error handling testing |

---

## 4. Features Under Test

### 4.1 Critical Features (Must Pass)

| Feature | Description | Test Cases |
|---------|-------------|------------|
| F01 | Speech Synthesis | TC-01 to TC-05 |
| F02 | Pronunciation Variants | TC-06 to TC-08 |
| F05 | Task Management | TC-12 to TC-14 |
| F07 | Authentication | TC-16 |

### 4.2 High Priority Features

| Feature | Description | Test Cases |
|---------|-------------|------------|
| F03 | Sentence Phonetic Panel | TC-09 |
| F04 | Playlist Management | TC-10, TC-11 |
| F06 | Task Sharing | TC-15 |
| F08 | Onboarding | TC-17 |

### 4.3 Medium Priority Features

| Feature | Description | Test Cases |
|---------|-------------|------------|
| F09 | Feedback | TC-18 |
| F10 | Notifications | TC-19 |

---

## 5. Test Execution

### 5.1 Entry Criteria

- Application deployed to test environment
- Backend services (Vabamorf, Merlin) running
- Test data prepared
- Browser audio enabled

### 5.2 Exit Criteria

- All Critical test cases pass
- 95% of High priority test cases pass
- No Critical or High severity defects open
- All user journeys completed successfully

### 5.3 Test Execution Order

1. **Smoke Test**: TC-01 (Basic Synthesis) - verify app loads and synthesizes
2. **Critical Features**: All Critical priority test cases
3. **High Features**: All High priority test cases
4. **User Journeys**: UJ-01, UJ-02, UJ-03
5. **Edge Cases**: All edge case test cases
6. **Medium Features**: Remaining test cases

---

## 6. Defect Management

### 6.1 Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | Application unusable | Synthesis fails completely |
| **High** | Major feature broken | Cannot create tasks |
| **Medium** | Feature partially broken | Download fails on specific browsers |
| **Low** | Minor issue | Visual alignment issue |

### 6.2 Defect Workflow

1. **New** - Defect reported
2. **Open** - Assigned to developer
3. **In Progress** - Being fixed
4. **Resolved** - Fix implemented
5. **Verified** - Tester confirms fix
6. **Closed** - Defect resolved

---

## 7. Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| **Test Lead** | Test planning, execution oversight, reporting |
| **Tester** | Execute test cases, report defects |
| **Developer** | Fix defects, support testing |
| **Product Owner** | Accept/reject test results |

---

## 8. Deliverables

| Deliverable | Description |
|-------------|-------------|
| Test Plan | This document |
| Test Cases | Step-by-step test procedures |
| Test Results | Pass/fail status for each test case |
| Defect Report | List of identified issues |
| Test Summary | Overall test outcome and recommendations |

---

## 9. Schedule

| Phase | Duration | Activities |
|-------|----------|------------|
| **Preparation** | 1 day | Environment setup, test data preparation |
| **Smoke Testing** | 0.5 day | Verify basic functionality |
| **Functional Testing** | 3-5 days | Execute all test cases |
| **User Journey Testing** | 1 day | End-to-end workflows |
| **Regression Testing** | 1-2 days | Verify fixes |
| **Reporting** | 0.5 day | Document results |

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend services unavailable | Cannot test synthesis | Ensure Docker containers running |
| Audio playback issues | Cannot verify audio output | Test on multiple browsers/devices |
| Network latency | Slow synthesis response | Test with local backend |
| Browser compatibility | Features broken on some browsers | Test on all supported browsers |

---

## Appendix A: Quick Reference

### Test Case Execution Checklist

- [ ] Environment ready (app loaded, services running)
- [ ] Audio enabled in browser
- [ ] Test data available
- [ ] Previous session logged out / cleared

### Browser Compatibility Matrix

| Browser | Windows | macOS | Notes |
|---------|---------|-------|-------|
| Chrome | Yes | Yes | Primary test browser |
| Firefox | Yes | Yes | Secondary |
| Safari | N/A | Yes | macOS only |
| Edge | Yes | Yes | Windows primary |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Vabamorf morphological analysis |
| `/api/synthesize` | POST | Merlin TTS audio generation |
| `/api/variants` | POST | Pronunciation variants |
| `/api/feedback` | POST | Submit user feedback |
