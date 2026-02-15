# Architecture

## System Overview

HAK is an Estonian language learning platform. Teachers create lessons with text-to-speech audio, students complete them. The system runs on AWS with a serverless backend and a React frontend.

**Client:** React SPA (Vite + SCSS/BEM), served via CloudFront CDN from S3.

**Backend:** Four Lambda functions behind API Gateway, plus one Docker service on ECS:

- **simplestore** — REST API for lessons, users, and progress. Reads/writes DynamoDB.
- **merlin-api** — TTS gateway. Accepts synthesis requests, sends them to SQS, checks results in S3.
- **merlin-worker** — Estonian speech synthesis engine (Merlin). Runs as a Docker container on ECS Fargate. Polls SQS for jobs, runs Merlin TTS, uploads WAV files to S3.
- **vabamorf-api** — Estonian morphological analysis. Lambda with a native binary (vmetajson) in a Docker container.
- **tara-auth** — Estonian eID (TARA) authentication via Cognito.

**Storage:** DynamoDB for application data, S3 for audio files and frontend assets.

**Queuing:** SQS connects merlin-api (producer) to merlin-worker (consumer).

## Monorepo Structure

pnpm workspaces monorepo. Packages and their dependencies:

- **frontend** — depends on `shared`, `specifications`, `simplestore` (dev)
- **simplestore** — depends on `shared`
- **merlin-api** — standalone (inlines shared utilities for Lambda bundling)
- **merlin-worker** — depends on `shared`
- **vabamorf-api** — depends on `shared`
- **tara-auth** — standalone
- **shared** — shared types, utilities, constants (no dependencies)
- **specifications** — Gherkin BDD feature specs, depends on `gherkin-parser`
- **gherkin-parser** — Gherkin-to-test mapping (no dependencies)

## Packages

- **frontend** — React, Vite, SCSS/BEM, Vitest. Runs on S3 + CloudFront. Teacher and student UI.
- **simplestore** — TypeScript, DynamoDB SDK. Lambda. Lessons, users, progress CRUD.
- **merlin-api** — TypeScript, ECS SDK, S3 SDK, SQS SDK. Lambda. TTS request gateway.
- **merlin-worker** — Python + TypeScript, Conda, Merlin engine. Docker on ECS Fargate. Estonian speech synthesis.
- **vabamorf-api** — TypeScript, native binary (vmetajson). Lambda (Docker). Estonian morphological analysis.
- **tara-auth** — TypeScript, Cognito SDK, JOSE. Lambda. Estonian eID (TARA) authentication.
- **shared** — TypeScript. Shared types, utilities, constants.
- **specifications** — Gherkin. BDD feature specifications.
- **gherkin-parser** — TypeScript. Gherkin-to-test mapping.

## Data Flow — Lesson Playback

1. Student opens the app. CloudFront serves the React SPA from S3.
2. Student navigates to a lesson. Frontend calls `GET /get?pk=...&sk=...&type=...` via API Gateway.
3. API Gateway routes to simplestore. Simplestore queries DynamoDB, returns lesson JSON.
4. Frontend renders the lesson. Audio files are served directly from S3 via content-hash URLs.

## Data Flow — TTS Synthesis

1. Teacher enters text and clicks synthesize. Frontend calls `POST /synthesize {text, voice}`.
2. API Gateway routes to merlin-api. Merlin-api sends a message to SQS and returns `202 Accepted` with a cache key.
3. merlin-worker picks up the message from SQS, runs Merlin TTS engine, uploads the resulting WAV to S3.
4. Frontend polls `GET /status/:cacheKey`. When merlin-api finds the file in S3, it returns `{status: ready, url}`.
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
