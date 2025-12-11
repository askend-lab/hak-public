# HAK Infrastructure

Terraform configuration for HAK project infrastructure.

## Quick Start

### Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- Access to `askend-lab-terraform-state` S3 bucket (read-only is sufficient for local testing)

### Environments

Infrastructure supports two environments:
- **dev**: `hak-dev.askend-lab.com`
- **prod**: `hak.askend-lab.com`

## Local Testing

### Step 1: Format Check

Check if code is properly formatted:

```bash
cd infra/
terraform fmt -check
```

If formatting issues found, auto-fix them:

```bash
terraform fmt
```

### Step 2: Validation

Validate Terraform configuration syntax:

```bash
terraform validate
```

This checks:
- Syntax errors
- Required arguments
- Type validation
- Reference validation

### Step 3: Plan (Dry Run)

Generate execution plan to see what changes will be made:

```bash
# For dev environment
terraform plan -var="env=dev" -lock=false

# For prod environment  
terraform plan -var="env=prod" -lock=false
```

**Important:** Use `-lock=false` flag for local testing!

#### Why `-lock=false`?

- State locking requires write access to DynamoDB table `askend-lab-terraform-locks`
- Local development accounts have read-only access
- `-lock=false` is **safe for plan** command (no state modifications)
- **Never use `-lock=false` with `apply` or `destroy`!**

### What Gets Created

The plan will show creation of:

1. **S3 Buckets**
   - `hak-{env}-website` - website hosting
   - `hak-artifacts` - build artifacts (dev only)

2. **CloudFront Distribution**
   - CDN with Origin Access Control (OAC)
   - Custom domain with HTTPS

3. **ACM Certificate**
   - SSL/TLS certificate for domain
   - Auto-validated via Route53

4. **Route53 Records**
   - A record pointing to CloudFront
   - Certificate validation records

5. **Lifecycle Policies**
   - Cleanup old builds after 30 days

## Common Commands

```bash
# Format code
terraform fmt

# Check formatting
terraform fmt -check

# Validate configuration
terraform validate

# Plan changes for dev
terraform plan -var="env=dev" -lock=false

# Plan changes for prod
terraform plan -var="env=prod" -lock=false

# Show current state
terraform show

# List resources
terraform state list
```

## CI/CD Deployment

Actual deployment happens through GitHub Actions, not locally.

The CI/CD pipeline has proper write access and will:
1. Run `terraform plan` with locking
2. Apply changes automatically (dev) or manually (prod)
3. Update state in S3 backend

## Troubleshooting

### Error: "operation error DynamoDB: PutItem... AccessDeniedException"

**Solution:** Add `-lock=false` flag to your command.

This error means you don't have write access to the state lock table. It's expected for local development.

### Error: "Error loading state: AccessDenied"

**Solution:** Check your AWS credentials have access to `askend-lab-terraform-state` bucket.

### Error: "No value for required variable"

**Solution:** Always specify `-var="env=dev"` or `-var="env=prod"`.

## Architecture Notes

- **Single table DynamoDB** pattern used for application data
- **S3 + CloudFront** for static site hosting
- **Scale-to-zero** architecture (no always-on resources)
- **Infrastructure reusability** via `env` variable

See `/drafts/Architecture.txt` for full architectural documentation.

<!-- Infrastructure ready for deployment -->
