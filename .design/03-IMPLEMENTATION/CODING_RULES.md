# Sprint Planning and Programming Guide

## What is this?

**Sprint Plan = AI Autonomous Work Program**

This is NOT a regular project plan. This is a program for autonomous AI work without human involvement.

**Goal:** Human creates a detailed plan → launches AI → goes to rest/work → AI executes everything itself → human returns and sees the result.

## Naming Convention

**All sprint plan files are named:**

```
YYYY-MM-DD-description.md
```

**Examples:**
- `2025-10-16-spike-hello-trello.md`
- `2025-10-17-implement-trello-client.md`
- `2025-10-18-add-mcp-handler.md`

**WHY:** Chronological order in the file system. Immediately clear when the plan was created and in what sequence.

## Philosophy

**"People should rest, and machines work!"**

Human creates a plan → leaves → AI works autonomously 2-4 hours → returns → everything is ready.

---

## WHY DO WE NEED A PLAN AT ALL?

1. **AI without a plan improvises** - will start adding "useful" features that aren't needed
2. **Plan = contract** - visible WHAT will be done BEFORE starting
3. **Stop to think** - consider the approach BEFORE coding
4. **Ability to return** - visible where we stopped
5. **AUTONOMOUS WORK** - cheap model works according to plan without human

---

## THREE MANDATORY INITIAL STEPS

### Step 0.1: Ensure the task is understood

**WHY:** AI has a tendency to start working immediately without clarifying details. Then programs the wrong thing for an hour.

- [ ] Read context and goal
- [ ] Ask again if unclear
- [ ] Confirm understanding BEFORE starting
- [ ] DO NOT start until sure WHAT needs to be done

### Step 0.2: Pre-flight check

**WHY:** To avoid getting stuck in the middle of the plan due to lack of basic things. Check BEFORE starting!

- [ ] Runtime installed (check version)
- [ ] Package manager works
- [ ] Cloud CLI configured (if needed)
- [ ] Internet available
- [ ] All necessary tools in place
- [ ] Credentials ready (API keys, tokens)

### Step 0.3: Rule when encountering problems

**WHY:** Out of desire to please, at the first difficulty AI suggests:
- "Cloud A not working? Let's use Cloud B!"
- "Framework A glitching? Let's use Framework B!"
- "Language A problem? Let's use Language B!"

**THIS IS A DISASTER!** You are impossibly lazy and give up very easily.

**When encountering a problem:**

1. Try to figure it out 2-3 times (within the plan, without changing technologies)
2. If not resolved - DO NOT change technologies! Write down:
   - [ ] WHAT were we doing (which step)
   - [ ] WHAT is the error (full text!)
   - [ ] WHAT did we try (2-3 attempts)
   - [ ] WHERE are we stuck (specifically)
3. Stop and wait

**"How do I know - should I kick you or should I help?"**

Problem WITHOUT description = useless stop.  
Problem WITH description = opportunity to solve quickly.

**NEVER:**
- DO NOT change technologies/approach without permission
- DO NOT improvise workarounds
- DO NOT get stuck silently without explanations

---

## CHECKBOXES = PROGRAM FOR AI

**WHY NOT FOR HUMANS:** Checkboxes are NOT for tracking progress. They are to force AI to make pauses.

**Problem:** AI is impossibly lazy. Wants to do everything at once: test + code + refactoring = one edit. Then everything breaks.

**Solution:** Checkboxes = **FORCED STOPS**

Placing a checkbox = physical action → AI must consciously pause → can't "skip through" → can't "do everything at once".

### MANDATORY RULE:

**EACH completed step = IMMEDIATELY check the checkbox in the plan file!**

1. Executed action → **STOP**
2. Mark `- [x]` in the plan file
3. Write a comment about what was done
4. Only then next step

**NEVER do multiple steps in a row without marking them!**

**Checkboxes = disciplinarian for lazy AI.**

**One checkbox = one atomic action.**

---

## TIME ESTIMATES

**WHY NOT FOR HUMANS:** Estimates are NOT for deadline planning. They are to force AI to think "HOW".

**NOT for humans! Estimates for AI!**

1. **To give an estimate, must answer "HOW will I do it"** - estimate = byproduct of approach planning
2. **Limiter for AI** - if stuck on "15-minute" task longer → stop and ask
3. **Without understanding "HOW" - estimate is guessing** - if I can't estimate, means I don't understand how to do it

---

## COMMENTS WHEN MARKING

**WHY:** Comments force AI to **CONFESS** instead of silently deviating from the plan.

Force confession of:
- Where they cut corners
- Where they added extra
- Where it didn't work the first time
- Where they deviated from plan

**Examples:**
- ✅ "Test passed first try"
- ⚠️ "Test passed immediately, no Red phase" → something wrong with TDD
- ⚠️ "Stuck for 40 minutes, not 15" → plan was inaccurate

**Comments = forced honesty + decision context.**

---

## LONG PLAN (100+ CHECKBOXES)

**WHY SO LONG:** Not for humans to read! For autonomous work of cheap model.

**Economics and autonomy:**
- **Expensive model (Sonnet):** discussions, planning, creating detailed plan
- **Cheap model (Haiku):** dumb execution according to ready plan

Long detailed plan with small steps:
1. **Cheap model is dumber** - needs very simple instructions
2. **One checkbox = one atomic action** - no improvisation
3. **Autonomous work** - the more detailed the plan, the longer AI works without human
4. **Fewer stuck points** - small steps = fewer places to break

**Human creates plan → goes to do other things → AI works by itself → human returns and sees progress.**

---

## TDD ALWAYS

**WHY:** Without TDD AI writes code "as it seems correct", then turns out half doesn't work. TDD = guarantee that code works.

**Correct cycle:**

1. **Red** - write test that fails
2. **Green** - minimal code to make test pass
3. **ALL TESTS** - run ALL existing tests (make sure nothing broke!)
4. **Refactor** - improve code while keeping tests green

NEVER ANY OTHER WAY. This is non-negotiable.

---

## TESTING: REALITY FIRST, THEN MOCKS

**AI problem with mocks:**
- Beautiful mocks ✅
- All tests green ✅
- "100% coverage!" ✅
- In production: wrong API, format, parsing ❌

**"I know you AIs, you'll do everything with mocks, shout about grandiose victory, and then it turns out in production it never even ran and can't even work in principle!!!"**

**Correct strategy:**

1. **START WITH REAL TEST**
   - Never with mocks!
   - Real call to real AWS/API
   - Make sure integration WORKS

2. **THEN mocks are allowed**
   - For speed
   - For economy
   - For CI/CD
   - BUT only AFTER real test!

3. **MINIMUM 1 REAL TEST REMAINS**
   - As "lie detector"
   - As "reality anchor"

4. **ALL EXPERIMENTS - ONLY REAL CALLS**
   - Experiments with mocks = nonsense
   - Mocks = studying air instead of reality

5. **COVERAGE 80%+**
   - Start with "happy path"
   - Then check metrics
   - Add tests to reach 80%+

**Sequence:**
1. Real test → RED
2. Real code → GREEN (works with real API!)
3. Add mocks for speed
4. Keep 1 real test
5. Check coverage → add tests to 80%+

---

## FINAL REPORT (LAST ITEM IN PLAN)

**WHY:** So that when human returns after 2 hours, they immediately see:
- WHO did this (to analyze efficiency of expensive vs cheap models)
- What was done and what wasn't
- What difficulties occurred
- What works
- How much time it actually took
- Whether a commit is needed

**ALWAYS at the end of plan:**

- [ ] **WHO DID IT** (Sonnet/Haiku/other) - **MOST IMPORTANT!**
- [ ] Date and time of completion
- [ ] WHAT WAS DONE (specifically, with step numbers)
- [ ] WHAT WAS NOT DONE (if any)
- [ ] DIFFICULTIES (what they were, how resolved)
- [ ] WHAT WENT WRONG (deviations from plan)
- [ ] WHAT WORKS (verified and tested)
- [ ] Actual time vs estimated
- [ ] **WAIT for commit command** (NEVER commit independently!)

AI **NEVER** commits by itself. Human will come and commit when they want.

---

## MAIN POINTS

**Plan = program for AI.**
**Checkboxes = stops.**
**Comments = honesty.**
**Real tests > mocks.**
**TDD always.**
