# API Reference

## SimpleStore API

Universal key-value CRUD API backed by DynamoDB single-table design. Base URL: via API Gateway. Requires Cognito JWT authorizer (except public/shared read endpoints).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/save` | Create or update item |
| `GET` | `/get?pk=...&sk=...&type=...` | Get item by key |
| `DELETE` | `/delete?pk=...&sk=...&type=...` | Delete item (owner only) |
| `GET` | `/query?prefix=...&type=...` | List items by prefix (max 100 results) |
| `GET` | `/get-public?pk=...&sk=...` | Get public item (no auth) |
| `GET` | `/get-shared?pk=...&sk=...` | Get shared item (no auth) |

Data types: `private` (owner only), `unlisted` (owner writes, anyone with key reads), `public` (everyone reads, owner writes), `shared` (everyone reads and writes).

Rate limiting: 10 req/s, burst 20 (API Gateway throttle).

## Vabamorf API

Estonian morphological analysis (Docker Lambda + native `vmetajson`). Base URL: via API Gateway.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Stress analysis of Estonian text |
| `POST` | `/variants` | Phonetic variants of a word |
| `GET` | `/health` | Health check |

### POST /analyze

Returns text with stress markers. Max input: 10,000 characters.

```bash
curl -X POST /analyze -H "Content-Type: application/json" -d '{"text": "mees"}'
```

Response: `{"stressedText": "m<ees", "originalText": "mees"}`

Stress markers: `<` primary stress before vowel, `_` compound word boundary.

Errors: 400 (missing body, invalid JSON, missing/empty `text`, text too long), 500 (processing error).

### POST /variants

Returns phonetic pronunciation variants with morphological information.

```bash
curl -X POST /variants -H "Content-Type: application/json" -d '{"word": "noormees"}'
```

```json
{
  "word": "noormees",
  "variants": [{
    "text": "n<oor_m<ees",
    "description": "nimisõna, sg n",
    "morphology": { "lemma": "noormees", "pos": "S", "fs": "sg n", "stem": "n<oor_m<ees", "ending": "0" }
  }]
}
```

| Field | Description |
|-------|-------------|
| `text` | Word with stress markers |
| `description` | Human-readable description (Estonian) |
| `morphology.lemma` | Dictionary form |
| `morphology.pos` | Part of speech (S=noun, V=verb, A=adj, D=adv, P=pron, K=conj, J=adpos, I=interj, Y=abbr) |
| `morphology.fs` | Grammatical form (e.g. `sg n` = singular nominative) |
| `morphology.stem` | Stem with stress markers |
| `morphology.ending` | Ending (`0` = zero ending) |

Errors: 400 (missing `word`), 500 (no variants found).

## Merlin TTS API

Estonian text-to-speech synthesis (SQS + ECS Merlin engine, S3 cache). Base URL: via API Gateway.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Request speech synthesis |
| `GET` | `/status/{cacheKey}` | Check synthesis status |
| `POST` | `/warmup` | Start ECS worker |
| `GET` | `/health` | Health check |

### POST /synthesize

Submits text for synthesis. Returns cache key for polling (or cached result directly).

```bash
curl -X POST /synthesize -H "Content-Type: application/json" -d '{"text": "Tere päevast", "voice": "efm_l"}'
```

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `text` | string | yes | — | Non-empty, max 1000 characters |
| `voice` | string | no | `efm_l` | Voice model identifier |
| `speed` | number | no | `1.0` | 0.5–2.0 |
| `pitch` | number | no | `0` | −500 to 500 |

Request body limit: 10 KB. Invalid JSON returns 400.

Response: `{"status": "ready"|"processing", "cacheKey": "...", "audioUrl": "..."}`.
Cached returns 200, queued returns 202. `cacheKey` is SHA-256 of `text|voice|speed|pitch`.

Rate limiting: 2 req/s, burst 4 (API Gateway throttle). Requires Cognito JWT authorization.

### GET /status/{cacheKey}

Poll for synthesis completion. Returns same response shape as `/synthesize`.

| `status` | Meaning |
|-----------|---------|
| `ready` | Audio available at `audioUrl` |
| `processing` | Still synthesizing, `audioUrl` is `null` |

### POST /warmup

Scales up ECS Merlin worker (cold start ~2 min). Rate-limited: 1 per 60s.

Response: `{"status": "warming"|"already_warm", "running": 0, "desired": 1}`.
Errors: 429 (rate limited), 500 (missing ECS config).

### GET /health

Both Vabamorf and Merlin expose `/health`: `{"status": "ok", "version": "1.0.0"}`.

## Authentication (TARA)

Estonian eID authentication via `tara-auth` Lambda + AWS Cognito. Supports Smart-ID and Mobile-ID.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tara/start` | Initiate TARA login (redirects to TARA) |
| `GET` | `/tara/callback` | TARA OAuth2 callback (sets cookies, redirects to frontend) |
| `POST` | `/tara/refresh` | Refresh access token using httpOnly cookie |
| `POST` | `/tara/exchange-code` | Exchange authorization code for tokens |

POST endpoints are protected by CSRF Origin header validation — requests without a matching `Origin` header return 403.

Tokens: access and id tokens are set as Secure cookies on callback. Refresh token is httpOnly (never accessible to JS). `redirect_uri` is hardcoded server-side.

## Error Format

All APIs return errors as: `{"error": "Error message"}`.

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |
