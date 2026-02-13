# API Reference

## SimpleStore API

Internal CRUD API for lessons, users, and progress. Base URL: `/api`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/lessons` | List all lessons |
| `GET` | `/lessons/:id` | Get lesson by ID |
| `POST` | `/lessons` | Create lesson |
| `PUT` | `/lessons/:id` | Update lesson |
| `DELETE` | `/lessons/:id` | Delete lesson |
| `GET` | `/progress/:userId` | Get user progress |
| `POST` | `/progress` | Save progress |

## Audio API

Audio file management. Base URL: `/api/audio`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/audio/:key` | Get audio file from S3 |
| `POST` | `/audio/upload` | Upload audio file |

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

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | yes | — | Estonian text to synthesize |
| `voice` | string | no | `efm_l` | Voice model |
| `speed` | number | no | `1.0` | Speech speed multiplier |
| `pitch` | number | no | `0` | Pitch adjustment |

Response: `{"status": "ready"|"processing", "cacheKey": "...", "audioUrl": "..."}`.
Cached returns 200, queued returns 202. `cacheKey` is SHA-256 of `text|voice|speed|pitch`.

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

## Authentication

Estonian eID (TARA) via `tara-auth` Lambda. Supports Smart-ID and Mobile-ID through AWS Cognito.

## Error Format

All APIs return errors as: `{"error": "Error message"}`.

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |
