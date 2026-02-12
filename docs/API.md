# API Reference

## Vabamorf API

Estonian morphological analysis service. Runs as a Docker Lambda with a native `vmetajson` binary.

Base URL: `https://vabamorf.example.com` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Stress analysis of Estonian text |
| `POST` | `/variants` | Phonetic variants of a word |
| `GET` | `/health` | Health check |

### POST /analyze

Returns text with stress markers. Maximum input length: 10,000 characters.

**Request:**

```bash
curl -X POST https://vabamorf.example.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "mees"}'
```

**Response (200):**

```json
{
  "stressedText": "m<ees",
  "originalText": "mees"
}
```

Stress markers in output:
- `<` — primary stress before vowel
- `_` — compound word boundary

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Missing request body |
| 400 | Invalid JSON |
| 400 | Missing `text` field |
| 400 | Empty `text` field |
| 400 | Text exceeds 10,000 characters |
| 500 | Processing error |

### POST /variants

Returns phonetic pronunciation variants with morphological information.

**Request:**

```bash
curl -X POST https://vabamorf.example.com/variants \
  -H "Content-Type: application/json" \
  -d '{"word": "noormees"}'
```

**Response (200):**

```json
{
  "word": "noormees",
  "variants": [
    {
      "text": "n<oor_m<ees",
      "description": "nimisõna, sg n",
      "morphology": {
        "lemma": "noormees",
        "pos": "S",
        "fs": "sg n",
        "stem": "n<oor_m<ees",
        "ending": "0"
      }
    }
  ]
}
```

**Variant fields:**

| Field | Description |
|-------|-------------|
| `text` | Word with stress markers |
| `description` | Human-readable description (Estonian) |
| `morphology.lemma` | Dictionary form |
| `morphology.pos` | Part of speech (S=noun, V=verb, A=adj, D=adv, P=pron, K=conj, J=adpos, I=interj, Y=abbr) |
| `morphology.fs` | Grammatical form (e.g. `sg n` = singular nominative) |
| `morphology.stem` | Stem with stress markers |
| `morphology.ending` | Ending (`0` = zero ending) |

**Errors:**

| Status | Condition |
|--------|-----------|
| 400 | Missing `word` field |
| 500 | No phonetic variants found |

### GET /health

```bash
curl https://vabamorf.example.com/health
```

**Response (200):**

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Merlin TTS API

Estonian text-to-speech synthesis. Queues synthesis jobs via SQS, processes them with Merlin engine on ECS, caches results in S3.

Base URL: `https://merlin-api.example.com` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Request speech synthesis |
| `GET` | `/status/{cacheKey}` | Check synthesis status |
| `POST` | `/warmup` | Start ECS worker |
| `GET` | `/health` | Health check |

### POST /synthesize

Submits text for speech synthesis. Returns immediately with a cache key for polling. If the result is already cached, returns it directly.

**Request:**

```bash
curl -X POST https://merlin-api.example.com/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Tere päevast", "voice": "efm_l"}'
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | yes | — | Estonian text to synthesize |
| `voice` | string | no | `efm_l` | Voice model |
| `speed` | number | no | `1.0` | Speech speed multiplier |
| `pitch` | number | no | `0` | Pitch adjustment |

**Response — cached (200):**

```json
{
  "status": "ready",
  "cacheKey": "a1b2c3...",
  "audioUrl": "https://bucket.s3.eu-west-1.amazonaws.com/cache/a1b2c3....wav"
}
```

**Response — queued (202):**

```json
{
  "status": "processing",
  "cacheKey": "a1b2c3...",
  "audioUrl": "https://bucket.s3.eu-west-1.amazonaws.com/cache/a1b2c3....wav"
}
```

The `cacheKey` is a SHA-256 hash of `text|voice|speed|pitch`. Same input always produces the same cache key.

### GET /status/{cacheKey}

Poll for synthesis completion.

**Request:**

```bash
curl https://merlin-api.example.com/status/a1b2c3...
```

**Response (200):**

```json
{
  "status": "ready",
  "cacheKey": "a1b2c3...",
  "audioUrl": "https://bucket.s3.eu-west-1.amazonaws.com/cache/a1b2c3....wav"
}
```

| `status` value | Meaning |
|----------------|---------|
| `ready` | Audio file available at `audioUrl` |
| `processing` | Still being synthesized, `audioUrl` is `null` |

### POST /warmup

Scales up the ECS Merlin worker (cold start takes ~2 min). Rate-limited to 1 call per 60 seconds.

**Request:**

```bash
curl -X POST https://merlin-api.example.com/warmup
```

**Response (200):**

```json
{
  "status": "warming",
  "running": 0,
  "desired": 1
}
```

| `status` value | Meaning |
|----------------|---------|
| `warming` | Worker is starting up |
| `already_warm` | Worker is already running |

**Errors:**

| Status | Condition |
|--------|-----------|
| 429 | Rate limited (1 request per 60s) |
| 500 | Missing ECS configuration |

### GET /health

```bash
curl https://merlin-api.example.com/health
```

**Response (200):**

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## SimpleStore API

Internal CRUD API for lessons, users, and progress.

Base URL: `/api` (via API Gateway)

### Lessons

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/lessons` | List all lessons |
| `GET` | `/lessons/:id` | Get lesson by ID |
| `POST` | `/lessons` | Create lesson |
| `PUT` | `/lessons/:id` | Update lesson |
| `DELETE` | `/lessons/:id` | Delete lesson |

### Progress

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/progress/:userId` | Get user progress |
| `POST` | `/progress` | Save progress |

## Audio API

Internal audio file management.

Base URL: `/api/audio` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/audio/:key` | Get audio file from S3 |
| `POST` | `/audio/upload` | Upload audio file |

## Authentication

Uses Estonian eID authentication (TARA) via the `tara-auth` Lambda. Supports Smart-ID and Mobile-ID through AWS Cognito.

## Error Format

All APIs return errors as JSON:

```json
{
  "error": "Error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |
