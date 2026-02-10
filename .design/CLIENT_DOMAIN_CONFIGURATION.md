# Client Domain Configuration in Production

## Overview

This document describes how to configure HAK application with a client's own domain while keeping **ALL infrastructure on our side**.

**Architecture:**
- Frontend: Client's domain (e.g., `haaldusabiline.eki.ee`)
- TARA Auth: Client's subdomain (e.g., `eki.ee/taraauth`)
- Backend Servers: **Our AWS infrastructure (100%)**
- Cognito: **Our User Pool (multi-tenant)**
- Lambda, API Gateway, CloudFront: **All ours**

**Client provides ONLY:**
- DNS records pointing to our infrastructure
- Domain ownership verification for ACM certificates

---

## Environment Separation

| Component | Dev (askend-lab) | Prod (client domain) |
|-----------|------------------|----------------------|
| Frontend URL | hak-dev.askend-lab.com | haaldusabiline.eki.ee |
| TARA Endpoint | auth.askend-lab.com | eki.ee/taraauth |
| API Endpoint | hak-api-dev.askend-lab.com | api.haaldusabiline.eki.ee |
| Cognito | eu-west-1_wlRtuLkG2 | Same (multi-tenant) |
| AWS Account | askend-lab | askend-lab (same) |

---

## Step 1: AWS Infrastructure Setup

### 1.1 API Gateway Custom Domain

Create custom domain mapping for client's TARA endpoint:

```hcl
# terraform/api-gateway-domains.tf

resource "aws_apigatewayv2_domain_name" "eki_tara" {
  domain_name = "eki.ee"
  
  domain_name_configuration {
    certificate_arn = aws_acm_certificate.eki_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "eki_tara" {
  api_id          = aws_apigatewayv2_api.tara_auth.id
  domain_name     = aws_apigatewayv2_domain_name.eki_tara.id
  stage           = aws_apigatewayv2_stage.prod.id
  api_mapping_key = "taraauth"
}
```

### 1.2 ACM Certificate

Certificate must be validated via DNS:

```hcl
resource "aws_acm_certificate" "eki_cert" {
  domain_name       = "eki.ee"
  validation_method = "DNS"
  
  subject_alternative_names = [
    "*.eki.ee"
  ]
  
  lifecycle {
    create_before_destroy = true
  }
}
```

**Client action required:** Add DNS validation records.

### 1.3 CloudFront Distribution for Frontend

```hcl
resource "aws_cloudfront_distribution" "eki_frontend" {
  aliases = ["haaldusabiline.eki.ee"]
  
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-eki-frontend"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    # ... standard SPA config
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.eki_cert.arn
    ssl_support_method  = "sni-only"
  }
}
```

---

## Step 2: Cognito Configuration

### 2.1 Update Allowed Callback URLs

```hcl
# terraform/cognito.tf

resource "aws_cognito_user_pool_client" "hak_client" {
  # ... existing config
  
  callback_urls = [
    # Dev
    "https://hak-dev.askend-lab.com/auth/callback",
    "http://localhost:5181/auth/callback",
    # Prod (client domain)
    "https://haaldusabiline.eki.ee/auth/callback",
  ]
  
  logout_urls = [
    # Dev
    "https://hak-dev.askend-lab.com",
    "http://localhost:5181",
    # Prod (client domain)
    "https://haaldusabiline.eki.ee",
  ]
}
```

---

## Step 3: TARA Lambda Configuration

### 3.1 Environment-based Redirect URIs

```typescript
// lambdas/tara-auth/src/config.ts

const ENVIRONMENTS = {
  dev: {
    frontendUrl: "https://hak-dev.askend-lab.com",
    taraCallbackUrl: "https://auth.askend-lab.com/auth/tara/callback",
    taraIssuer: "https://tara-test.ria.ee/oidc",
  },
  prod: {
    frontendUrl: "https://haaldusabiline.eki.ee",
    taraCallbackUrl: "https://eki.ee/taraauth/callback",
    taraIssuer: "https://tara.ria.ee/oidc", // Production TARA
  },
};

export function getConfig(stage: string) {
  return ENVIRONMENTS[stage] || ENVIRONMENTS.dev;
}
```

### 3.2 Serverless Configuration

```yaml
# lambdas/tara-auth/serverless.yml

provider:
  environment:
    STAGE: ${sls:stage}
    FRONTEND_URL: ${self:custom.frontendUrls.${sls:stage}}
    TARA_CALLBACK_URL: ${self:custom.taraCallbacks.${sls:stage}}

custom:
  frontendUrls:
    dev: https://hak-dev.askend-lab.com
    prod: https://haaldusabiline.eki.ee
  taraCallbacks:
    dev: https://auth.askend-lab.com/auth/tara/callback
    prod: https://eki.ee/taraauth/callback
```

---

## Step 4: TARA Registration

### 4.1 Development (tara-test.ria.ee)

Already configured:
- Redirect URI: `https://auth.askend-lab.com/auth/tara/callback`
- IP whitelist: `34.253.56.45`

### 4.2 Production (tara.ria.ee)

**Required:** Apply to RIA (klient@ria.ee)

Application details:
- **Service name:** Hääldusabiline (EKI)
- **Redirect URI:** `https://eki.ee/taraauth/callback`
- **IP whitelist:** `34.253.56.45` (our NAT Gateway)
- **Organization:** Eesti Keele Instituut

Secrets to store in AWS Secrets Manager:
```json
{
  "tara-prod-client-id": "...",
  "tara-prod-client-secret": "..."
}
```

---

## Step 5: Frontend Configuration

### 5.1 Dynamic TARA URL

```typescript
// packages/frontend/src/services/auth/config.ts

export function getTaraLoginUrl(): string {
  const hostname = window.location.hostname;
  
  // Production client domain
  if (hostname === "haaldusabiline.eki.ee") {
    return "https://eki.ee/taraauth/start";
  }
  
  // Dev
  if (hostname.includes("askend-lab.com")) {
    return "https://auth.askend-lab.com/auth/tara/start";
  }
  
  // Local development
  return "http://localhost:4001/auth/tara/start";
}
```

### 5.2 Environment Variables

```env
# .env.production (for EKI build)
VITE_API_URL=https://api.haaldusabiline.eki.ee
VITE_TARA_URL=https://eki.ee/taraauth
VITE_COGNITO_DOMAIN=askend-lab-auth.auth.eu-west-1.amazoncognito.com
```

---

## Step 6: Client DNS Configuration

Client must add these DNS records:

### 6.1 Frontend Domain

```
haaldusabiline.eki.ee  CNAME  d1234567890.cloudfront.net
```

### 6.2 TARA Endpoint

```
; API Gateway custom domain
eki.ee  A  <API Gateway IP>
; OR
eki.ee  CNAME  d-xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com
```

### 6.3 ACM Certificate Validation

```
_acme-challenge.eki.ee  CNAME  _xxxxxxxx.acm-validations.aws
```

---

## Step 7: Deployment Checklist

### Pre-deployment

- [ ] ACM certificate created and validated
- [ ] TARA production credentials received from RIA
- [ ] Secrets stored in AWS Secrets Manager
- [ ] Client DNS records configured

### Infrastructure

- [ ] API Gateway custom domain created
- [ ] CloudFront distribution created
- [ ] Cognito callback URLs updated

### Application

- [ ] TARA Lambda updated with prod config
- [ ] Frontend built with production env vars
- [ ] E2E tests pass with client domain

### Post-deployment

- [ ] TARA flow tested end-to-end
- [ ] User creation in Cognito verified
- [ ] Token refresh working
- [ ] Logout flow working

---

## Rollback Plan

If issues arise:

1. **DNS rollback:** Client points domain back to their old system
2. **Feature flag:** Disable TARA button on frontend
3. **Cognito:** Remove client URLs from callback list

Our infrastructure remains unchanged; only DNS routing changes.

---

## Cost Considerations

No additional costs for client domain:
- Same Lambda functions
- Same Cognito User Pool
- Same NAT Gateway

Only incremental:
- CloudFront requests (minimal)
- API Gateway requests (minimal)
- ACM certificate (free)

---

## Security Notes

1. **CORS:** API Gateway must allow client domain origin
2. **CSP:** Frontend CSP must allow Cognito domain
3. **Cookies:** SameSite=Lax for cross-domain auth flow
4. **HTTPS:** Required for all endpoints (enforced by TARA)
