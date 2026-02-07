# SLSA — Supply-chain Levels for Software Artifacts Checklist

> https://slsa.dev/
> Framework for ensuring supply chain integrity. Target: Level 2.

## SLSA Level 1: Documentation
- [ ] Build process is documented (README, CI workflow files)
- [ ] Build scripts are version-controlled (GitHub Actions YAML)
- [ ] Build process generates provenance metadata

## SLSA Level 2: Hosted Build
- [ ] Builds run on a hosted CI service (GitHub Actions ✓)
- [ ] Build process is defined in version-controlled config (`.github/workflows/` ✓)
- [ ] Build service authenticates to artifact stores (AWS ECR, S3)
- [ ] Provenance is generated automatically by the build service

## SLSA Level 3: Hardened Builds (aspirational)
- [ ] Build environment is ephemeral (GitHub-hosted runners ✓)
- [ ] Build process is isolated (no shared state between builds)
- [ ] Provenance is non-forgeable (signed by the build service)

## Dependency Management
- [ ] All dependencies pinned to exact versions in `pnpm-lock.yaml`
- [ ] GitHub Actions pinned to SHA (not `@v3`, use `@sha256:abc...`)
- [ ] Docker base images pinned to digest (`node:18@sha256:...`)
- [ ] Dependabot configured for all ecosystems (npm, docker, github-actions)

## Artifact Integrity
- [ ] Release artifacts have SHA-256 checksums
- [ ] Docker images pushed with content-addressable digest
- [ ] Consider Sigstore/cosign for container image signing
- [ ] SBOM generated for each release (SPDX or CycloneDX format)
