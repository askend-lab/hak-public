# Next Steps for Aleksei - What to Do Right Now

**Date:** October 15, 2025  
**Priority:** Week 3 of the project (until end of October)

---

## 🎯 Main Goal: Technical Readiness for November Development Kickoff

By the end of October we need:
1. ✅ Understand how client components work
2. ✅ Choose technology stack
3. ✅ Set up development environment
4. ✅ Answer critical questions
5. ✅ Prepare architecture

---

## 📅 Plan for This Week (Week 3)

### Day 1-2: Setup

#### 1. Install and configure Cursor
```bash
# Download: https://cursor.sh/
# Install
# Configure Git integration
```

**Why:** This is the main development tool

#### 2. Get access to Git repository
**From:** Anton  
**What's needed:** 
- Repository URL
- SSH key or access token
- Push rights

**Action:**
```bash
git clone <repo-url>
cd <project-name>
```

#### 3. Transfer documentation to Git
**What to transfer:** Everything from `projects/eestikeeleinstituut/`

**Structure:**
```
repo/
├── README.md
├── docs/
│   ├── vision/
│   │   ├── EXEC_SUMMARY_RU.md
│   │   ├── PROJECT_OVERVIEW.md
│   │   └── MEETING_SUMMARY.md
│   ├── architecture/
│   │   ├── TECHNICAL_SPEC_DRAFT.md
│   │   ├── ARCHITECTURE_DIAGRAM.txt
│   │   └── DESIGN_SYSTEM.md
│   ├── planning/
│   │   ├── REVISED_ESTIMATE.md
│   │   ├── RISKS.md
│   │   ├── TODO.md
│   │   └── PHASES.md (create)
│   ├── requirements/
│   │   ├── UX_SPECIFICATION.md
│   │   ├── CRITICAL_QUESTIONS.md
│   │   └── ACCEPTANCE.md (create)
│   └── workflow/
│       ├── WORKFLOW.md
│       └── NEXT_STEPS_ALEKSEI.md (this file)
├── src/
│   ├── frontend/
│   ├── backend/
│   └── components/
└── tests/
```

**First commit:**
```bash
git add docs/
git commit -m "Initial project documentation from SharePoint analysis"
git push origin main
```

---

### Day 3-5: Client Components

#### 4. Get access to components

**Write to Tatjana/client:**
```
Hi!

To start technical work, I need access to components:

1. Stress Marker Component
   - GitHub/GitLab repository URL
   - Read access
   - Documentation (if available)

2. Merlin TTS Synthesizer
   - GitHub/GitLab repository URL  
   - Read access
   - Documentation (if available)

3. Design System (Storybook)
   - URL or repository
   - Access

Also need licenses of these components for verification.

Thanks!
```

#### 5. Study Stress Marker

**Questions that need answers:**

1. **Installation and running:**
   - How to run locally?
   - Docker image available?
   - Dependencies?

2. **API and interface:**
   - How to call? (CLI, HTTP API, library?)
   - Input data format?
   - Output data format?

3. **Functionality:**
   - Only stress marks or something else?
   - How are stress marks denoted? (symbols)
   - Are there different pronunciation variants?
   - If yes, how to get them?

**Create test file:**
```markdown
# Stress Marker - Test Results

## Installation
- [x] Cloned repository
- [ ] Installed dependencies
- [ ] Successfully ran locally

## Test Inputs
Input 1: "Tere, kuidas läheb?"
Output: ???

Input 2: "Täna on ilus ilm"
Output: ???

## API Format
Request format: ???
Response format: ???

## Pronunciation Variants
Question: Can it provide multiple variants?
Answer: ???

## Issues Found
1. ???
2. ???

## Conclusion
Ready to use: YES / NO / PARTIALLY
Blockers: ???
```

#### 6. Study Merlin TTS

**Questions that need answers:**

1. **Installation and running:**
   - How to run?
   - Docker?
   - Resource requirements?

2. **API and interface:**
   - How to call?
   - File-based (as mentioned)?
   - Can we wrap with HTTP API?

3. **Synthesis:**
   - Input data format?
   - Output audio format? (WAV? MP3? Sample rate?)
   - Synthesis speed?
   - "One file at a time" limitation - how does it manifest?

4. **⭐ CRITICAL: Timing data**
   - Does Merlin output timing information?
   - Word-level timing?
   - Phoneme-level timing?
   - Timing data format?

**Create test file:**
```markdown
# Merlin TTS - Test Results

## Installation
- [ ] Installed
- [ ] Successfully synthesized test audio

## Test Synthesis
Input: "Tere, kuidas läheb?" (with stress marks)
Output audio: [link to generated file]
Duration: ??? seconds
Quality: Good / OK / Poor

## Performance
Time to synthesize 10-word sentence: ??? seconds
Concurrent requests: Blocked (as expected)

## Timing Data ⭐
Does Merlin output timing data? YES / NO

If YES:
- Format: ???
- Word-level: YES / NO
- Phoneme-level: YES / NO
- Example: ???

If NO:
- We need alternative approach (see CRITICAL_QUESTIONS.md)

## Audio Format
- Format: WAV / MP3 / ???
- Sample rate: ???
- Bitrate: ???
- File size (10 words): ???

## Issues Found
1. ???

## Conclusion
Ready to use: YES / NO / PARTIALLY
Blockers: ???
```

---

## 📅 Plan for Next Week (Week 4)

### 7. Meeting with designer Helen

**When:** Next week  
**Participants:** Tatjana, Helen, Aleksei (?)  
**Agenda:**
- Visualization of phonetic symbols
- Design system integration
- UI development timeline

**Prepare:**
- Review client's Storybook
- Estimate how much time UI will take
- Prepare questions about components

### 8. Choose technology stack

**Based on:**
- Language of client components (Python? Node?)
- Design system (React? Vue?)
- Your preferences
- Performance requirements

**Create document:**
```markdown
# Technology Stack Decision

## Frontend
Choice: React / Vue / ???
Reason: ???

## Backend  
Choice: Node.js / Python / ???
Reason: ???

## Database
Choice: PostgreSQL / MySQL / ???
Reason: ???

## Queue
Choice: Redis + Bull / RabbitMQ / ???
Reason: ???

## Hosting
Choice: ??? (Anton will decide)

## CI/CD
Choice: GitHub Actions / GitLab CI / ???
```

### 9. Set up Development Environment

**Docker Compose for local development:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app"]
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
  
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: eki_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
  
  redis:
    image: redis:7
  
  stress-marker:
    # Client's component
    build: ./components/stress-marker
    ports: ["5001:5001"]
  
  merlin:
    # Client's component
    build: ./components/merlin
    ports: ["5002:5002"]
```

---

## 📅 Plan for Rest of October

### 10. Integration Prototype

**Goal:** Prove that components work end-to-end

**Minimal prototype:**
```
Simple HTML form
    ↓
Submit text
    ↓
Call Stress Marker
    ↓
Call Merlin TTS
    ↓
Return audio file
    ↓
Play in browser
```

**Without:**
- No database
- No authentication
- No beautiful UI
- No variants

**Only proving:** Basic flow works

### 11. Document Results

**Create:**
```markdown
# Component Integration - Feasibility Report

## Executive Summary
Can we build this? YES / NO / WITH MODIFICATIONS

## Stress Marker Integration
Status: ✅ Works / ⚠️ Issues / ❌ Blocker
Issues: ???

## Merlin TTS Integration  
Status: ✅ Works / ⚠️ Issues / ❌ Blocker
Issues: ???

## Critical Questions Answered
Q1: Pronunciation variants - WHERE FROM?
A1: ???

Q2: Timing data - AVAILABLE?
A2: ???

## Recommendations
1. ???
2. ???

## Revised Estimate
Original: €36k, 13 weeks
After testing: €??? k, ??? weeks
Reason: ???
```

### 12. CI/CD Setup

**Set up with Anton:**
- Automatic build from Git
- Deployment to dev environment
- Basic tests (smoke tests)

---

## ✅ Success Checklist by End of October

### Technical Readiness
- [ ] Client components running locally
- [ ] Tested end-to-end flow
- [ ] Got answers to critical questions
- [ ] Chosen technology stack
- [ ] Development environment set up
- [ ] CI/CD working

### Documentation
- [ ] All documentation in Git
- [ ] Phase plan detailed
- [ ] Acceptance criteria written
- [ ] Feasibility report ready

### Decisions
- [ ] Pronunciation variants - clear where from
- [ ] Timing for karaoke - have solution
- [ ] Design system - clear how to integrate
- [ ] Architecture agreed upon

---

## 🚨 If Something Goes Wrong

### Blocker: No access to components
**Action:** Immediately escalate to Tatjana  
**Critical:** Without components we can't start

### Blocker: Components don't work
**Action:** Document problem → discuss with team  
**Possibly:** Need help from client

### Blocker: No answer to critical questions
**Action:** Can't give accurate estimate  
**Solution:** Make assumptions, document risks

### Blocker: Licenses don't fit
**Action:** STOP, don't start development  
**Solution:** Discuss alternatives with client

---

## 📞 Who to Contact

### For Access
- **Git:** Anton
- **Components:** Tatjana → client
- **Design system:** Tatjana

### For Technical Questions
- **Architecture:** Discuss with team
- **Client components:** Through Tatjana to client
- **Infrastructure:** Anton

### For Project Questions
- **Timeline, priorities:** Tatjana
- **Requirements:** Tatjana
- **Client:** Through Tatjana

---

## 📚 What to Read Every Day

1. **Morning:** Check Git (new commits, issues)
2. **Work:** Open Cursor with project
3. **Evening:** Update TODO.md with your progress

**Key documents:**
- [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md) - what MUST be found out
- [WORKFLOW.md](WORKFLOW.md) - how we work
- [TODO.md](TODO.md) - what to do

---

## 🎯 Success Criteria

**End of October - I'm ready to start development if:**

✅ I ran components locally  
✅ I understood where pronunciation variants come from  
✅ I know if there's timing data for karaoke  
✅ I chose and configured technology stack  
✅ I can deploy simple application to dev  
✅ All documentation in Git and up to date  

**If all ✅ → November we can start coding UI and functionality!**

---

**Document:** Action plan for Aleksei  
**Priority:** High  
**Deadline:** End of October  
**Status:** In progress

**Questions?** → Tatjana

