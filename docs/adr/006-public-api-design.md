# ADR 006: Public API Endpoints Without Authentication

**Status:** Accepted  
**Date:** 2026-02

## Context

HAK has two APIs that serve the core learning experience: Merlin API (text-to-speech) and Vabamorf API (morphological analysis). The question was whether these should require authentication.

## Decision

**Merlin API and Vabamorf API are intentionally public, unauthenticated endpoints.** They must be accessible without login to serve the core learning experience. Protection is via API Gateway throttling and AWS WAF rate limiting only:

- **merlin-api**: 2 req/s, burst 4 (API Gateway) + Cognito JWT authorizer (added 2026-02)
- **vabamorf-api**: no auth (public morphological analysis)
- **AWS WAF**: 100 requests / 5 minutes per IP (global)

**SimpleStore** uses Cognito JWT authorizer on all mutation endpoints. Public/shared read endpoints are unauthenticated by design.

## Consequences

- **Positive:** Learning features work without login — lower barrier for students
- **Positive:** Simpler frontend — no token management for core API calls
- **Negative:** Abuse risk (TTS generation costs, SQS/ECS scaling) — mitigated by throttling and WAF
- **Negative:** No per-user usage tracking on public endpoints
