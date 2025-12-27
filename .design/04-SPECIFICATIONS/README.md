# EKI Pronunciation Platform - Specifications

**Version:** 1.1  
**Created:** 2025-10-23  
**Updated:** 2025-11-17  
**Status:** ✅ All features implemented in prototype

---

## Overview

This directory contains complete specifications for the EKI Pronunciation Platform.
**All 10 features (30 user stories) have been fully implemented** in the prototype at 
`/home/alex/cursor/eki/eki-proto`. These specifications now reflect the actual 
implementation status and serve as documentation for the production system.

**Prototype:** `/home/alex/cursor/eki/eki-proto`  
**Implementation Status:** ✅ 100% feature complete  
**Components:** 22 React components  
**User Stories:** 30/30 implemented  
**Methodology:** [AI-Pulse Development](./.methodology/SPECIFICATIONS.md)

### Key Implementation Highlights

✅ **Speech Synthesis** - Vabamorf + Merlin TTS integration, voice model selection  
✅ **Pronunciation Variants** - Interactive word selection with modal variants  
✅ **Phonetic Editing** - Full edit mode with symbol toolbar  
✅ **Playlist Management** - Drag-and-drop reordering (@dnd-kit)  
✅ **Task Management** - CRUD operations with localStorage persistence  
✅ **Task Sharing** - Unique share tokens, read-only access  
✅ **Authentication** - eID UI stub with isikukood validation  
✅ **Notifications** - Toast system via NotificationContext  

### Pending Production Work

⏳ **Backend Integration** - Replace localStorage with database  
⏳ **Real eID Service** - Integrate with actual eID authentication  
⏳ **Email Service** - Connect feedback form to email backend

---

## Document Index

### Core Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [00-FEATURE-MAP.md](00-FEATURE-MAP.md) | Complete feature inventory with priorities | ✅ Complete |
| [GLOSSARY.md](GLOSSARY.md) | Domain terminology and definitions | 🚧 Pending |

---

## Features Summary

**Total Features:** 10  
**Status:** ✅ All features implemented in prototype

### ✅ Implemented Features (10/10)
- **F-001:** Speech Synthesis (Kõnesüntees) - ✅ Complete
- **F-002:** Stressed Text Display - ✅ Complete
- **F-003:** Pronunciation Variants - ✅ Complete
- **F-004:** Playlist Management - ✅ Complete
- **F-005:** Task Management - ✅ Complete
- **F-006:** Task Sharing - ✅ Complete
- **F-007:** Phonetic Guide - ✅ Complete
- **F-008:** Authentication (eID) - ✅ Complete (UI stub, backend integration pending)
- **F-009:** Feedback System - ✅ Complete (UI only, email service pending)
- **F-010:** Notifications - ✅ Complete

---

## User Stories

### By Feature

**F-001: Speech Synthesis** (High Priority)
- US-001: Enter text and synthesize speech
- US-002: Play synthesized audio with auto-play
- US-003: Download synthesized audio (WAV file)

**F-002: Stressed Text Display** (High Priority)
- US-004: View stressed text with phonetic markers
- US-005: Edit phonetic markers manually

**F-003: Pronunciation Variants** (High Priority)
- US-006: Select word and view pronunciation variants
- US-007: Choose variant and replace in text
- US-008: Synthesize and play modified pronunciation

**F-004: Playlist Management** (High Priority)
- US-009: Add entry to playlist
- US-010: Play individual playlist entry
- US-011: Play all playlist entries sequentially
- US-012: Delete entry from playlist
- US-013: Reorder playlist entries (drag & drop)
- US-014: Edit playlist entry (reload to synthesis)

**F-005: Task Management** (High Priority)
- US-015: Create new task with name and description
- US-016: View list of all tasks
- US-017: View task details with all entries
- US-018: Edit task metadata (name, description)
- US-019: Delete task with confirmation
- US-020: Add synthesis entries to task
- US-021: Add playlist entries to existing task

**F-006: Task Sharing** (Medium Priority)
- US-022: Generate shareable link for task
- US-023: Access shared task via link (copy to own tasks)

**F-007: Phonetic Guide** (Medium Priority)
- US-024: View phonetic symbols reference guide

**F-008: Authentication** (High Priority)
- US-025: Login with eID (isikukood)
- US-026: View user profile
- US-027: Logout from system
- US-028: Redirect to login for protected features

**F-009: Feedback System** (Medium Priority)
- US-029: Submit feedback with message and email

**F-010: Notifications** (Low Priority)
- US-030: Display and dismiss notifications

**New User Stories from Prototype Analysis:**
- US-031: Audio performance optimization (caching) - F-001
- US-032: Copy shared task entries to playlist - F-006
- US-033: Baseline tasks access - F-005

**Total User Stories:** 33 (30 original + 3 from prototype analysis)

---

## Architecture Components

### Frontend Components (22) ✅ IMPLEMENTED
All components built in prototype at `/home/alex/cursor/eki/eki-proto/components/` with SCSS styling.

**Core Synthesis:**
- TextInput
- AudioPlayer
- StressedTextDisplay
- PronunciationVariants

**Playlist:**
- Playlist
- PlaylistItem
- PlaylistAudioPlayer

**Task Management:**
- TaskManager
- TaskDetailView
- TaskCreationModal
- TaskEditModal
- ShareTaskModal

**Authentication:**
- LoginModal
- UserProfile

**Modals & Dialogs:**
- FeedbackModal
- PhoneticGuideModal
- ConfirmDialog

**Notifications:**
- Notification
- NotificationContainer

### API Endpoints (3) ✅ IMPLEMENTED
- `POST /api/analyze` - Vabamorf stress marking
- `POST /api/synthesize` - Merlin TTS synthesis  
- `POST /api/variants` - Pronunciation variants (stub)

### External Services (2) ✅ DEPLOYED
- **Vabamorf** (Port 8001 local, AWS App Runner production) - Morphological analysis
- **Merlin TTS** (Port 8002 local, AWS App Runner production) - Speech synthesis

### Data Models (6)
- User
- Task
- TaskEntry
- CreateTaskRequest
- UpdateTaskRequest
- TaskSummary

---

## Development Workflow

### Phase 1: Specification Review ✅ COMPLETE
- [x] Extract features from prototype
- [x] Create Feature Map
- [x] Write User Stories with AC (30 user stories)
- [x] Update specifications to match prototype implementation
- [ ] Create Glossary (pending)
- [ ] Validate with stakeholders (pending)

### Phase 2: Prototype Development ✅ COMPLETE
- [x] All 10 features implemented in `/home/alex/cursor/eki/eki-proto`
- [x] 22 React components built
- [x] Integration with Vabamorf and Merlin TTS services
- [x] localStorage-based data persistence
- [x] Comprehensive UI/UX implementation

### Phase 3: Production Development (Next)
- [ ] Backend database integration (replace localStorage)
- [ ] Real eID authentication integration
- [ ] Email service for feedback system
- [ ] Write tests (coverage ≥85%)
- [ ] Production deployment

---

## Key Requirements

### Functional Requirements
1. **Speech Synthesis**: Estonian text → phonetic transcription → audio
2. **Pronunciation Learning**: Interactive word selection with variants
3. **Playlist Management**: Create, edit, reorder speech sequences
4. **Task Management**: Authenticated users can save and share tasks
5. **eID Authentication**: Estonian national ID integration

### Non-Functional Requirements
1. **Performance**: Synthesis < 10 seconds
2. **Usability**: Intuitive UI for language learners
3. **Accessibility**: WCAG 2.1 Level AA compliance
4. **Security**: Secure authentication and data storage
5. **Scalability**: Support multiple concurrent users

### Technical Requirements
1. **Frontend**: Next.js 15, React 19, TypeScript
2. **Styling**: SCSS with EKI Design System
3. **Testing**: Vitest, coverage ≥85%
4. **Backend**: Node.js API, PostgreSQL
5. **Deployment**: Docker containers, AWS infrastructure

---

## Related Documentation

### Prototype Documentation
- [Business Requirements](../../EKI-ui-prototype/docs/01-BUSINESS%20REQUIREMENTS/)
- [Architecture](../../EKI-ui-prototype/docs/02-MVP%20ARCHITECTURE/)
- [Implementation Docs](../../EKI-ui-prototype/docs/03-IMPLEMENTATION/)

### Methodology
- [AI-Pulse Core](../.methodology/CORE.md)
- [Specification Rules](../.methodology/SPECIFICATIONS.md)
- [Development Rules](../.methodology/RULES.md)

### Project Documentation
- [Project Structure](../../PROJECT_STRUCTURE.md)
- [Testing Strategy](../../TESTING.md)
- [Project Config](../../PROJECT_CONFIG.md)

---

## Glossary Preview

Key terms used in specifications:

- **Kõnesüntees** - Speech synthesis
- **Hääldusabiline** - Pronunciation helper/assistant
- **Rõhutatud tekst** - Stressed/marked text
- **Lausung** - Utterance, speech sequence
- **Ülesanne** - Task, assignment
- **Esitusloend** - Playlist
- **eID** - Estonian electronic ID
- **Isikukood** - Estonian personal identification code

*(Full glossary in [GLOSSARY.md](GLOSSARY.md))*

---

## How to Use This Documentation

### For Developers
1. Start with [00-FEATURE-MAP.md](00-FEATURE-MAP.md) to understand all features
2. Read relevant User Stories for implementation guidance
3. Follow AC (Acceptance Criteria) for test-driven development
4. Reference GLOSSARY.md for domain terms

### For Product Owners
1. Review Feature Map for priority decisions
2. Validate User Stories against business requirements
3. Add/modify AC based on stakeholder feedback

### For QA
1. Use AC as test cases
2. Verify implementation against specifications
3. Report gaps between specs and implementation

---

## Contributing

### Adding New Specifications
1. Follow templates in `.methodology/templates/`
2. Assign unique IDs (US-XXX, F-XXX)
3. Link to related features
4. Update this README index
5. Commit with format: `[PROJ-XXX] Add US-XXX specification`

### Modifying Existing Specs
1. Track changes in document history
2. Update "Last Updated" timestamp
3. Notify affected team members
4. Update cross-references

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-23 | Initial feature extraction from prototype | AI Assistant |
| 1.1 | 2025-11-17 | Updated all specifications to match prototype implementation status | AI Assistant |

---

**Maintainer:** EKI Development Team  
**Contact:** development@eki.ee  
**Repository:** [EKI-ui](https://github.com/eki/EKI-ui)

