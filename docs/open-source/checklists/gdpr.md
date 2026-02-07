# GDPR — General Data Protection Regulation Checklist

> https://gdpr-info.eu/
> EU data protection regulation. Applies to all processing of personal data.

## Art. 5: Data Processing Principles
- [ ] **Purpose limitation** — Document what personal data is collected and why
- [ ] **Data minimization** — Collect only data necessary for language learning
- [ ] **Storage limitation** — Define retention periods for user data, tasks, audio cache
- [ ] **Accuracy** — Allow users to update their profile information
- [ ] **Integrity and confidentiality** — Encryption at rest and in transit

## Art. 6: Lawful Basis for Processing
- [ ] Document lawful basis for each type of data processing
- [ ] User consent mechanism for non-essential processing
- [ ] Public task (Art. 6(1)(e)) justification documented for government service

## Art. 13-14: Transparency (Privacy Notice)
- [ ] Privacy policy page accessible from the application
- [ ] Describes: data controller, DPO contact, data categories, purposes, legal basis
- [ ] Describes: retention periods, data sharing, international transfers, user rights

## Art. 15-22: Data Subject Rights
- [ ] **Right of access** (Art. 15) — User can export their data
- [ ] **Right to rectification** (Art. 16) — User can correct their data
- [ ] **Right to erasure** (Art. 17) — User can delete their account and all data
- [ ] **Right to data portability** (Art. 20) — Export in machine-readable format (JSON)
- [ ] **Right to restriction** (Art. 18) — Ability to restrict processing
- [ ] Mechanism for submitting data subject requests (email or in-app)

## Art. 25: Data Protection by Design
- [ ] Privacy considerations in architecture decisions (documented in ADRs)
- [ ] Default settings are privacy-friendly (no optional tracking enabled by default)
- [ ] Pseudonymization where possible (Cognito sub ID instead of name)
- [ ] No unnecessary data collection in frontend analytics

## Art. 32: Security of Processing
- [ ] Encryption in transit (TLS 1.2+ via CloudFront)
- [ ] Encryption at rest (DynamoDB, S3 encryption enabled)
- [ ] Access controls (IAM least privilege, Cognito auth)
- [ ] Regular security testing (audit schedule documented)

## Art. 33-34: Breach Notification
- [ ] Incident response plan documented
- [ ] Notification process to DPA within 72 hours
- [ ] Notification process to affected users without undue delay
- [ ] Contact information for Estonian Data Protection Inspectorate

## Art. 35: Data Protection Impact Assessment (DPIA)
- [ ] DPIA conducted for the application (government service processing user data)
- [ ] Risk assessment documented with mitigations
- [ ] DPO consulted during DPIA process

## Art. 28: Data Processor Agreements
- [ ] DPA with AWS (as data processor) — AWS DPA documented
- [ ] DPA with any third-party services used
- [ ] Sub-processor list maintained and documented
