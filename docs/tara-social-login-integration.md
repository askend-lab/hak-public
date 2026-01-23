# TARA + Social Login Integration

## Architecture

All auth methods → Cognito User Pool (askend-lab-users) → Cognito JWT → Backend Lambda

**Existing:**
- User Pool: eu-west-1_wlRtuLkG2
- Domain: askend-lab-auth.auth.eu-west-1.amazoncognito.com
- Client ID: 64tf6nf61n6sgftqif6q975hka

## Setup

### 1. VPC + NAT Gateway
- Create VPC with NAT Gateway (Elastic IP)
- Register Elastic IP with TARA (klient@ria.ee)
- Cost: ~€35/month

### 2. Identity Providers in Cognito

**Google:**
- Redirect URI: https://askend-lab-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse
- Get Client ID/Secret from console.cloud.google.com

**Facebook:**
- Redirect URI: https://askend-lab-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse
- Get App ID/Secret from developers.facebook.com

**TARA:**
- Apply to klient@ria.ee (demo first, then prod)
- Redirect URI: https://askend-lab-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse
- IP whitelist: NAT Gateway Elastic IP
- Issuer: https://tara.ria.ee/oidc (prod) or https://tara-test.ria.ee/oidc (demo)

### 3. Frontend

Use Cognito Hosted UI or Amplify with existing credentials above.

### 4. Backend

No changes - already uses Cognito authorizer.

## Files

- infra/vpc-nat.tf (VPC, NAT Gateway)
- infra/cognito-idp.tf (Google, Facebook, TARA providers)
