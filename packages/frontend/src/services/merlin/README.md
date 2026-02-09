# Merlin TTS Service

This directory contains only the Docker configuration for Merlin TTS.

**Important:** The source code (`src/`) and models (`voices/`) are NOT stored in git.
They are copied from `research/merlin/` during Docker build.

## Files in git:

- `Dockerfile` - Docker image configuration
- `app.py` - Flask API wrapper
- `docker-entrypoint.sh` - Container startup script
- `mrln_et.yml` - Conda environment specification
- `README.md` - This file

## Building:

**IMPORTANT:** The build context MUST be the project root (not services/merlin/).

The Dockerfile copies files from `research/merlin/` which is NOT in git.

```bash
# From project root:
docker build -f services/merlin/Dockerfile -t merlin:latest .
```

Or use docker-compose which handles the context correctly.

### Why research/ is not in git:

The merlin repository is ~600MB with models and compiled tools.
To keep our git repo small, we clone it separately and copy files during Docker build.
