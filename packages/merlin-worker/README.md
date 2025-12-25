# Merlin Worker

SQS worker that processes audio synthesis requests using the Merlin TTS model.

## Overview

This worker polls an SQS queue for synthesis requests, calls the Merlin API to generate audio, and uploads the result to S3.

## Flow

```
SQS Queue → Worker → Merlin API → S3 Bucket
```

1. Receive message from SQS (text + hash)
2. Call Merlin API to synthesize audio
3. Upload audio to S3 with hash as filename
4. Delete message from queue

## Configuration

Environment variables:
- `QUEUE_URL` - SQS queue URL
- `BUCKET_NAME` - S3 bucket for audio files
- `MERLIN_URL` - Merlin TTS API endpoint

## Usage

```bash
# Run tests
pnpm test

# Deploy
pnpm run deploy
```

## Exports

```typescript
import { processMessage, WorkerConfig } from '@hak/merlin-worker';
```
