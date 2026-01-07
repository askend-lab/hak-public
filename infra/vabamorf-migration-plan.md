# Vabamorf API Migration Plan: Terraform to Serverless

## Problem
Terraform state lock conflicts on every Vabamorf deploy.

## Root Cause
Violation of "RIGHT TOOL FOR THE JOB" principle (principles.txt:22-24).
Lambda deploys with every commit -> should use Serverless, not Terraform.

## Steps

- [ ] **Step 1**: Remove Vabamorf resources from Terraform state (workflow: terraform-cleanup-vabamorf.yml)
- [ ] **Step 2**: Delete vabamorf.tf from repo
- [ ] **Step 3**: Delete old AWS resources (Lambda, API Gateway, domain created by Terraform)
- [ ] **Step 4**: Update serverless.yml with custom domain via serverless-domain-manager
- [ ] **Step 5**: Update CI/CD to use Serverless instead of Terraform
- [ ] **Step 6**: Test deployment via custom domain
- [ ] **Step 7**: Cleanup debug code

## Success Criteria (principles.txt:303-310)
- [ ] No state lock conflicts
- [ ] Independent service deploys
- [ ] Fast rollbacks
