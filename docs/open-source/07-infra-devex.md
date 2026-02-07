# Phase 5b: Infrastructure & Developer Experience

> MEDIUM — production-grade infra and frictionless contributor onboarding.
> Every item: 🔧 = DevBox hook or CI step exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [ ] | [ ] | IaC security | NEW: `run-tfsec` | tfsec |
| [ ] | [ ] | Docker best practices | NEW: `run-docker-lint` | hadolint |
| [ ] | [ ] | Lighthouse ≥90 | NEW: `run-lighthouse` | lhci |
| [ ] | [ ] | Bundle size budget | NEW: `bundle-size` | size-limit |

## Manual Gates

### Terraform
- [ ] Parameterize all env-specific values
- [ ] Add `infra/README.md`, verify `terraform.tfvars.example`
- [ ] Tag all AWS resources (`Project`, `Environment`, `ManagedBy`)

### Docker
- [ ] Multi-stage builds, pinned base images, non-root user
- [ ] Add `.dockerignore`, health checks

### Local Development
- [ ] Create `docker-compose.yml` (DynamoDB local, localstack)
- [ ] Add `.editorconfig`, VS Code settings
- [ ] Create `docs/GETTING_STARTED.md`
