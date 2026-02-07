# NIST SP 800-218 — Secure Software Development Framework Checklist

> https://csrc.nist.gov/projects/ssdf
> Practices for secure software development across the lifecycle.

## PO: Prepare the Organization
- [ ] **PO.1** Define security requirements for HAK (authentication, authorization, data protection, input validation)
- [ ] **PO.2** Implement roles and responsibilities for security (who reviews PRs for security, who triages vulnerabilities)
- [ ] **PO.3** Implement supporting toolchain (ESLint security rules, gitleaks, pnpm audit, Dependabot)
- [ ] **PO.4** Define and use criteria for software security checks (CI quality gates)
- [ ] **PO.5** Create secure development environment (branch protection, signed commits, secret scanning)

## PS: Protect the Software
- [ ] **PS.1** Protect all forms of code from unauthorized access (branch protection on `main`, require reviews)
- [ ] **PS.2** Provide a mechanism for verifying software integrity (signed releases, checksums, SBOM)
- [ ] **PS.3** Archive and protect each software release (GitHub Releases with tags)

## PW: Produce Well-Secured Software
- [ ] **PW.1** Design software to meet security requirements (threat model, security architecture documented)
- [ ] **PW.2** Review design to verify compliance with security requirements (architecture review documented in ADRs)
- [ ] **PW.4** Reuse existing well-secured software (use AWS managed services, established npm packages)
- [ ] **PW.5** Create source code following secure coding practices (OWASP, CERT, Google Style Guide)
- [ ] **PW.6** Configure compilation/build to improve security (TypeScript strict, ESLint security rules, no debug in prod)
- [ ] **PW.7** Review and test code for vulnerabilities (PR reviews, static analysis, dynamic testing)
- [ ] **PW.8** Test executable code for vulnerabilities (E2E tests, property-based tests, security-focused tests)
- [ ] **PW.9** Configure software to have secure settings by default (no debug pages, strict CORS, secure headers)

## RV: Respond to Vulnerabilities
- [ ] **RV.1** Identify and confirm vulnerabilities (monitor Dependabot alerts, pnpm audit, GitHub security advisories)
- [ ] **RV.2** Assess, prioritize, and remediate vulnerabilities (response timeline in SECURITY.md: Critical 24-48h, High 7d)
- [ ] **RV.3** Analyze vulnerabilities to find root cause (post-mortem process for security issues)
