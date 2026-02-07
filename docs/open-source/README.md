# Open Source Preparation Plan

> **Goal**: Prepare HAK for public open source release.
> **Master plan**: [`MASTER_PLAN.md`](./MASTER_PLAN.md)

## Methodology

> **We build a QUALITY SYSTEM, not just fix code.**
>
> Every checklist item has **two checkboxes**:
> - 🔧 = Verification tool configured as a **DevBox hook**
> - ✅ = Hook passes, all issues resolved (green)
>
> **If it's not in DevBox, it doesn't exist.**
> Flow: find tool → add to DevBox → see it fail → fix → see it green.

## Phase Documents

| # | Document | Priority |
|---|----------|----------|
| 1 | [Security & Secrets](./01-security.md) | CRITICAL |
| 2 | [Internal Decoupling](./02-decoupling.md) | HIGH |
| 3 | [Code Quality](./03-code-quality.md) | HIGH |
| 4 | [Testing & Coverage](./04-testing.md) | HIGH |
| 5 | [Documentation](./05-documentation.md) | MEDIUM |
| 6 | [CI/CD & Dependencies](./06-cicd.md) | MEDIUM |
| 7 | [Infrastructure & DevEx](./07-infra-devex.md) | MEDIUM |
| 8 | [Launch Checklist](./08-launch-checklist.md) | HIGH |

## Reference

- [Verification Approach](./checklists/00-verification-approach.md) — standard → hook mapping
- [Verification Pipeline](./checklists/00-verification-pipeline.md) — hook enablement steps
- [Checklists](./checklists/) — per-standard compliance checklists
- [Standards](./standards/) — quality standards we follow
