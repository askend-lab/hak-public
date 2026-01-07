# Vabamorf API Migration Plan: Terraform to Serverless

## Problem
Terraform state lock conflicts on every Vabamorf deploy.

## Root Cause
Violation of "RIGHT TOOL FOR THE JOB" principle (principles.txt:22-24).
Lambda deploys with every commit -> should use Serverless, not Terraform.

## Steps

- [x] **Step 1**: Remove Vabamorf resources from Terraform state
- [x] **Step 2**: Delete vabamorf.tf from repo
- [x] **Step 3**: Delete old AWS resources (Lambda, API Gateway, domain created by Terraform)
- [x] **Step 4**: Update serverless.yml with custom domain via serverless-domain-manager
- [x] **Step 5**: Update CI/CD to use Serverless instead of Terraform
- [x] **Step 6**: Test deployment via custom domain
- [x] **Step 7**: Switch frontend to Lambda URL

## Success Criteria (principles.txt:303-310)
- [x] No state lock conflicts
- [x] Independent service deploys
- [x] Fast rollbacks

## Completed: 2026-01-07

URLs:
- Dev: https://vabamorf-dev.askend-lab.com
- Prod: https://vabamorf.askend-lab.com
