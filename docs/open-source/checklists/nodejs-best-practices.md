# Node.js Best Practices — Checklist

> https://github.com/goldbergyoni/nodebestpractices (100k+ stars)
> Production Node.js patterns applied to HAK.

## Project Structure
- [ ] Structure by components/packages, not by technical role (HAK uses monorepo packages ✓)
- [ ] Separate business logic from API layer (handlers vs. core logic)
- [ ] Wrap common utilities as packages (`@hak/shared` ✓)
- [ ] Use environment-aware configuration (config per env, not if/else chains)

## Error Handling
- [ ] Use `async/await` with try-catch (not callbacks or raw `.then()`)
- [ ] Distinguish operational errors from programmer errors
- [ ] Use custom error classes with HTTP status codes and error codes
- [ ] Handle unhandled rejections and uncaught exceptions at process level
- [ ] Fail fast: validate all inputs at function entry, return early on invalid
- [ ] Log errors with full context (requestId, userId, operation, input summary)

## Code Style
- [ ] Use ESLint with strict rule set (verified ✓)
- [ ] Use Prettier for formatting (mentioned in CONTRIBUTING but not configured — add)
- [ ] Prefer `const` over `let`, never `var` (enforced ✓)
- [ ] Use strict equality (`===`) everywhere (enforced ✓)
- [ ] No `console.log` in production code — use structured logger

## Testing
- [ ] Test pyramid: many unit tests, fewer integration, fewest E2E
- [ ] Each test is independent and can run in isolation
- [ ] Test names describe the scenario: "should return 400 when text exceeds limit"
- [ ] Use realistic test data, not "foo/bar" placeholders
- [ ] AAA pattern: Arrange, Act, Assert
- [ ] Tag tests by type for selective execution (`--testPathPattern`)

## Security
- [ ] Never trust user input — validate everything server-side
- [ ] Use helmet-equivalent headers (CSP, X-Frame-Options, etc.) via CloudFront
- [ ] Limit request payload size at API Gateway level
- [ ] Run `pnpm audit` in CI, fail on vulnerabilities
- [ ] Use `npm-check-updates` or Dependabot to keep deps current
- [ ] No `eval()`, `new Function()`, or `child_process.exec()` with user input

## Performance
- [ ] Use async operations for I/O (never sync file/network ops in handlers)
- [ ] Avoid blocking the event loop (no CPU-heavy sync operations)
- [ ] Use connection pooling for HTTP clients (AWS SDK reuse)
- [ ] Implement caching where appropriate (S3 audio cache ✓)
- [ ] Monitor memory usage (Lambda memory limits)

## Docker (for vabamorf-api, merlin-worker)
- [ ] Use `.dockerignore` to exclude tests, docs, node_modules
- [ ] Multi-stage builds: build stage + minimal runtime stage
- [ ] Run as non-root user (`USER node`)
- [ ] Use `dumb-init` or `tini` as PID 1
- [ ] Install production dependencies only (`pnpm install --prod`)
- [ ] Pin Node.js version to specific patch release
