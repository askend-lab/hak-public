# AI-Assisted Development Workflow - Discussion Agenda

**Date:** 2025-10-21 (Tomorrow)  
**Purpose:** Define methodology for AI-assisted software development  
**Context:** First AI-driven project in organization

---

## 🎯 Overview

This project (EKI) is the **first in the organization** developed with AI assistance (Claude via Cursor).

**Goal:** Document replicable process for future AI-assisted projects.

**Challenge:** Align AI workflow with existing Agile/Jira processes.

---

## 📋 Topics to Discuss

### 1. Repository Structure & AI Workspace

**Question:** How to organize AI methodology documentation?

**Options:**
- **Separate repository** for AI methodology
  - Pros: Reusable across projects, centralized
  - Cons: How to link to Cursor workspace?
- **Subrepository** (git submodule)
  - Pros: Connected but separate
  - Cons: Complexity
- **Workspace folder** (Cursor multi-root)
  - Pros: Easy access for AI
  - Cons: Mixed concerns?

**Decision needed:**
- Where to store AI methodology docs?
- How to make them visible to AI workspace?
- How to update frequently without disrupting projects?

---

### 2. Jira Terminology vs. Our Workflow

**Problem:** Jira concepts don't map cleanly to our AI workflow

**Jira Standard:**
```
Epic (months)
  └─ Story (weeks)
      └─ Task (days)
          └─ Subtask (hours)
Sprint = 2 weeks
```

**Our AI Workflow:**
```
"Sprint" = 1-2 hours
  ├─ Planning: 15-20 min
  ├─ Execution: 60 min (AI autonomous)
  └─ Commit & Report: 15 min
```

**Terminology Conflict:**
- ❌ Can't call our 1-hour iteration a "Sprint" (Jira Sprint = 2 weeks)
- ❌ Can't call it a "Task" (our scope > typical Task)
- ❓ What should we call it?

**Options:**
1. **"Work Unit"** - neutral, clear
2. **"Session"** - reflects AI pairing session
3. **"Iteration"** - agile term, but clear
4. **"Task"** - use Jira term, accept larger scope
5. **Keep "Sprint"** - just document that it's different from Jira

**Decision needed:**
- What to call our 1-2 hour AI work iterations?
- How do they map to Jira issues?

---

### 3. Jira Integration Strategy

**Principle:** Minimize Jira interactions - only reporting, not planning

**Current approach:**
- Planning happens locally (PLAN.md)
- Execution happens locally (code + tests)
- Reporting to Jira at completion

**Questions:**
1. **When to create Jira issues?**
   - At start of work?
   - At end of work?
   - Daily batch?

2. **What level of Jira issue?**
   - Each AI "sprint" = Sub-task?
   - Each AI "sprint" = Task?
   - Group multiple iterations into one Task?

3. **What to track in Jira?**
   - Time spent?
   - Story points?
   - Just completion status?

**Example from today:**
- Sprint 02 (6 hours) → Created ANT-12 Sub-task → Marked Done
- Works, but is this the right mapping?

---

### 4. Git Workflow for AI Development

**Questions:**

**Branching:**
- Main branch only?
- Feature branches per "sprint"?
- Feature branches per Jira Epic?
- No branches (direct commits)?

**Commits:**
- When to commit?
  - After each "sprint"?
  - After each phase?
  - Daily?
- Commit message format?
  - Link to Jira issue?
  - Reference PLAN.md?

**Pull Requests:**
- Use PRs?
  - Per "sprint"?
  - Per Epic?
  - Never (project-dependent)?
- Who reviews?
  - Human always?
  - AI self-review?
  - Automated checks only?

**Decision needed:**
- Git workflow for this project
- General guidelines for future AI projects
- When PRs are required vs. optional

---

### 5. AI Autonomy & Human Checkpoints

**Goal:** AI works autonomously for 1 hour, minimal interruptions

**Workflow proposal:**
```
1. Planning (15-20 min, human-led)
   - Define goal
   - Break into phases
   - Set success criteria
   
2. Execution (60 min, AI autonomous)
   - Follow TDD
   - Write tests & code
   - Run tests
   - Refactor
   - Update docs
   
3. Review & Commit (15 min, human-led)
   - Human reviews output
   - AI adjusts if needed
   - Commit changes
   - Update Jira
   - Optional: Retrospective
```

**Questions:**
- Is 1 hour realistic?
- When should AI ask for help?
- What if stuck? (timeout mechanism?)
- How to handle scope creep?

---

### 6. Project-Specific vs. Organization-Wide

**Two levels of documentation:**

**Organization-wide (separate repo?):**
- AI development philosophy
- General Jira integration
- General git workflows
- Team collaboration with AI
- Security & compliance
- Tool setup (Cursor, MCP)

**Project-specific (this repo):**
- EKI architecture
- Tech stack choices
- Sprint plans & reports
- Code standards
- Testing strategy

**Decision needed:**
- Split now or later?
- How to reference org-wide from project?
- Who maintains org-wide docs?

---

### 7. Specific Decisions Needed for This Project

**Git:**
- [ ] Branch strategy?
- [ ] Commit frequency?
- [ ] Pull request policy?
- [ ] Commit message format?

**Jira:**
- [ ] Map our "sprint" to Task or Sub-task?
- [ ] Track time in Jira?
- [ ] Use Jira sprints at all?
- [ ] How often to sync?

**Terminology:**
- [ ] What to call our 1-2 hour iterations?
- [ ] Update all docs with chosen term?

**Quality Gates:**
- [ ] When is work "done"?
- [ ] Required test coverage %?
- [ ] Who approves merges?

---

## 📊 Current State Analysis

**What works:**
- ✅ Local planning (PLAN.md)
- ✅ TDD methodology
- ✅ Local testing
- ✅ Documentation standards
- ✅ Post-completion Jira reporting

**What needs definition:**
- ❓ Terminology alignment
- ❓ Git workflow
- ❓ Jira integration timing
- ❓ Workspace setup for AI methodology docs
- ❓ Review process

---

## 🎯 Discussion Goals

**Tomorrow we need to decide:**

1. **Terminology:** What to call our work units?
2. **Repository:** Where AI methodology docs live, how AI accesses them?
3. **Jira Mapping:** How our work maps to Jira issues?
4. **Git Workflow:** Branching, commits, PRs for this project?
5. **Documentation Split:** Project vs. organization-wide?

**Output:** Clear decisions → Update Sprint 03 plan → Begin documentation

---

### 3. Project Documentation Structure (Replicable Template)

**Question:** How to structure project docs so other AI projects can follow?

**Balance needed:**
- ✅ **Enough** for AI to verify implementation compliance
- ✅ **Minimal** to not overload context window

**Documentation components:**

**3.1 Project Goal/Vision**
- How much detail?
- User stories? Use cases?
- Target audience definition?

**3.2 Architecture Documentation**
- High-level overview only?
- Detailed component diagrams?
- API specs?
- Data models?
- How deep to go?

**3.3 Roadmap**
- Required or optional?
- Granularity (Epics? Features? Releases?)
- How to keep updated?

**3.4 Coding Standards**
- Code style guide
- Naming conventions
- File structure
- When to document these?

**Decision needed:**
- **Template** for AI-friendly project documentation
- **Minimum viable docs** for AI to work effectively
- **Maximum size** before splitting files
- **Structure** that other projects can copy

**Example structure to validate:**
```
docs/
├── 01-BUSINESS/          # Goals, use cases
├── 02-ARCHITECTURE/      # System design
├── 03-IMPLEMENTATION/    # Code standards, APIs
├── 04-ROADMAP/           # Future plans (optional?)
└── 05-PROCESS/           # How to work (this discussion)

sprints/                  # Actual work log
└── archive/              # Completed work
```

Is this structure reusable? Too much? Too little?

---

### 4. Mini-Sprint Definition & Workflow

**Working name:** "Mini-Sprint" (temporary - needs better name)

**Characteristics:**
- **Duration:** 1-2 hours total
  - Planning: 15-20 min (human-led)
  - Execution: 60 min (AI autonomous)
  - Review: 15 min (human-led)
- **Scope:** Deliverable unit of work
- **Output:** Tested, documented, committable code
- **End:** Pull request (maybe?) + Jira update

**Problem:** Scope can change during execution!
- Developer may decide to exclude something
- Developer may add something discovered during work
- Not fixed like traditional Sprint

**Questions:**

**4.1 Naming**
- "Mini-Sprint" too confusing with Jira Sprint?
- "Work Session"?
- "Development Unit"?
- "Iteration"?
- "Task" (accept it's bigger than typical)?

**4.2 Scope Management**
- How to handle scope changes mid-execution?
- Re-estimate on the fly?
- Document changes in PLAN.md?
- When to split into multiple units?

**4.3 Planning Process**
- How to break down work?
- Time estimation rules?
- Phase breakdown (always? sometimes?)
- Success criteria - how specific?

**4.4 Execution Rules**
- TDD mandatory?
- Test coverage threshold (80%+)?
- When to ask for help vs. continue?
- How to track progress during work?

**4.5 Completion Criteria**
- What tests to run?
  - Unit tests?
  - Integration tests?
  - E2E tests?
  - All of the above?
- User validation - what to check?
- Code review - self or human?
- Refactoring - before or after commit?

**4.6 Deliverables**
- Always PLAN.md?
- Always FINAL-REPORT.md?
- Or lighter for small units?
- Code + tests (always)
- Documentation updates (always?)

---

### 5. Estimation & Story Points

**Question:** How to estimate AI work?

**Story Points - What they mean:**
- Traditional: Complexity + Effort + Uncertainty
- AI context: ???

**Challenges:**
- AI speed varies (new tech vs. familiar)
- Context switching cost
- Debugging/fixing can expand time
- First time vs. second time (learning curve)

**Proposals:**

**Option 1: Time-based**
- 1 SP = 30 min
- 2 SP = 1 hour
- 3 SP = 1.5 hours
- 5 SP = 2-3 hours
- 8 SP = too big, split

**Option 2: Complexity-based**
- 1 SP = Simple (CRUD, styling)
- 2 SP = Medium (API integration)
- 3 SP = Complex (new architecture)
- 5 SP = Very complex (R&D needed)

**Option 3: Hybrid**
- Use Fibonacci (1, 2, 3, 5, 8)
- Consider: Complexity + Unknowns + Dependencies
- AI velocity tracked over sprints

**Decision needed:**
- Story point system for AI work?
- Estimation guidelines?
- How to calibrate (adjust based on actual)?
- Track velocity over time?

---

### 6. Refactoring in Mini-Sprint Workflow

**Question:** When and how to refactor?

**TDD includes refactoring:**
- RED → GREEN → **REFACTOR**

**But when exactly?**
- After each test passes?
- At end of all features?
- Separate refactoring "mini-sprint"?

**Refactoring scope:**
- Must tests pass before refactoring? (YES)
- Must tests pass after refactoring? (YES)
- Can refactoring be separate from feature work?

**Decision needed:**
- Refactoring always included in mini-sprint time?
- Or separate task type?
- How to estimate refactoring time?
- Can developer decide "no refactoring needed"?

---

### 7. Pull Request Strategy (Project-Dependent)

**Question:** When to use PRs in AI projects?

**Current understanding:**
- Some projects: No PRs, direct commits to main/development
- Some projects: PRs required
- Decision per project

**For EKI project:**
- [ ] Use PRs?
- [ ] If yes, when?
  - Per mini-sprint?
  - Per Epic?
  - Per feature?
- [ ] Who reviews?
  - Human always?
  - AI self-review sufficient?
  - Automated CI only?

**PR content if used:**
- Link to Jira issue?
- Include PLAN.md summary?
- Test results?
- Coverage report?

---

### 8. "Scrum for AI" - Complete Methodology

**Big picture:** Need comprehensive methodology document

**Should cover:**

**8.1 Roles**
- AI Developer (Claude)
- Human Developer/Product Owner
- Reviewer (if separate)

**8.2 Artifacts**
- PLAN.md (planning artifact)
- Code + Tests (product)
- FINAL-REPORT.md (review artifact)
- Jira issues (tracking)

**8.3 Ceremonies**
- Planning session (15-20 min)
- Execution (AI autonomous)
- Review/Demo (what was built)
- Retrospective (what learned)

**8.4 Metrics**
- Velocity (story points per week?)
- Test coverage %
- Time estimates accuracy
- Bug rate post-completion

**8.5 Quality Gates**
- Definition of Ready (before starting)
- Definition of Done (before committing)
- Acceptance criteria

**Decision needed:**
- Is this Sprint 03 scope?
- Or separate initiative?
- Who creates org-wide methodology?
- Timeline?

---

### 9. Multi-Project Scalability

**Question:** How to make this work across projects?

**Scenarios:**
1. **New AI project starts** - what do they copy from EKI?
2. **Different tech stack** - does methodology change?
3. **Different team** - different Jira setup?

**Reusable components:**
- ✅ Process documents (testing, TDD, etc.)
- ✅ Templates (PLAN, REPORT)
- ❓ Project structure?
- ❓ Jira integration scripts?
- ❓ Git hooks?

**Project-specific:**
- Architecture
- Tech stack choices
- Business domain
- Coding standards (language-specific)

**Decision needed:**
- What's in "AI Methodology Core" (reusable)?
- What's in "Project Template" (copy per project)?
- How to version methodology?

---

### 10. Context Window Management

**Critical question:** How to keep documentation minimal but complete?

**AI context limit considerations:**
- Current: 1M tokens (~750k words)
- But reading large docs is expensive
- Need quick reference, not novels

**Documentation principles:**
- 200 lines max per file (already decided)
- English only (already decided)
- What else?

**Structure principles:**
- Many small files > few large files?
- Clear file names (self-documenting)?
- Cross-references (AI can read on-demand)?
- Index/README in each directory?

**Decision needed:**
- How to structure docs for optimal AI reading?
- Summarization strategy for large projects?
- When to split files?

---

### 11. Language Policy for AI Development

**Question:** What language to use during development vs. in repository?

**Proposed Rule:**

**During Mini-Sprint (Work in Progress):**
- ✅ **Any language** comfortable for user (Russian, Estonian, English)
- ✅ **Draft documents** in user's language for speed
- ✅ **Communication** in user's language for clarity
- ✅ **Quick iterations** without translation overhead

**Before Commit (Final):**
- ✅ **All code** in English (already standard)
- ✅ **All comments** translated to English
- ✅ **All documentation** translated to English
- ✅ **Commit messages** in English
- ✅ **PLAN.md & FINAL-REPORT.md** in English

**Benefits:**
- 🚀 **Speed:** No translation during active development
- 💬 **Clarity:** User communicates in native language
- 📖 **Understanding:** User reviews in comfortable language
- 🌍 **Repository:** Clean, international, shareable

**Implementation:**

**Phase 1: Development (any language)**
```
User (Russian): "Создай компонент кнопки"
AI (Russian): "Создаю... тесты написаны, компонент готов"
Draft docs (Russian): "Компонент для кнопки..."
```

**Phase 2: Pre-Commit Translation**
```
AI task: Translate all docs to English
- PLAN.md (ru) → PLAN.md (en)
- Code comments (ru) → Code comments (en)
- FINAL-REPORT.md (ru) → FINAL-REPORT.md (en)
```

**Phase 3: Commit (English only)**
```
✅ All files in English
✅ Commit message: English
✅ Repository: International
```

**Questions:**

**11.1 Translation Timing**
- Translate at very end of mini-sprint?
- Or phase-by-phase during work?
- Who validates translation quality?

**11.2 Translation Scope**
- Code comments - always translate?
- Variable names - English always?
- Test descriptions - translate?
- Temporary files - need translation?

**11.3 Exceptions**
- Domain-specific terms (Estonian linguistics) - keep in Estonian?
- User-facing text - multiple languages?
- Documentation examples - original language OK?

**11.4 Quality Control**
- AI self-translates?
- Human reviews translations?
- Automated checks for non-English?

**Decision needed:**
- Exact workflow for translation step
- What gets translated, what stays
- Quality assurance for translations
- Add "Translation phase" to mini-sprint checklist?

**Proposed Workflows:**

**Option A: Translate Before Commit (Current)**
1. Planning (15-20 min, any language)
2. Execution (60 min, any language)
3. Translation (10 min, AI translates to English)
4. Review & Commit (15 min, English only)
Total: 1.5-2 hours

**Option B: Feature Branch + Merge Translation**
1. Work in feature branch (any language)
2. Multiple commits in native language (fast iteration)
3. Before merge to main:
   - AI translates entire branch to English
   - Single merge commit (English only)
   - Main branch stays clean (no non-English commits)
4. Branch deleted after merge
Total: Same, but flexibility to commit multiple times

**Option C: Automated Pre-Commit Hook**
1. Work in any language
2. Try to commit
3. Pre-commit hook:
   - Detects non-English in code/docs
   - Auto-translates via AI
   - Commits English version
4. No manual translation step
Total: Automated, seamless

**Automation Ideas:**

**11.5 Git Hooks for Language Enforcement**
- **pre-commit hook:**
  - Scans staged files for non-English
  - Detects: code comments, documentation
  - Actions:
    - Block commit if non-English found?
    - Auto-translate and stage?
    - Warn and require manual fix?
- **pre-merge hook:**
  - Check entire branch before merge to main
  - Ensure main branch = English only
  - No "language commits" leak through

**11.6 Branch Strategy for Language Flexibility**
- **Feature branch:** Work in any language, commit freely
- **Main branch:** English only, enforced by hooks
- **Merge process:**
  - AI creates "translation commit" before merge
  - Or: Squash merge with English-only message
  - Or: Rebase and translate each commit

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| **Translate before each commit** | Clean history always | Slower iteration |
| **Feature branch + merge translation** | Fast iteration, clean main | More complex workflow |
| **Automated hook** | No manual work | Requires setup, may break workflow |

**Decision needed:**
- Which approach for EKI project?
- Default recommendation for other projects?
- Git hook implementation (if chosen)?
- Exception handling (domain terms, examples)?

**Example scenario:**
```
Feature branch: feature/sprint-02-frontend
  - commit 1: "Создан компонент TextInput" (Russian)
  - commit 2: "Добавлены тесты" (Russian)
  - commit 3: "Исправлен баг" (Russian)

Before merge:
  - AI translates all commits
  - Creates clean English history
  
Main branch after merge:
  - commit: "Sprint 02: Frontend components with tests" (English)
  - No Russian commits visible
```

**Questions:**
- Keep feature branch history (with Russian)?
- Or rewrite history during merge?
- Squash merge vs. merge commit?

---

## 💡 Questions for Tomorrow

1. Is there existing Agile/Scrum documentation in the organization?
2. Are other teams using Jira in similar ways?
3. What's the review/approval process normally?
4. Are there security/compliance requirements for AI-generated code?
5. Who will maintain organization-wide AI methodology docs?
6. Should this be documented in Sprint 03 or separate initiative?
7. **Language policy:** Working languages (ru/et/en) vs. repository language (en only)?
8. **Translation workflow:** Who ensures quality? Automated checks?

---

## 📝 Notes

**This document:** Discussion agenda, not final decisions

**After discussion:** Update Sprint 03 plan with agreed approach

**Sprint 03 may expand:** If we include org-wide methodology creation

---

**Status:** Ready for discussion  
**Next:** Tomorrow's planning session

