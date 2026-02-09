# HAK Infrastructure

Terraform configuration for HAK.

## Environments

- **dev**: `hak-dev.<your-domain>` (configured via `domain_name` variable)
- **prod**: `hak.<your-domain>` (configured via `domain_name` variable)

## Local Testing

```bash
cd infra/
terraform fmt -check
terraform validate
terraform plan -var="env=dev" -lock=false
```

Use `-lock=false` for local testing (read-only access to state).

## Resources Created

- **S3**: `hak-{env}-website`, `hak-artifacts`
- **CloudFront**: CDN with OAC, HTTPS
- **Route53**: DNS records
- **DynamoDB**: `single-table-lambda-{env}`

## Deployment

Via GitHub Actions (not locally). Dev deploys automatically, prod manually.
