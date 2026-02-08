# Audio API Lambda Architecture

## Overview

The Audio API Lambda is a thin API layer that manages audio generation requests. It implements a "check-then-queue" pattern to avoid redundant generation work.

## Workflow

### POST /generate

**Request:**
```json
{
  "text": "tere"
}
```

**Process:**

1. **Hash Calculation**
   - Compute SHA-256 hash of the text
   - Example: `hash("tere")` → `abc12345...`
   - Hash = text + phonetic settings + generator version

2. **S3 Cache Check**
   - Check if file exists: `s3://hak-audio-{env}/cache/abc12345.mp3`

   **If EXISTS:**
   - Return immediately with URL
   - **No generation needed** (protection from spam/bombing)

   **If NOT EXISTS:**
   - Put message to SQS queue
   - Return status "processing"

**Response (Cache Hit):**
```json
{
  "status": "ready",
  "url": "https://<your-audio-bucket>.s3.amazonaws.com/cache/abc12345.mp3",
  "hash": "abc12345"
}
```

**Response (Cache Miss):**
```json
{
  "status": "processing",
  "hash": "abc12345"
}
```

## Frontend Polling Strategy

The Lambda does NOT provide status check endpoint. Frontend handles polling itself:

1. Call `POST /generate` → receive hash
2. Periodically try to load file from S3: `GET /audio/cache/{hash}.mp3`
3. If 404 → keep polling
4. If 200 → play audio

## Architecture Components

```
┌─────────┐    POST /generate    ┌──────────────┐
│ Frontend│ ───────────────────> │ Audio-API    │
│         │                       │ Lambda       │
└─────────┘                       └──────┬───────┘
                                         │
                    ┌────────────────────┴───────────────┐
                    │                                    │
                    ▼                                    ▼
              ┌──────────┐                         ┌─────────┐
              │    S3    │                         │   SQS   │
              │  Cache   │                         │  Queue  │
              └──────────┘                         └────┬────┘
                    ▲                                   │
                    │                                   ▼
                    │                         ┌──────────────────┐
                    └─────────────────────────│ Fargate Worker   │
                         Generated MP3        │ (ML Model)       │
                                              └──────────────────┘
```

## Security & Cost Optimization

**Protection from bombing:**
- S3 check before queueing prevents duplicate generation
- If audio already exists, no SQS message is created

**Cost efficiency:**
- Cache-first approach minimizes generation
- Content-addressable storage (CAS) by hash
- Fargate Spot instances for generation

**Authentication:**
- AWS Cognito authorization
- Lambda gets user ID from `event.requestContext.authorizer.claims.sub`
- Rate limiting can be added per user if needed

## Technical Details

**Lambda Configuration:**
- Runtime: Node.js (18+)
- Memory: 256-512 MB (minimal)
- Timeout: 5-10 seconds
- Environment: Uses computed names for service discovery
  - SQS Queue: `hak-audio-generation-{env}`
  - S3 Bucket: `hak-audio-{env}`

**Dependencies:**
- AWS SDK (S3, SQS)
- Crypto (SHA-256 hashing)
- No database needed (stateless)

## Future Enhancements (Optional)

- Pre-warming: Send empty SQS message when teacher enters builder
- Batch generation endpoint for multiple phrases
- Priority queue for urgent requests
