# Docker Security — Checklist

> https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
> https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
> Applied to HAK's Docker images: vabamorf-api, merlin-worker, merlin Dockerfile, vabamorf Dockerfile.

## Image Selection
- [ ] Use official Node.js images from Docker Hub
- [ ] Use slim/alpine variants (not full Debian)
- [ ] Pin base image to specific digest (`node:18.20.5-slim@sha256:...`)
- [ ] No `latest` tag in base images

## Build Process
- [ ] Multi-stage builds: build stage (compile/bundle) + runtime stage (minimal)
- [ ] `.dockerignore` excludes: `node_modules`, `test/`, `docs/`, `*.md`, `.git/`, `coverage/`
- [ ] Install production dependencies only in runtime stage (`pnpm install --prod`)
- [ ] Copy only necessary files to runtime stage (not entire repo)

## Runtime Security
- [ ] Run as non-root user: `USER node` (or create dedicated user)
- [ ] Use `dumb-init` or `tini` as PID 1 for proper signal handling
- [ ] Set `NODE_ENV=production` in runtime environment
- [ ] No `--privileged` flag in container execution
- [ ] Read-only root filesystem where possible (`--read-only`)

## Secret Management
- [ ] No secrets in Dockerfile (no `ENV SECRET=...`)
- [ ] No secrets in build arguments (use runtime env vars or Secrets Manager)
- [ ] No `.env` files copied into image
- [ ] AWS credentials injected via IAM role (ECS task role), not env vars

## Network
- [ ] Expose only necessary ports (`EXPOSE` directive matches actual usage)
- [ ] Use internal Docker networks for inter-container communication
- [ ] No SSH server inside containers

## Scanning
- [ ] Trivy or Docker Scout integrated into CI pipeline
- [ ] Zero high/critical vulnerabilities in final images
- [ ] Scan runs on every PR that modifies Dockerfile or dependencies
- [ ] Base image vulnerability alerts configured (Dependabot for Docker)

## Health Checks
- [ ] `HEALTHCHECK` instruction in Dockerfiles (HTTP check for web services)
- [ ] ECS health check configured for merlin-worker
- [ ] Restart policy configured for failed health checks
