# TARA Auth

Estonian eID (TARA) authentication Lambda for HAK. Handles the OAuth2 Authorization Code flow with TARA, exchanges tokens with AWS Cognito, and manages secure cookie-based sessions.

## Authentication Flow

```
1. GET /tara/start        → Redirect to TARA with PKCE + state cookie
2. TARA callback          → GET /tara/callback → Exchange code → Set cookies → Redirect to frontend
3. POST /tara/refresh     → Read httpOnly cookie → Refresh Cognito tokens → Set new cookies
4. POST /tara/exchange-code → Exchange authorization code for Cognito tokens
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tara/start` | Initiate TARA login (generates PKCE, sets state cookie, redirects) |
| `GET` | `/tara/callback` | TARA OAuth2 callback (exchanges code, sets token cookies) |
| `POST` | `/tara/refresh` | Refresh access token using httpOnly refresh cookie |
| `POST` | `/tara/exchange-code` | Exchange authorization code for Cognito tokens |

## Security Features

- **Token cookies** — access and id tokens set as Secure cookies (not URL params)
- **httpOnly refresh** — refresh token in httpOnly cookie (never accessible to JS)
- **PKCE** — Proof Key for Code Exchange prevents authorization code interception
- **State + nonce** — anti-CSRF state parameter with TTL validation
- **CSRF protection** — Origin header validation on all POST endpoints (returns 403 on mismatch)
- **Cookie domain** — scoped to exact frontend hostname (e.g., `.hak-dev.askend-lab.com`)
- **Personal code validation** — `^[A-Z]{2}\d{11}$` regex before Cognito filter interpolation
- **Sanitized logging** — error logs contain only `error.message`, no raw objects or stack traces

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TARA_CLIENT_ID` | TARA OAuth2 client ID |
| `TARA_CLIENT_SECRET` | TARA OAuth2 client secret (from SSM/SecretsManager) |
| `TARA_ISSUER` | TARA OIDC issuer URL |
| `COGNITO_DOMAIN` | Cognito hosted UI domain |
| `COGNITO_USER_POOL_ID` | Cognito user pool ID |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |
| `FRONTEND_URL` | Frontend URL for redirects and CSRF validation |

## Testing

```bash
pnpm test              # Run tests
pnpm test:full         # Run with coverage
```

Test files are in `test/` directory:
- `handler.test.ts` — start/callback handler tests
- `handler.refresh.test.ts` — refresh + exchange-code + CSRF tests
- `handler.cookies.mutations.test.ts` — cookie domain, creation, parsing
- `cognito-client.mutations.test.ts` — Cognito user operations
- `integration.test.ts` — full auth flow integration tests

## Deploy

```bash
serverless deploy --stage dev
```
