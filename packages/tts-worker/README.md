# Merlin TTS Worker

Estonian speech synthesis worker. Polls SQS for synthesis requests, runs the Merlin TTS engine, and uploads WAV audio to S3.

## Architecture

```
SQS queue ──► worker.py ──► merlin/run_merlin.py ──► WAV ──► S3
                              (conda env: mrln_et)
```

- **worker.py** — SQS consumer: polls queue, orchestrates synthesis, uploads results
- **merlin/** — Third-party Merlin TTS engine (University of Edinburgh CSTR)
- **tools/** — Binary dependencies (SPTK, WORLD, genlab) compiled during Docker build

## Files

- `worker.py` — Main worker (Python, production entry point)
- `Dockerfile` — Production image (Ubuntu + Miniconda + Merlin + voice models from S3)
- `Dockerfile.local` — Local development image
- `merlin/` — Merlin TTS engine source (third-party, do not modify)
- `tools/` — Signal processing tools (SPTK, WORLD, genlab)
- `mrln_et.yml` — Conda environment for Merlin
- `tests/` — pytest tests for worker.py

## Building

Voice models (~267MB) are downloaded from S3 during Docker build using BuildKit secrets:

```bash
docker build \
  --secret id=aws_access_key_id,env=AWS_ACCESS_KEY_ID \
  --secret id=aws_secret_access_key,env=AWS_SECRET_ACCESS_KEY \
  --secret id=aws_session_token,env=AWS_SESSION_TOKEN \
  -t merlin-worker:latest \
  packages/merlin-worker/
```

## Testing

```bash
pip install -r requirements-test.txt
pytest tests/ -v
```
