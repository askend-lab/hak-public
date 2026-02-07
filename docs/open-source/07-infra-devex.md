# Phase 5b: Infrastructure & Developer Experience

> MEDIUM — production-grade infra and frictionless contributor onboarding.

## 1. Terraform Quality

- [ ] **Parameterize all env-specific values** — No hardcoded AWS Account IDs, domains, bucket names, regions.
- [ ] **Add `infra/README.md`** — Prerequisites, state management, per-env config, deploy from scratch.
- [ ] **Add Terraform validation to CI** — `terraform fmt -check`, `validate`, `tflint`, `tfsec`.
- [ ] **Add cost estimation** — `infracost` for cost impact of changes.
- [ ] **Modularize Terraform** — Reusable modules for Lambda, API Gateway, CloudFront.
- [ ] **Verify `terraform.tfvars.example`** — Complete with documentation.
- [ ] **Tag all AWS resources** — `Project`, `Environment`, `ManagedBy` tags.

## 2. Docker Quality

- [ ] **Use multi-stage builds** — Minimize final image size.
- [ ] **Pin base image versions** — `node:18.20.5-slim` not `node:18-slim`.
- [ ] **Add `.dockerignore`** — Exclude unnecessary files.
- [ ] **Run as non-root** — `USER node` in Dockerfiles.
- [ ] **Add health checks** — `HEALTHCHECK` instruction.
- [ ] **Scan images** — Integrate `trivy` into CI.

## 3. Local Development

- [ ] **Create `docker-compose.yml`** — One-command local setup with all services.
- [ ] **Add local DynamoDB** — `dynamodb-local` for offline development.
- [ ] **Add local S3** — `localstack` or `minio`.
- [ ] **Add `pnpm dev` command** — Start all services with hot reload.
- [ ] **Add VS Code settings** — `.vscode/settings.json`, `.vscode/extensions.json`.

## 4. Contributor Onboarding

- [ ] **Create `docs/GETTING_STARTED.md`** — Fork, clone, prerequisites, env vars, tests, dev server, submit PR.
- [ ] **Add code tours** — VS Code CodeTour for guided codebase exploration.
- [ ] **Add Mermaid diagrams** — Architecture diagrams rendering on GitHub.

## 5. Formatting & Consistency

- [ ] **Add Prettier** — `.prettierrc` and devDependency (mentioned in CONTRIBUTING but not configured).
- [ ] **Add format-on-save** — VS Code settings + `lint-staged`.
- [ ] **Add EditorConfig** — `.editorconfig` for editor-agnostic formatting.

## 6. Accessibility & i18n

- [ ] **WCAG 2.1 AA audit** — Keyboard nav, screen readers, contrast, focus, forms, alt text.
- [ ] **Add automated a11y testing** — `@axe-core/playwright` in E2E tests.
- [ ] **Extract UI strings** — Move hardcoded Estonian text to translation files.
- [ ] **Add i18n framework** — Consider `react-i18next`.

## 7. Performance

- [ ] **Lighthouse 90+** in all categories.
- [ ] **Bundle analysis** — Code splitting, lazy loading, tree shaking.
- [ ] **Core Web Vitals** — LCP < 2.5s, FID < 100ms, CLS < 0.1.
- [ ] **Lambda cold start optimization** — Minimize bundle, lazy imports, provisioned concurrency.
- [ ] **DynamoDB query optimization** — Access patterns, GSI usage, no scans.
