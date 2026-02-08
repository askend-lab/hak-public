# Presentation Preparation - Part 2: Key Insights (1-6)

## Insight 1: Gherkin Generation - Works but Not Enough

**What worked:**
- Generating app from Gherkin files WORKS
- Main generation took ~7 hours
- All tests GREEN

**The Problem:**
- Visual chaos when opened - no design
- If Gherkin didn't say "modal" → opened randomly
- If Gherkin didn't say "disabled" → button wasn't disabled

**Conclusion:**
- Gherkin alone is NOT enough
- Need: design system + UX requirements
- Solution: browser access, compare with prototype

---

## Insight 2: Prompts Don't Work - Constraints Do

**The paradox:**
- Expected: library of prompts
- Reality: no prompts to demonstrate

**Why prompts don't work:**
- Session lasts 8 hours
- Document at start → evaporates from memory
- Agent "forgets" rules over time

**Solution:**
- Git hooks check EVERY commit
- ESLint checks EVERY file
- Agent can forget document, but CANNOT bypass hook

---

## Insight 3: Tighten Constraints for AI

**Current:** Complexity = 10
**Proposal:** Lower to 8

**NASA Power of 10 (applicable):**
1. 2+ assertions per function
2. No dynamic memory after init
3. Fixed loop bounds
4. Check ALL return values
5. Max nesting: 3-4 levels

**Big Tech:** No hard limits, rely on code review
**AI-first:** Stricter automation NEEDED

---

## Insight 4: TDD Enforcement - Timestamp Check

**Problem:**
- TDD works great with AI, BUT
- Agent forgets and jumps to code
- Documents don't help

**Current:** Coverage 80%
**Issue:** Coverage alone = "rear-view mirror"

**NEW: Timestamp check**
- Tests must be modified BEFORE code
- True TDD enforcement

---

## Insight 5: Framework "Implemented in Iron"

**Expected:** Prompt library
**Reality:** Constraint system

**Scale:**
- ~18 DevBox hooks
- ~50+ ESLint rules
- Full test suite on every commit
- Coverage gates

**This IS the framework** - portable from project to project

---

## Insight 6: Documentation Doesn't Work for AI

**Experiment:**
- Asked agent: "Did you read architecture doc?"
- Answer: "Yes, first 100 lines. Didn't continue - outdated"

**Key finding:**
- AI is SMART - sees document is outdated
- Correctly decides to ignore it

**Best way to explain architecture:**
Put AI in project that HAS that architecture.

**Conclusion:**
Instead of documentation → spend time on refactoring
"Documentation is for humans, code is for AI"
