# Vabamorf API

Estonian morphological analysis service. Runs as a Docker Lambda with a native `vmetajson` binary.

Base URL: `https://vabamorf.example.com` (via API Gateway)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze` | Stress analysis of Estonian text |
| `POST` | `/variants` | Phonetic variants of a word |
| `GET` | `/health` | Health check |

## POST /analyze

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

## POST /variants

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

## GET /health

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
