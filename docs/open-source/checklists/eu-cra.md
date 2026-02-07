# EU Cyber Resilience Act — Checklist

> https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Essential Cybersecurity Requirements
- [ ] check · [ ] done — Security by design (`threat model + ADRs`)
- [ ] check · [ ] done — No known exploitable vulns at release (`security-audit` hook)
- [ ] check · [ ] done — Secure by default config (`run-build` — no debug in prod)
- [ ] check · [ ] done — Auth protection (`run-tests` — auth tests)
- [ ] check · [ ] done — Data confidentiality — encryption (`tfsec`)
- [ ] check · [ ] done — Data integrity — input validation (`run-tests`)

## Vulnerability Handling
- [ ] check · [ ] done — Process for identifying vulns (`security-audit` + Dependabot)
- [ ] check · [ ] done — Process for documenting and remediating (`SECURITY.md` SLA)
- [ ] check · [ ] done — Timely security updates (`manual review`)
- [ ] check · [ ] done — Public disclosure policy (`SECURITY.md`)

## Software Bill of Materials (SBOM)
- [ ] check · [ ] done — SBOM generated per release (`release workflow`)
- [ ] check · [ ] done — SBOM includes all direct + transitive deps (`syft` or `spdx-sbom-generator`)
- [ ] check · [ ] done — SBOM generation automated in CI (`release workflow`)
- [ ] check · [ ] done — SBOM published alongside release (`GitHub Release assets`)

## Reporting Obligations
- [ ] check · [ ] done — Actively exploited vulns reported to ENISA 24h (`incident process doc`)
- [ ] check · [ ] done — Incident notification process documented (`manual review`)
- [ ] check · [ ] done — Contact point for vuln reports (`SECURITY.md email`)

## Documentation Requirements
- [ ] check · [ ] done — User docs include security instructions (`manual review`)
- [ ] check · [ ] done — Tech docs describe security architecture (`ARCHITECTURE.md`)
- [ ] check · [ ] done — Support period communicated (`README`)
- [ ] check · [ ] done — End-of-life policy documented (`manual review`)

## Open Source Specific (CRA Recital 18)
- [ ] check · [ ] done — Security policy published (`SECURITY.md`)
- [ ] check · [ ] done — Vulnerability handling process in place (`SECURITY.md + Dependabot`)
- [ ] check · [ ] done — Cooperation with authorities documented (`manual review`)
