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
- ⚠️ **Known limitation:** Single AZ deployment. If AZ goes down, TARA login unavailable. Acceptable for MVP; future: multi-AZ with multiple NAT Gateways.

### 2. TARA Auth Lambda
- Runs in VPC private subnet (outbound via NAT Gateway)
- Endpoints:
  - `GET /auth/tara/start` - redirects to TARA authorize URL
  - `GET /auth/tara/callback` - receives code, exchanges for token, creates Cognito session
- Uses AdminCreateUser + Custom Auth flow (via Cognito triggers) for token generation

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
- Issuer: https://tara.ria.ee (prod) or https://tara-test.ria.ee (demo)
  - Note: OIDC endpoints are at `/oidc/*` but issuer claim in JWT is the base URL
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

### TARA Flow (Custom Auth)

**Why Custom Auth?**
TARA cannot be added as a standard Cognito OIDC Identity Provider due to IP whitelist requirements.
Cognito's `CUSTOM_AUTH` flow is the documented AWS mechanism for non-standard authentication scenarios.

**Flow:**
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
   - If not found, create new user with `AdminCreateUser`
   - No email-based linking: different login methods = separate accounts (simpler, no account takeover risk)
10. Lambda calls `AdminInitiateAuth` with `CUSTOM_AUTH` flow
11. Cognito triggers Custom Auth Lambda (verifies and issues tokens)
12. Lambda returns tokens to frontend via HttpOnly secure cookies
    - Tokens NOT passed in URL parameters (prevents logging, Referer leaks)
    - Frontend auth state: separate `is_authenticated` cookie (not HttpOnly) or `/auth/me` endpoint

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

### Cognito Custom Auth Configuration
- **ExplicitAuthFlows:** `ALLOW_ADMIN_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
- **Custom attribute:** `custom:personal_code` for TARA user linking

**Lambda Functions:**
- `cognitoTriggers` - handles all three Cognito trigger events via switch on `triggerSource`
- IAM role: minimal permissions (no Admin API access needed, only Cognito trigger response)

**Triggers:**
1. **DefineAuthChallenge** - returns `CUSTOM_CHALLENGE`
2. **CreateAuthChallenge** - creates challenge metadata
3. **VerifyAuthChallengeResponse** - validates and returns success

**Trust chain between TARA Lambda and Cognito triggers:**
- Cognito triggers are invoked only by Cognito, not externally accessible
- TARA Lambda verifies JWT before calling adminInitiateAuth
- Chain of trust: User → TARA (auth) → TARA Lambda (JWT verified) → Cognito → Trigger Lambda

### User Accounts
- TARA users identified by `custom:personal_code` attribute
- No cross-provider linking: Google login and TARA login = separate accounts
- Simplifies security model, eliminates account takeover risks

## Next Steps

### INFRA repo (sam/infra)
- [ ] Fix redirect_uri in `lambdas/tara-auth/src/handler.ts` (change callback URL from `hak-api-dev` to `auth.askend-lab.com`)
- [ ] Add Cognito Lambda triggers in `terraform/cognito.tf` (lambda_config block)
- [ ] Deploy: Lambda via CI/CD + Terraform apply

### HAK repo (kate/hak)
- [ ] Update `getTaraLoginUrl()` in `packages/frontend/src/services/auth/config.ts` to use `auth.askend-lab.com`
- [ ] Update E2E tests in `packages/frontend/e2e/tara-auth.spec.ts` to use new URLs
- [ ] Deploy frontend

### Testing
- [ ] Test full TARA demo flow end-to-end (ID-card, Mobile-ID, Smart-ID)
- [ ] Verify Cognito user creation/linking works

### Production Migration (later)
- [ ] Apply for TARA production account (klient@ria.ee)
- [ ] Switch TARA_ISSUER from `tara-test.ria.ee` to `tara.ria.ee`
- [ ] Implement password security improvement (random secret per user)

## Security & Operations Considerations

### Rate Limiting
- AWS WAF rate limiting on Lambda endpoints
- Cognito built-in throttling for Admin API calls
- CloudWatch alarms on anomalous request patterns

### Error Handling
- Structured error responses (no sensitive data in errors)
- Failed auth attempts logged with pseudonymized user ID
- Graceful degradation on TARA unavailability

### Monitoring
- CloudWatch metrics: auth success/failure rates, latency
- Alarms: elevated failure rates, NAT Gateway issues
- Log retention: 30 days (no PII in logs)

### Token Management
- Access/ID tokens: 1 hour validity
- Refresh tokens: 30 days, rotation on use
- JWKS caching: cache TARA JWKS with TTL (reduce latency, handle TARA downtime)
