# AI-Assisted Development Workflow - Decisions Protocol

**Date:** 2025-10-20  
**Status:** ✅ Session Complete (5 decisions)  
**Purpose:** Document all decisions for AI development methodology

> **Note:** This is a living document. More decisions will be added in future sessions.

---

## Decision Log

### Decision #1: [PENDING] - Terminology for Work Units

**Date:** 2025-10-20  
**Topic:** What to call our 1-2 hour AI work iterations?

**Context:**
- Jira Sprint = 2 weeks (too big)
- Jira Task = typically small, narrow scope
- Our iteration = 1-2 hours, but contains multiple sub-tasks
- Scope: Planning + TDD + Implementation + Tests + Docs + Refactoring

**Current usage in this project:**
- We call them "Sprints" (Sprint 01, Sprint 02)
- But this conflicts with Jira terminology
- Causes confusion

**Options proposed:**

| Option | Pros | Cons | Notes |
|--------|------|------|-------|
| **"Sprint"** (keep current) | Already using, familiar | Conflicts with Jira Sprint (2 weeks) | Confusing |
| **"Mini-Sprint"** | Clear it's smaller | Still uses "Sprint" | Wordy |
| **"Work Session"** | Reflects AI pairing | Not standard Agile term | Clear |
| **"Iteration"** | Standard Agile term | Generic | Acceptable |
| **"Task"** | Maps to Jira Task | Our scope > typical Task | May work |
| **"Development Unit"** | Neutral, clear | Too formal | Meh |
| **"Cycle"** | Short, clear | Not standard | Interesting |

**Questions for discussion:**

1. **What matters most?**
   - Jira compatibility?
   - Internal clarity?
   - External documentation?

2. **How often do we reference Jira?**
   - If minimal, maybe conflict doesn't matter?
   - If frequent, need alignment?

3. **Can we redefine "Task" for AI context?**
   - Jira Task in AI project = larger scope than traditional
   - Document this explicitly?

4. **Do we need two terms?**
   - Internal: "Sprint" (what we call it in planning)
   - External: "Task" (what we call it in Jira)
   - Mapping documented clearly?

**My recommendation to discuss:**
- Consider keeping "Sprint" internally (Sprint 01, Sprint 02)
- Map to Jira "Task" or "Sub-task" for tracking
- Document: "In this AI project, Sprint ≠ Jira Sprint. Our Sprint = 1-2 hour Task."
- Alternative: Use "Task" everywhere, accept larger scope

**Decision:** ✅ **"Cycle"**

**Numbering format:** `[sprint].[cycle]` + optional description
- Example: `02.04` (Sprint 02, Cycle 04)
- Example: `02.04-refactoring` (with description)
- Example: `03.01-lifecycle-doc`

**Jira mapping:** Cycle = Task (or Sub-task under Story)

**Rationale:**
1. Standard Agile term, fits within Sprint
2. Clear hierarchy: Sprint > Cycle > (phases)
3. Easy to pronounce and type
4. Numbering shows: which Sprint, which Cycle
5. Optional description adds clarity

**Terminology:**
- **Jira Sprint (2 weeks)** → contains multiple Cycles
- **Cycle (1-2 hours)** → maps to Jira Task
- **Phase (15-30 min)** → internal breakdown of Cycle

**Usage:**
- "Today completed Cycles 02.03 and 02.04"
- Directory: `sprints/sprint-02/cycle-02.04/`
- Jira: Task "Cycle 02.04: Component refactoring"

**Action items:**
1. Update Sprint 01 & 02 naming retroactively
2. Create Cycle numbering guide
3. Update all documentation templates

---

### Decision #2: Language Policy

**Date:** 2025-10-20  
**Topic:** What language for communication vs. files?

**Decision:** ✅ **English for all repository files, user's language for communication**

**Rules:**
1. **All files in repository:** English (default)
   - Code, comments, documentation, tests
   - PLAN.md, FINAL-REPORT.md
   - README files
   - No exceptions unless explicitly requested

2. **Communication with user:** User's language
   - Russian, Estonian, English - whatever user prefers
   - AI responds in same language
   - Fast, clear communication

3. **Exception:** User can request specific file in other language
   - Rare case
   - Must be explicit request
   - Document why in English separately

**Rationale:**
- Repository = international, shareable
- Communication = comfortable, efficient
- No translation overhead during work
- Clean, professional codebase

**Action items:**
1. Update documentation standards
2. All new files: English only
3. Existing files: already English ✅

---

### Decision #3: Git Workflow & Branching

**Date:** 2025-10-20  
**Topic:** Branch strategy for Cycles

**Decision:** ✅ **Feature branch per Cycle (default), project can override**

**Default workflow:**
1. Create branch: `cycle/[sprint].[cycle]-[description]`
   - Example: `cycle/02.04-refactoring`
2. Work and commit freely in branch
3. When Cycle complete:
   - Run all tests
   - Merge to main
   - Delete branch
4. One branch = one Cycle

**Project override allowed:**
- Small projects: can commit directly to main
- Must be documented in project's CODING_RULES.md
- Example: "This project uses direct main commits (no branches)"

**For EKI project:** ✅ **Override - direct main commits**
- Reason: Small project, single developer
- No branches, no PRs
- Commit after each Cycle complete
- Can switch to branches later if needed

**Rationale:**
- Feature branches = safe, isolated work
- Easy to abandon if Cycle fails
- Clean main branch
- But small projects: overhead not worth it

**Action items:**
1. Document default in methodology
2. Each project chooses in setup phase
3. Update templates with both options

---

### Decision #4: Jira Integration Strategy

**Date:** 2025-10-20 (Updated)  
**Topic:** When and how to sync Cycles with Jira

**Decision:** ✅ **Create Jira Task BEFORE Cycle start (placeholder), update after completion**

**Workflow:**
1. **Before Cycle starts (placeholder creation):**
   - Create Jira Task
   - Minimal fields:
     - Summary: "Cycle [sprint].[cycle]: [brief name]"
     - Sprint: Assign to Jira Sprint
     - Project: ANT
   - Get Task number (e.g., ANT-13)
   - **Purpose:** Enable Jira-linked commits
2. **During Cycle:** 
   - Use Task number in ALL commits: `[ANT-13] Description`
   - Work locally
3. **After Cycle complete:**
   - Update Task with full details (see below)
   - Add story points
   - Mark as Done
4. **No separate report per Cycle**

**Full Jira Task fields (update after completion):**
- **Summary:** Cycle [sprint].[cycle]: [description]
  - Example: "Cycle 02.04: Component refactoring"
- **Description:**
  - Functionality delivered
  - Key changes
  - Link to documentation (if separate report exists)
- **Story Points:** Mandatory (for velocity tracking)
- **Sprint:** Assign to correct Jira Sprint
- **Project:** ANT (or relevant)
- **Labels:** Relevant tags (e.g., "EKI", "frontend")

**Story Points:**
- Required for every Cycle
- Used to calculate team velocity
- Estimate based on complexity + time

**Optional fields:**
- Time tracking (if needed)
- Attachments (screenshots, diagrams)
- Links to commits/PRs

**Rationale:**
- Minimal Jira overhead during work
- Complete tracking after delivery
- Velocity metrics for planning
- Clean Jira board

**Action items:**
1. Define story point scale for Cycles
2. Create Jira Task template
3. Document in Cycle completion checklist

---

### Decision #5: Story Points Scale

**Date:** 2025-10-20  
**Topic:** How to estimate Cycles

**Decision:** ✅ **Fibonacci sequence: 1, 2, 3, 5, 8, 13 (max)**

**Scale:**
- **1 SP** - Simple, quick (30-60 min)
- **2 SP** - Standard Cycle (1-1.5 hours)
- **3 SP** - Medium complexity (1.5-2 hours)
- **5 SP** - Complex (2-3 hours)
- **8 SP** - Very complex → **discuss & split**
- **13 SP** - Too large → **must split**

**Rules:**
- If estimate ≥8 SP: discuss with team, likely split
- If estimate =13 SP: mandatory split into smaller Cycles
- Prefer smaller Cycles (1-5 SP)

**Considerations:**
- Complexity + Unknowns + Dependencies
- Not just time
- AI velocity will be tracked and calibrated

**Action items:**
1. Document scale in methodology
2. Add to Cycle planning checklist
3. Track actual vs estimated for calibration

---

### Decision #6: Repository Structure for AI Methodology

**Date:** 2025-10-20  
**Topic:** Where to store reusable AI methodology docs

**Decision:** ✅ **Separate repository + Cursor multi-root workspace**

**Structure:**
- **Methodology repo:** `ai-dev-methodology` (separate repo)
- **Project repos:** `EKI-ui`, `project-2`, etc.
- **Cursor workspace:** Multi-root (both repos visible to AI)

**Workspace setup:**
```json
{
  "folders": [
    { "path": "../ai-dev-methodology" },
    { "path": "." }
  ]
}
```

**Methodology repo contains:**
- Process docs (SPRINT_LIFECYCLE, TESTING_STRATEGY, etc.)
- Templates (PLAN, FINAL-REPORT)
- Glossary, decision log
- Reusable across all projects

**Project repo contains:**
- Project-specific docs (architecture, business)
- Code, tests
- Sprint history
- Reference to methodology version

**Rationale:**
- Central source of truth
- AI has access via workspace
- Easy updates (git pull)
- Version control for methodology
- Reusable across organization

**Action items:**
1. Create `ai-dev-methodology` repository
2. Move generic docs from EKI to methodology repo
3. Keep project-specific docs in EKI
4. Document workspace setup

---

### Decision #7: Definition of Done for Cycle

**Date:** 2025-10-20  
**Topic:** When is Cycle complete?

**Decision:** ✅ **Comprehensive checklist + Backlog for deferred items**

**Cycle Completion Checklist:**

**Scope & Functionality:**
- [ ] All planned features implemented
- [ ] Cycle goal achieved (as defined in PLAN.md)
- [ ] Tests cover ALL required functionality (not just high %)
- [ ] No gaps between requirements and tests

**Testing & Quality:**
- [ ] All tests passing (unit + integration + E2E)
- [ ] TDD followed (RED → GREEN → REFACTOR)
- [ ] Code coverage ≥80%
- [ ] No linter errors

**Architecture & Technical:**
- [ ] No contradiction with system architecture
- [ ] No contradiction with system functionality/roadmap
- [ ] Technical debt identified and registered
- [ ] Risks identified and registered

**Refactoring (see separate REFACTORING.md):**
- [ ] No code duplication
- [ ] No long files (size limits defined per project)
- [ ] Correct file names
- [ ] Files in correct locations
- [ ] No documentation >200 lines

**User Review:**
- [ ] User tested functionality manually
- [ ] User reviewed code visually
- [ ] User errors fixed or registered in Backlog
- [ ] User comments addressed or registered in Backlog

**Documentation:**
- [ ] Documentation updated (all relevant docs)
- [ ] PLAN.md updated with results
- [ ] Code comments added
- [ ] README updated (if needed)
- [ ] Ideas registered in Backlog

**Backlog Management:**
- [ ] Dropped scope items → Backlog
- [ ] New ideas → Backlog
- [ ] Identified risks → Backlog (Risks section)
- [ ] Technical debt → Backlog (Tech Debt section)

**BACKLOG.md structure:**
```markdown
# Project Backlog

## Ideas
- [Date] Idea description (from Cycle X.Y)

## Technical Debt
- [Date] Known debt (from Cycle X.Y)

## Risks
- [Date] Risk description (from Cycle X.Y)

## Deferred Features
- [Date] Feature dropped from Cycle X.Y
```

**Cycle cannot close until:**
- All checkboxes checked OR
- Decision made for each unchecked item (defer, skip, accept)
- Decision documented

**Action items:**
1. Create BACKLOG.md template
2. Create REFACTORING.md with criteria
3. Add to Cycle templates

---

### Decision #8: Test Coverage Thresholds

**Date:** 2025-10-20  
**Topic:** Required test coverage %

**Decision:** ✅ **Overall 85%, flexible per component**

**Two approaches (document both):**

**Approach A: Uniform threshold**
- All code: ≥85%
- Simple, clear rule

**Approach B: Differentiated thresholds**
- Critical paths (API, auth): 95-100%
- Business logic: 90%
- UI components: 80%
- Utils/helpers: 75%
- **Overall project:** ≥85%

**Projects can choose approach in CODING_RULES.md**

**Mandatory:**
- Overall coverage ≥85% (always)
- Report coverage in Cycle completion
- Track trend over time

**Action items:**
1. Document both approaches
2. Add coverage reporting to checklist
3. Configure vitest coverage thresholds

---

### Decision #9: Commit Message Format

**Date:** 2025-10-20  
**Topic:** How to format commit messages

**Decision:** ✅ **Jira-linked format**

**Format:** `[JIRA-KEY] Brief description`

**Examples:**
- `[ANT-12] Sprint 02: Frontend with EKI Design System`
- `[ANT-13] Cycle 03.01: Add BACKLOG.md template`
- `[ANT-14] Fix audio player auto-play`

**Rules:**
- Always include Jira Task key
- English only
- Brief but descriptive
- Present tense

**Workflow impact:**
- Task must be created BEFORE first commit
- Placeholder Task OK (will be filled later)

**Action items:**
1. Document format in methodology
2. Add to commit checklist
3. Consider git commit template

---

### Decision #10: Retrospective Process

**Date:** 2025-10-20  
**Topic:** How to conduct Cycle retrospectives

**Decision:** ✅ **Focus on process improvement, not just deliverables**

**Key retrospective question (mandatory):**
> "What should we improve in documentation/methodology to make the process more efficient, faster, reliable, and higher quality?"

**Retrospective structure:**
1. What went well? ✅
2. What didn't go well? ❌
3. What did we learn? 🎓
4. **What to improve in way of working?** ⭐ (main focus)
   - Documentation gaps?
   - Methodology unclear?
   - Process bottlenecks?
   - Tools/templates needed?
5. Action items for next Cycle

**Output:**
- Updates to methodology docs
- New templates/checklists
- Process refinements
- Continuous improvement

**Frequency:**
- After each Cycle (brief, 5-10 min)
- After each Sprint (detailed, if multiple Cycles)

**Action items:**
1. Create retrospective template
2. Add to Cycle completion checklist
3. Track improvements over time

---

### Decision #11: AI Development Transparency

**Date:** 2025-10-20  
**Topic:** How to disclose AI-assisted development

**Decision:** ✅ **Clearly state in project README with links to methodology**

**Required in every AI project README:**

**Section:** "Development Methodology" or "About This Project"

**Content:**
- Statement: "This project is developed with AI assistance"
- AI tool used: Claude Sonnet 4.5 via Cursor
- Link to methodology documentation
- Link to workflow decisions
- Team composition (Human + AI)

**Example:**
```markdown
## Development

**AI-Assisted:** This project is developed using Claude Sonnet 4.5 via Cursor

**Methodology:** See [AI Development Workflow](../ai-dev-methodology/)

**Team:**
- Human Developer: [Name]
- AI Assistant: Claude Sonnet 4.5

**Process:** Cycle-based development (1-2 hour iterations)
```

**Rationale:**
- Transparency about AI use
- Clear documentation for future maintainers
- Easy to find methodology
- Professional disclosure

**Action items:**
1. Update EKI README
2. Add to project template
3. Link to methodology repo

---

### Decision #12: Project Documentation Structure

**Date:** 2025-10-20  
**Topic:** Standard folder structure for AI projects

**Decision:** ✅ **Three main documentation blocks + optional raw materials**

**Structure:**

```
project-root/
├── docs/
│   ├── 01-PRODUCT/              # Business documentation
│   │   ├── INTRODUCTION.md      # What is this? For whom?
│   │   ├── PROBLEM.md           # What problem are we solving?
│   │   ├── ALTERNATIVES.md      # Why this solution? What else considered?
│   │   ├── USE_CASES.md         # Functional requirements (with checkboxes)
│   │   ├── NON_FUNCTIONAL.md    # Performance, security, etc. (with checkboxes)
│   │   └── RISKS.md             # Known risks
│   │
│   ├── 02-IT/                   # Technical documentation
│   │   ├── ARCHITECTURE.md      # System design, components
│   │   ├── API_SPEC.md          # API documentation (if needed)
│   │   ├── DATA_MODELS.md       # Data structures (if needed)
│   │   └── CODING_RULES.md      # Code standards
│   │
│   ├── 03-PROJECT/              # Project management
│   │   ├── ROADMAP.md           # High-level sequence (with checkboxes)
│   │   ├── SPRINTS.md           # Human sprints status (with checkboxes)
│   │   ├── BACKLOG.md           # Ideas, tech debt, deferred items
│   │   └── sprint-01/           # Cycles for Sprint 01
│   │       ├── cycle-01.01.md
│   │       └── cycle-01.02.md
│   │
│   └── 00-RAW/                  # Optional: Client materials
│       └── original-docs/
│
├── sprints/                     # Or use docs/03-PROJECT/
│   ├── sprint-01/
│   └── sprint-02/
```

**Alternative naming (to discuss):**
- `01-PRODUCT`, `02-IT`, `03-PROJECT`
- Or: `PRODUCT/`, `TECHNICAL/`, `MANAGEMENT/`
- Or: `business/`, `tech/`, `project/`

**Key principles:**
1. **Separation of concerns:** Business ≠ Technical ≠ Management
2. **Checkboxes:** Requirements, roadmap, sprints all trackable
3. **Scalable:** Structure works for small and large projects
4. **AI-friendly:** Clear hierarchy, max 200 lines per file

**Required minimum docs:**
- ✅ INTRODUCTION.md
- ✅ PROBLEM.md
- ✅ ARCHITECTURE.md
- ✅ USE_CASES.md
- ✅ ROADMAP.md

**Optional:**
- ALTERNATIVES.md (good for decision history)
- NON_FUNCTIONAL.md (if complex requirements)
- RISKS.md (if significant risks)
- RAW materials folder

**Action items:**
1. Decide on folder naming convention
2. Create project template with this structure
3. Migrate EKI docs to this structure (if needed)
4. Document in methodology repo

**Folder naming:** ✅ **Use numeric prefixes**
- `01-PRODUCT/`, `02-IT/`, `03-PROJECT/`
- Good visual sorting
- Clear hierarchy

---

### Decision #13: Project Setup Workshop

**Date:** 2025-10-20  
**Topic:** How to start new AI project from scratch

**Decision:** ✅ **Workshop checklist + Templates with built-in instructions**

**Document needed:** `HOW_TO_START_PROJECT.md`

**Workshop agenda (with user):**
1. [ ] What problem are we solving? → PROBLEM.md
2. [ ] Who is this for? → INTRODUCTION.md
3. [ ] What alternatives exist? → ALTERNATIVES.md
4. [ ] How will we solve it technically? → ARCHITECTURE.md
5. [ ] What are use cases? → USE_CASES.md
6. [ ] Non-functional requirements? → NON_FUNCTIONAL.md
7. [ ] What are the risks? → RISKS.md
8. [ ] What's the roadmap? → ROADMAP.md
9. [ ] Coding standards? → CODING_RULES.md
10. [ ] Setup BACKLOG.md
11. [ ] Create first Sprint plan

**Sources:**
- User provides documents
- AI + User discuss and create
- AI reads external materials and drafts

**Human Sprint management:**
- Create `SPRINTS.md` with checkboxes
- Track which Sprints active/complete
- Link to Cycles within Sprint

**Cycle Templates:**
- Template includes instructions (no separate how-to)
- Self-documenting
- Checklist built-in

**Action items:**
1. Create `HOW_TO_START_PROJECT.md` workshop guide
2. Create Sprint open/close checklists
3. Create Cycle template with instructions
4. Document in methodology repo

---

### Decision #14: Templates Over Instructions

**Date:** 2025-10-20  
**Topic:** How to create new documents

**Decision:** ✅ **Use templates (copy & fill), not how-to guides**

**Approach:**
- Methodology repo contains templates
- AI copies template → fills in project-specific info
- Faster than reading instructions

**Templates needed:**
- CYCLE_PLAN_TEMPLATE.md
- FINAL_REPORT_TEMPLATE.md
- INTRODUCTION_TEMPLATE.md
- PROBLEM_TEMPLATE.md
- ARCHITECTURE_TEMPLATE.md
- USE_CASES_TEMPLATE.md
- ROADMAP_TEMPLATE.md
- BACKLOG_TEMPLATE.md
- README_TEMPLATE.md

**Template format:**
- Placeholders: `[PROJECT_NAME]`, `[CYCLE_NUMBER]`
- Instructions as comments in template
- Examples included

**Action items:**
1. Create all templates in methodology repo
2. Document template usage
3. No separate how-to guides needed

---

### Decision #15: Self-Documenting Templates

**Date:** 2025-10-20  
**Topic:** How to make templates AI-friendly

**Decision:** ✅ **Embed explanations as comments in templates**

**Principle:**
- AI reads ONE document better than TWO
- Template + instructions in same file > Template + separate guide
- Quality improves when context is immediate

**Template format:**
```markdown
# [PROJECT_NAME] - Cycle Plan

<!-- WHY: This plan guides AI through 1-2 hour development cycle -->
<!-- FORMAT: Use checkboxes for trackability -->

## Goal
<!-- Describe: What we're building, why, success criteria -->
[Fill in goal here]

## Phases
<!-- Break work into 15-30 min chunks for progress tracking -->
- [ ] Phase 1: [Name]
  <!-- Include time estimate, deliverables -->
```

**Benefits:**
- Everything in one place
- AI doesn't skip context
- Self-explanatory for humans too
- Reduces need for separate how-to docs

**Meta-docs still needed (but minimal):**
- High-level process overview
- Decision log (this document)
- Glossary

**Action items:**
1. Add explanatory comments to all templates
2. Include examples in templates
3. Test: can new developer use template without external guide?

---

### Decision #16: When AI Should Ask for Help

**Date:** 2025-10-20  
**Topic:** AI autonomy limits

**Decision:** ✅ **Stop after 3 failed attempts**

**Rule:**
- If AI stuck on problem
- Made 3 different attempts to solve
- Still not working
- → STOP and ask user

**NOT reasons to ask:**
- Time concerns (AI doesn't track real time)
- Scope questions (scope is FIXED by user, cannot grow)

**Rationale:**
- 3 attempts = exhausted obvious solutions
- Further attempts = wasting time
- User input needed for unblocking

**Action items:**
1. Add to AI guidelines
2. Include in Cycle template

---

### Decision #17: Refactoring Timing

**Date:** 2025-10-20  
**Topic:** When to refactor code

**Decision:** ✅ **Always within Cycle, never separate**

**Rules:**
- Refactoring = part of TDD (RED → GREEN → REFACTOR)
- Must happen BEFORE commit
- Cannot commit dirty code
- No separate "refactoring Cycles"

**Timing:**
- During REFACTOR phase of TDD
- Before Cycle completion
- Part of Definition of Done

**Rationale:**
- Clean code is deliverable requirement
- Technical debt avoidance
- Quality built-in, not retrofitted

**Action items:**
1. Emphasize in TDD documentation
2. Include in Definition of Done checklist

---

### Decision #18: AI Development Philosophy Document

**Date:** 2025-10-20  
**Topic:** Need overview document

**Decision:** ✅ **Create AI_DEVELOPMENT_PHILOSOPHY.md**

**Content:**
- Core principles
- Why AI-assisted development
- Key differences from traditional
- Benefits and limitations
- General guidelines

**Purpose:** High-level context for methodology

---

### Decision #19: Documentation Minimalism

**Date:** 2025-10-20  
**Topic:** Keep methodology compact

**Decision:** ✅ **Minimum viable documentation only**

**Rules:**
- Only essential docs
- Concise, no fluff
- Templates > explanations
- One page better than three

**Action items:**
1. Review all docs for bloat
2. Merge similar topics
3. Delete unnecessary

---

### Decision #20: AI Behavior - Don't Give Up

**Date:** 2025-10-20  
**Topic:** AI problem-solving approach

**Decision:** ✅ **Stop and ask, don't change approach**

**Anti-pattern observed:**
- AI encounters problem
- Instead of asking for help → changes approach
- "Let's use different version"
- "Let's skip this feature"
- "Let's do it differently"
- **This is WRONG**

**Correct behavior:**
- Encounter problem
- Try solution 1
- Try solution 2
- Try solution 3
- If all fail → **STOP and ASK user**
- **Do NOT:**
  - Change requirements
  - Downgrade versions
  - Skip features
  - Find workarounds without asking

**Rationale:**
- Scope is FIXED by user
- User knows constraints
- Changing approach = wasting time on wrong solution
- Asking = faster resolution

**This applies to:**
- Library versions
- Architecture decisions
- Feature scope
- Testing approach
- Any significant choice

**Action items:**
1. Add prominently to AI guidelines
2. Include in every Cycle template as reminder
3. Track in retrospectives

---

## Open Questions

**Q1: Where to store Cycle documents?**
- Option A: `docs/03-PROJECT/sprint-01/cycle-01.01.md`
- Option B: `03-PROJECT/sprint-01/cycle-01.01.md` (no docs/)
- Option C: `cycles/01.01.md`
- **Status:** Deferred - will decide after testing structure

**Q2: Requirements Format**
- Use Given/When/Then (BDD/Gherkin style)
- Feature-based approach
- **Status:** To be discussed in detail tomorrow

---

## Summary

**Total decisions:** 17
**Status:** Core methodology defined
**Next:** Create templates and documentation based on decisions

---

## Next Topics Queue

1. ✅ Terminology (discussing now)
2. ⏳ Repository structure for AI methodology
3. ⏳ Jira integration strategy
4. ⏳ Git workflow & branching
5. ⏳ Language policy & translation
6. ⏳ Project documentation template
7. ⏳ Estimation & story points
8. ⏳ Pull request strategy
9. ⏳ Quality gates
10. ⏳ Context management

---

## Discussion Format

**For each topic:**
1. Present options with pros/cons
2. Discuss implications
3. Make decision
4. Document rationale
5. Define action items
6. Move to next topic

---

**Status:** Decision #1 in progress  
**Next:** Awaiting discussion on terminology

