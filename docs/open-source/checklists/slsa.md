# SLSA — Supply-chain Levels for Software Artifacts Checklist

> https://slsa.dev/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## SLSA Level 1: Documentation
- [ ] check · [ ] done — Build process documented (`README + CI workflow files`)
- [ ] check · [ ] done — Build scripts version-controlled (`GitHub Actions YAML`)
- [ ] check · [ ] done — Build generates provenance metadata (`release workflow`)

## SLSA Level 2: Hosted Build
- [ ] check · [ ] done — Builds run on hosted CI — GitHub Actions (`build.yml`)
- [ ] check · [ ] done — Build defined in version-controlled config (`build.yml`)
- [ ] check · [ ] done — Provenance generated automatically (`release workflow`)

## Dependency Management
- [ ] check · [ ] done — All deps pinned in `pnpm-lock.yaml` (`dependency-check` hook)
- [ ] check · [ ] done — Actions pinned to SHA (`workflow audit script`)
- [ ] check · [ ] done — Docker images pinned to digest (`hadolint`)
- [ ] check · [ ] done — Dependabot for all ecosystems (`dependabot.yml`)

## Artifact Integrity
- [ ] check · [ ] done — Release artifacts have SHA-256 checksums (`release workflow`)
- [ ] check · [ ] done — Docker images with content-addressable digest (`CI push`)
- [ ] check · [ ] done — SBOM generated per release — SPDX/CycloneDX (`release workflow`)
