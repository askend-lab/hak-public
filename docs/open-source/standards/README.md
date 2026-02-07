# International Standards Reference

> A curated collection of industry and government standards applicable to HAK.
> Use these as the baseline for achieving diamond-quality open source code.

## Standards by Category

| # | Category | Document | Standards Count |
|---|----------|----------|-----------------|
| 1 | [Software Safety & Reliability](./01-safety-reliability.md) | NASA, DO-178C, IEC 61508, MISRA | 12 |
| 2 | [Security](./02-security.md) | OWASP, NIST, CWE, ISO 27001 | 16 |
| 3 | [Code Quality & Style](./03-code-quality.md) | CERT, Google, Airbnb, Clean Code | 14 |
| 4 | [Testing](./04-testing.md) | ISTQB, ISO 29119, TDD, BDD | 10 |
| 5 | [Accessibility](./05-accessibility.md) | WCAG, Section 508, EN 301 549 | 7 |
| 6 | [Cloud & Infrastructure](./06-cloud-infra.md) | CIS, AWS Well-Architected, 12-Factor | 10 |
| 7 | [Open Source & Governance](./07-open-source.md) | OSSF, CHAOSS, REUSE, SPDX | 11 |
| 8 | [Government & Public Sector](./08-government.md) | EU, Estonian, GDPR, eIDAS | 9 |

## How to Use

1. Review each standard's applicability to HAK
2. Map specific requirements to our [Open Source Preparation Plan](../README.md)
3. Create automated checks where possible (linters, CI gates)
4. Document compliance in `docs/COMPLIANCE.md`

## Priority Matrix

**Must comply** (blocking for launch):
- OWASP Top 10, WCAG 2.1 AA, GDPR, OSSF Scorecard, CIS Benchmarks

**Should comply** (target before launch):
- NASA Power of 10, CERT Secure Coding, 12-Factor App, AWS Well-Architected

**Aspirational** (continuous improvement):
- ISO 25010, ISO 27001, DO-178C concepts, MISRA-like rigor
