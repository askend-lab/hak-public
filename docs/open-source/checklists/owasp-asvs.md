# OWASP ASVS Level 2 — Checklist

> https://owasp.org/www-project-application-security-verification-standard/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## V1: Architecture, Design and Threat Modeling
- [ ] check · [ ] done — Architecture with trust boundaries documented (`manual review`)
- [ ] check · [ ] done — Threat model per API endpoint — STRIDE (`manual review`)
- [ ] check · [ ] done — Input validation strategy centralized (`run-lint` + `run-tests`)

## V2: Authentication
- [ ] check · [ ] done — OIDC via Cognito/TARA (`run-tests` — auth tests)
- [ ] check · [ ] done — PKCE verifier ≥ 43 chars, RFC 7636 (`run-tests`)
- [ ] check · [ ] done — Token expiration configured (`Cognito config review`)
- [ ] check · [ ] done — No credentials in code (`secret-detection` hook)

## V3: Session Management
- [ ] check · [ ] done — Session tokens cryptographically random — JWT (`run-tests`)
- [ ] check · [ ] done — Session timeout configured (`Cognito config review`)
- [ ] check · [ ] done — Logout invalidates tokens (`run-tests` — logout test)

## V4: Access Control
- [ ] check · [ ] done — Every endpoint has access control (`run-tests`)
- [ ] check · [ ] done — Users access only own resources (`run-tests`)
- [ ] check · [ ] done — Deny by default (`run-tests` — unauthorized access tests)

## V5: Validation, Sanitization and Encoding
- [ ] check · [ ] done — All input validated: type, length, format (`run-tests`)
- [ ] check · [ ] done — `MAX_TEXT_LENGTH` enforced server-side (`run-tests`)
- [ ] check · [ ] done — API responses use `application/json` (`run-tests`)

## V6: Stored Cryptography
- [ ] check · [ ] done — DynamoDB encryption at rest (`tfsec`)
- [ ] check · [ ] done — S3 encryption enabled (`tfsec`)
- [ ] check · [ ] done — SHA-256 for hashing (`run-tests` — hash tests)

## V7: Error Handling and Logging
- [ ] check · [ ] done — Errors logged with context (`run-tests` — logging tests)
- [ ] check · [ ] done — Client responses contain no sensitive info (`run-tests`)
- [ ] check · [ ] done — Security events logged (`run-tests`)
- [ ] check · [ ] done — Logs don't contain PII/tokens (`no-console` hook + review)

## V8: Data Protection
- [ ] check · [ ] done — Sensitive data classified (`manual review`)
- [ ] check · [ ] done — PII protected in transit and at rest (`tfsec` + `run-tests`)
- [ ] check · [ ] done — Data retention policies defined (`manual review`)

## V9: Communication
- [ ] check · [ ] done — TLS 1.2+ for all external comms (`tfsec` — CloudFront)
- [ ] check · [ ] done — HSTS headers configured (`run-tests` — header tests)

## V10: Malicious Code
- [ ] check · [ ] done — No backdoors/debug endpoints in prod (`run-lint` + review)
- [ ] check · [ ] done — `DebugPage.tsx` removed/disabled in prod (`run-build` check)
- [ ] check · [ ] done — No eval/Function constructor (`run-lint` — `no-eval` rule)

## V11: Business Logic
- [ ] check · [ ] done — Text limits enforced client + server (`run-tests`)
- [ ] check · [ ] done — TTS synthesis rate-limited (`terraform validate`)
- [ ] check · [ ] done — Task sharing has auth checks (`run-tests`)

## V13: API and Web Service
- [ ] check · [ ] done — All endpoints documented (`manual review`)
- [ ] check · [ ] done — Request size limits at API Gateway (`terraform validate`)
- [ ] check · [ ] done — Proper HTTP methods (GET read, POST write) (`run-tests`)

## V14: Configuration
- [ ] check · [ ] done — Secrets externalized from code (`secret-detection` hook)
- [ ] check · [ ] done — No debug mode in production (`run-build` check)
- [ ] check · [ ] done — CORS restrictive, not `*` (`run-tests` — header tests)
