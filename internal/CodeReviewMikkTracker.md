# Code Review Tracker — Mikk Merimaa Findings

Ref: `internal/CodeReviewMikkReport.txt` (original) | `internal/CodeReviewMikkCrossCheck.md` (cross-check)

Legend: [ ] Accept — we agree to fix | [ ] Fixed — code changed | [ ] Closed — verified done
For rejected items: Accept is replaced with `Reject (reason)` and item is marked Closed immediately.

---

## 1. Documentation

- [ ] Accept  [ ] Fixed  [ ] Closed — **1.1.1** (Low) README inconsistencies: React version 18→19, dev port 5180→5181
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.1.2** (Low) Shared module doesn't list dependencies (cross-check: WRONG — s3 client IS listed)
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.1.3** (Low) vabamorf-api README lists deps but package.json dependencies empty
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.2.1** (Low) No separate INSTALL.md
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.1** (Low) Duplicate architecture line in README
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.2** (Low) Tech stack duplication in ARCHITECTURE.md and module READMEs
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.3** (Medium) ARCHITECTURE.md says merlin-worker depends on shared (incorrect)
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.4** (Medium) ARCHITECTURE.md says vabamorf-api depends on shared (misleading)
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.5** (Medium) merlin-worker described as Python + TypeScript (inaccurate)
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.3.6** (High?) Architecture doc missing key sections
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.4.1** (Medium) API docs are manual, no OpenAPI/Swagger
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.5.1** (Medium) No deployment guide for engineers
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.5.1.1** (Low) Too many markdown files (~46)
- [ ] Accept  [ ] Fixed  [ ] Closed — **1.5.1.2** (Low) Design documentation in two places

## 2. Technical Stack

- [ ] Accept  [ ] Fixed  [ ] Closed — **2.1** (Low) Node.js 20, should upgrade to latest LTS
- [ ] Accept  [ ] Fixed  [ ] Closed — **2.2** (Low) 5 testing frameworks is excessive
- [ ] Accept  [ ] Fixed  [ ] Closed — **2.3** (Low/High) Bug in generate.py: ERB branch uses bark_alpha (dead code path)

## 3. Project Structure

- [ ] Accept  [ ] Fixed  [ ] Closed — **3.1** (Low) merlin-worker and merlin-api tightly coupled, could merge

## 4. Code Style

- [ ] Accept  [ ] Fixed  [ ] Closed — **4.1** (Low) if statements without curly brackets
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.2** (Medium) getCorsOrigin and shared utilities duplicated (intentional inlining)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.3** (Low) `as unknown as` double type assertions
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.4** (Low) Nested ternary statements
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.5** (Low) Array indexes as React keys
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.6** (Low) Unused code: Icons, LoginModalProps.message, commented code
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.7** (Low) Redundant `?` and `undefined` type specifiers
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.8** (Medium) Deprecated APIs (cross-check: React.FormEvent NOT deprecated)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.9** (Low) Duplicate CSS selectors (.marker-tooltip--align-center)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.10** (Low) Redundant return None in Python (cross-check: NOT confirmed)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.11** (Low) ~30 TODO matches (cross-check: found 12, not 30)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.12** (Low) Unnecessary list() calls on iterables in Python
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.13** (Low) Unnecessary awaits not attached to promises (cross-check: NOT confirmed)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.14** (Medium) DeepRecurrentNetwork class issues (external library)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.15** (Low) Python naming case issues (ML math notation)
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.16** (Medium) 1000+ code style issues from SonarQube
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.17** (Medium) Merlin NN Python files have style issues and commented code
- [ ] Accept  [ ] Fixed  [ ] Closed — **4.18** (Medium) Floating point equality checks in worker.py

## 5. Simplicity & Patterns

- [ ] Accept  [ ] Fixed  [ ] Closed — **5.1** (Low) S3 utilities duplicated between shared and merlin-api
- [ ] Accept  [ ] Fixed  [ ] Closed — **5.2** (Low) LambdaResponse and createResponse duplicated across packages
- [ ] Accept  [ ] Fixed  [ ] Closed — **5.3** (Low) `if True:` block in run_merlin.py (indentation hack)
- [ ] Accept  [ ] Fixed  [ ] Closed — **5.4** (Low) HTTP_STATUS duplicated across packages

## 6. Maintainability

- [ ] Accept  [ ] Fixed  [ ] Closed — **6.1** (High) pnpm test:all silently skips merlin-worker Python tests

## 7. Error Handling

- [ ] Accept  [ ] Fixed  [ ] Closed — **7.1** (Low) simplestore doesn't use extractErrorMessage from shared
- [ ] Accept  [ ] Fixed  [ ] Closed — **7.2** (Low) merlin-api and vabamorf-api use console.error instead of shared logger

## 8. Testing

- [ ] Accept  [ ] Fixed  [ ] Closed — **8.1** (High) merlin-worker Python tests not in CI (cross-check: they ARE in build-merlin-worker.yml)
- [ ] Accept  [ ] Fixed  [ ] Closed — **8.2.1** (Medium) Test duplications in simplestore (handler vs routes tests)
- [ ] Accept  [ ] Fixed  [ ] Closed — **8.2.2** (Low) Auth context tests fragmented into 6 files

## 9. CI/CD

- [ ] Accept  [ ] Fixed  [ ] Closed — **9.1** (Low) Dockerfile uses `RUN cd` instead of WORKDIR
- [ ] Accept  [ ] Fixed  [ ] Closed — **9.2** (Low) Serverless framework version mismatch v3 yml / v4 package.json (by design)
- [ ] Accept  [ ] Fixed  [ ] Closed — **9.3** (Medium) No deployment workflow for some components (cross-check: most exist)

## 10. Configuration

- [ ] Accept  [ ] Fixed  [ ] Closed — **10.1** (Low) Unused env vars COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID in merlin-api README
- [ ] Accept  [ ] Fixed  [ ] Closed — **10.2** (Medium) Empty-string fallback for ECS env vars (cross-check: guarded by isEcsConfigured)

## 11. Dependencies

- [ ] Accept  [ ] Fixed  [ ] Closed — **11.1** (Medium) 10 unused dependencies (cross-check: 7 confirmed unused)

## 12. Security

- [ ] Accept  [ ] Fixed  [ ] Closed — **12.1** (High) /synthesize and /warmup no auth (cross-check: BY DESIGN, documented)
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.2** (Medium) Shared throttling not per-user (WAF has per-IP limiting)
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.3** (Medium) CORS behavior differs: shared="null" vs merlin/vabamorf="*"
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.4** (Medium) OS Command Injection via shell=True (fix in progress, TDD tests exist)
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.5** (Medium) pickle.load without integrity verification
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.6** (Medium) CORS misconfiguration (duplicate of 12.3)
- [ ] Accept  [ ] Fixed  [ ] Closed — **12.7** (Medium) Missing cacheKey validation in worker.py

## 13. Performance

- [ ] Accept  [ ] Fixed  [ ] Closed — **13.1** (Medium) DNN model loaded from disk on every request
- [ ] Accept  [ ] Fixed  [ ] Closed — **13.2** (Medium) SQS polls only 1 message per cycle

## 14. Domain Logic

- [ ] Accept  [ ] Fixed  [ ] Closed — **14.1** (Low) Module names should reflect domain, not technology
