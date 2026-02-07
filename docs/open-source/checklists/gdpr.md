# GDPR — General Data Protection Regulation Checklist

> https://gdpr-info.eu/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Art. 5: Data Processing Principles
- [ ] check · [ ] done — Purpose limitation documented (`manual review`)
- [ ] check · [ ] done — Data minimization — only necessary data (`manual review`)
- [ ] check · [ ] done — Retention periods defined (`manual review`)
- [ ] check · [ ] done — Encryption at rest and in transit (`tfsec`)

## Art. 6: Lawful Basis for Processing
- [ ] check · [ ] done — Lawful basis documented per data type (`manual review`)
- [ ] check · [ ] done — Public task (Art. 6(1)(e)) justification documented (`manual review`)

## Art. 13-14: Transparency (Privacy Notice)
- [ ] check · [ ] done — Privacy policy page accessible (`Playwright test`)
- [ ] check · [ ] done — Lists: controller, DPO, categories, purposes, legal basis (`manual review`)
- [ ] check · [ ] done — Lists: retention, sharing, transfers, rights (`manual review`)

## Art. 15-22: Data Subject Rights
- [ ] check · [ ] done — Right of access — user can export data (`run-tests` — export test)
- [ ] check · [ ] done — Right to rectification — user can correct data (`run-tests`)
- [ ] check · [ ] done — Right to erasure — user can delete account (`run-tests`)
- [ ] check · [ ] done — Right to portability — export in JSON (`run-tests`)
- [ ] check · [ ] done — Mechanism for data subject requests (`manual review`)

## Art. 25: Data Protection by Design
- [ ] check · [ ] done — Privacy in architecture (documented in ADRs) (`manual review`)
- [ ] check · [ ] done — Default settings privacy-friendly (`manual review`)
- [ ] check · [ ] done — Pseudonymization where possible (`code review`)
- [ ] check · [ ] done — No unnecessary analytics (`run-lint` — no tracking scripts)

## Art. 32: Security of Processing
- [ ] check · [ ] done — Encryption in transit TLS 1.2+ (`tfsec`)
- [ ] check · [ ] done — Encryption at rest DynamoDB/S3 (`tfsec`)
- [ ] check · [ ] done — Access controls IAM least privilege (`tfsec`)

## Art. 33-34: Breach Notification
- [ ] check · [ ] done — Incident response plan documented (`manual review`)
- [ ] check · [ ] done — DPA notification within 72h process (`manual review`)
- [ ] check · [ ] done — Contact for Estonian DPI (`manual review`)

## Art. 35: DPIA
- [ ] check · [ ] done — DPIA conducted (`manual review`)
- [ ] check · [ ] done — Risk assessment with mitigations (`manual review`)

## Art. 28: Data Processor Agreements
- [ ] check · [ ] done — DPA with AWS documented (`manual review`)
- [ ] check · [ ] done — Sub-processor list maintained (`manual review`)
