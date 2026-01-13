# UJ-01: Teacher Workflow

**Type:** End-to-End User Journey  
**Priority:** Critical  
**Duration:** 10-15 minutes

## Overview

A language teacher creates a pronunciation exercise, adds synthesized sentences, and shares it with students.

## Persona

**Mari** - Estonian language teacher  
- Teaches Estonian as second language
- Creates pronunciation exercises for students
- Wants to share exercises via links

## Journey Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │ ──► │Create Task  │ ──► │Add Sentences│ ──► │Share Task   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Teacher has valid isikukood
- [ ] Backend services running

## Journey Steps

### Phase 1: Login

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to application | Main page loads | ☐ |
| 2 | Click "Logi sisse" | Login modal opens | ☐ |
| 3 | Enter isikukood: `39901010011` | Valid input | ☐ |
| 4 | Click "Sisene" | Logged in, profile visible | ☐ |

### Phase 2: Create Content

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 5 | Enter "Tere päevast" | Text in input | ☐ |
| 6 | Press Enter | Audio plays | ☐ |
| 7 | Click "Lisa lause" | New row added | ☐ |
| 8 | Enter "Kuidas läheb" | Second sentence | ☐ |
| 9 | Press Enter | Audio plays | ☐ |
| 10 | Click "Lisa lause" | Third row added | ☐ |
| 11 | Enter "Aitäh, hästi" | Third sentence | ☐ |
| 12 | Press Enter | Audio plays | ☐ |

### Phase 3: Explore Variants (Optional)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 13 | Click on "läheb" tag | Variants panel opens | ☐ |
| 14 | Preview a variant | Audio plays | ☐ |
| 15 | Select preferred variant | Variant applied | ☐ |
| 16 | Close panel | Returns to main view | ☐ |

### Phase 4: Create Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 17 | Click "Lisa ülesandesse (3)" | Dropdown opens | ☐ |
| 18 | Click "Loo uus ülesanne" | Task modal opens | ☐ |
| 19 | Enter name: "Tervituste harjutus" | Name entered | ☐ |
| 20 | Enter description: "Harjuta tervituste hääldust" | Description entered | ☐ |
| 21 | Click "Loo ülesanne" | Task created | ☐ |
| 22 | Verify notification | "Ülesanne loodud!" shown | ☐ |

### Phase 5: Verify Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 23 | Click "Vaata ülesannet" in notification | Task detail opens | ☐ |
| 24 | Verify entries | 3 sentences visible | ☐ |
| 25 | Play an entry | Audio works | ☐ |

### Phase 6: Share Task

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 26 | Click "Jaga" button | Share modal opens | ☐ |
| 27 | Click "Kopeeri" | Link copied | ☐ |
| 28 | Verify notification | "Link kopeeritud!" shown | ☐ |
| 29 | Note the share URL | URL for students | ☐ |

### Phase 7: Logout

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 30 | Click profile dropdown | Dropdown opens | ☐ |
| 31 | Click "Logi välja" | Logged out | ☐ |
| 32 | Verify | "Logi sisse" button visible | ☐ |

## Success Criteria

- [ ] Teacher successfully logged in
- [ ] Content created with correct pronunciations
- [ ] Task created with all entries
- [ ] Shareable link generated and copied
- [ ] Entire workflow completed without errors

## Features Covered

| Feature | User Stories |
|---------|-------------|
| F01 Speech Synthesis | US-01, US-02, US-03 |
| F02 Pronunciation Variants | US-05, US-06, US-07 |
| F04 Playlist | US-11 |
| F05 Task Management | US-15, US-19 |
| F06 Task Sharing | US-20 |
| F07 Authentication | US-22, US-24 |

## Notes

- This journey covers the primary teacher use case
- Time estimate: 10-15 minutes for complete walkthrough
- Can be shortened by skipping variant exploration
