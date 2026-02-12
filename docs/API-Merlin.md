# Merlin TTS API

Estonian text-to-speech synthesis. Queues synthesis jobs via SQS, processes them with Merlin engine on ECS, caches results in S3.

Base URL: `https://merlin-api.example.com` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Request speech synthesis |
| `GET` | `/status/{cacheKey}` | Check synthesis status |
| `POST` | `/warmup` | Start ECS worker |
| `GET` | `/health` | Health check |

## POST /synthesize

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

## GET /status/{cacheKey}

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

## POST /warmup

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

## GET /health

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
