# **HAK — Project Retrospective**

## **A Pilot Project Built by 2 Humans and 4 AI Agents**

Presentation date: March 12, 2026  
Period: September 2025 — February 2026 (6 months)  
Active development: December 2025 — February 2026 (3 months)

## **1 What is HAK?**

An Estonian speech service — text-to-speech synthesis and morphological analysis of the Estonian language.

- 11 packages in a monorepo (TypeScript + Python)  
- Frontend — React 19 SPA  
- Backend — 4 Lambda functions (auth, store, tts-api, morphology-api)  
- ML worker — Python/ECS (speech synthesis via the Merlin neural network)  
- Infrastructure — AWS (Lambda, ECS, DynamoDB, S3, SQS, CloudFront, WAF, Cognito)  
- CI/CD — GitHub Actions (14 workflow files)

### **Project Scope**

- Original budget: 800 hours (460 engineering + 340 UX/PM/analysis/testing)  
- Team: 2 people — Tanya (project manager + frontend development via AI agents) and Alex (developer/architect), supported by a team of 4 AI agents  
- Required competencies: backend, frontend, DevOps, TARA authentication integrated with AWS Cognito, full test coverage — AI agents covered the missing competencies  
- The scope grew beyond the original plan to include: full automated test coverage, Google authentication (in addition to TARA), a frontend component library built from scratch, an interactive prototype for user testing and UX validation, and a security audit  
- All project documentation (use cases, test cases, test reports, etc.) was auto-generated from the code

Production-ready in this pilot meant: CI/CD and infrastructure automation, automated test coverage, security hardening (WAF + authorization), external review, and a reproducible quality process (DevBox).

---

## **2 Project Timeline**

Full duration: September 2025 — February 2026 (6 months)
Active development: December 2025 — February 2026 (3 months)

### **Phase 1: Prototype (September — November)**

Engineer time: ~8 hours

Instead of a traditional analysis phase with extensive documentation, we built a functional prototype first. This prototype served multiple purposes:

- **Given to the customer** to interact with directly — "show, don't tell"  
- **Given to the designer** to think through actual interaction patterns with a real, working product  
- **Used for all user interviews** — the highly interactive nature of the application made Figma files insufficient; users needed to experience the real thing  
- **Set up Vabamorf and Merlin** in containers as part of initial technical groundwork

The prototype approach saved significant time compared to the traditional waterfall path of analysis → design → build, where stakeholders are often surprised by the final result because static artifacts (documents, design screens) fail to communicate how an interactive product actually feels. With a working prototype, feedback was instant and expectations were aligned from day one.

### **Phase 2: Full Development (December — February)**

Engineer time: ~320 hours


| Month    | Focus                                                                                     |
| -------- | ----------------------------------------------------------------------------------------- |
| December | Establishing tools, processes, and the AI agent workflow from scratch                     |
| January  | Main development using the established tools and process                                  |
| February | Finalizing — refactoring for open source, audits (code review, security audit), hardening |


### **Time Breakdown**


| Category                  | Hours                                          |
| ------------------------- | ---------------------------------------------- |
| Engineering (actual)      | ~330                                           |
| PM, UX, frontend development, analysis, testing (Tanya) | ~175                                           |
| AI agent work             | 2,320 commits, 701 PRs (not measured in hours) |


Of the ~330 engineering hours, roughly half (~165 hours) went toward establishing the AI agent process from scratch — tooling, workflows, quality gates, and learning how to effectively manage a team of agents. This is a one-time investment. With the tools and knowledge now in place, we estimate the same engineering work could be done in half the time on a future project.

---

## **3 What Makes This Project Unique**

This is the first project where all code was written by AI agents, directed by two humans.  
Alex (developer) acted as architect, reviewer, and agent manager. Tanya (project manager) handled PM, UX coordination, client communication, and built the entire frontend by directing AI agents. All code was written by 4 AI agents:


| Name          | Commits | Role                                                    |
| ------------- | ------- | ------------------------------------------------------- |
| Alex (human)  | 1,211   | Developer, architect, review, agent management          |
| Tanya (human) | 17      | Project manager, frontend development (via AI agents)   |
| Eve (AI)      | 383     | Lead developer (frontend, backend, infra)               |
| Kate (AI)     | 400     | Quality, security, audits, documentation                |
| Luna (AI)     | 183     | Refactoring, optimization (net −43,645 lines — cleanup) |
| Sam (AI)      | 67      | Targeted tasks                                          |
| Total         | 2,320   |                                                         |


### **The Competency Challenge**

The project required expertise across: backend, frontend, DevOps, TARA authentication integrated with AWS Cognito, and full test coverage. In a traditional setup, this would require multiple specialists.

In reality, the team was two people — Tanya (project manager) and Alex (developer) — with AI agents covering the missing competencies. The agents provided the breadth; the humans provided the direction.

A striking example: Tanya, whose background is project management — not software development — built the entire React 19 frontend (~24,000 lines, 65 TSX components, 13K SCSS) by directing AI agents. This would not have been possible without the agents. It demonstrates that AI agents don't just make developers faster — they enable non-developers to produce production-quality code when given the right tools and process.
Quality was enforced by automated quality gates (DevBox), tests, and technical oversight/review.

### **The One Thing AI Couldn't Do: Original UX Design**

Almost every aspect of the project could be automated through AI agents — but not UX design. Creating a tasteful, cohesive look and feel required a human designer. Helen (designer on the customer side, costs not factored into the project budget) gave the application its design language and visual identity.

However, once a solid design language was established, AI agents could handle UX improvement iterations without the designer present: prompting AI with different options, trying variations, and verifying with Helen afterwards. This saved significant time and kept engineering resources out of the loop for prototyping and validating design refinements.

This points to a pattern: **AI agents need human-created foundations** (architecture from Alex, design language from Helen, product direction from Tanya) **but can iterate on those foundations autonomously**.

A practical bottleneck: designs were created in Figma but were not consumable by AI agents in any structured way. The only workflow was manually taking screenshots of Figma designs and feeding them to the AI. There is no automated pipeline from Figma → AI agent → code. Streamlining this design-to-frontend handoff is an open challenge for future projects.

### **The Human in the Loop: Not Optional, Not Easy**

While AI agents accelerate humans and give them access to skills and competencies they don't have at a high level, not just anyone can run a team of agents. The person directing agents must:

- **Be technical and senior** — you need to understand the code the agents produce  
- **Be able to call bullshit** — agents confidently produce wrong answers; you must catch them  
- **Guide and reason** — agents need precise, well-structured direction or they drift  
- **Separate good ideas from bad** — agents suggest many things; knowing which to follow requires judgment  
- **Understand how agentic systems work** — prompt design, context management, parallelization, and failure modes

This is not a tool that replaces developers. It is a force multiplier for the right kind of developer.

### **Working with AI Agents: Key Observations**

What works well:

- Speed: 2,320 commits in 3 months (≈26 commits/day)  
- 701 pull requests merged in 3 months (≈8 PRs/day)  
- Parallel work: multiple agents working simultaneously on different tasks  
- Systematic work: audits, checklists, verification — agents don't get tired  
- Documentation: 31 internal documents (analyses, audits, proposals)  
- Tests: 407 test files — agents write tests without resistance

What doesn't work is covered in detail in Section 7.

---

## **4 Project Statistics** *(Reference)*

### **Weekly Activity**


| Week                | Commits | PRs (merged) | Note                 |
| ------------------- | ------- | ------------ | -------------------- |
| W50 (Dec 9–15)      | 24      | 16           | Project start        |
| W51 (Dec 16–22)     | 220     | 105          | Core scaffolding     |
| W52 (Dec 23–29)     | 29      | 22           | Holidays             |
| W01 (Dec 30 – Jan 5 | 5       | 5            | Holidays             |
| W02 (Jan 6–12)      | 151     | 45           | Frontend backend     |
| W03 (Jan 13–19)     | 156     | 38           | Frontend backend     |
| W04 (Jan 20–26)     | 56      | 16           | Stabilization        |
| W05 (Jan 27 – Feb 2 | 59      | 24           | Stabilization        |
| W06 (Feb 3–9)       | 178     | 17           | Infrastructure       |
| W07 (Feb 10–16)     | 908     | 290          | Peak: quality audits |
| W08 (Feb 17–23)     | 251     | 44           | Code review, fixes   |
| W09 (Feb 24 – Mar 2 | 225     | 63           | Security, SLA        |
| W10–11 (Mar 3–10)   | 59      | 16           | Final verification   |


Peak week W07 — 908 commits and 290 PRs in a single week. This was the period of mass quality audits (ESLint, Ruff, test coverage, security).

### **Code Volume**


| Metric                     | Value                                         |
| -------------------------- | --------------------------------------------- |
| Total commits              | 2,320                                         |
| Pull requests (merged)     | 701                                           |
| Lines added (all time)     | 816,657                                       |
| Lines deleted (all time)   | 344,866                                       |
| Current size (TypeScript)  | 40,000 lines                                  |
| Current size (Python/ML)   | 12,300 lines (incl. Merlin ML model 11K)      |
| Infrastructure (Terraform) | 3,100 lines (incl. 1,700 monitoring/security) |
| Test files                 | 407                                           |
| CI/CD workflows            | 14                                            |
| Internal documents         | 31                                            |
| Packages in monorepo       | 11                                            |


## **5 Code Review** *(Reference)*

### **External Reviewers**

Two external reviewers audited the AI-written code:  
Mikk Merimaa — detailed report across 14 categories:

1. Documentation (14 items)
2. Tech stack (3)
3. Project structure (1)
4. Code style (18)
5. Simplicity and patterns (4)
6. Maintainability (1)
7. Error handling (2)
8. Testing (3)
9. CI/CD (3)
10. Configuration (2)
11. Dependencies (1)
12. Security (7)
13. Performance (2)
14. Domain logic (1)

Total: 62 items. Of these, 47 accepted, 15 rejected (incorrect or not applicable).  
Lauri — 12 items, including:

- Architectural issues (3 High)  
- Security (2 High)  
- Testing (3 Medium)  
- Other (4 Medium/Low)

### **Code Review Results**


| Metric                     | Value                |
| -------------------------- | -------------------- |
| Total review items         | 74 (Mikk 62 + Lauri 12) |
| Accepted                   | 59                   |
| Rejected (incorrect)       | 15                   |
| Closed (confirmed by code) | 100                  |
| Remaining open             | 20                   |


Of the 20 open items:

- 2 — accepted risk (third-party library)  
- 5 — awaiting pen tests  
- 4 — deferred features  
- 6 — pen tests not yet conducted  
- 3 — separate repository / reverted by design

### **What Reviewers Found**

The good (what AI got right):

- Clean architecture: monorepo, package separation  
- Typing: TypeScript strict mode  
- CI/CD: full deployment automation  
- Infrastructure: Terraform, serverless

The bad (what AI got wrong):

- Code duplication across packages (S3 utilities, HTTPSTATUS, LambdaResponse)  
- Weak tests: expect(true).toBe(true), typeof == "function" (60 instances)  
- No systematic logging (0 logs in tts-api at launch)  
- No error handling (bare catch {}, silent error swallowing)  
- Security: endpoints without authorization (before PR 759)  
- shell=True, pickle.load without checksum (in ML component)

### **How We Fixed It**

A DevBox quality system was created — automatic hooks on every commit:


| Tool               | What it checks                             |
| ------------------ | ------------------------------------------ |
| ESLint (30+ rules) | Code style, security, promises, complexity |
| Ruff (Python)      | Security, style, dead code                 |
| Stylelint          | CSS/SCSS                                   |
| mypy               | Python typing                              |
| knip               | Dead code detection                        |
| Test coverage      | Thresholds: 80–95% per package             |
| Security audit     | npm audit, IaC security                    |


14 of Mikk's 47 accepted items are now enforced by DevBox hooks — they cannot happen again.

## **6 Security** *(Reference)*

After the external review, a series of security audits were conducted:


| Audit                 | Date    | Result                                                 |
| --------------------- | ------- | ------------------------------------------------------ |
| Security Audit        | 03.10   | 15 sections, 13 SEC items                              |
| WAF rules             | 02.2026 | 7 rules (rate limiting, geo-blocking, per-user limits) |
| Cognito authorization | 03.2026 | All API endpoints behind JWT                           |
| SLA document          | 03.2026 | Rate limits, availability targets                      |


## **7 What Went Well and What Didn't**

### **✅ What Went Well**

1. Prototyping before analysis — a functional prototype replaced traditional waterfall documentation, enabling instant client feedback, real user interviews, and aligned expectations from day one
2. Two people instead of a full team — AI agents covered backend, frontend, DevOps, auth, and testing competencies that would normally require multiple specialists
3. Development speed — 3 months of active development from zero to production-ready, no weekends or overtime required from humans
4. 24/7 capacity — agents work nights, weekends, and holidays; quality audits and refactoring ran outside working hours
5. Volume of work — 2,320 commits, 701 PRs, 40K+ lines of TypeScript
6. Documentation — 31 internal documents, OpenAPI specifications, all auto-generated from code
7. Testing — 407 test files, 80–95% coverage
8. Infrastructure — full Terraform, 14 CI/CD workflows
9. Quality system — DevBox with 30+ ESLint rules, automated checks
10. Security — WAF, Cognito JWT, rate limits, geo-blocking
11. Code review — 74 items from 2 reviewers, 100+ closed

### **❌ What Went Poorly**

1. Quality of early iterations — without review, AI writes "working but brittle" code
2. Weak tests — AI tends to write stub tests (expect(true).toBe(true))
3. Duplication — without architectural oversight, AI copies instead of reusing
4. Security by default — AI doesn't add authorization unless explicitly asked
5. Logging — AI doesn't add logs unless explicitly asked
6. Context — agents lose context between sessions
7. CI/CD cost — every push costs money; agents tend to push frequently

### **🔑 The Main Result: A New Development Process**

The most valuable outcome of the project is not the code, but the process. We now have a reproducible development process with AI agents, and it has a huge number of advantages:

- **Systematic quality.** Agents check 30+ rules on every commit. Outside working hours (which are now also working hours).  
- **Hyper-agile development.** Prototype in half an hour → show the client → ship with tests that night.

### **📈 The Accelerating Flywheel**

Each major deliverable was produced faster than the last:

| Deliverable | Time     | Note                             |
| ----------- | -------- | -------------------------------- |
| 1st         | 8 days   | Equivalent to ~5 people × 10 days |
| 2nd         | 2.5 days |                                  |
| 3rd         | ~4 hours |                                  |

This is the compounding effect: the tools, the process, and the quality gates improve with each cycle. Each iteration is faster and higher quality. This kind of acceleration is hard to achieve by any other means.

### **Reusable Assets Produced for the Company**

The pilot created reusable assets and baselines that can be applied to future projects:

- **DevBox quality system**: automated checks and guardrails that prevent common AI-generated failures  
- **CI/CD and infrastructure baseline**: repeatable automation patterns for deploys and environments  
- **Documentation-from-code approach**: use cases, test cases, test reports generated as part of development  
- **Prototype-first workflow**: “show, don’t tell” as a repeatable way to reduce rework and align expectations  
- **Agent management practices**: tasking, review, and quality-gated merge workflow for running agent teams

### **❓ Open Question: Maintainability**

If this code landed on a team of regular developers — what would they say?  
One honest programmer's answer: "Throw it out and rewrite." Not because the code is bad, but because it wasn't written the way people are used to.  
But: is that even the goal? If a project is generated and maintained by AI agents, does it need to be comfortable for humans to work in? It depends on context:

- Commercial product (AI-maintained) — not necessarily. Agents maintain their own code.  
- Government project (riigihange) — possibly requires handoff to humans. Then architecture and documentation are critical.  
- Hybrid — AI writes, humans review and direct. The current HAK model.

---

## **8 The Numbers on One Slide**

Project:    HAK — Estonian speech service

Period:     6 months (Sep 2025 — Feb 2026)

Team:       2 humans + 4 AI agents

Commits:    2,320

PRs merged: 701

Lines:      40K TypeScript + 12K Python/ML

Tests:      407 files

Coverage:   80–95%

Packages:   11

Terraform:  3,100 lines

CI/CD:      14 workflows

Review:     74 items (2 reviewers)

Closed:     ~100 items

Open:       20 (pen tests + deferred)

## **9 Real Project Numbers**

### **Budget vs. Actuals**


| Metric | Budget | Actual |
| ----- | ----- | ----- |
| Engineering (Alex) | 460 hours | ~330 hours (~165h process setup + ~165h development) |
| PM/UX/analysis/testing (Tanya) | 340 hours | ~175 hours |
| Total human hours | 800 hours | ~505 hours |
| AI agent work | — | 2,320 commits, 701 PRs (not measured in hours) |


Note: roughly half of Alex's engineering time (~165 hours) went toward establishing the AI agent process from scratch. This is a one-time investment — with the tools and knowledge now in place, the same engineering work could be done in half the time on a future project.

**AI tooling costs** (Cursor, Windsurf IDE licenses and LLM API usage): ~€500 total for Alex and Tanya combined over the project duration. CI/CD costs from agent-driven pushes were not tracked separately — this is a gap for future projects.

Not included in budget/actuals above:

- Helen’s design work (customer side)  
- CI/CD spend and cloud runtime costs (not tracked in this pilot)  
- Pen testing (planned/ongoing) and any external security testing costs

### **Expert Estimate: If Done by Humans**

Component-by-component estimate based on code volume and complexity:


| Component                                         | Volume                | Hours         |
| ------------------------------------------------- | --------------------- | ------------- |
| Frontend (React 19, 6 features, 65 TSX, 13K SCSS) | 24,000 lines          | 530–720       |
| Auth (Cognito TARA JWT)                           | 942 lines integration | 160–240       |
| Store (DynamoDB, atomic upsert, Zod)              | 1,385 lines           | 130–160       |
| TTS API Morphology API                            | 1,454 lines           | 145–205       |
| Shared lib API Client                             | 1,207 lines           | 60–90         |
| TTS Worker (Python ML integration)                | 319 lines Docker      | 110–150       |
| Infrastructure (Terraform, 24 files)              | 3,104 lines           | 220–330       |
| CI/CD (GitHub Actions, 14 workflows)              | 1,785 lines           | 60–80         |
| Specs Documentation                               | 97 Gherkin 31 docs    | 95–135        |
| Management and coordination                       | —                     | 100–140       |
| TOTAL (human estimate)                            |                       | 1,610 — 2,250 |


Note: the gap between the budget (800h) and the estimate (2,000h) is explained by the fact that humans would have written fewer tests, less documentation, and cut scope. AI agents generated significantly more artifacts than a human team typically produces.

### **Comparison: AI vs. Human Team**


| Metric        | AI (actual)                            | Humans (estimate)     |
| ------------- | -------------------------------------- | --------------------- |
| Calendar time | 6 months (3 months active development) | 4–6 months (3 people) |
| Person-hours  | ~505h human (330h eng + 175h PM) + agents | ~800–2,000h (team) |
| Commits       | 2,320                                  | 500–800 (typical)     |
| Test coverage | 80–95%                                 | 60–80% (typical)      |
| Documentation | 31 internal docs                       | 5–10 (typical)        |


## **10 Key Team Conclusions**

### **✅ What Was Confirmed**

1. Projects like this are real. A full production service, built by 2 people + 4 AI agents in 6 months (3 months active development).
2. We have a set of proven mechanisms and practices — they work and are reproducible.
3. Tests are the main safety net. 407 test files = you can do any refactoring. We changed the application architecture many times and never broke the system. You can send agents to change 250 files overnight — everything works in the morning.
4. Unlimited technical knowledge. We can use any technology on the market, even if we've never worked with it before. Example: TARA login integration — we were very worried, but it only took 1.5 hours.
5. Prototypes are our superpower. Within 2–3 days we can show the client what it will look like. Saves enormous amounts of rework time.

### **❌ Mistakes and Lessons**

1. Don't build an "official version" alongside a prototype. We started with a prototype, then in parallel built the "correct" version. It couldn't catch up to the prototype. The right path: bring the prototype up to the required quality level.
2. A project is a series of prototypes. The workflow:
  - Take a stable, refactored version  
  - Branch off, remove all controls  
  - Vibe-coding: prototype new functionality  
  - Play with the prototype until it looks right  
  - Merge back → on merge it gains tests, linters, compliance  
  - Prototype in half an hour → show client after the meeting → ship to main overnight with all checks
3. Open question: are such strict quality requirements necessary?
  - Complexity 8 (ESLint max-statements) — industry standard  
  - 95% test coverage — a very high bar  
  - Sometimes an agent spends 30 minutes just to reach complexity 8 or 95% coverage  
  - The screws are tight right now — but the question remains: is it worth loosening them for speed?

---

## **11 Quality Requirements Analysis: What's Reasonable vs. Excessive** *(Reference)*

### **Current ESLint Rules**


| Rule                          | Value | Industry | Assessment                           |
| ----------------------------- | ----- | -------- | ------------------------------------ |
| complexity (cyclomatic)       | 8     | 10–15    | ⚠️ Strict, but justified for AI code |
| cognitive-complexity          | 8     | 10–15    | ⚠️ Strict, but justified             |
| max-statements (.ts)          | 10    | 15–25    | ❌ Too strict — causes eslint-disable |
| max-statements (.tsx)         | 15    | 15–25    | ✅ Fine                               |
| max-lines-per-function (.ts)  | 30    | 50–75    | ❌ Strictest seen in the wild         |
| max-lines-per-function (.tsx) | 60    | 50–100   | ✅ Fine                               |
| max-lines (file)              | 200   | 200–300  | ✅ Fine                               |
| max-depth                     | 3     | 3–4      | ✅ Good, prevents nesting             |
| max-params                    | 3     | 3–5      | ✅ Strict, but forces good design     |
| max-nested-callbacks          | 2     | 3–4      | ⚠️ Strict                            |


### **Test Coverage**


| Module          | Current threshold        | Industry | Assessment                                      |
| --------------- | ------------------------ | -------- | ----------------------------------------------- |
| Global mintotal | 93%                      | 70–80%   | ❌ Very high — agents waste time chasing numbers |
| shared          | 80%                      | 70–80%   | ✅ Reasonable                                    |
| store           | 80% lines, 75% functions | 70–80%   | ✅ Reasonable                                    |
| auth            | 90% branches             | 70–80%   | ⚠️ High, but auth is critical                   |
| frontend        | no threshold             | 60–70%   | ✅ Correct — UI coverage is expensive to measure |


### **Recommendation**

Keep strict (protect against AI errors):

- complexity: 8 — AI generates spaghetti code without this limit  
- max-depth: 3 — AI loves nested if/else  
- max-params: 3 — forces parameter grouping  
- max-lines: 200 — prevents god files  
- 80% coverage on backend modules — a reasonable safety net

Relaxed (decision made, changes implemented):

- max-statements: 10 → 12 — eliminates most eslint-disable instances  
- max-lines-per-function: 30 → 40 — 30 is too little for real functions with error handling  
- Global mintotal: 93% → 90% — reduces pressure to write meaningless tests for the number  
- max-nested-callbacks: 2 → 3 — 2 is too few for Promise chains

Bottom line: the rules are right in spirit — they prevent AI from degrading the code. 4 values relaxed by 10–25%, which will save agent time without a noticeable drop in quality. The remaining strict rules (complexity 8, max-depth 3, max-params 3) are kept — they are critical for controlling AI-generated code.

## **12 Silicon Team vs. Human Team: Fundamental Differences**

The management structure is the same (tasks, review, deploy), but the internal friction is radically lower.

### **6 Key Differences**

1. Instant cloning. You can't copy a human. Production is on fire and there's a feature deadline at the same time — in a human team, that's a resource conflict. In a silicon team, you just spin up another container. Completely eliminates the concept of a "human bottleneck."
2. No context between sessions. A human comes in the morning and remembers yesterday. An agent is born fresh every time — it reconstructs context from code, tickets, and comments. This is why documentation and ticket quality aren't just "good practice" — they are literally the team's working memory. Without them, the agent is blind.
3. No ego or politics. A human takes code review personally, argues about architecture on principle, defends "their" code. An agent doesn't care. A night-shift refactorer can rewrite their module — and nothing happens. This massively simplifies management: half of management in human teams is managing emotions.
4. Identical thinking. If one instance of a model understood the task, another will too. In a human team, a senior and a junior think differently. Here, all agents are equally capable. There's no "weak link" problem.
5. Cost of idle time = zero. A human waiting on review or blocked still gets paid and gets frustrated. An agent simply doesn't run, and that costs nothing. You can design a process where agents only work when there's work.
6. No initiative. A human can come and say: "We're heading toward an architectural dead end" or "Let's try a different approach." An agent does what it's told. Strategic thinking, product vision, creative pivots — these remain with the human. The human in this system is not just a manager, but the sole source of direction.

### **Conclusion**

A silicon team is a perfect execution machine with zero human overhead, but with no will of its own. The management structure is the same because the tasks are the same. But the internal friction within that structure is radically lower.

## **13 Discussion Questions**

1. How do we scale the AI-agent approach to other projects?  
2. How do we identify and train the right people to manage AI agent teams?  
3. Should we adopt prototype-first as standard practice for all projects?  
4. How do we organize the "prototype → vibe-coding → merge with quality" cycle?  
5. Which tasks are best left to humans, and which should be delegated to AI?  
6. When should quality gates be loosened, and when should they be kept strict?  
7. How do we manage CI/CD and AI tooling costs as we scale?  
8. How do we create a streamlined pipeline from design tools (Figma) to AI agents, replacing the current manual screenshot workflow?

