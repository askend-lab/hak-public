# EU Cyber Resilience Act — Checklist

> https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
> EU cybersecurity requirements for products with digital elements. Coming into force 2024-2027.

## Essential Cybersecurity Requirements
- [ ] Product designed with appropriate level of cybersecurity (security by design)
- [ ] No known exploitable vulnerabilities at time of release
- [ ] Secure by default configuration (no debug mode, strict CORS, secure headers)
- [ ] Protection against unauthorized access (authentication, authorization)
- [ ] Protection of confidentiality of data (encryption at rest and in transit)
- [ ] Protection of integrity of data (input validation, checksums)

## Vulnerability Handling
- [ ] Process for identifying vulnerabilities (Dependabot, pnpm audit, CodeQL)
- [ ] Process for documenting and remediating vulnerabilities (SECURITY.md timeline)
- [ ] Security updates provided in timely manner (response SLA defined)
- [ ] Public disclosure policy (coordinated disclosure via SECURITY.md)

## Software Bill of Materials (SBOM)
- [ ] SBOM generated for each release (SPDX or CycloneDX format)
- [ ] SBOM includes all direct and transitive dependencies
- [ ] SBOM generation automated in CI/CD pipeline
- [ ] SBOM published alongside release artifacts

## Reporting Obligations
- [ ] Actively exploited vulnerabilities reported to ENISA within 24 hours
- [ ] Incident notification process documented
- [ ] Contact point for vulnerability reports (SECURITY.md email)

## Documentation Requirements
- [ ] User documentation includes security instructions
- [ ] Technical documentation describes security architecture
- [ ] Support period for security updates clearly communicated
- [ ] End-of-life policy documented

## Open Source Specific (CRA Recital 18)
- [ ] Open source steward responsibilities understood (if applicable)
- [ ] Security policy published and maintained
- [ ] Vulnerability handling process in place
- [ ] Cooperation with market surveillance authorities documented
