# TARA + Social Login Integration

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Authentication Flows                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Google/Facebook (via Cognito):                                             │
│  ┌────────┐    ┌─────────┐    ┌─────────────┐    ┌─────────┐               │
│  │Frontend│───►│ Cognito │───►│Google/FB IDP│───►│ Cognito │──► JWT        │
│  └────────┘    │Hosted UI│    └─────────────┘    │tokens   │               │
│                └─────────┘                       └─────────┘               │
│                                                                             │
│  TARA (via custom Lambda - IP whitelist requirement):                       │
│  ┌────────┐    ┌──────┐    ┌────────┐    ┌──────────────┐    ┌─────────┐   │
│  │Frontend│───►│ TARA │───►│Frontend│───►│TARA Auth     │───►│ Cognito │   │
│  │        │    │      │    │callback│    │Lambda in VPC │    │ tokens  │   │
│  └────────┘    └──────┘    └────────┘    │(NAT Gateway) │    └─────────┘   │
│                                          └──────────────┘                   │
│                                                 │                           │
│                                                 ▼                           │
│                                          ┌──────────┐                       │
│                                          │TARA token│ (IP whitelisted)      │
│                                          │ endpoint │                       │
│                                          └──────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why TARA needs special handling:**
TARA production environment requires IP whitelist for token endpoint requests. Cognito as a managed AWS service uses AWS IP addresses we don't control. Therefore, TARA cannot be added as a standard Cognito OIDC Identity Provider.

**Solution:** Custom Lambda in VPC with NAT Gateway (fixed Elastic IP) handles TARA token exchange, then creates/links user in Cognito programmatically.

**Existing Cognito:**
- User Pool: eu-west-1_wlRtuLkG2
- Domain: askend-lab-auth.auth.eu-west-1.amazoncognito.com
- Client ID: 64tf6nf61n6sgftqif6q975hka

## Setup

### 1. VPC + NAT Gateway (for TARA Lambda)
- Create VPC with private subnet + NAT Gateway
- NAT Gateway has Elastic IP (fixed, controllable)
- Register Elastic IP with TARA (klient@ria.ee)
- Cost: ~€35/month

### 2. TARA Auth Lambda
- Runs in VPC private subnet (outbound via NAT Gateway)
- Endpoints:
  - `GET /auth/tara/start` - redirects to TARA authorize URL
  - `GET /auth/tara/callback` - receives code, exchanges for token, creates Cognito session
- Uses AdminCreateUser/AdminInitiateAuth to create Cognito tokens

### 3. Identity Providers in Cognito (Google/Facebook only)

**Google:**
- Redirect URI: https://askend-lab-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse
- Get Client ID/Secret from console.cloud.google.com

**Facebook:**
- Redirect URI: https://askend-lab-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse
- Get App ID/Secret from developers.facebook.com

**TARA:** NOT added to Cognito (handled by custom Lambda)

### 4. TARA Registration
- ✅ **Demo account configured** (tara-test.ria.ee)
- Redirect URI: https://auth.askend-lab.com/auth/tara/callback
- IP whitelist: 34.253.56.45 (NAT Gateway Elastic IP)
- Secrets stored in: `askend-lab/llm-keys` (Secrets Manager)
  - `tara-client-id`
  - `tara-client-secret`
- For production: apply to klient@ria.ee with same redirect URI and IP

### 5. Frontend
- Google/Facebook: Use Cognito Hosted UI
- TARA: Button redirects to `/auth/tara/start` endpoint

### 6. Backend
- No changes - continues using Cognito authorizer
- All auth methods result in same Cognito JWT

## Files

**Infrastructure (sam/infra):**
- `terraform/vpc-nat.tf` - VPC, private subnets, NAT Gateway, Elastic IP
- `terraform/cognito.tf` - User Pool configuration
- `terraform/tara-auth-domain.tf` - Custom domain for TARA Auth API
- `lambdas/tara-auth/` - TARA authentication Lambda
  - `serverless.yml` - deployment config with VPC settings
  - `src/handler.ts` - API endpoints (start, callback)
  - `src/tara-client.ts` - TARA OIDC client
  - `src/cognito-client.ts` - Cognito integration
  - `src/cognito-triggers.ts` - Custom Auth triggers

**Deployed Infrastructure:**
- Domain: `auth.askend-lab.com`
- API Gateway: REST API (REGIONAL)
- NAT Gateway IP: `34.253.56.45`
- Lambda functions:
  - `tara-auth-dev-taraStart`
  - `tara-auth-dev-taraCallback`
  - `tara-auth-dev-cognitoTriggers`

## Authentication Flow Details

### TARA Flow
1. User clicks "Login with TARA" → redirects to `/auth/tara/start`
2. Lambda builds TARA authorize URL with state/nonce, redirects user
3. User authenticates in TARA (ID-card, Mobile-ID, Smart-ID)
4. TARA redirects to `/auth/tara/callback?code=xxx&state=yyy`
5. Lambda validates state cookie
6. Lambda exchanges code for tokens at TARA token endpoint (via NAT Gateway IP)
   - Uses `client_secret_basic` authentication (Basic Auth header)
7. Lambda verifies TARA id_token (JWT signature via JWKS, issuer, audience, nonce)
8. Lambda extracts user info (personal code, name, email) from TARA id_token
9. Lambda creates/finds user in Cognito:
   - Search by `custom:personal_code` attribute
   - If not found, search by email and link
   - If not found, create new user with `AdminCreateUser`
10. Lambda sets user password with `AdminSetUserPassword` (for ADMIN_USER_PASSWORD_AUTH)
11. Lambda generates Cognito tokens via `AdminInitiateAuth` with `ADMIN_USER_PASSWORD_AUTH`
12. Lambda redirects to frontend with Cognito tokens in URL params

### TARA OIDC Configuration
- **Current:** Demo environment (`https://tara-test.ria.ee`)
- **Production:** `https://tara.ria.ee` (switch later)
- **Endpoints:** All at `/oidc/*` path (authorize, token, jwks)
- **Auth method:** `client_secret_basic` only
- **Supported scopes:** `openid`

## Current Status

| Component | Status | Details |
|-----------|--------|--------|
| VPC + NAT Gateway | ✅ | IP: 34.253.56.45 |
| TARA Auth Lambda | ✅ | Deployed to infra |
| Custom Domain | ✅ | auth.askend-lab.com |
| /auth/tara/start | ✅ | Redirects to TARA |
| /auth/tara/callback | ⏳ | Needs testing |
| Cognito Triggers | ⏳ | Need to add lambda_config |
| TARA Demo | ✅ | Credentials in Secrets Manager |
| TARA Production | ⏳ | Apply after demo testing |

### Cognito Configuration
- **ExplicitAuthFlows:** `ALLOW_ADMIN_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
- **Custom attribute:** `custom:personal_code` for TARA user linking

### Password Security (TODO)
Current implementation uses deterministic password. Target implementation:
1. On user creation: generate random secret, store in `custom:tara_secret` attribute
2. On login: read secret from attribute, use for password generation
3. Benefits: rotating global secret doesn't break existing users, one leak doesn't compromise all

### User Linking
Users are linked by personal code (isikukood) stored as `custom:personal_code` Cognito attribute.
Same person logging via TARA and Google gets linked to same Cognito user if email matches.
