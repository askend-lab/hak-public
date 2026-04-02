# Deployment

## Overview

HAK uses serverless architecture on AWS, deployed via GitHub Actions and Terraform.

## Environments

| Environment | Purpose | Deploy Trigger |
|-------------|---------|----------------|
| `dev` | Development / integration | Auto on push to `main` |
| `prod` | Production | Manual workflow dispatch |

## CI/CD Pipelines

### Build (`build.yml`)

Triggered on push to `main`. Detects changed packages, builds only affected modules, uploads artifacts to S3.

```
push to main → detect changes → build affected → upload to S3 → auto-deploy to dev
```

### Deploy (`deploy.yml`)

Deploys specified modules from S3 artifacts to any environment.

```bash
# Manual deploy to prod
gh workflow run deploy.yml -f environment=prod -f build_id=<BUILD_ID>
```

## Module Deployment Targets

| Module | Target | Method |
|--------|--------|--------|
| `frontend` | S3 + CloudFront | Static files upload + cache invalidation |
| `simplestore` | Lambda | `aws lambda update-function-code` (zip) |
| `tts-api` | Lambda (×3) | `aws lambda update-function-code` (zip) |
| `auth` | Lambda (×6) | `aws lambda update-function-code` (zip) |
| `merlin-worker` | ECS (Docker) | ECR push + service update |
| `vabamorf-api` | Lambda (Docker) | `aws lambda update-function-code` (image) |

## Infrastructure (Terraform)

Infrastructure is managed in `infra/` with Terraform.

```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Key Resources

- **API Gateway** — routes for all Lambda APIs
- **DynamoDB** — lesson and user data storage
- **S3** — frontend hosting + audio file storage
- **CloudFront** — CDN for frontend and audio
- **ECR** — Docker image registry for merlin-worker
- **Route53** — DNS management
- **CloudWatch** — monitoring, alarms, dashboards

### Environment Variables

Copy and fill `infra/terraform.tfvars.example`:

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
# Edit terraform.tfvars with your values
```

## Local Development

```bash
# Start frontend dev server
pnpm start

# Run with local DynamoDB
docker compose up -d
```

See [docker-compose.yml](../docker-compose.yml) for local service configuration.
