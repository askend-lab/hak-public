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

- **S3**: `hak-{env}-website` (frontend), `hak-merlin-{env}-audio` (TTS cache), `hak-artifacts`
- **CloudFront**: CDN with OAC, HTTPS, CSP headers, access logging
- **Route53**: DNS records
- **DynamoDB**: `simplestore-{env}` (PITR enabled)
- **API Gateway**: HTTP APIs for all Lambda services
- **WAF**: Rate limiting (100 req/5 min per IP) + AWS managed rules
- **ECS Fargate**: Merlin TTS worker cluster with auto-scaling
- **SQS**: Merlin synthesis queue + DLQ
- **Cognito**: User pools for authentication
- **CloudTrail**: Multi-region audit trail (365-day retention)
- **GuardDuty**: Threat detection with S3 monitoring
- **CloudWatch**: Alarms + dashboard for DynamoDB, Lambda, ECS
- **ECR**: Docker image repository for merlin-worker and vabamorf-api

## Deployment

Via GitHub Actions (not locally). Dev deploys automatically, prod manually.
