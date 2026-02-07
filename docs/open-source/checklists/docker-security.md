# Docker Security — Checklist

> https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Image Selection
- [ ] check · [ ] done — Official Node.js images from Docker Hub (`hadolint`)
- [ ] check · [ ] done — Slim/alpine variants, not full Debian (`hadolint`)
- [ ] check · [ ] done — Base image pinned to specific digest (`hadolint` — DL3006)
- [ ] check · [ ] done — No `latest` tag in base images (`hadolint` — DL3007)

## Build Process
- [ ] check · [ ] done — Multi-stage builds (`hadolint` + `code review`)
- [ ] check · [ ] done — `.dockerignore` excludes tests/docs/node_modules (`hadolint`)
- [ ] check · [ ] done — Production deps only in runtime stage (`hadolint`)
- [ ] check · [ ] done — Only necessary files copied to runtime (`code review`)

## Runtime Security
- [ ] check · [ ] done — Run as non-root: `USER node` (`hadolint` — DL3002)
- [ ] check · [ ] done — `dumb-init` or `tini` as PID 1 (`hadolint` + code review)
- [ ] check · [ ] done — `NODE_ENV=production` set (`hadolint`)

## Secret Management
- [ ] check · [ ] done — No secrets in Dockerfile (`secret-detection` hook)
- [ ] check · [ ] done — No `.env` files copied into image (`hadolint` + `.dockerignore`)
- [ ] check · [ ] done — AWS creds via IAM role, not env vars (`tfsec`)

## Network
- [ ] check · [ ] done — Only necessary ports exposed (`hadolint`)
- [ ] check · [ ] done — No SSH server inside containers (`hadolint`)

## Scanning
- [ ] check · [ ] done — Trivy integrated into CI (`trivy` in build workflow)
- [ ] check · [ ] done — Zero high/critical vulns in images (`trivy` exit code)
- [ ] check · [ ] done — Scan on every Dockerfile change PR (`CI workflow`)
- [ ] check · [ ] done — Dependabot for Docker base images (`dependabot.yml`)

## Health Checks
- [ ] check · [ ] done — `HEALTHCHECK` instruction in Dockerfiles (`hadolint`)
- [ ] check · [ ] done — ECS health check configured (`terraform validate`)
