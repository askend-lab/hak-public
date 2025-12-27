# Vabamorf and Merlin Services Documentation

## Overview

The project uses two services for Estonian speech synthesis:
1. **Vabamorf** (port 8001) - adds phonetic markers to text
2. **Merlin** (port 8002) - synthesizes speech from marked text

---

## 1. Vabamorf - Morphological Analyzer

### Purpose
Analyzes Estonian text and adds phonetic markers:
- `<` - third degree of length (three-mora syllable)
- `]` - palatalization  
- `+` - morpheme boundary (stem+ending)
- `_` - compound word boundary

### API

**Health Check:**
```http
GET http://localhost:8001/health
```

**Text Analysis:**
```http
POST http://localhost:8001/analyze
Content-Type: application/json

{
  "text": "Mees peeti kinni"
}
```

**Response:**
```json
{
  "stressedText": "m<ees p<ee+ti k<in]ni",
  "originalText": "Mees peeti kinni"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Estonian text (non-empty, max 1 MB) |

### Examples

```javascript
// Node.js
const response = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Tere kena ilm' })
});
const { stressedText } = await response.json();
```

```bash
# curl
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Mees peeti kinni"}'
```

### Error Codes
- `200` - success
- `400` - invalid JSON or empty text
- `413` - request larger than 1 MB
- `500` - processing error

---

## 2. Merlin - TTS (Text-to-Speech)

### Purpose
Synthesizes speech from text with phonetic markers.

### API

**Health Check:**
```http
GET http://localhost:8002/health
```

**Speech Synthesis:**
```http
POST http://localhost:8002/synthesize
Content-Type: application/json

{
  "text": "m<ees p<ee+ti k<in]ni",
  "voice": "efm_l",
  "speed": 1.0,
  "pitch": 0,
  "returnBase64": true
}
```

**Response:**
```json
{
  "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "format": "wav"
}
```

### Parameters

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `text` | string | - | required | Text with phonetic markers |
| `voice` | string | `efm_s`, `efm_l` | `efm_l` | Voice model |
| `speed` | float | 0.5 - 2.0 | 1.0 | Speech rate |
| `pitch` | int | -500 - +500 | 0 | Pitch shift (Hz) |
| `returnBase64` | boolean | true/false | true | Return format |

### Voice Models

- **efm_s** - for individual words (short)
- **efm_l** - for sentences (long)

### Examples

```javascript
// Basic synthesis
const response = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'tere',
    voice: 'efm_s',
    returnBase64: true
  })
});
const { audio } = await response.json();
const audioBuffer = Buffer.from(audio, 'base64');
fs.writeFileSync('output.wav', audioBuffer);
```

```javascript
// With parameter modifications (slower and lower)
const response = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'm<ees p<ee+ti k<in]ni',
    voice: 'efm_l',
    speed: 0.8,    // slower
    pitch: -80,    // lower
    returnBase64: true
  })
});
```

```bash
# curl - save WAV file
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"tere","voice":"efm_s","returnBase64":false}' \
  --output output.wav
```

### Error Codes
- `200` - success
- `400` - invalid parameters
- `500` - synthesis error or timeout (30 sec)

---

## 3. End-to-End Pipeline

### Complete Synthesis Process

```javascript
// Step 1: Text analysis
const analysisResponse = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Mees peeti kinni' })
});
const { stressedText } = await analysisResponse.json();
console.log(stressedText); // "m<ees p<ee+ti k<in]ni"

// Step 2: Speech synthesis
const synthesisResponse = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: stressedText,
    voice: 'efm_l',
    speed: 1.0,
    returnBase64: true
  })
});
const { audio } = await synthesisResponse.json();

// Step 3: Save
const audioBuffer = Buffer.from(audio, 'base64');
fs.writeFileSync('output.wav', audioBuffer);
```

### Diagram

```
Estonian text → [Vabamorf] → Marked text → [Merlin] → WAV audio
```

---

## 4. Docker Management

### Starting Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f vabamorf
docker-compose logs -f merlin

# Stop
docker-compose down
```

### Port Configuration

| Service | External Port | Internal Port | Container |
|---------|---------------|---------------|-----------|
| Vabamorf | 8001 | 8000 | eki-vabamorf |
| Merlin | 8002 | 8000 | eki-merlin |

---

## 5. Performance

| Operation | Time |
|-----------|------|
| Vabamorf (word) | ~50-100 ms |
| Vabamorf (sentence) | ~100-200 ms |
| Merlin (word) | ~1-3 sec |
| Merlin (sentence) | ~3-10 sec |
| End-to-end | ~5-12 sec |

---

## 6. Testing

```bash
# Run integration tests
npm test
```

Tests in `__tests__/integration.test.ts` verify:
- Health checks
- Text analysis (simple and complex)
- Synthesis with different models
- Speed and pitch parameters
- End-to-end pipeline
- Error handling

---

## 7. Troubleshooting

**Container won't start:**
```bash
# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

**Synthesis timeout:**
```bash
# Increase timeout in docker-compose.yml
# TIMEOUT=120 for Merlin
docker-compose restart merlin
```

**Check service health:**
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
```

---

## References

- **Vabamorf**: https://github.com/Filosoft/vabamorf
- **Merlin TTS**: https://github.com/CSTR-Edinburgh/merlin
- **Working Documentation (Sprints)**: `sprints/`

---

**Version**: 1.0.0 | **Sprint**: 01 | **Date**: 20.10.2025

