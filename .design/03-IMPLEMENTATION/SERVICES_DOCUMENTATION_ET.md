# Vabamorf ja Merlin teenuste dokumentatsioon

## Ülevaade

Projekt kasutab kahte teenust eesti kõne sünteesiks:
1. **Vabamorf** (port 8001) - lisab tekstile foneetilised märgised
2. **Merlin** (port 8002) - sünteesib kõne märgistatud tekstist

---

## 1. Vabamorf - Morfoloogiline analüsaator

### Otstarve
Analüüsib eesti teksti ja lisab foneetilised märgised.

#### Foneetilised sümbolid:
- `<` - kolmas välde (kolmemoreline silp), pannakse täishäälikule ette
- `?` - rõhuline silp, pannakse täishäälikule ette (näidatakse ainult kui ettearvamatu)
- `]` - palatalisatsioon, pannakse palataliseeritud kaashäälikule järele
- `~` - selge eraldus *n* ja *k* vahel klastris *nk* (ainult sõnades *soonkond* ja *tosinkond*)

#### Piirid:
- `+` - morfeemide piir (tüvi+lõpp)
- `_` - liitsõna piir
- `=` - tühik sõnade vahel mitmeosalistes üksustes
- `[` - eraldab käändelõpu tüvest

#### Abisümbolid:
- `'` - apostroof võõrnimedes lõpu eraldamiseks (nt *Newcastle'i*)
- `()` - kahtlased/harva kasutatavad vormid
- `&` - paralleelsed vormivariandid
- `#` - semantiline põhivorm

### API

**Tervise kontroll:**
```http
GET http://localhost:8001/health
```

**Teksti analüüs:**
```http
POST http://localhost:8001/analyze
Content-Type: application/json

{
  "text": "Mees peeti kinni"
}
```

**Vastus:**
```json
{
  "stressedText": "m<ees p<ee+ti k<in]ni",
  "originalText": "Mees peeti kinni"
}
```

### Parameetrid

| Parameeter | Tüüp | Kohustuslik | Kirjeldus |
|------------|------|-------------|-----------|
| `text` | string | Jah | Eesti tekst (mitte tühi, maks 1 MB) |

### Näited

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

### Veakoodid
- `200` - edukas
- `400` - vale JSON või tühi text
- `413` - päring üle 1 MB
- `500` - töötlemise viga

---

## 2. Merlin - TTS (Text-to-Speech)

### Otstarve
Sünteesib kõne foneetiliste märgistega tekstist.

### API

**Tervise kontroll:**
```http
GET http://localhost:8002/health
```

**Kõne süntees:**
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

**Vastus:**
```json
{
  "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "format": "wav"
}
```

### Parameetrid

| Parameeter | Tüüp | Väärtused | Vaikimisi | Kirjeldus |
|------------|------|-----------|-----------|-----------|
| `text` | string | - | kohustuslik | Tekst foneetiliste märgistega |
| `voice` | string | `efm_s`, `efm_l` | `efm_l` | Häälmudel |
| `speed` | float | 0.5 - 2.0 | 1.0 | Kõne kiirus |
| `pitch` | int | -500 - +500 | 0 | Tooni muutus (Hz) |
| `returnBase64` | boolean | true/false | true | Tagastusformaat |

### Häälemudelid

- **efm_s** - üksikute sõnade jaoks (lühike)
- **efm_l** - lausete jaoks (pikk)

### Näited

```javascript
// Põhiline süntees
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
// Parameetrite muutmisega (aeglasem ja madalam)
const response = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'm<ees p<ee+ti k<in]ni',
    voice: 'efm_l',
    speed: 0.8,    // aeglasem
    pitch: -80,    // madalam
    returnBase64: true
  })
});
```

```bash
# curl - salvesta WAV fail
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"tere","voice":"efm_s","returnBase64":false}' \
  --output output.wav
```

### Veakoodid
- `200` - edukas
- `400` - valed parameetrid
- `500` - sünteesi viga või timeout (30 sek)

---

## 3. Täielik töövoog

### Täielik sünteesi protsess

```javascript
// Samm 1: Teksti analüüs
const analysisResponse = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Mees peeti kinni' })
});
const { stressedText } = await analysisResponse.json();
console.log(stressedText); // "m<ees p<ee+ti k<in]ni"

// Samm 2: Kõne süntees
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

// Samm 3: Salvestamine
const audioBuffer = Buffer.from(audio, 'base64');
fs.writeFileSync('output.wav', audioBuffer);
```

### Diagramm

```
Eesti tekst → [Vabamorf] → Märgistatud tekst → [Merlin] → WAV audio
```

---

## 4. Docker haldus

### Teenuste käivitamine

```bash
# Käivita kõik teenused
docker-compose up -d

# Kontrolli staatust
docker-compose ps

# Logid
docker-compose logs -f vabamorf
docker-compose logs -f merlin

# Peata
docker-compose down
```

### Portide konfiguratsioon

| Teenus | Väline port | Sisemine port | Konteiner |
|--------|-------------|---------------|-----------|
| Vabamorf | 8001 | 8000 | eki-vabamorf |
| Merlin | 8002 | 8000 | eki-merlin |

---

## 5. Jõudlus

| Operatsioon | Aeg |
|-------------|-----|
| Vabamorf (sõna) | ~50-100 ms |
| Vabamorf (lause) | ~100-200 ms |
| Merlin (sõna) | ~1-3 sek |
| Merlin (lause) | ~3-10 sek |
| Täielik töövoog | ~5-12 sek |

---

## 6. Testimine

```bash
# Integratsioonitestide käivitamine
npm test
```

Testid failis `__tests__/integration.test.ts` kontrollivad:
- Tervise kontrolle
- Teksti analüüsi (lihtne ja keeruline)
- Sünteesi erinevate mudelitega
- Speed ja pitch parameetreid
- Täielikku töövoogu
- Vigade töötlemist

---

## 7. Probleemide lahendamine

**Konteiner ei käivitu:**
```bash
# Ehita uuesti
docker-compose build --no-cache
docker-compose up -d
```

**Timeout sünteesi ajal:**
```bash
# Suurenda timeout docker-compose.yml failis
# TIMEOUT=120 Merlin jaoks
docker-compose restart merlin
```

**Kontrolli teenuste tervist:**
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
```

---

## Viited

- **Vabamorf**: https://github.com/Filosoft/vabamorf
- **Merlin TTS**: https://github.com/CSTR-Edinburgh/merlin
- **Tööline dokumentatsioon (sprintid)**: `sprints/`

---

**Versioon**: 1.0.0 | **Sprint**: 01 | **Kuupäev**: 20.10.2025
