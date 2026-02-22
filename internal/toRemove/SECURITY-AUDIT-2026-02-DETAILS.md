# Security Audit Details — February 2026

Technical details for findings in `SECURITY-AUDIT-2026-02.md`.

## C1. Tokens in redirect URL — Full Analysis

**Location:** `packages/tara-auth/src/handler.ts` lines 211-237  
**Flow:** TARA callback → Cognito tokens generated → 302 redirect with tokens as URL params

```
GET /auth/callback?access_token=eyJ...&id_token=eyJ... HTTP/1.1
```

**Exposure vectors:** Browser history, CloudFront logs (`infra/cloudfront.tf:194`, 90-day retention in S3), Referer header to any external resource, analytics/error tracking URL capture.

**Recommended fix:** Set access_token and id_token as httpOnly cookies alongside refresh_token, or implement a one-time authorization code stored in DynamoDB with 30s TTL.

## C2. Merlin API Auth — Endpoint Matrix

| Endpoint | Method | Auth | Throttle | Risk |
|----------|--------|------|----------|------|
| `/synthesize` | POST | NONE | 5/s | TTS abuse, SQS flood |
| `/status/{key}` | GET | NONE | 5/s | Cache enumeration |
| `/health` | GET | NONE | 5/s | Low |
| `/warmup` | POST | NONE | 5/s | ECS scaling ($$) |

Compare with SimpleStore: `/save`, `/get`, `/delete`, `/query` all have Cognito authorizer.

## C3. Text Validation Gap

`packages/shared/src/constants.ts` defines `MAX_AUDIO_TEXT_LENGTH: 1000` but `packages/merlin-api/src/handler.ts` never imports it. The `validateText()` function only checks `typeof text === "string" && text !== ""`. No validation on `voice`, `speed`, or `pitch` parameters either — attacker can set `speed: 0.001` for extremely long audio generation.

## C4. redirect_uri Forwarding

`exchangeCodeHandler` (line 306) destructures `redirect_uri` from user-supplied JSON body and passes it to `https://{cognitoDomain}/oauth2/token`. Cognito does validate against whitelist, but defense-in-depth requires server-side control. The frontend config already has `cognitoConfig.redirectUri` — the backend should mirror this from env vars.

## H1. Cookie Domain Calculation

```typescript
// Returns .askend-lab.com for https://hak.askend-lab.com
getCookieDomain() → '.' + parts.slice(-2).join('.')
```

This means `staging.askend-lab.com`, `other-project.askend-lab.com`, etc. all receive the refresh token cookie. Any XSS on any askend-lab.com subdomain can steal refresh tokens.

## H2. CORS Configuration Matrix

| Package | CORS Origin Source | Credentials | Risk |
|---------|-------------------|-------------|------|
| shared (default) | `ALLOWED_ORIGIN` or `*` | No | Wildcard fallback |
| tara-auth | `getCorsOrigin()` | Yes | `*` + credentials |
| simplestore | `getCorsOrigin()` | No | Wildcard fallback |
| merlin-api | serverless.yml allowedOrigins | No | Correctly configured |
| vabamorf-api | serverless.yml allowedOrigins | No | Correctly configured |

## H3-H4. SimpleStore Specifics

No `throttle` in `serverless.yml`. Public endpoints `/get-shared` and `/get-public` have no Cognito authorizer at API Gateway level. Partition key structure `{app}#{tenant}#{env}#{type}` is predictable for anyone reading the open-source code.

## H5. CI Audit Step

```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
  continue-on-error: true  # Never blocks deployment
```

## M4. S3 Audio URL Pattern

Cache keys are SHA-256 of `{text}|{voice}|{speed}|{pitch}`. Same input = same key. URL pattern: `https://{bucket}.s3.{region}.amazonaws.com/cache/{sha256}.wav`. If bucket allows public read or has misconfigured policy, all synthesized audio is accessible.

## M5. Cognito Filter Injection Surface

```typescript
Filter: `"custom:personal_code" = "${personalCode}"`
```

Estonian personal code format: 11 digits (e.g., `39901011234`). No regex validation before filter interpolation. While input comes from verified TARA JWT, adding `/^\d{11}$/` check costs nothing and prevents edge cases.

## Methodology

- Static analysis of all .ts/.tsx/.js files (464 source files)
- Terraform/Serverless IaC review (infra/, */serverless.yml)
- GitHub Actions workflow analysis (.github/workflows/)
- `pnpm audit` dependency scan
- Authentication flow trace: TARA OIDC → Cognito CUSTOM_AUTH → Frontend
- CORS + cookie + CSP header analysis
- S3 bucket policy + IAM permission review
