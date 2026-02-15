# Merlin API

TTS gateway Lambda for Estonian speech synthesis. Accepts synthesis requests, checks S3 cache, sends jobs to SQS, and returns results.

## Architecture

```
Frontend → POST /synthesize → merlin-api → SQS queue → merlin-worker → S3
Frontend → GET /status/{key} → merlin-api → S3 (check cache)
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/synthesize` | Cognito JWT | Submit text for synthesis |
| `GET` | `/status/{cacheKey}` | Cognito JWT | Poll synthesis status |
| `POST` | `/warmup` | Cognito JWT | Scale up ECS worker |
| `GET` | `/health` | None | Health check |

## Input Validation

| Parameter | Type | Required | Default | Range |
|-----------|------|----------|---------|-------|
| `text` | string | yes | — | 1–1000 characters |
| `voice` | string | no | `efm_l` | Voice model ID |
| `speed` | number | no | `1.0` | 0.5–2.0 |
| `pitch` | number | no | `0` | −500 to 500 |

- Request body limit: 10 KB (`MAX_BODY_SIZE`)
- Invalid JSON returns 400
- Cache key: SHA-256 of `text|voice|speed|pitch`

## Rate Limiting

- API Gateway throttle: 2 req/s, burst 4
- Warmup endpoint: 1 call per 60 seconds (in-Lambda rate limit)
- AWS WAF: 100 requests / 5 minutes per IP

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SQS_QUEUE_URL` | Merlin synthesis SQS queue URL |
| `S3_BUCKET` | Audio cache S3 bucket |
| `ALLOWED_ORIGIN` | CORS allowed origin |
| `ECS_CLUSTER` | ECS cluster name (for warmup) |
| `ECS_SERVICE` | ECS service name (for warmup) |
| `COGNITO_USER_POOL_ID` | Cognito user pool for JWT auth |
| `COGNITO_CLIENT_ID` | Cognito client ID for JWT auth |

## Note on Shared Utilities

merlin-api inlines utility functions from `@hak/shared` (e.g., `getCorsOrigin`) because Lambda bundling does not support workspace package imports. This is an intentional trade-off documented in `internal/DESIGN-DECISIONS.md`.

## Testing

```bash
pnpm test              # Run tests
pnpm test:full         # Run with coverage
```

## Deploy

```bash
serverless deploy --stage dev
```
