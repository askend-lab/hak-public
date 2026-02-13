# Vabamorf API

Lambda API for Estonian morphological analysis using the Vabamorf library.

## Overview

Provides endpoints for analyzing Estonian text and extracting phonetic/stress information.

## Endpoints

### POST /analyze
Analyzes text and returns morphological breakdown with stress markers.

```json
{
  "text": "Tere päevast"
}
```

### POST /variants
Returns pronunciation variants for a word.

```json
{
  "word": "koer"
}
```

## Configuration

Environment variables:
- `VMETAJSON_PATH` — Path to vmetajson binary (default: `./vmetajson`)
- `DICT_PATH` — Path to Estonian dictionary directory (default: `.`)

## Usage

```bash
# Run tests
pnpm test

# Deploy (via Serverless Framework)
serverless deploy --stage dev
```

## Dependencies

- `vmetajson` - Estonian morphological analyzer binary
- `et.dct` - Estonian dictionary file
