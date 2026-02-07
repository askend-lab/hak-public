# NIST SP 800-218 — Secure Software Development Framework Checklist

> https://csrc.nist.gov/projects/ssdf
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## PO: Prepare the Organization
- [ ] check · [ ] done — PO.1: Security requirements defined (`manual review`)
- [ ] check · [ ] done — PO.2: Roles for security reviews defined (`CONTRIBUTING.md`)
- [ ] check · [ ] done — PO.3: Toolchain implemented (`devbox.yaml` — all hooks)
- [ ] check · [ ] done — PO.4: Security check criteria defined (`devbox.yaml` thresholds)
- [ ] check · [ ] done — PO.5: Secure dev environment (`branch protection + secret-detection`)

## PS: Protect the Software
- [ ] check · [ ] done — PS.1: Code protected from unauthorized access (`branch protection`)
- [ ] check · [ ] done — PS.2: Software integrity verification (`signed releases + SBOM`)
- [ ] check · [ ] done — PS.3: Releases archived and protected (`GitHub Releases + tags`)

## PW: Produce Well-Secured Software
- [ ] check · [ ] done — PW.1: Security requirements in design (`threat model docs`)
- [ ] check · [ ] done — PW.2: Design reviewed for security (`ADR reviews`)
- [ ] check · [ ] done — PW.4: Reuse well-secured components (`security-audit` hook)
- [ ] check · [ ] done — PW.5: Secure coding practices (`run-lint` + `no-any` + `run-typecheck`)
- [ ] check · [ ] done — PW.6: Build config improves security (`run-build` — strict mode)
- [ ] check · [ ] done — PW.7: Code reviewed for vulns (`run-lint` + `secret-detection`)
- [ ] check · [ ] done — PW.8: Executable tested for vulns (`run-tests` — security tests)
- [ ] check · [ ] done — PW.9: Secure defaults — no debug in prod (`run-build` check)

## RV: Respond to Vulnerabilities
- [ ] check · [ ] done — RV.1: Identify vulns (`security-audit` hook + Dependabot)
- [ ] check · [ ] done — RV.2: Prioritize and remediate (`SECURITY.md` SLA)
- [ ] check · [ ] done — RV.3: Root cause analysis (`post-mortem process`)
