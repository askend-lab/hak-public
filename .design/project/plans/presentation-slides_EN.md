# Presentation Plan - AI-First Development

## Slide 1: Team
- Team of 13 AI agents
- Alice, Bob, Kate, Mike, Sam, Boxer, Eve, Sophia, Max, Felicia, Luna, Eidos
- [team picture]

## Slide 2: How It Works - Slack
- How to work with 13 agents?
- **Problem:** 13 agents × each doing something = overload
- **Solution:** Slack
  - Agents write only when there's a question
  - Reduces cognitive load
  - Mobility: forest, bicycle
  - Strategically: path to team collaboration of agents

## Slide 3: Project - HAK
- Estonian pronunciation learning platform
- History: prototype → Gherkin → code

**HAK Project Timeline (Lines Changed by Day)**

| Date       | Added    | Deleted  | Net      | What Happened                          |
|------------|----------|----------|----------|----------------------------------------|
| Dec 09     | +3,836   | -9       | +3,827   | DevBox setup                           |
| Dec 10     | +161     | -19      | +142     | DevBox updates                         |
| Dec 11     | +12,697  | -36      | +12,661  | CI/CD + Terraform + SingleTableLambda  |
| Dec 12     | +481     | -151     | +330     | Landing page                           |
| Dec 15     | +27,847  | -16,990  | +10,857  | US-020 setup, Audio API Lambda         |
| Dec 16     | +13,149  | -237     | +12,912  | EKI Audio integration, CI/CD           |
| Dec 17     | +39,463  | -7,891   | +31,572  | Cognito, Gherkin reporter, refactoring |
| Dec 20     | +102     | -207     | -105     | DRY refactoring                        |
| Dec 21     | +1,564   | -291     | +1,273   | ESLint fixes, tests                    |
| Dec 23     | +5,210   | -2,567   | +2,643   | DevBox ESLint config                   |
| Dec 24     | +3,119   | -1,672   | +1,447   | Coverage enforcement                   |
| Dec 25     | +3,040   | -11,740  | -8,700   | Cleanup + first Gherkin spec           |
| **Dec 27** | **+19,494** | **-1,179** | **+18,315** | **🎯 Gherkin specs batch #1 (15 files)** |
| **Dec 29** | **+14,143** | **-1,904** | **+12,239** | **🎯 Gherkin specs batch #2 (18 files)** |
| Dec 30-31  | +4,957   | -899     | +4,058   | Frontend polish, test coverage         |
|------------|----------|----------|----------|----------------------------------------|
| **TOTAL**  | ~150K    | ~46K     | ~104K    | 3 weeks                                |

**Key:** Dec 27 + Dec 29 = main Gherkin → Code generation

## Slide 4: Gherkin Is Not Enough
- Generation from Gherkin works (~7 hours, all tests green)
- BUT: visual chaos without design
- Need: design system + UX requirements + prototype comparison

## Slide 5: Prompts Don't Work (Paradox)
- Expectation: accumulate library of prompts
- Reality: accumulated only ONE prompt
- Why: 8-hour session → agent "forgets" instructions

## Slide 6: Documentation Doesn't Work (Paradox)
- Documents at session start → evaporate from memory
- AI is smart: sees outdated document → ignores it

## Slide 7: What DO We Transfer? → DevBox
- Not prompts, not documentation
- DevBox = development control system with AI
- **Don't need to teach AI to code — need to establish rules**
- Rules ≠ words. Rules = concrete checks

## Slide 8: DevBox Overview
- DevBox is 3x larger than HAK project itself (by tests)
- Framework > project it builds
- ~18 hooks + ~50 ESLint rules + coverage gates

## Slide 9: Examples - Enforcement
- **TDD Enforcement** - timestamp check: tests BEFORE code
- **Coverage Enforcement** - minimum 80% coverage

## Slide 10: Sprint Workflow
- First: plan together with agent (20-25 tasks)
- Write to document
- [example from Boxer - show stories]
- Then agent AUTONOMOUSLY: commits → pushes → PR → tests → refactoring

## Slide 11: Refactoring Philosophy
- Refactoring time = 2× development time
- Refactor until agent cries
- "Can't find anything more to refactor" = done

## Slide 12: Quality Standards - NASA/Pentagon Level
- Complexity 8 (like space research)
- Reference to Power of 10 Rules
- Code readable for humans AND understandable for AI
- **Don't teach AI to code — throw it into project**
- AI will find architecture itself

## Slide 13: Philosophy
- Preparing "special forces operator" — will get out of any situation
- Limit with behavioral rules, don't teach
- Claude 4.5 — terrifying power
- Teaching it to code is hopeless
- **It knows more than us**

## Slide 14: Honest Assessment
- Now: platform for ONE developer
- Team for ONE manager
- Not yet scaled
- All functionality for scaling is in one place: when agent writes to Slack
