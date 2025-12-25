# Backlog

Ideas and future work that may be implemented someday.

## Specifications

- [ ] **Restore test visualization (properly)**
  
  TestsPage was removed from frontend. Rebuild visualization as a separate tool or dashboard that reads from `@hak/specifications` and displays Gherkin scenarios with test results.

- [ ] **Create Gherkin prototype with React Testing Library**
  
  Implement in-memory Gherkin tests that:
  - Render real React components via `@testing-library/react`
  - Simulate button clicks via `userEvent`
  - Mock HTTP requests (stay in-memory, no servers)
  - Steps located in `frontend/steps/`, features in `specifications/`
  
  See `packages/specifications/README.md` for architecture details.

## Frontend

- [ ] **Migrate from inline styles to Tailwind CSS**
  
  Currently using inline styles via `styles/colors.ts`. Consider migrating to Tailwind CSS for:
  - Better developer experience
  - Smaller bundle size
  - Consistent design tokens
  - Industry standard for React projects

- [ ] **Unify response helpers across packages**
  
  `audio-api` and `simplestore` have similar `createResponse()` functions. Consider extracting common HTTP response utilities to `@hak/shared` after unifying the interfaces.

- [ ] **Refactor auth token getter to DI pattern**
  
  `services/tasks/api.ts` uses global `authTokenGetter`. Consider dependency injection for better testability and avoiding global state.

- [ ] **Add package exports field**
  
  Add `exports` field to package.json files for better tree-shaking and explicit public API definition.

- [ ] **Zustand store helpers**
  
  Create `createSetter()` helper to reduce boilerplate in Zustand stores. Add devtools middleware for debugging.

- [ ] **httpClient retry and config encapsulation**
  
  Add retry logic from `retry.ts` to `httpClient.ts`. Encapsulate `API_CONFIG` usage within httpClient.

- [ ] **i18n type safety**
  
  Generate TypeScript types from translation JSON files for type-safe translation keys.

## Infrastructure

- [ ] **Enable CloudFront after AWS account verification**
  
  CloudFront config in `infra/cloudfront.tf` is commented out pending AWS Support verification. Re-enable after verification to get HTTPS and CDN.

- [ ] **Add Terraform validation to pre-commit hooks**
  
  Add `terraform fmt -check` and `terraform validate` to devbox.yaml hooks for infra/ directory changes.

- [ ] **Consider moving infra to packages (component isolation)**
  
  Currently all Terraform is in `/infra/`. Alternative: each package contains its own infra (e.g., `packages/singletablelambda/infra/dynamodb.tf`). This makes components self-contained and portable. Trade-off: more complex state management.

- [ ] **Import domain infrastructure as npm dependency**
  
  Currently, shared infrastructure docs (Cognito, Terraform state, deployment patterns) are duplicated or missing. The `askend-lab` domain/AWS account should be packaged as an npm dependency that brings:
  - Domain-level infrastructure documentation
  - Shared Terraform modules
  - Common deployment configurations
  
  This would make HAK (and other projects) reference the canonical source instead of duplicating knowledge.
