# Architecture

## System Overview

HAK is an Estonian language learning platform. Teachers create lessons with text-to-speech audio, students complete them. The system runs on AWS with a serverless backend and a React frontend.

**Client:** React SPA (Vite + SCSS/BEM), served via CloudFront CDN from S3.

**Backend:** Four Lambda functions behind API Gateway, plus one Docker service on ECS:

- **store** — REST API for lessons, users, and progress. Reads/writes DynamoDB.
- **tts-api** — TTS gateway. Accepts synthesis requests, sends them to SQS, checks results in S3.
- **tts-worker** — Estonian speech synthesis engine (Merlin). Runs as a Docker container on ECS Fargate. Polls SQS for jobs, runs Merlin TTS, uploads WAV files to S3.
- **morphology-api** — Estonian morphological analysis. Lambda with a native binary (vmetajson) in a Docker container.
- **auth** — Estonian eID (TARA) authentication via Cognito.

**Storage:** DynamoDB for application data, S3 for audio files and frontend assets.

**Queuing:** SQS connects tts-api (producer) to tts-worker (consumer).

## Monorepo Structure

pnpm workspaces monorepo. Packages and their dependencies:

- **frontend** — depends on `shared`, `specifications`, `store` (dev)
- **store** — depends on `shared`
- **tts-api** — standalone (inlines shared utilities for Lambda bundling)
- **tts-worker** — standalone (Python, no npm dependencies)
- **morphology-api** — standalone (inlines shared utilities for Docker Lambda bundling)
- **auth** — standalone
- **shared** — shared types, utilities, constants (no dependencies)
- **specifications** — Gherkin BDD feature specs, depends on `gherkin-parser`
- **gherkin-parser** — Gherkin-to-test mapping (no dependencies)

## Packages

- **frontend** — React, Vite, SCSS/BEM, Vitest. Runs on S3 + CloudFront. Teacher and student UI.
- **store** — TypeScript, DynamoDB SDK. Lambda. Lessons, users, progress CRUD.
- **tts-api** — TypeScript, ECS SDK, S3 SDK, SQS SDK. Lambda. TTS request gateway.
- **tts-worker** — Python, Conda, Merlin engine. Docker on ECS Fargate. Estonian speech synthesis.
- **morphology-api** — TypeScript, native binary (vmetajson). Lambda (Docker). Estonian morphological analysis.
- **auth** — TypeScript, Cognito SDK, JOSE. Lambda. Estonian eID (TARA) authentication.
- **shared** — TypeScript. Shared types, utilities, constants.
- **specifications** — Gherkin. BDD feature specifications.
- **gherkin-parser** — TypeScript. Gherkin-to-test mapping.

## Data Flow — Lesson Playback

1. Student opens the app. CloudFront serves the React SPA from S3.
2. Student navigates to a lesson. Frontend calls `GET /get?pk=...&sk=...&type=...` via API Gateway.
3. API Gateway routes to store. Store queries DynamoDB, returns lesson JSON.
4. Frontend renders the lesson. Audio files are served directly from S3 via content-hash URLs.

## Data Flow — TTS Synthesis

1. Teacher enters text and clicks synthesize. Frontend calls `POST /synthesize {text, voice}`.
2. API Gateway routes to tts-api. tts-api sends a message to SQS and returns `202 Accepted` with a cache key.
3. tts-worker picks up the message from SQS, runs Merlin TTS engine, uploads the resulting WAV to S3.
4. Frontend polls `GET /status/:cacheKey`. When tts-api finds the file in S3, it returns `{status: ready, url}`.
5. Frontend plays the audio from the S3 URL.

## Infrastructure

All infrastructure is managed with Terraform in `infra/`.

- **main.tf** — Provider and backend config
- **variables.tf** — Input variables
- **locals.tf** — Local values
- **outputs.tf** — Output values
- **terraform-state.tf** — Remote state backend (S3 + DynamoDB lock)
- **api-gateway.tf** — API Gateway routes for all Lambda APIs
- **dynamodb.tf** — DynamoDB tables
- **website.tf** — S3 + CloudFront for frontend hosting
- **audio.tf** — S3 audio bucket, SQS queue, IAM roles
- **ecr.tf** — ECR repository for Docker images
- **cloudfront.tf** — CDN distribution
- **route53.tf** — DNS records
- **cloudwatch-alarms.tf** — Monitoring alarms
- **cloudwatch-dashboard.tf** — Monitoring dashboard
- **slack-notifications.tf** — Alert notifications to Slack
- **merlin/** — Merlin-specific infra: ECS cluster, Fargate service, SQS queue, S3 bucket, IAM roles, auto-scaling

## CI/CD & Deployment

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| **build.yml** | Push/PR to main | Lint, typecheck, test per-package, build artifacts, upload to S3 |
| **deploy.yml** | Called by build.yml or manual | Smart-diff deploy to dev/prod (only changed modules) |
| **build-merlin-worker.yml** | Push to `packages/tts-worker/**` | Python tests, Docker build, push to ECR |
| **terraform.yml** | Push to `infra/**` | Terraform plan (PR) / apply (main) |
| **e2e.yml** | Push to `packages/frontend/**` | Playwright E2E browser tests |
| **release.yml** | Manual | Version bump, changelog, GitHub release |
| **build.public.yml** | Push/PR to main | Lint, typecheck, test (public repo CI) |
| **codeql.yml** | Push/PR to main | CodeQL security analysis |

**Deploy flow:** `build.yml` creates a build artifact per module → `deploy.yml` compares with current deployment state → deploys only changed modules (direct `aws lambda update-function-code` for Lambdas, S3 sync for frontend, CloudFront invalidation). Lambda infrastructure (IAM, env vars, config) is managed by Terraform.

**Manual deploy:** `deploy.yml` can be triggered manually with a build ID and target environment (dev/prod).

**There is no manual deployment process.** All deployments go through CI/CD pipelines. Engineers push code to branches, create PRs, and merges to `main` trigger automated builds and deployments. Infrastructure changes in `infra/` trigger Terraform plan/apply.

## Authentication & Authorization

Two login methods via AWS Cognito: **TARA** (Estonian eID — ID-card, Mobile-ID, Smart-ID) and **Cognito Hosted UI** (email/password with PKCE). The `auth` Lambda handles TARA OAuth2 flow. Tokens are exchanged at `/auth/callback`, access tokens sent as `Authorization: Bearer`, refresh tokens stored in httpOnly cookies.

**Public endpoints (no auth):** `/api/synthesize`, `/api/status/*`, `/api/analyze`, `/api/variants`, `/api/get-shared`, `/api/get-public`
**Authenticated endpoints (Cognito JWT):** `/api/save`, `/api/get`, `/api/delete`, `/api/query`

See `docs/AUTHENTICATION.md` for full details.

## Security Model

**Network layer:**

- All traffic goes through **CloudFront** — API Gateways have no public DNS
- **AWS WAF** on CloudFront with two rules:
  - Per-IP rate limiting: 100 requests / 5 minutes → BLOCK
  - AWS Managed Common Rules: SQL injection, XSS, and other attack protection
- WAF logs (BLOCK + COUNT) stored in CloudWatch (90-day retention)
- **CORS** restricts browser-origin requests to the configured domain

**Application layer:**

- **PKCE** on all OAuth2 flows — prevents authorization code interception
- **httpOnly cookies** for refresh tokens — not accessible to JavaScript
- **CSRF protection** on auth POST endpoints (Origin header validation)
- **Input validation** — Zod schemas on API inputs, regex validation on cache keys (SHA-256 hex)
- **No secrets on frontend** — all sensitive values are server-side environment variables
- **Shell injection prevention** — Python worker uses `subprocess.run` with argument lists, no `shell=True`
- **CodeQL** — GitHub security analysis runs on every push/PR

**Data layer:**

- S3 buckets are private, accessed via CloudFront signed URLs or IAM roles
- DynamoDB access scoped to Lambda execution roles
- Cognito client secrets stored in SSM/Secrets Manager

## System Diagrams

```
Browser → CloudFront (WAF) → API Gateway → Lambda / ECS
```

### TTS Synthesis Pipeline

```
Frontend  POST /synthesize → tts-api → SQS → tts-worker (ECS Fargate)
          GET /status/{key} → tts-api → S3 ← tts-worker (WAV upload)
```

### Authentication Flow

```
Frontend → TARA/Cognito → auth Lambda → Cognito User Pool → Frontend (/auth/callback)
```

## Quality System

Pre-commit hooks (DevBox) enforce quality on every commit. The commit is rejected if any check fails.

| Hook | What it checks |
|------|----------------|
| **TYPE** | TypeScript strict compilation (`tsc --noEmit`) across all packages |
| **RUN-LINT** | ESLint zero-warnings policy on changed files |
| **DEAD-CODE** | Unused exports detection (knip) |
| **PLAYWRIGHT** | E2E browser tests |
| **SECURITY** | `pnpm audit` — 0 known CVEs |
| **DEPS** | Unused/missing dependency detection |
| **CIRCULAR-DEPS** | Circular import detection (madge) |
| **JSCPD** | Copy-paste detection (≤5% threshold) |
| **SRC-SIZE** | Source file size limit (≤400 lines) |
| **MD-SIZE** | Markdown file size limit (≤200 lines) |
| **SECRET** | Secret/credential scanning (gitleaks) |
| **LANG** | Language consistency checking |

Lint metrics enforced: complexity ≤10, function length ≤50L, nesting depth ≤4, no console statements, no magic numbers.
