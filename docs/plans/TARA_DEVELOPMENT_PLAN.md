# TARA Integration Development Plan

## Overview

Implementation of TARA authentication in Development Environment with full infrastructure (NAT Gateway, Lambda) using TARA Demo environment.

**Target:** hak-dev.askend-lab.com  
**TARA Environment:** tara-test.ria.ee (demo, no IP whitelist)  
**Timeline:** Ready for production switch after dev validation

---

## Phase 1: Infrastructure Setup (sam/infra)

### 1.1 VPC + NAT Gateway

**File:** `terraform/vpc-nat.tf`

```hcl
# VPC for Lambda with outbound fixed IP
resource "aws_vpc" "lambda_vpc"
resource "aws_subnet" "private" (Lambda runs here)
resource "aws_subnet" "public" (NAT Gateway here)
resource "aws_internet_gateway" "igw"
resource "aws_nat_gateway" "nat"
resource "aws_eip" "nat_ip" (Fixed IP for TARA whitelist)
resource "aws_route_table" "private_rt"
resource "aws_security_group" "lambda_sg"
```

**Outputs needed:**
- `vpc_id`
- `private_subnet_ids`
- `lambda_security_group_id`
- `nat_gateway_ip` (for TARA registration)

**Cost:** ~€35/month (NAT Gateway + Elastic IP)

### 1.2 Secrets Manager

**File:** `terraform/secrets.tf` (add TARA secrets)

```hcl
resource "aws_secretsmanager_secret" "tara_credentials" {
  name = "askend-lab/tara-credentials"
}
```

Secret structure:
```json
{
  "client_id": "...",
  "client_secret": "...",
  "issuer": "https://tara-test.ria.ee/oidc"
}
```

---

## Phase 2: TARA Auth Lambda (hak)

### 2.1 Package Structure

```
packages/tara-auth/
├── src/
│   ├── handler.ts          # Lambda entry point
│   ├── routes.ts           # /auth/tara/* routes
│   ├── tara-client.ts      # TARA OIDC client
│   ├── cognito-client.ts   # Cognito admin operations
│   └── types.ts
├── test/
│   ├── handler.test.ts
│   └── tara-client.test.ts
├── package.json
├── tsconfig.json
└── serverless.yml
```

### 2.2 Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/tara/start` | GET | Builds TARA authorize URL, sets state cookie, redirects |
| `/auth/tara/callback` | GET | Receives code, exchanges for token, creates session |

### 2.3 Lambda Configuration

```yaml
# serverless.yml
functions:
  tara-auth:
    handler: src/handler.handler
    vpc:
      securityGroupIds:
        - ${ssm:/askend-lab/lambda-security-group-id}
      subnetIds:
        - ${ssm:/askend-lab/private-subnet-id-1}
        - ${ssm:/askend-lab/private-subnet-id-2}
    environment:
      TARA_CLIENT_ID: ${ssm:/askend-lab/tara-client-id}
      TARA_CLIENT_SECRET: ${ssm:/askend-lab/tara-client-secret}
      TARA_ISSUER: https://tara-test.ria.ee/oidc
      COGNITO_USER_POOL_ID: eu-west-1_wlRtuLkG2
      COGNITO_CLIENT_ID: ${ssm:/askend-lab/cognito-hak-client-id}
      FRONTEND_URL: https://hak-dev.askend-lab.com
```

### 2.4 Authentication Flow Implementation

```typescript
// /auth/tara/start
1. Generate random state
2. Store state in secure cookie (httpOnly, sameSite=lax)
3. Build authorize URL:
   https://tara-test.ria.ee/oidc/authorize
   ?client_id=...
   &redirect_uri=https://hak-api-dev.askend-lab.com/auth/tara/callback
   &response_type=code
   &scope=openid
   &state=...
   &nonce=...
4. Return 302 redirect

// /auth/tara/callback
1. Validate state from cookie matches query param
2. POST to https://tara-test.ria.ee/oidc/token
   - client_id, client_secret, code, redirect_uri, grant_type=authorization_code
3. Verify id_token signature (JWKS from .well-known)
4. Extract claims: sub (personal code), given_name, family_name
5. Find or create Cognito user by personal_code attribute
6. Generate Cognito tokens via AdminInitiateAuth
7. Redirect to frontend with tokens (or set cookies)
```

### 2.5 User Management in Cognito

**Custom attribute:** `custom:personal_code` (isikukood)

**User creation/linking logic:**
```typescript
async function findOrCreateUser(taraIdToken: TaraIdToken): Promise<CognitoUser> {
  // 1. Try find by personal_code
  const existingUser = await findUserByAttribute('custom:personal_code', taraIdToken.sub);
  if (existingUser) return existingUser;
  
  // 2. Try find by email (if provided)
  if (taraIdToken.email) {
    const emailUser = await findUserByEmail(taraIdToken.email);
    if (emailUser) {
      // Link TARA to existing account
      await updateUserAttribute(emailUser, 'custom:personal_code', taraIdToken.sub);
      return emailUser;
    }
  }
  
  // 3. Create new user
  return await adminCreateUser({
    username: `tara_${taraIdToken.sub}`,
    attributes: {
      'custom:personal_code': taraIdToken.sub,
      'given_name': taraIdToken.given_name,
      'family_name': taraIdToken.family_name,
      'email': taraIdToken.email || `${taraIdToken.sub}@tara.ee`
    }
  });
}
```

---

## Phase 3: Frontend Integration

### 3.1 Login Page Update

**File:** `packages/frontend/src/pages/Login.tsx`

Add TARA button:
```tsx
<Button 
  variant="outlined"
  onClick={() => window.location.href = '/api/auth/tara/start'}
>
  <TaraIcon /> Logi sisse TARA-ga
</Button>
```

### 3.2 Callback Handling

If tokens returned via redirect:
```tsx
// /auth/callback page
const params = new URLSearchParams(window.location.search);
const accessToken = params.get('access_token');
const idToken = params.get('id_token');
// Store tokens, redirect to app
```

---

## Phase 4: Testing

### 4.1 Unit Tests

- TARA client: token exchange, ID token verification
- Cognito client: user lookup, creation, token generation
- Route handlers: state validation, error handling

### 4.2 Integration Tests

- Full flow with TARA demo
- User creation in Cognito
- Token generation and validation
- Frontend login/logout flow

### 4.3 Manual Testing

1. Click "TARA" button on login page
2. Authenticate with Smart-ID test user
3. Verify redirect back to app
4. Verify user created in Cognito
5. Verify app recognizes user

---

## Phase 5: TARA Registration

### 5.1 Demo Environment (tara-test.ria.ee)

- No application required for demo
- No IP whitelist
- Use demo credentials from https://e-gov.github.io/TARA-Doku/Testing

### 5.2 Production Environment (tara.ria.ee)

After dev validation:
1. Email klient@ria.ee with application
2. Provide: redirect_uri, NAT Gateway IP
3. Wait for approval
4. Receive production client_id/secret
5. Update secrets, switch issuer URL

---

## Implementation Order

| Step | Task | Blocked by |
|------|------|------------|
| 1 | Create VPC + NAT in sam/infra | - |
| 2 | Apply Terraform, get VPC outputs | Step 1 |
| 3 | Add custom:personal_code to Cognito schema | - |
| 4 | Create tara-auth package scaffold | - |
| 5 | Implement TARA client (OIDC) | Step 4 |
| 6 | Implement Cognito admin client | Step 4 |
| 7 | Implement Lambda handlers | Steps 5, 6 |
| 8 | Write unit tests | Step 7 |
| 9 | Deploy Lambda to dev with VPC | Steps 2, 7 |
| 10 | Add TARA button to frontend | - |
| 11 | End-to-end testing | Steps 9, 10 |
| 12 | Apply for TARA production | Step 11 validated |

---

## Rollback Plan

If issues arise:
1. TARA button hidden via feature flag
2. Lambda can be undeployed
3. VPC/NAT can stay (used by other services later)
4. Cognito users created via TARA remain valid

---

## Success Criteria

- [ ] User can click "TARA" and authenticate with Smart-ID/Mobile-ID/ID-card
- [ ] User appears in Cognito with personal_code attribute
- [ ] Returning user gets same Cognito account
- [ ] Existing Google user can link TARA to same account
- [ ] All Cognito tokens work with existing backend authorizer
