# Security Standards

Standards for secure software development, vulnerability prevention, and security architecture.

## 1. OWASP Top 10 — Web Application Security Risks
- **Link**: https://owasp.org/www-project-top-ten/
- **Scope**: Top 10 most critical web application security risks
- **2021 List**: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Auth Failures, Data Integrity Failures, Logging Failures, SSRF
- **HAK action**: Audit every Lambda handler against each category

## 2. OWASP ASVS — Application Security Verification Standard
- **Link**: https://owasp.org/www-project-application-security-verification-standard/
- **Scope**: Comprehensive security requirements framework (3 levels)
- **HAK target**: Level 2 (standard applications)
- **Sections**: Authentication, Session Management, Access Control, Validation, Cryptography, Error Handling, Data Protection, Communication, API Security

## 3. OWASP SAMM — Software Assurance Maturity Model
- **Link**: https://owaspsamm.org/
- **Scope**: Framework for improving secure development practices
- **Domains**: Governance, Design, Implementation, Verification, Operations

## 4. OWASP Serverless Top 10
- **Link**: https://owasp.org/www-project-serverless-top-10/
- **Scope**: Security risks specific to serverless architectures (Lambda, API Gateway)
- **Directly applicable to HAK's architecture**

## 5. NIST SP 800-53 — Security and Privacy Controls
- **Link**: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
- **Scope**: Comprehensive catalog of security controls for federal systems
- **Key families**: Access Control, Audit, Configuration, Identification, Incident Response

## 6. NIST SP 800-218 — Secure Software Development Framework (SSDF)
- **Link**: https://csrc.nist.gov/projects/ssdf
- **Scope**: Practices for secure software development
- **Groups**: Prepare Organization, Protect Software, Produce Well-Secured Software, Respond to Vulnerabilities

## 7. NIST Cybersecurity Framework (CSF) 2.0
- **Link**: https://www.nist.gov/cyberframework
- **Scope**: Framework for managing cybersecurity risk
- **Functions**: Govern, Identify, Protect, Detect, Respond, Recover

## 8. CWE — Common Weakness Enumeration
- **Link**: https://cwe.mitre.org/
- **Scope**: Catalog of software/hardware weakness types
- **Key CWEs for web apps**: CWE-79 (XSS), CWE-89 (SQL Injection), CWE-287 (Auth), CWE-200 (Info Exposure)
- **Top 25**: https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html

## 9. CVE — Common Vulnerabilities and Exposures
- **Link**: https://cve.mitre.org/
- **Scope**: Standard identifiers for known vulnerabilities
- **HAK action**: Monitor dependencies via `pnpm audit` and Dependabot

## 10. ISO/IEC 27001 — Information Security Management
- **Link**: https://www.iso.org/standard/27001
- **Scope**: ISMS requirements — policies, risk assessment, controls
- **Applicable**: Security policy, access control, asset management, incident management

## 11. ISO/IEC 27034 — Application Security
- **Link**: https://www.iso.org/standard/44378.html
- **Scope**: Framework for integrating security into application lifecycle
- **Key concept**: Application Security Controls (ASCs)

## 12. CERT Secure Coding Standards
- **Link**: https://wiki.sei.cmu.edu/confluence/display/seccode
- **Scope**: Language-specific secure coding rules (C, C++, Java, Perl, Android)
- **TypeScript parallels**: Input validation, integer overflow, null handling, error handling

## 13. SANS Top 25 Software Errors
- **Link**: https://www.sans.org/top25-software-errors/
- **Scope**: Most dangerous software errors
- **Categories**: Insecure Interaction, Risky Resource Management, Porous Defenses

## 14. Supply Chain Security — SLSA Framework
- **Link**: https://slsa.dev/
- **Scope**: Supply-chain Levels for Software Artifacts
- **Levels**: Build integrity, source integrity, dependencies, build platform security
- **HAK action**: Signed commits, reproducible builds, dependency pinning

## 15. OpenSSF Best Practices Badge
- **Link**: https://www.bestpractices.dev/
- **Scope**: Security best practices criteria for open source projects
- **HAK target**: Passing badge level (then Silver, Gold)

## 16. STRIDE Threat Modeling
- **Link**: https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool
- **Scope**: Microsoft's threat classification model
- **Categories**: Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege
- **HAK action**: Create threat model for each API endpoint and data flow
