# Testing Standards

Standards and methodologies for comprehensive software testing.

## 1. ISTQB — International Software Testing Qualifications Board
- **Link**: https://www.istqb.org/
- **Scope**: International standard for software testing certification and methodology
- **Key concepts**: Test levels (unit, integration, system, acceptance), test techniques (black-box, white-box, experience-based), test management, defect management
- **Foundation syllabus**: https://www.istqb.org/certifications/certified-tester-foundation-level

## 2. ISO/IEC 29119 — Software Testing Standard
- **Link**: https://www.iso.org/standard/81291.html
- **Parts**: Testing concepts, test processes, test documentation, test techniques, keyword-driven testing
- **HAK action**: Align test documentation and processes with ISO 29119

## 3. Test-Driven Development (TDD) — Kent Beck
- **Link**: https://www.oreilly.com/library/view/test-driven-development/0321146530/
- **Cycle**: Red → Green → Refactor
- **Key principles**: Write test first, minimal code to pass, refactor without changing behavior
- **HAK status**: TDD is a stated project methodology; verify all code follows this discipline

## 4. Behavior-Driven Development (BDD) — Dan North
- **Link**: https://dannorth.net/introducing-bdd/
- **Tools**: Cucumber, Gherkin (HAK uses both)
- **Format**: Given-When-Then scenarios in `.feature` files
- **HAK status**: 32 feature files in `packages/specifications/`; cucumber tests currently broken

## 5. Testing Trophy — Kent C. Dodds
- **Link**: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- **Layers** (bottom to top): Static Analysis → Unit Tests → Integration Tests → E2E Tests
- **Key insight**: Integration tests provide the best ROI
- **HAK action**: Ensure test pyramid/trophy is balanced — not just unit tests

## 6. MC/DC — Modified Condition/Decision Coverage (from DO-178C)
- **Link**: https://en.wikipedia.org/wiki/Modified_condition/decision_coverage
- **Scope**: Every condition independently affects the decision outcome
- **HAK action**: For critical validation logic, ensure MC/DC coverage, not just line coverage

## 7. Mutation Testing
- **Link**: https://stryker-mutator.io/ (JavaScript/TypeScript)
- **Scope**: Measure test suite effectiveness by introducing code mutations
- **Metric**: Mutation score = killed mutants / total mutants (target >80%)
- **HAK action**: Run Stryker on critical packages (shared, simplestore, audio-api)

## 8. Property-Based Testing
- **Link**: https://github.com/dubzzz/fast-check (TypeScript)
- **Scope**: Generate random inputs to find edge cases automatically
- **Classic reference**: QuickCheck — https://hackage.haskell.org/package/QuickCheck
- **HAK action**: Apply to input validation, parsers, hash functions

## 9. Contract Testing
- **Link**: https://pact.io/
- **Scope**: Verify API consumers and providers agree on the contract
- **Alternative**: Shared Zod schemas between frontend and backend
- **HAK action**: Ensure frontend API calls match backend handler contracts

## 10. IEEE 829 — Test Documentation Standard
- **Link**: https://standards.ieee.org/standard/829-2008.html
- **Documents**: Test plan, test design, test case, test procedure, test log, test report
- **HAK action**: Ensure test documentation exists for each test level
