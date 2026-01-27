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
- Apply to klient@ria.ee (demo first, then prod)
- Redirect URI: https://hak-api.askend-lab.com/auth/tara/callback (our Lambda)
- IP whitelist: NAT Gateway Elastic IP
- Issuer: https://tara.ria.ee/oidc (prod) or https://tara-test.ria.ee/oidc (demo)

### 5. Frontend
- Google/Facebook: Use Cognito Hosted UI
- TARA: Button redirects to `/auth/tara/start` endpoint

### 6. Backend
- No changes - continues using Cognito authorizer
- All auth methods result in same Cognito JWT

## Files

**Infrastructure (sam/infra):**
- terraform/vpc-nat.tf - VPC, private subnet, NAT Gateway, Elastic IP
- terraform/cognito.tf - existing, add Google/Facebook providers

**TARA Lambda (hak):**
- packages/tara-auth/ - new package for TARA authentication Lambda
- serverless-tara.yml - deployment config with VPC settings

## Authentication Flow Details

### TARA Flow
1. User clicks "Login with TARA" → redirects to `/auth/tara/start`
2. Lambda builds TARA authorize URL with state, redirects user
3. User authenticates in TARA (ID-card, Mobile-ID, Smart-ID)
4. TARA redirects to `/auth/tara/callback?code=xxx&state=yyy`
5. Lambda validates state, exchanges code for tokens at TARA (via NAT Gateway IP)
6. Lambda extracts user info (personal code, name) from TARA id_token
7. Lambda creates/finds user in Cognito (AdminCreateUser or lookup by personal code)
8. Lambda generates Cognito tokens (AdminInitiateAuth with ADMIN_NO_SRP_AUTH)
9. Lambda redirects to frontend with Cognito tokens

### User Linking
Users are linked by personal code (isikukood) stored as Cognito custom attribute.
Same person logging via TARA and Google gets linked to same Cognito user if email matches.
