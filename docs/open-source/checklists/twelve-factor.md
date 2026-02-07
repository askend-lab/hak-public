# Twelve-Factor App — Checklist

> https://12factor.net/
> Methodology for building modern cloud-native applications.

## I. Codebase — One codebase tracked in revision control, many deploys
- [ ] Single monorepo for all packages (verified ✓)
- [ ] Same codebase deploys to dev and prod environments
- [ ] No environment-specific code branches

## II. Dependencies — Explicitly declare and isolate dependencies
- [ ] All dependencies in `package.json` (verified ✓)
- [ ] Lock file (`pnpm-lock.yaml`) committed for reproducible builds
- [ ] Remove stale `packages/vabamorf-api/package-lock.json` (npm artifact)
- [ ] No implicit system dependencies undocumented

## III. Config — Store config in the environment
- [ ] Remove hardcoded `askend-lab.com` URLs from source code
- [ ] Remove hardcoded Cognito User Pool ID and Client ID from source
- [ ] Remove hardcoded AWS Account ID from Terraform
- [ ] All environment-specific values via `process.env` or `VITE_*` env vars
- [ ] `.env.example` documents every required variable

## IV. Backing Services — Treat backing services as attached resources
- [ ] DynamoDB, S3, SQS, Cognito accessed via env-configured endpoints (verified ✓)
- [ ] Switching from dev to prod DynamoDB requires only config change
- [ ] Local development possible with localstack/dynamodb-local

## V. Build, Release, Run — Strictly separate build and run stages
- [ ] CI builds artifacts (Lambda zips, Docker images, frontend bundle)
- [ ] Release tags artifacts with version number
- [ ] Runtime configuration injected at deploy time (Terraform variables)

## VI. Processes — Execute the app as stateless processes
- [ ] Lambda functions are stateless (verified ✓)
- [ ] No in-memory session state (Cognito handles sessions)
- [ ] vmetajson process pool is per-container (ECS), not shared

## VII. Port Binding — Export services via port binding
- [ ] vabamorf-api exposes HTTP via port in Docker container (verified ✓)
- [ ] Frontend dev server binds to configurable port

## VIII. Concurrency — Scale out via the process model
- [ ] Lambda auto-scales horizontally (verified ✓)
- [ ] merlin-worker scales via ECS task count + SQS
- [ ] No shared mutable state between Lambda invocations

## IX. Disposability — Maximize robustness with fast startup and graceful shutdown
- [ ] Lambda cold start under 1 second (measure and optimize)
- [ ] ECS containers handle SIGTERM gracefully (merlin-worker)
- [ ] No long-running initialization in Lambda handler path

## X. Dev/Prod Parity — Keep dev, staging, and production similar
- [ ] Same Terraform modules for dev and prod (parameterized)
- [ ] Local development uses same database technology (DynamoDB)
- [ ] Docker images identical between environments
- [ ] Create `docker-compose.yml` for local parity

## XI. Logs — Treat logs as event streams
- [ ] Structured JSON logging in all Lambda functions
- [ ] Logs shipped to CloudWatch (verified ✓)
- [ ] No file-based logging (stdout/stderr only)
- [ ] Replace debug `console.log` with structured logger

## XII. Admin Processes — Run admin/management tasks as one-off processes
- [ ] Database migrations (if any) run as one-off scripts
- [ ] Admin tasks documented in `scripts/` with README
- [ ] No manual AWS Console operations required for routine tasks
