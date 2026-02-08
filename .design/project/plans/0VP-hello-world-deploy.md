# 0VP: Hello World Deploy

Minimal React application with deployment to two environments.

**Goal:** Test the entire process from code to production.

**Result:** 
- `hak-dev.askend-lab.com` → "Hello HAK!"
- `hak.askend-lab.com` → "Hello HAK!"

---

## Phase 1: Monorepo Setup

### 1.1 Initialize pnpm workspace

- [x] RED: Check that `pnpm -v` works, `pnpm-workspace.yaml` exists
- [x] GREEN: Create `pnpm-workspace.yaml` with packages/*
- [x] REFACTOR: Add `.npmrc` with pnpm settings

**Files:**
- `pnpm-workspace.yaml`
- `.npmrc`
- `package.json` (root)

### 1.2 Packages structure

- [x] RED: Check that `/packages/frontend/package.json` exists
- [x] GREEN: Create directories `packages/frontend`, `packages/shared`, `infra`
- [x] REFACTOR: Add basic package.json to each package

**Structure:**
```
/
├── packages/
│   ├── frontend/
│   │   └── package.json
│   └── shared/
│       └── package.json
├── infra/
│   └── (terraform files)
├── pnpm-workspace.yaml
└── package.json
```

---

## Phase 2: Frontend (Vite + React)

### 2.1 Vite scaffold

- [x] RED: Run `pnpm --filter frontend dev`, expect error (no vite)
- [x] GREEN: Initialize Vite + React + TypeScript in packages/frontend
- [x] REFACTOR: Remove extra files from template (App.css, logo, etc.)

**Command:** `cd packages/frontend && pnpm create vite . --template react-ts`

### 2.2 Minimal component

- [x] RED: Write test `App.test.tsx` - check that "Hello HAK" renders
- [x] GREEN: Change `App.tsx` to show "Hello HAK!"
- [x] REFACTOR: Remove extra styles, keep minimum

**Test:**
```typescript
// packages/frontend/src/App.test.tsx
it('renders Hello HAK', () => {
  render(<App />);
  expect(screen.getByText(/Hello HAK/i)).toBeInTheDocument();
});
```

### 2.3 Build check

- [x] RED: Run `pnpm --filter frontend build`, check that dist/ is created
- [x] GREEN: Ensure build works without errors
- [x] REFACTOR: Configure vite.config.ts if needed (base path, etc.)

---

## Phase 3: Terraform Infrastructure

### 3.1 Terraform setup

- [x] RED: Run `terraform init` in infra/, expect error (no files)
- [x] GREEN: Create `main.tf`, `variables.tf`, `backend.tf`
- [x] REFACTOR: Extract common settings to `locals.tf`

**Files:**
- `infra/main.tf` - AWS provider
- `infra/variables.tf` - variable `env` (dev/prod)
- `infra/backend.tf` - S3 backend for state

### 3.2 S3 for website

- [x] RED: Check that bucket `hak-${env}` does not exist (`terraform plan` shows create)
- [x] GREEN: Add `aws_s3_bucket` for website hosting
- [x] REFACTOR: Add bucket policy for public read

**Resources:**
- `aws_s3_bucket.website`
- `aws_s3_bucket_website_configuration`
- `aws_s3_bucket_public_access_block`
- `aws_s3_bucket_policy`

### 3.3 CloudFront distribution

- [x] RED: `terraform plan` shows CloudFront will be created
- [x] GREEN: Add `aws_cloudfront_distribution` with S3 origin
- [x] REFACTOR: Configure cache behavior, error pages (SPA routing)

**Resources:**
- `aws_cloudfront_distribution.website`
- `aws_cloudfront_origin_access_control`

### 3.4 Route53 DNS

- [x] RED: `terraform plan` shows DNS record will be created
- [x] GREEN: Add `aws_route53_record` for domain
- [x] REFACTOR: Use data source for existing hosted zone

**Domain logic:**
- `env = "dev"` → `hak-dev.askend-lab.com`
- `env = "prod"` → `hak.askend-lab.com` (no suffix!)

### 3.5 S3 for artifacts

- [x] RED: `terraform plan` shows create for artifacts bucket
- [x] GREEN: Add `aws_s3_bucket.artifacts` (one for both envs)
- [x] REFACTOR: Add lifecycle policy for cleaning old builds

---

## Phase 4: GitHub Actions CI/CD

### 4.1 Basic workflow

- [x] RED: Push to main, Actions don't run (no workflow)
- [x] GREEN: Create `.github/workflows/ci-cd.yml` with build + test
- [x] REFACTOR: Add cache for pnpm

**File:** `.github/workflows/ci.yml`

### 4.2 Deploy to dev

- [x] RED: After merge to main, dev is not updated
- [x] GREEN: Add step for S3 upload and CloudFront invalidation
- [x] REFACTOR: Extract deploy logic to reusable action

**Secrets needed:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- (or better: OIDC with AWS)

### 4.3 Deploy to prod (manual)

- [x] RED: No way to deploy to prod
- [x] GREEN: Add `workflow_dispatch` with build selection
- [x] REFACTOR: Add confirmation step

---

## Phase 5: Integration and Testing

### 5.1 E2E check dev

- [ ] RED: Open `hak-dev.askend-lab.com`, see error (not deployed)
- [ ] GREEN: Run full pipeline, verify site opens
- [ ] REFACTOR: Add smoke test in CI (curl or playwright)

### 5.2 E2E check prod

- [ ] RED: Open `hak.askend-lab.com`, see error
- [ ] GREEN: Run manual deploy, verify site
- [ ] REFACTOR: Document deployment process

### 5.3 Rollback test

- [ ] RED: No way to rollback to previous build
- [ ] GREEN: Add workflow for deploying specific artifact from S3
- [ ] REFACTOR: Add list of available builds to workflow_dispatch

---

## Definition of Done

- [ ] `hak-dev.askend-lab.com` shows "Hello HAK!"
- [ ] `hak.askend-lab.com` shows "Hello HAK!"
- [ ] Push to main automatically deploys to dev
- [ ] Prod deploys manually via button
- [ ] Terraform apply requires only `env` variable
- [ ] All tests pass
- [ ] DevBox hooks pass
