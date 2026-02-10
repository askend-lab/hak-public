# Client Domain Configuration Guide

## Overview

This guide explains what DNS records the client needs to configure for their custom domain.

---

## Step 1: Provide Domain Names

Client provides the following domain names:

| Purpose | Domain | Example |
|---------|--------|---------|
| Frontend | Main application | `haaldusabiline.eki.ee` |
| TARA Auth | Authentication endpoint | `eki.ee/taraauth` |
| API | Backend API (optional) | `api.haaldusabiline.eki.ee` |

---

## Step 2: Certificate Validation (DNS)

We will create SSL certificates for client domains. Client needs to add CNAME records for validation.

**We provide:** DNS records to add (format below)
**Client adds:** CNAME records in their DNS

```
_acme-challenge.haaldusabiline.eki.ee  CNAME  _xxxxx.acm-validations.aws.
_acme-challenge.eki.ee                 CNAME  _yyyyy.acm-validations.aws.
```

*Exact values will be provided after certificate request.*

---

## Step 3: Point Domains to Our Infrastructure

After certificates are validated, client adds:

### Frontend Domain

```
haaldusabiline.eki.ee  CNAME  <cloudfront-domain>.cloudfront.net.
```

### TARA Auth Domain (if separate subdomain)

```
auth.eki.ee  CNAME  <api-gateway-domain>.execute-api.eu-west-1.amazonaws.com.
```

*Exact CNAME targets will be provided.*

---

## Step 4: TARA Registration

For production TARA (tara.ria.ee), client needs to:

1. Apply to RIA (klient@ria.ee)
2. Provide:
   - **Service name:** Application name
   - **Redirect URI:** `https://eki.ee/taraauth/callback`
   - **IP whitelist:** `34.253.56.45`
   - **Organization:** Client organization name

3. Send received credentials to us (securely)

---

## Checklist

### Client Actions

- [ ] Provide domain names (Step 1)
- [ ] Add certificate validation DNS records (Step 2)
- [ ] Add CNAME records pointing to our infrastructure (Step 3)
- [ ] Apply for TARA production and send credentials (Step 4)

### Our Actions

- [ ] Create SSL certificates
- [ ] Configure domains in our infrastructure
- [ ] Update application configuration
- [ ] Test end-to-end flow
- [ ] Deploy to production

---

## Timeline

| Step | Duration | Blocker |
|------|----------|---------|
| Certificate validation | 1-2 days | Client DNS access |
| Infrastructure config | 1 day | Certificates validated |
| TARA registration | 1-2 weeks | RIA approval |
| Final testing | 1 day | All above complete |

---

## Support Contact

For questions or to provide domain information:
- Email: support@askend-lab.com
