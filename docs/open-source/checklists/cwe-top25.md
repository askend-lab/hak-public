# CWE Top 25 Most Dangerous Software Weaknesses — Checklist

> https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html
> Mapped to HAK codebase with specific verification actions.

## Memory Safety (not directly applicable to TypeScript/Node.js)
- [ ] **CWE-787 Out-of-bounds Write** — N/A (managed language), verify native addons (vmetajson C++ binary)
- [ ] **CWE-125 Out-of-bounds Read** — N/A, verify vmetajson binary is from trusted source

## Injection
- [ ] **CWE-79 XSS** — React escapes by default; audit `dangerouslySetInnerHTML` usage (should be zero); audit URL construction in links
- [ ] **CWE-89 SQL Injection** — N/A (DynamoDB, not SQL); verify DynamoDB expression construction uses parameterized expressions
- [ ] **CWE-78 OS Command Injection** — Audit `child_process.spawn` in vmetajson.ts: uses argument array (safe), verify no shell option
- [ ] **CWE-77 Command Injection** — No `exec()` or `execSync()` with user input anywhere in codebase

## Authentication & Access
- [ ] **CWE-287 Improper Authentication** — All protected endpoints use Cognito authorizer; verify no bypass paths
- [ ] **CWE-862 Missing Authorization** — Verify every Lambda checks userId from JWT matches requested resource
- [ ] **CWE-863 Incorrect Authorization** — Verify share token access doesn't leak private data
- [ ] **CWE-306 Missing Auth for Critical Function** — List all API endpoints, verify none are unprotected unintentionally

## Data Exposure
- [ ] **CWE-200 Exposure of Sensitive Information** — Error responses don't include stack traces; logs don't contain PII
- [ ] **CWE-522 Insufficiently Protected Credentials** — No credentials in source code; tokens not logged

## Input Validation
- [ ] **CWE-20 Improper Input Validation** — All Lambda handlers validate input type, length, format before processing
- [ ] **CWE-434 Unrestricted Upload** — No file upload endpoints (audio is generated server-side); if added, restrict type/size
- [ ] **CWE-502 Deserialization of Untrusted Data** — `JSON.parse` wrapped in try-catch; no `eval` or `Function` constructor
- [ ] **CWE-611 XXE** — N/A (no XML parsing in the application)

## Design
- [ ] **CWE-798 Hard-coded Credentials** — gitleaks scan confirms no secrets in code; Cognito client ID is public by design (documented)
- [ ] **CWE-918 SSRF** — No user-controlled URLs in server-side HTTP requests
- [ ] **CWE-352 CSRF** — PKCE + state parameter in OAuth flow; API uses Bearer token (not cookies) for auth
- [ ] **CWE-269 Improper Privilege Management** — IAM roles follow least privilege; no admin endpoints without proper auth

## Crypto
- [ ] **CWE-327 Use of Broken Crypto Algorithm** — SHA-256 used for hashing (verified); no MD5 or SHA-1 for security purposes
- [ ] **CWE-326 Inadequate Encryption Strength** — TLS 1.2+ enforced; AES-256 for data at rest (AWS managed)
