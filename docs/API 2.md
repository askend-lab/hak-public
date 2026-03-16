# API Reference

Service-specific API documentation:

- [Vabamorf API](API-Vabamorf.md) — Estonian morphological analysis
- [Merlin TTS API](API-Merlin.md) — Estonian text-to-speech synthesis

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
