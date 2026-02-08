# API Reference

## SimpleStore API

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

Base URL: `/api/audio` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/audio/:key` | Get audio file from S3 |
| `POST` | `/audio/upload` | Upload audio file |

## Merlin TTS API

Base URL: `/api/tts` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Request TTS synthesis |
| `GET` | `/status/:jobId` | Check synthesis status |

### POST /synthesize

Request:
```json
{
  "text": "Tere päevast",
  "voice": "efm_l"
}
```

Response (202 Accepted):
```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

### GET /status/:jobId

Response:
```json
{
  "jobId": "uuid",
  "status": "ready",
  "audioUrl": "https://..."
}
```

## Vabamorf API

Base URL: `/api/vabamorf` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Morphological analysis |
| `POST` | `/variants` | Get word variants with phonetic markers |
| `GET` | `/health` | Health check |

### POST /analyze

Request:
```json
{
  "text": "Tere päevast"
}
```

Response:
```json
{
  "words": [
    {
      "word": "Tere",
      "analysis": [{ "root": "tere", "pos": "I" }]
    }
  ]
}
```

### POST /variants

Request:
```json
{
  "word": "kooli"
}
```

Response:
```json
{
  "word": "kooli",
  "variants": [
    { "form": "k`ooli", "type": "sg g" },
    { "form": "kooli", "type": "sg p" }
  ]
}
```

## Authentication

Currently uses Estonian ID-card authentication (Smart-ID / Mobile-ID).
API Gateway handles auth via custom authorizer.

## Error Responses

All APIs return errors in a consistent format:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 500 | Internal server error |
