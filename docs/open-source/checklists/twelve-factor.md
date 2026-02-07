# Twelve-Factor App — Checklist

> https://12factor.net/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## I. Codebase — One codebase, many deploys
- [ ] check · [ ] done — Single monorepo for all packages (`already satisfied`)
- [ ] check · [ ] done — Same codebase deploys to dev and prod (`terraform validate`)

## II. Dependencies — Explicitly declare and isolate
- [ ] check · [ ] done — All deps in package.json (`dependency-check` hook)
- [ ] check · [ ] done — Lock file committed (`pnpm-lock.yaml` in git)
- [ ] check · [ ] done — Remove stale `vabamorf-api/package-lock.json` (`manual check`)

## III. Config — Store config in the environment
- [ ] check · [ ] done — No hardcoded `askend-lab.com` URLs (`secret-detection` + grep)
- [ ] check · [ ] done — No hardcoded Cognito IDs in source (`secret-detection` + grep)
- [ ] check · [ ] done — No hardcoded AWS Account ID in Terraform (`tfsec`)
- [ ] check · [ ] done — `.env.example` documents all required vars (`manual review`)

## IV. Backing Services — Treat as attached resources
- [ ] check · [ ] done — DynamoDB/S3/SQS via env-configured endpoints (`run-tests`)
- [ ] check · [ ] done — Local dev possible with localstack (`docker-compose.yml`)

## V. Build, Release, Run — Strictly separate stages
- [ ] check · [ ] done — CI builds artifacts (`GitHub Actions build.yml`)
- [ ] check · [ ] done — Release tags artifacts with version (`release workflow`)

## VI. Processes — Stateless
- [ ] check · [ ] done — Lambda functions are stateless (`run-tests`)
- [ ] check · [ ] done — No in-memory session state (`code review`)

## VII. Port Binding — Export via port
- [ ] check · [ ] done — vabamorf-api exposes HTTP via port (`Dockerfile EXPOSE`)

## VIII. Concurrency — Scale out via process model
- [ ] check · [ ] done — Lambda auto-scales horizontally (`terraform validate`)
- [ ] check · [ ] done — No shared mutable state between invocations (`run-tests`)

## IX. Disposability — Fast startup, graceful shutdown
- [ ] check · [ ] done — Lambda cold start < 1 second (`performance test`)
- [ ] check · [ ] done — ECS handles SIGTERM gracefully (`Docker health check`)

## X. Dev/Prod Parity
- [ ] check · [ ] done — Same Terraform modules for dev/prod (`terraform validate`)
- [ ] check · [ ] done — `docker-compose.yml` for local parity (`file existence check`)

## XI. Logs — Event streams
- [ ] check · [ ] done — Structured JSON logging (`no-console` hook — no raw console.log)
- [ ] check · [ ] done — No file-based logging (`code review`)

## XII. Admin Processes — One-off tasks
- [ ] check · [ ] done — Admin tasks documented in scripts/ (`manual review`)
- [ ] check · [ ] done — No manual Console operations required (`manual review`)
