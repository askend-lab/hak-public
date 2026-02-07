# CWE Top 25 Most Dangerous Software Weaknesses — Checklist

> https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Memory Safety (N/A for TypeScript — verify native addons)
- [ ] check · [ ] done — CWE-787/125: vmetajson binary from trusted source (`manual review`)

## Injection
- [ ] check · [ ] done — CWE-79 XSS: no `dangerouslySetInnerHTML` (`run-lint` — ESLint rule)
- [ ] check · [ ] done — CWE-89: DynamoDB uses parameterized expressions (`run-tests`)
- [ ] check · [ ] done — CWE-78: `spawn` uses argument array, no shell (`run-lint` + review)
- [ ] check · [ ] done — CWE-77: no `exec()` with user input (`run-lint` — `no-eval`)

## Authentication & Access
- [ ] check · [ ] done — CWE-287: all protected endpoints use Cognito auth (`run-tests`)
- [ ] check · [ ] done — CWE-862: every Lambda checks userId from JWT (`run-tests`)
- [ ] check · [ ] done — CWE-863: share token doesn't leak private data (`run-tests`)
- [ ] check · [ ] done — CWE-306: no unprotected critical endpoints (`run-tests` + review)

## Data Exposure
- [ ] check · [ ] done — CWE-200: error responses don't include stack traces (`run-tests`)
- [ ] check · [ ] done — CWE-522: no credentials in source, tokens not logged (`secret-detection`)

## Input Validation
- [ ] check · [ ] done — CWE-20: all handlers validate type/length/format (`run-tests`)
- [ ] check · [ ] done — CWE-502: `JSON.parse` in try-catch, no `eval` (`run-lint`)
- [ ] check · [ ] done — CWE-434: no unrestricted file uploads (`code review`)

## Design
- [ ] check · [ ] done — CWE-798: no hard-coded credentials (`secret-detection` hook)
- [ ] check · [ ] done — CWE-918 SSRF: no user-controlled URLs server-side (`run-lint` + review)
- [ ] check · [ ] done — CWE-352 CSRF: PKCE + Bearer token, not cookies (`run-tests`)
- [ ] check · [ ] done — CWE-269: IAM least privilege (`tfsec`)

## Crypto
- [ ] check · [ ] done — CWE-327: SHA-256 used, no MD5/SHA-1 for security (`run-tests`)
- [ ] check · [ ] done — CWE-326: TLS 1.2+, AES-256 at rest (`tfsec`)
