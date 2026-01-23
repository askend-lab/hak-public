# Client Custom Domain

## Setup

**Dev**: hak-api-dev.askend-lab.com (our domain)  
**Prod**: hak.company.com (client domain)

## Requirements

Client needs to add 2 DNS records to company.com zone:

1. **CNAME** for certificate validation (get from Terraform output)
2. **A/ALIAS** record: hak.company.com → API Gateway regional domain (get from Terraform output)

## Deployment

1. Deploy Terraform (prod): creates ACM cert + API Gateway custom domain
2. Send DNS records to client
3. Wait for validation (5-30 min)
4. Deploy Lambda to prod

## Files

- Create: infra/client-domain.tf (ACM cert, API Gateway domain, base path /api)
