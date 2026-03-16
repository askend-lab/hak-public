# HAK: What We Learned Building a Product with AI Agents

**Pilot project retrospective | March 12, 2026**

---

## Slide 1 — What is HAK?

HAK is an Estonian speech service:

- Text-to-speech synthesis (TTS)
- Morphological analysis

---

## Slide 2 — The Experiment

We had a contract to build an Estonian speech service (text-to-speech + morphological analysis).

We decided to use it as a pilot:

> **What happens if AI agents write all the code, directed by just two people?**

Full production stack: frontend, backend, ML pipeline, infrastructure, CI/CD — not a toy project.

---

## Slide 3 — The Team

Two people. Four AI agents. That's it.


| Name                      | Role                                              |
| ------------------------- | ------------------------------------------------- |
| Alex (human)              | Developer, architect, agent manager               |
| Tanya (human)             | PM, UX, frontend development (via AI agents)      |
| Eve, Kate, Luna, Sam (AI) | Development, quality, refactoring, targeted tasks |


The project required backend, frontend, DevOps, TARA auth, Cognito, full test coverage.

Normally this needs a team of specialists. We had two people + agents covering the gaps.

*Deep dive: Retrospective §3 — team table, competency challenge, human-in-the-loop requirements*

---

## Slide 4 — We Started with a Prototype, Not a Document

Instead of traditional analysis → design → build, we built a **working prototype in ~8 hours** of engineer time.

- Gave it to the customer to play with
- Gave it to the designer to work from
- Used it for all user interviews — Figma wouldn't have worked, the app is too interactive
- Generated Business Requirements documentation from, which was required for Phase 1 handover and as an input to actual development

**"Show, don't tell"** — instant feedback, aligned expectations from day one.

*Deep dive: Retrospective §2 — full timeline, phase breakdown, time allocation*

---

## Slide 5 — What Went Well

1. **Prototyping before analysis.** Working prototype replaced waterfall docs, enabling instant client feedback and real user interviews.
2. **Two people instead of a full team.** AI agents covered backend, frontend, DevOps, auth, and testing competencies that would normally require multiple specialists.
3. **No weekends, no overtime.** Humans worked normal hours throughout the project.
4. **24/7 capacity.** Agents work nights, weekends, and holidays. Quality audits and refactoring ran outside working hours.
5. **Unlimited technical knowledge.** Any technology, even unfamiliar ones. TARA auth integration: feared complexity, done in 1.5 hours.
6. **Builders, not narrow specialists.** Tanya, whose background is PM—not development—built the full React 19 frontend (~24,000 lines, 65 components) by directing AI agents. AI doesn’t just make developers faster—it enables non-developers to produce production code **when quality guardrails are in place** (tests + DevBox + review).
7. **Everything auto-generated.** 31 internal docs, test reports, use cases — all generated from code.
8. **407 test files, 80–95% coverage.** Agents write tests without resistance.
9. **74 review items from 2 external reviewers.** 100+ closed.

*Deep dive: Retrospective §7 — full list, accelerating flywheel, reusable assets produced*

---

## Slide 6 — The Numbers


|                        | Budget        | Actual                 |
| ---------------------- | ------------- | ---------------------- |
| Engineering (Alex)     | 460 hours     | ~330 hours             |
| PM/UX/frontend (Tanya) | 340 hours     | ~175 hours             |
| **Total human hours**  | **800 hours** | **~505 hours**         |
| AI tooling cost        | —             | **~€500**              |
| AI agent output        | —             | 2,320 commits, 701 PRs |


- Human-equivalent estimate for the same work: **1,600–2,250 hours**
- Two people + €500 in AI tools delivered what would typically take a team of 3–5 over 4–6 months
- Humans worked normal hours (no weekends/overtime).
- Agents provided 24/7 execution capacity.

*Deep dive: Retrospective §9 — budget vs. actuals, component-by-component human estimate, AI vs. human comparison*

---

## Slide 7 — The Acceleration

Each major deliverable was produced faster than the last:


| Deliverable        | Time     |
| ------------------ | -------- |
| 1st major delivery | 8 days   |
| 2nd                | 2.5 days |
| 3rd                | ~4 hours |


- Each cycle got faster because the tools, process, and quality gates compound
- Half of Alex's engineering time (~165h) was building the process from scratch — a **one-time investment**
- Next project starts with all of that already in place

---

## Slide 8 — What Went Wrong

1. **AI writes "working but brittle" code by default.** Without review, quality drops fast — stub tests, missing error handling, no logging.
2. **AI doesn't think about security unless told.** Endpoints shipped without authorization until explicitly required.
3. **AI copies instead of reusing.** Without architectural oversight, you get duplication across packages.
4. **Agents lose context between sessions.** Documentation becomes the team's working memory. Without it, agents are blind.
5. **Design-to-code handoff is not AI-native yet.** A tasteful look required a human designer (Helen). Once the design language was set, AI could iterate — but the Figma → AI handoff was entirely manual (screenshots fed to AI). No automated pipeline exists yet.
6. **Every push costs money.** Agents push frequently — CI/CD costs need active management.

*Deep dive: Retrospective §7 (What Went Poorly) + §3 (UX design + Figma bottleneck)*

---

## Slide 9 — How We Fixed It

The problems were real, but they're **solved problems now**.

- Built an automated quality system (DevBox) — **30+ rules checked on every commit**, 24/7
- Two external reviewers audited the AI code: 74 findings, ~100 closed
- **14 of the most common issues are now physically impossible to reintroduce**
- Security hardened: WAF, JWT on all endpoints, rate limits, geo-blocking

The key insight: **AI needs guardrails, but once you build them, they enforce themselves.**

*Deep dive: Retrospective §5 (Code Review) + §6 (Security) + §11 (Quality Requirements Analysis)*

---

## Slide 10 — The Real Outcome Isn't the Application

> The most valuable thing we built is **the process**, not the product.

A repeatable development process with AI agents that is:

- **Systematic** — automated quality checks on every commit, including nights and weekends
- **Fast** — prototype in hours, show the client, ship with full tests that night
- **Compounding** — each project gets faster because tooling and knowledge carry over
- **Scalable** — no hiring bottleneck, spin up another agent

And it requires **the right human**: senior, technical, able to call bullshit, able to reason with agents.

This is not a tool that replaces developers. **It is a force multiplier for the right kind of developer -> Developer ++**

*Deep dive: Retrospective §10 (Key Team Conclusions) + §12 (Silicon Team vs. Human Team)*

---

## Slide 11 — What This Means for the Company

1. **We can take on more projects with fewer people.** Two people + AI agents delivered what used to take a full team.
2. **We can prototype at the speed of conversation.** Client says something in a meeting → working demo the next day.
3. **We can use any technology.** Agents have unlimited technical knowledge. TARA integration: feared, done in 1.5 hours.
4. **Non-developers can build production software.** PM built the entire frontend. This changes how we think about team composition.
5. **Quality is built into the process.** Automated gates mean quality doesn't degrade under deadline pressure.
6. **The investment is front-loaded.** ~165 hours to build the process. Next project starts from that baseline.

---

## Slide 12 — Recommended Next Steps

1. **Pick the next 1–2 projects** that fit this approach (clear scope, strong feedback loop, high leverage from automation).
2. **Standardize the guardrails** (DevBox quality gates, templates, review practices) as a reusable company baseline.
3. **Train “agent managers.”** Define the skills profile and run internal onboarding for senior staff.
4. **Track costs properly** (LLM/tooling, CI/CD spend, cloud runtime) to keep the economics transparent.
5. **Fix the design-to-code bottleneck.** Run a focused experiment to streamline Figma → AI → frontend implementation.

---

## Slide 13 — Open Questions

1. How do we scale this to other projects?
2. How do we identify and train the right people to manage agent teams?
3. Should prototype-first become our standard practice?
4. Which tasks stay human, which go to agents?
5. How do we create a pipeline from Figma → AI agents, replacing the manual screenshot workflow?
6. How do we manage tooling and CI/CD costs as we scale?

---

*All deep-dive references point to: [HAK — Project Retrospective.md](HAK%20—%20Project%20Retrospective.md)*