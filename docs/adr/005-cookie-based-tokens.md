# ADR 005: Cookie-Based Token Delivery After TARA Authentication

**Status:** Accepted  
**Date:** 2026-02

## Context

TARA authentication callback originally passed Cognito access and id tokens as URL query parameters in a 302 redirect to the frontend. This exposed tokens in browser history, CloudFront access logs (90-day retention), Referer headers to external resources, and analytics/error tracking URL captures (finding C1 in security audit).

## Decision

Move access and id tokens from URL query parameters to **Secure cookies** set in the 302 redirect response. The redirect URL now carries only `?auth=success` as a signal. The frontend reads tokens from `document.cookie` instead of `URLSearchParams`. Refresh token was already delivered via httpOnly cookie.

POST endpoints (`/tara/refresh`, `/tara/exchange-code`) are protected by **CSRF Origin header validation** — requests without a matching `Origin` header return 403.

## Consequences

- **Positive:** Tokens no longer leak via browser history, server logs, or Referer headers
- **Positive:** CloudFront logs contain no sensitive data
- **Positive:** CSRF protection prevents cross-origin token operations
- **Negative:** Cookies are accessible to JavaScript (not httpOnly) because the SPA needs to read id_token for userId/email extraction — XSS risk mitigated by CSP
- **Negative:** Cookie domain must be carefully scoped (narrowed to exact frontend hostname)
