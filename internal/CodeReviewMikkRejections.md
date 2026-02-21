# Rejection Justifications — Mikk Merimaa Code Review

This document explains why each rejected finding was not accepted for fixing.
Ref: `internal/CodeReviewMikkTracker.md` | `internal/CodeReviewMikkCrossCheck.md`

---

## 1.1.2 (Low) — "Shared module doesn't list `aws-sdk/client-s3` as a dependency"

**Reason: Reviewer error.**

Mikk states that the `shared` package README does not list `@aws-sdk/client-s3` as a dependency. This is factually incorrect. The file `packages/shared/package.json` explicitly includes `"@aws-sdk/client-s3": "^3.990.0"` in its `dependencies` object. The shared module's README also documents Lambda helpers and S3 utilities that use this SDK.

The reviewer likely checked an older version of the file or confused the shared README's narrative description (which focuses on exported functions rather than listing raw npm dependencies) with the actual `package.json`.

**Evidence:** `packages/shared/package.json` line 15 — `"@aws-sdk/client-s3": "^3.990.0"`.

---

## 3.1 (Low) — "merlin-worker and merlin-api are tightly coupled, could merge into one directory"

**Reason: Architecturally inappropriate.**

merlin-worker and merlin-api are fundamentally different services:

- **merlin-api** is a TypeScript AWS Lambda function deployed via Serverless Framework. It handles HTTP requests, validates input, checks S3 cache, and sends messages to SQS.
- **merlin-worker** is a Python application running on ECS Fargate in a Docker container with Conda, Miniconda, SPTK tools, and neural network models. It polls SQS, runs the Merlin TTS engine, and uploads results to S3.

They share no code, use different languages (TypeScript vs Python), different runtimes (Lambda vs ECS), different build pipelines (esbuild/Serverless vs Docker), and different deployment workflows (`deploy.yml` vs `build-merlin-worker.yml`). The only coupling is through SQS (message queue) and S3 (shared storage) — which is standard asynchronous microservice communication.

Merging them into one directory would create a confusing hybrid package with mixed Python/TypeScript tooling, a single `package.json` trying to serve both, and no clear separation of deployment concerns. The current structure correctly reflects the deployment boundary.

---

## 4.10 (Low) — "Redundant `return None` in Python"

**Reason: Finding not confirmed in codebase.**

We searched all Python files in `packages/merlin-worker/` for explicit `return None` statements and found zero occurrences. Python functions that don't explicitly return a value already return `None` implicitly — the codebase follows this convention correctly.

Mikk may have been referring to bare `return` statements (without `None`), which are a valid Python idiom for early exits from functions. These are not redundant — they serve a control flow purpose.

Without specific file/line references from the reviewer, we cannot act on this finding.

---

## 4.13 (Low) — "Unnecessary awaits not attached to promises"

**Reason: Finding not confirmed in codebase.**

We searched all TypeScript source files (excluding tests) for `await` usage. All `await` calls in production source code are on functions that return Promises — this is correct async/await usage.

In test files, some `await` calls may be on synchronous mocked functions, but this is harmless (awaiting a non-Promise value returns it immediately) and is a common testing pattern when the real function is async.

Without specific file/line references from the reviewer, we cannot identify the alleged issue. The codebase's TypeScript strict mode and ESLint configuration would flag genuinely problematic await usage.

---

## 4.14 (Medium) — "DeepRecurrentNetwork class has too many responsibilities"

**Reason: External library code, not ours.**

The file `packages/merlin-worker/merlin/models/deep_rnn.py` (301 lines) contains the `DeepRecurrentNetwork` class, which is part of the **Merlin Speech Synthesis Toolkit** originally developed by the University of Edinburgh's Centre for Speech Technology Research.

This is third-party scientific code integrated into our project for Estonian TTS synthesis. Refactoring it would:
1. Break compatibility with the trained neural network models that depend on this exact class structure.
2. Require re-training voice models (a multi-day process requiring specific GPU infrastructure and linguistic data).
3. Risk introducing subtle numerical bugs in the forward pass computation.

The class follows ML research conventions (large `__init__` for layer construction, monolithic forward pass). This is standard in deep learning codebases (cf. PyTorch model definitions, TensorFlow Keras layers).

We maintain this code in a "minimal touch" policy — only fixing bugs that affect runtime behavior, not refactoring for style.

---

## 4.15 (Low) — "Python naming case issues (W_value, Whx, etc.)"

**Reason: ML mathematical notation convention.**

Variable names like `W_value`, `mW_value`, `Whx`, `bh` in the Merlin neural network code follow standard mathematical notation used in machine learning literature:

- `W` = weight matrix (capital letter for matrices is universal in linear algebra)
- `Whx` = weight matrix connecting hidden (h) to input (x)
- `bh` = bias vector for hidden layer
- `mW` = momentum for weight matrix (common in SGD with momentum)

Renaming these to `weight_value`, `momentum_weight_value`, `weight_hidden_to_input` etc. would:
1. Make the code unreadable to ML researchers who reference the underlying papers.
2. Break the correspondence between code and mathematical formulas in the Merlin documentation.
3. Violate the conventions of every major ML framework (PyTorch, TensorFlow, JAX all use similar notation).

PEP 8 itself acknowledges that mathematical code may deviate from naming conventions when the domain demands it.

---

## 4.17 (Medium) — "Merlin NN Python files have style issues and commented-out code"

**Reason: External library code, not ours.**

Same reasoning as 4.14. The entire `packages/merlin-worker/merlin/` directory contains the Merlin TTS engine from the University of Edinburgh. The commented-out code includes:
- Experimental configurations from the original researchers
- Alternative model architectures that were tested during development
- Debug print statements used during model training

This code is maintained under a "minimal touch" policy. The commented-out code serves as documentation of the original researchers' intent and alternative approaches. Cleaning it up risks removing information that may be needed when debugging synthesis quality issues or adapting to new voice models.

Our own code (`worker.py`, `tests/`) follows our project's style conventions.

---

## 7.2 (Low) — "merlin-api and vabamorf-api use console.error instead of shared logger"

**Reason: Standalone Lambda architecture constraint.**

Both `merlin-api` and `vabamorf-api` are standalone AWS Lambda functions that intentionally do not import `@hak/shared` at runtime. This is documented in `packages/merlin-api/README.md` line 54:

> "merlin-api inlines utility functions from @hak/shared (e.g., getCorsOrigin) because Lambda bundling does not support workspace package imports."

Using the shared `createLogger` / `logger` module would require either:
1. Adding `@hak/shared` as a runtime dependency — which conflicts with the standalone Lambda architecture and increases cold start time.
2. Inlining the logger too — which would add more duplicated code, contradicting the reviewer's own finding about code duplication (5.1, 5.2).

In AWS Lambda, `console.error()` output goes directly to CloudWatch Logs with timestamps, request IDs, and log levels. The shared logger adds structured JSON formatting — a nice-to-have but not essential for Lambda functions where CloudWatch provides native log aggregation.

The current approach is a pragmatic trade-off, not an oversight.

---

## 8.1 (High) — "merlin-worker Python tests not executed by CI"

**Reason: Reviewer error — tests ARE in CI.**

Mikk states that Python tests for merlin-worker are not executed in CI. This is factually incorrect.

The file `.github/workflows/build-merlin-worker.yml` lines 36-40 explicitly runs Python tests:

```yaml
- name: Run Python tests
  working-directory: packages/merlin-worker
  run: |
    pip install -r requirements-test.txt
    pytest tests/ -v --json-report --json-report-file=test-results.json
```

This workflow runs on every push that changes `packages/merlin-worker/**` files. It installs Python 3.11, installs test dependencies, runs pytest with verbose output and JSON reporting, and then proceeds to Docker build only if tests pass.

The tests are NOT in the main `build.yml` workflow (which runs pnpm-based TypeScript tests), but this is by design — the main workflow handles TypeScript packages, and `build-merlin-worker.yml` handles the Python package. Both run on the same trigger (push to PR branches).

The confusion may arise because `pnpm test:all` in the root `package.json` runs `pnpm -r run test:full`, which calls `merlin-worker/package.json`'s `test:full` script. This script silently skips if the Python venv is not set up — but this is for local development convenience, not CI. In CI, the dedicated workflow handles Python tests properly.

---

## 8.2.2 (Low) — "Auth context tests fragmented into 6 files"

**Reason: Intentional organization by concern.**

The AuthProvider is the most complex state management component in the frontend. It handles:
- OAuth 2.0 PKCE flow with TARA (Estonian national authentication)
- Token refresh with Cognito
- Session persistence across browser tabs
- Error recovery and edge cases
- Multiple callback types (login, logout, refresh)

The 6 test files are organized by testing concern:

| File | Concern | Why separate |
|------|---------|-------------|
| `context.test.tsx` | Core provider behavior | Base functionality |
| `context.state.test.tsx` | State transitions | Complex state machine |
| `context.callbacks.test.tsx` | Login/logout callbacks | Side effects |
| `context.edge.test.tsx` | Edge cases | Error paths |
| `context.refresh.test.tsx` | Token refresh | Async timing |
| `context.returns.test.tsx` | Hook return values | API contract |

Plus `context.test-utils.tsx` with shared test helpers — indicating this was a deliberate architectural decision, not accidental fragmentation.

Benefits of this structure:
- Each file is focused and readable (vs one 1000+ line test file)
- Failures clearly indicate which concern broke
- Tests can be run individually during development
- Shared test-utils prevent duplication across test files

This is a recognized testing pattern in the React community for complex contexts.

---

## 9.2 (Low) — "Serverless framework version mismatch: v3 in yml / v4 in package.json"

**Reason: Intentional design decision, documented.**

The root `README.md` explicitly addresses this:

> "**Serverless Framework v3** — we use Serverless Framework v3 (EOL) intentionally. v4 requires a commercial license (per-seat pricing). We will migrate when the project justifies the cost, or when a viable open-source alternative matures."

The `frameworkVersion: "3"` in all `serverless.yml` files is the runtime constraint that controls which features are available. The `"serverless": "^4.32.0"` in `package.json` is the CLI tool version — Serverless CLI v4 is backwards-compatible and can deploy v3 configurations.

This is a deliberate cost optimization. Serverless Framework v4 introduced per-developer licensing at $12-60/month/developer. For a research project with occasional contributors, this cost is not justified when v3 functionality meets all requirements.

---

## 9.3 (Medium) — *Note: This was later ACCEPTED per Alex's request to document properly.*

---

## 12.1 (High) — "No authentication on /synthesize and /warmup endpoints"

**Reason: Intentional design, fully documented.**

This is the most significant error in Mikk's review. He rates this as HIGH severity, but it is entirely by design.

The root `README.md` lines 58-63 explicitly states:

> "**Merlin API (TTS) and Vabamorf API (NLP) are public endpoints** — no authentication is required. These APIs serve the core learning experience and must be accessible without login. Protection is via API Gateway throttling and AWS WAF rate limiting only."

Additionally:
- `packages/merlin-api/serverless.yml` has `AuthorizationType: NONE` with a corresponding test (`test/serverless-config.test.ts`) that verifies this configuration is intentional.
- The APIs serve an educational Estonian language learning application where TTS must work without requiring users to create accounts.
- Protection against abuse is handled at the infrastructure level: API Gateway throttling (2 req/s, burst 4) and AWS WAF (100 requests / 5 min per IP).

The reviewer's concern about abuse is valid in principle, but the risk is mitigated by infrastructure-level rate limiting, and the design choice is a product requirement, not a security oversight.

Note: The `merlin-api/README.md` incorrectly lists "Cognito JWT" as the auth method for these endpoints — this is a documentation bug (accepted as finding 15.2), not a code bug.

---

## 12.5 (Medium) — "pickle.load without integrity verification"

**Reason: Low risk in current architecture.**

The `pickle.load` call at `merlin/run_merlin.py` line 93 loads DNN model files:

```python
dnn_model = pickle.load(open(nnets_file_name, 'rb'))
```

The model file path (`nnets_file_name`) is:
1. Set at Docker image build time from S3 voice models
2. Stored inside the Docker image layer at a fixed filesystem path
3. Not user-controllable — no HTTP request or SQS message can influence which file is loaded
4. The Docker image is built in CI with verified S3 sources and pushed to a private ECR registry

For `pickle.load` to be exploitable, an attacker would need to either:
- Compromise the Docker image build pipeline and inject a malicious model file
- Gain write access to the ECS container filesystem at runtime

Both scenarios require infrastructure-level compromise that would have far more severe consequences than pickle deserialization.

Migrating away from pickle would require converting all voice models to a safe format (e.g., ONNX, SavedModel), revalidating synthesis quality, and modifying the Merlin engine — a multi-week effort for minimal security gain given the threat model.

---

## 12.6 (Medium) — "CORS misconfiguration"

**Reason: Duplicate of finding 12.3.**

This finding describes the same issue as 12.3 (CORS behavior differences between packages). Finding 12.3 is accepted and will be fixed. Tracking the same issue twice would create confusion in the tracker.

---

## 13.2 (Medium) — "SQS polls only 1 message per cycle"

**Reason: Appropriate for sequential processing model.**

The SQS worker (`worker.py` line 286) uses `MaxNumberOfMessages=1`. While SQS supports up to 10 messages per `receive_message` call, increasing this value would not improve throughput because:

1. **Merlin TTS synthesis is CPU-intensive** — each synthesis takes 3-15 seconds depending on text length and voice model. The worker processes one request at a time sequentially.
2. **Memory constraints** — the neural network models occupy significant RAM. Processing multiple requests simultaneously would require proportionally more memory.
3. **No parallel processing** — the worker is single-threaded Python. Fetching 10 messages but processing them sequentially would just increase the visibility timeout risk (messages could time out while waiting in the local queue).
4. **ECS auto-scaling** — for higher throughput, the architecture scales horizontally by running multiple ECS tasks, each polling 1 message. This is the standard SQS consumer pattern.

Increasing `MaxNumberOfMessages` would only help if we also implemented multiprocessing/threading, which would require significant refactoring of the Merlin engine (which uses global state and is not thread-safe).

The current architecture achieves throughput scaling through horizontal scaling (more ECS tasks), not per-task parallelism.
