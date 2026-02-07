# Node.js Best Practices — Checklist

> https://github.com/goldbergyoni/nodebestpractices
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Project Structure
- [ ] check · [ ] done — Structure by components/packages (`monorepo — already satisfied`)
- [ ] check · [ ] done — Separate business logic from API layer (`code review`)
- [ ] check · [ ] done — Shared utilities in `@hak/shared` (`dependency-check` hook)
- [ ] check · [ ] done — Env-aware configuration, no if/else chains (`code review`)

## Error Handling
- [ ] check · [ ] done — async/await with try-catch (`no-floating-promises` hook)
- [ ] check · [ ] done — Custom error classes with HTTP status codes (`run-tests`)
- [ ] check · [ ] done — Unhandled rejections caught at process level (`run-tests`)
- [ ] check · [ ] done — Fail fast: validate inputs at entry (`run-tests`)
- [ ] check · [ ] done — Log errors with context (requestId, userId) (`run-tests`)

## Code Style
- [ ] check · [ ] done — ESLint with strict rules (`run-lint` hook)
- [ ] check · [ ] done — Prettier for formatting (`prettier-check` hook)
- [ ] check · [ ] done — `const` over `let`, never `var` (`run-lint` — `prefer-const`)
- [ ] check · [ ] done — Strict equality `===` everywhere (`run-lint` — `eqeqeq`)
- [ ] check · [ ] done — No `console.log` in production (`no-console` hook)

## Testing
- [ ] check · [ ] done — Balanced test pyramid (`run-tests` — coverage report)
- [ ] check · [ ] done — Tests independent and isolated (`run-tests` — `--randomize`)
- [ ] check · [ ] done — Test names describe scenario (`code review`)
- [ ] check · [ ] done — Realistic test data, not "foo/bar" (`code review`)
- [ ] check · [ ] done — AAA pattern: Arrange, Act, Assert (`code review`)

## Security
- [ ] check · [ ] done — Never trust user input — validate server-side (`run-tests`)
- [ ] check · [ ] done — Security headers via CloudFront (`tfsec`)
- [ ] check · [ ] done — Request payload size limits at API Gateway (`terraform validate`)
- [ ] check · [ ] done — `pnpm audit` in CI, fail on vulns (`security-audit` hook)
- [ ] check · [ ] done — No `eval()`, `exec()` with user input (`run-lint` — `no-eval`)

## Performance
- [ ] check · [ ] done — Async I/O only, no sync file/network ops (`run-lint`)
- [ ] check · [ ] done — No event loop blocking (`run-lint` — complexity limits)
- [ ] check · [ ] done — AWS SDK client reuse (`code review`)
- [ ] check · [ ] done — Caching where appropriate — S3 audio (`run-tests`)

## Docker
- [ ] check · [ ] done — `.dockerignore` excludes tests/docs (`hadolint`)
- [ ] check · [ ] done — Multi-stage builds (`hadolint`)
- [ ] check · [ ] done — Run as non-root `USER node` (`hadolint`)
- [ ] check · [ ] done — Production deps only (`hadolint`)
- [ ] check · [ ] done — Pin Node.js version (`hadolint`)
