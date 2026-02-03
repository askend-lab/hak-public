# TARA Custom Auth Implementation Plan

## Overview
Replace password-based auth with Cognito Custom Auth flow.

## Implementation Checklist

### Phase 1: Testing Infrastructure
- [ ] Capture TARA fixtures from demo environment
  - [ ] JWKS response (`fixtures/tara-jwks.json`)
  - [ ] Token endpoint response format
  - [ ] Decoded id_token structure
- [ ] Setup integration test framework
  - [ ] nock for TARA HTTP mocking
  - [ ] aws-sdk-client-mock for Cognito
  - [ ] jose for JWT signing in tests

### Phase 2: cognitoTriggers Lambda
- [ ] Create `packages/tara-auth/src/cognito-triggers.ts`
  - [ ] DefineAuthChallenge handler
  - [ ] CreateAuthChallenge handler
  - [ ] VerifyAuthChallengeResponse handler
- [ ] Unit tests for each trigger
- [ ] Add to serverless.yml

### Phase 3: Cognito Configuration
- [ ] Update `terraform/cognito.tf`
  - [ ] Add Lambda trigger permissions
  - [ ] Configure DefineAuthChallenge trigger
  - [ ] Configure CreateAuthChallenge trigger
  - [ ] Configure VerifyAuthChallengeResponse trigger
- [ ] Enable CUSTOM_AUTH flow on app client

### Phase 4: TARA Lambda Updates
- [ ] Update `cognito-client.ts`
  - [ ] Replace ADMIN_USER_PASSWORD_AUTH with CUSTOM_AUTH
  - [ ] Remove password generation code
  - [ ] Remove AdminSetUserPassword call
- [ ] Update callback handler for HttpOnly cookies
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
