# TARA Custom Auth Implementation Plan

## Overview
Replace password-based auth with Cognito Custom Auth flow.

## Implementation Checklist

### Phase 1: Testing Infrastructure
- [x] Capture TARA fixtures from demo environment
  - [x] JWKS response (`fixtures/tara-jwks.json`)
  - [x] Token endpoint response format
  - [x] Decoded id_token structure
- [x] Setup integration test framework
  - [x] nock for TARA HTTP mocking
  - [x] aws-sdk-client-mock for Cognito
  - [x] jose for JWT signing in tests

### Phase 2: cognitoTriggers Lambda
- [x] Create `packages/tara-auth/src/cognito-triggers.ts`
  - [x] DefineAuthChallenge handler
  - [x] CreateAuthChallenge handler
  - [x] VerifyAuthChallengeResponse handler
- [x] Unit tests for each trigger
- [x] Add to serverless.yml

### Phase 3: Cognito Configuration
- [ ] Update `terraform/cognito.tf` (in sam/infra workspace)
  - [ ] Add Lambda trigger permissions
  - [ ] Configure DefineAuthChallenge trigger
  - [ ] Configure CreateAuthChallenge trigger
  - [ ] Configure VerifyAuthChallengeResponse trigger
- [ ] Enable CUSTOM_AUTH flow on app client

### Phase 4: TARA Lambda Updates
- [x] Update `cognito-client.ts`
  - [x] Replace ADMIN_USER_PASSWORD_AUTH with CUSTOM_AUTH
  - [x] Remove password generation code
  - [x] Remove AdminSetUserPassword call
- [x] Update callback handler for HttpOnly cookies
- [ ] Integration tests with mocked externals

### Phase 5: End-to-End Testing
- [ ] Integration tests: full flow with mocks
- [ ] Manual test on dev environment
- [ ] Verify tokens work with backend

---

## Testing Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Integration Tests                    │
├─────────────────────────────────────────────────────┤
│  nock                        aws-sdk-client-mock    │
│  ┌─────────────┐             ┌─────────────────┐   │
│  │ Mock TARA   │             │ Mock Cognito    │   │
│  │ - /jwks     │             │ - AdminCreate   │   │
│  │ - /token    │             │ - AdminInitiate │   │
│  │ - /authorize│             │ - ListUsers     │   │
│  └─────────────┘             └─────────────────┘   │
│           │                          │              │
│           ▼                          ▼              │
│  ┌───────────────────────────────────────────────┐ │
│  │              Lambda Handlers                   │ │
│  │  taraStart → taraCallback → cognitoTriggers  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Fixtures (capture once from real TARA demo)
1. `test/fixtures/tara-jwks.json` - JWKS public keys
2. `test/fixtures/tara-token-response.json` - Token endpoint response
3. `test/fixtures/tara-id-token-decoded.json` - Decoded id_token example

### Test Scenarios
1. **Happy path (new user):** TARA auth → user created → tokens returned
2. **Existing user:** TARA auth → user found by personal_code → tokens returned
3. **TARA error:** Invalid code → proper error response
4. **Cognito error:** User creation fails → proper error handling

### Tools
- **Jest** - test runner
- **nock** - HTTP mocking for TARA endpoints
- **@aws-sdk/client-cognito-identity-provider mock** - Cognito API mocking
- **jose** - JWT signing for test tokens

---

## Terraform Configuration Required

The following changes need to be made in `sam/infra/terraform/cognito.tf`:

```hcl
# Add to aws_cognito_user_pool resource:
lambda_config {
  define_auth_challenge          = data.aws_cloudformation_export.cognito_triggers_arn.value
  create_auth_challenge          = data.aws_cloudformation_export.cognito_triggers_arn.value
  verify_auth_challenge_response = data.aws_cloudformation_export.cognito_triggers_arn.value
}

# Add data source to get Lambda ARN from CloudFormation export:
data "aws_cloudformation_export" "cognito_triggers_arn" {
  name = "tara-auth-${var.environment}-cognito-triggers-arn"
}

# Add Lambda permission for Cognito to invoke:
resource "aws_lambda_permission" "cognito_triggers" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = data.aws_cloudformation_export.cognito_triggers_arn.value
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.hak.arn
}

# Update app client explicit_auth_flows:
explicit_auth_flows = [
  "ALLOW_CUSTOM_AUTH",
  "ALLOW_REFRESH_TOKEN_AUTH"
]
```
