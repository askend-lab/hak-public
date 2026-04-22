# Authentication Architecture

HAK uses AWS Cognito for authentication with two login methods:

1. **TARA** — Estonian national eID authentication (ID-card, Mobile-ID, Smart-ID)
2. **Cognito Hosted UI** — Standard email/password login

## Flow Overview

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│ Frontend │────►│ Login Button │────►│ Cognito/TARA│────►│ Callback │
│  (SPA)   │     │  (LoginModal)│     │  (Redirect)  │     │  /auth/  │
└─────────┘     └──────────────┘     └─────────────┘     │ callback │
                                                          └────┬─────┘
                                                               │
                                                          Token Exchange
                                                          (PKCE + code)
                                                               │
                                                          ┌────▼─────┐
                                                          │ AuthCtx  │
                                                          │ (tokens) │
                                                          └──────────┘
```

## Authentication Methods

### TARA (Estonian eID)

TARA is Estonia's national authentication service. The flow:

1. User clicks "Log in with TARA" in `LoginModal`
2. Frontend redirects to `VITE_TARA_LOGIN_URL` (configured via env var)
3. TARA authenticates the user (ID-card, Mobile-ID, or Smart-ID)
4. TARA redirects back to the backend authentication Lambda (not included in open-source release)
5. The auth Lambda creates/finds the Cognito user and returns an auth code
6. Frontend receives the code at `/auth/callback` and exchanges it for tokens

### Cognito Hosted UI

Standard OAuth2 Authorization Code flow with PKCE:

1. User clicks "Log in" in `LoginModal`
2. Frontend generates a PKCE code verifier/challenge pair
3. Redirects to Cognito Hosted UI with `code_challenge`
4. User authenticates on Cognito's login page
5. Cognito redirects to `/auth/callback?code=...`
6. Frontend exchanges `code` + `code_verifier` for tokens

## Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthProvider` | `services/auth/context.tsx` | React context managing auth state, token refresh |
| `AuthCallbackPage` | `pages/AuthCallbackPage.tsx` | Handles OAuth callback, exchanges code for tokens |
| `LoginModal` | `components/LoginModal.tsx` | Login UI with TARA and Cognito options |
| `config.ts` | `services/auth/config.ts` | OAuth URLs, PKCE helpers, Cognito config |
| `pkce.ts` | `services/auth/pkce.ts` | PKCE code verifier/challenge generation |
| `useUserId` | `hooks/useUserId.ts` | Hook to get current user's ID |

## Environment Variables

All auth configuration is via `VITE_` environment variables (see `.env.example`):

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_COGNITO_REGION` | AWS region (default: `eu-west-1`) | No |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | For login |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID | For login |
| `VITE_COGNITO_DOMAIN` | Cognito Hosted UI domain | For login |
| `VITE_TARA_LOGIN_URL` | TARA auth start URL | For TARA login |

## Token Management

- Tokens are stored in `AuthProvider` React state (not localStorage)
- Access tokens are refreshed automatically before expiry
- Token refresh uses Cognito's `/oauth2/token` endpoint with `refresh_token` grant
- On refresh failure, user is logged out

## Security Design

- **PKCE** — Prevents authorization code interception (no client secret on frontend)
- **Redirect URI whitelist** — Cognito only redirects to allowed URIs
- **No secrets on frontend** — All sensitive values are server-side only
- **Short-lived tokens** — Access tokens expire, refresh tokens are used for renewal

## Development Without Auth

The dev server works without authentication. API calls are proxied to deployed services via `vite.config.ts`. You can develop UI components without setting up Cognito.

To enable login in development:
1. Copy `.env.example` to `.env.local`
2. Fill in Cognito values (get from team lead)
3. Restart dev server
