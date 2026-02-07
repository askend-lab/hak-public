# OWASP Top 10 (2021) — Checklist

> https://owasp.org/www-project-top-ten/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## A01: Broken Access Control
- [ ] check · [ ] done — All endpoints enforce auth via Cognito (`run-tests` — auth tests)
- [ ] check · [ ] done — Users access only own data — userId in partition key (`run-tests`)
- [ ] check · [ ] done — Share token access control validated (`run-tests`)
- [ ] check · [ ] done — CORS not `*` in production (`run-tests` — header assertions)
- [ ] check · [ ] done — API Gateway resource policies restrict access (`terraform validate`)

## A02: Cryptographic Failures
- [ ] check · [ ] done — TLS enforced via CloudFront (`terraform validate`)
- [ ] check · [ ] done — DynamoDB encryption at rest enabled (`tfsec`)
- [ ] check · [ ] done — S3 bucket encryption enabled (`tfsec`)
- [ ] check · [ ] done — No sensitive data in URLs/query params (`run-lint` — custom rule)
- [ ] check · [ ] done — Audio cache uses SHA-256 hash (`run-tests`)

## A03: Injection
- [ ] check · [ ] done — All Lambda inputs validated (`run-tests` — validation tests)
- [ ] check · [ ] done — DynamoDB uses parameterized expressions (`run-lint` — no string concat)
- [ ] check · [ ] done — No `eval()` or `Function()` (`run-lint` — `no-eval` rule)
- [ ] check · [ ] done — vmetajson uses argument array, not shell (`code review`)
- [ ] check · [ ] done — React escapes output by default (`run-lint` — no dangerouslySetInnerHTML)

## A04: Insecure Design
- [ ] check · [ ] done — Threat model exists per endpoint (`manual review`)
- [ ] check · [ ] done — Rate limiting on API Gateway (`terraform validate`)
- [ ] check · [ ] done — Text limits enforced server-side (`run-tests`)

## A05: Security Misconfiguration
- [ ] check · [ ] done — No default credentials in code (`secret-detection` hook)
- [ ] check · [ ] done — IAM least privilege (`tfsec`)
- [ ] check · [ ] done — Error responses don't leak stack traces (`run-tests`)
- [ ] check · [ ] done — Security headers set (CSP, X-Frame, etc.) (`run-tests`)

## A06: Vulnerable and Outdated Components
- [ ] check · [ ] done — All npm vulns resolved (`security-audit` hook)
- [ ] check · [ ] done — Dependabot enabled (`GitHub settings`)
- [ ] check · [ ] done — Docker images scanned (`trivy` in CI)
- [ ] check · [ ] done — No deprecated dependencies (`dependency-check` hook)

## A07: Identification and Authentication Failures
- [ ] check · [ ] done — PKCE follows RFC 7636 (`run-tests` — auth tests)
- [ ] check · [ ] done — Token storage is secure (`code review`)
- [ ] check · [ ] done — Session timeout configured (`Cognito config review`)

## A08: Software and Data Integrity Failures
- [ ] check · [ ] done — Signed commits, protected branches (`GitHub settings`)
- [ ] check · [ ] done — Dependencies pinned to exact versions (`dependency-check`)
- [ ] check · [ ] done — No deserialization of untrusted data (`run-lint`)

## A09: Security Logging and Monitoring Failures
- [ ] check · [ ] done — All auth events logged (`run-tests` — logging assertions)
- [ ] check · [ ] done — API access logged (`terraform validate` — access logs)
- [ ] check · [ ] done — CloudWatch alarms configured (`terraform validate`)
- [ ] check · [ ] done — No sensitive data in logs (`run-lint` — no-console + review)

## A10: Server-Side Request Forgery (SSRF)
- [ ] check · [ ] done — No user-controlled URLs in server requests (`run-lint` + review)
- [ ] check · [ ] done — S3 presigned URLs have short expiration (`run-tests`)
