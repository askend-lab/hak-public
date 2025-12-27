# Project Workflow - EKI Pronunciation Platform

**Date:** October 15, 2025  
**Participants:** Aleksei (development), Tatjana (analytics/PM), Anton (infrastructure)

---

## 📅 Current Project Status

**Week:** 3 of 22  
**Phase:** Design + Technical preparation  
**Until end of October:** Work with components and architecture

### Project Timeline
- **Weeks 1-5:** Analysis, design, technical preparation
- **End of October:** Design complete, architecture ready
- **November:** Start functionality development
- **Week 22:** Release

---

## 🛠️ Development Tools

### 1. Git Repository
**Where:** Shared for entire project  
**Access:** Anton organizes

**What we store:**
- ✅ All documentation (text files, Markdown)
- ✅ Code (frontend, backend)
- ✅ Configuration (Docker, CI/CD)
- ✅ Tests
- ❌ NOT stored: Word/Excel files, binary documents

**Format:** Only plain text, Markdown

### 2. Cursor IDE
**What it is:** AI-powered IDE for development  
**How we work:**
1. Connect Git repository to Cursor
2. Write documentation and tasks
3. Cursor helps generate code
4. Iterative work

**Aleksei:** Install and configure Cursor with Git repo

### 3. SharePoint (client's)
**Purpose:** Documentation exchange with client  
**Contents:**
- Analysis and specifications
- Prototypes
- Project plan
- Design materials

**Process:** SharePoint → convert to text → Git

### 4. Task Management
**Internal:** Git + checkboxes in text files  
**With client:** SharePoint (project plan)  
**Optional:** Trello board for visualization

### 5. CI/CD
**Where:** Cloud deployment (Anton will specify)  
**Goal:** Free or conditionally free  
**Requirement:** Automatic build and deploy

---

## 📋 Base Documents (priority)

### Document 1: Vision (What we're doing)
**File:** `VISION.md`  
**Contents:**
- Why this project?
- What problem are we solving?
- For whom?
- Key goals

**Status:** ✅ Done (see PROJECT_OVERVIEW.md, EXEC_SUMMARY_RU.md)

### Document 2: Architecture (How we're doing it)
**File:** `ARCHITECTURE.md`  
**Contents:**
- System components
- Technology stack
- Integrations
- Data flow
- Diagrams

**Status:** ✅ Done (see TECHNICAL_SPEC_DRAFT.md, ARCHITECTURE_DIAGRAM.txt)

### Document 3: Phase Plan (When we're doing it)
**File:** `PHASES.md`  
**Format:** Checkboxes by phases  
**Contents:**
- [ ] Phase 1: Preparation and design
- [ ] Phase 2: Basic functionality
- [ ] Phase 3: Extended features
- [ ] Phase 4: Testing and release

**Status:** ⏳ Need to create detailed plan with checkboxes

### Document 4: Acceptance Criteria (How we test)
**File:** `ACCEPTANCE.md`  
**Format:** Text scenarios  
**Contents:**
- Go here → see this
- Do that → this happens
- Simple text descriptions (not Gherkin yet)

**Status:** ⏳ Need to create after functionality clarification

---

## 🎯 Next Steps for Aleksei

### Step 1: Setup (this week)
- [ ] Install Cursor IDE
- [ ] Get access to Git repository (Anton)
- [ ] Clone repository
- [ ] Configure Cursor to work with repo
- [ ] Transfer all created documentation to Git

### Step 2: Components (until end of October)
- [ ] Get access to client components:
  - [ ] Stress marker repository
  - [ ] Merlin TTS repository
- [ ] Study components:
  - [ ] How does stress marker work?
  - [ ] What does it output?
  - [ ] Are there pronunciation variants?
- [ ] Study Merlin:
  - [ ] How does synthesis work?
  - [ ] What input/output format?
  - [ ] Is there timing data?
- [ ] Run components locally (Docker)
- [ ] Test end-to-end flow

### Step 3: Design System (in parallel)
- [ ] Get access to client's Storybook
- [ ] Evaluate integration complexity
- [ ] Understand how much time frontend will take on their UI kit

### Step 4: Architecture (until end of October)
- [ ] Determine technology stack:
  - [ ] Frontend framework (React/Vue)
  - [ ] Backend framework (Node/Python)
  - [ ] Database (PostgreSQL)
  - [ ] Queue (Redis/RabbitMQ)
- [ ] Design API endpoints
- [ ] Set up CI/CD pipeline
- [ ] Set up development environment

### Step 5: Documentation (current)
- [ ] Create detailed phase plan (PHASES.md)
- [ ] Create acceptance criteria (ACCEPTANCE.md)
- [ ] Update documentation after component testing

---

## 👥 Attendance Schedule

### Aleksei
- **Tuesday:** Office morning until 12:00
- **Wednesday:** Office afternoon
- **Thursday:** Office morning until 12:00
- **Other times:** Online available

**Goal:** Come as often as possible, especially if there are blockers

### Tatjana
- Coordinates as needed

---

## 🔄 Workflow

### Daily
1. **Morning:** Sync-up (if needed)
2. **Work:** Cursor + Git
3. **Commit:** Regular commits with descriptions
4. **Push:** Automatic build and deploy

### Weekly
1. **Team meeting:** Status, blockers, plans
2. **Client meeting (if needed):** Demo, feedback
3. **Plan update:** SharePoint for client

### On Blockers
- Immediate escalation to Tatjana
- Office meeting to discuss
- Quick decision making

---

## 📦 Deployment

### Development
- **Where:** TBD (Anton will set up)
- **How:** Automatically from Git
- **URL:** TBD

### Staging
- **Where:** TBD
- **For whom:** Testing, client demo
- **URL:** TBD

### Production
- **Where:** Client hosts themselves
- **When:** After acceptance
- **Handover:** All code + documentation + instructions

---

## 🎨 Design (current phase)

### What's happening
- Designer working on visual mockups
- Meeting with designer Helen next week
- Deciding how to visualize phonetic symbols

### Development Dependencies
- UI kit (Storybook) already exists
- Can start simple UI without final design
- Synthesizer can be tested without UI at all

### Plan
- In parallel with design: technical component integration
- After design: UI implementation
- Functionality may change after design (this is normal)

---

## 🚦 Phase Readiness Criteria

### Phase 1: Technical Preparation (until end of October)
- ✅ Git repository set up
- ✅ CI/CD working
- ✅ Client components running locally
- ✅ Tested end-to-end flow
- ✅ Architecture clear
- ✅ Technology stack chosen
- ✅ Basic documentation ready

### Phase 2: MVP (November)
- ✅ Basic synthesis works
- ✅ UI implemented
- ✅ Can do demo
- ✅ Deployed to staging

### Phase 3: Extended Functionality
- TBD after Phase 2

### Phase 4: Release
- TBD

---

## 📝 Documentation Rules

### In Git
- ✅ Markdown files (.md)
- ✅ Text files (.txt)
- ✅ Configuration (.json, .yaml, .env.example)
- ✅ Diagrams in text format (ASCII, Mermaid)

### NOT in Git (or separately)
- ❌ Word documents (.docx)
- ❌ Excel spreadsheets (.xlsx)
- ❌ PDF files (only if absolutely necessary)
- ❌ Binary files

### Conversion from SharePoint
1. Export as text
2. Format in Markdown
3. Add to Git
4. Link to original in SharePoint (if needed)

---

## 🤖 Working with Cursor/AI

### Code Generation Process
1. Write checkboxes with tasks
2. Cursor reads project context
3. Generates code based on tasks
4. Iterative refinement
5. Code review (human)
6. Commit

### Best Practices
- More detailed documentation → better AI generates
- Examples help AI understand patterns
- Test scenarios → AI can generate tests
- Regular refactoring

---

## 📞 Communication

### Communication Channel
- Main: TBD (Slack? Teams? Email?)
- Code: Git (pull requests, issues)
- Documents: SharePoint with client, Git internally

### Meeting Frequency
- **Daily (if needed):** Quick sync
- **Weekly:** Status and planning
- **Ad-hoc:** On blockers

---

## ✅ Checklist: Am I Ready to Start?

### Setup
- [ ] Cursor installed
- [ ] Git repository accessible
- [ ] Documentation transferred to Git
- [ ] CI/CD configured

### Access
- [ ] Git repository
- [ ] Stress marker component
- [ ] Merlin TTS component
- [ ] Design system (Storybook)
- [ ] SharePoint (optional)

### Understanding
- [ ] Read all documentation
- [ ] Understood architecture
- [ ] Know critical questions
- [ ] Understood workflow

**If all ✅ → can start!**

---

**Document:** Workflow  
**Status:** Current  
**Updated:** October 15, 2025  
**Next update:** After setup phase

