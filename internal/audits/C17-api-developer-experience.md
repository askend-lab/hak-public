# Checklist: API tarbija / Arendajakogemus (Developer Experience)

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — API endpointid, dokumentatsioon, veateated, SDK, sandbox, versioonihaldus.

---

## API dokumentatsioon

- [ ] **1.1. Puudub OpenAPI / Swagger spetsifikatsioon** — pole `openapi.yaml` ega `swagger.json` faili. API tarbija peab koodi lugema, et mõista endpointe.
  **Soovitus:** Loo OpenAPI 3.0 spec: `docs/api/openapi.yaml`.
- [ ] **1.2. Puudub API README** — pole `packages/merlin-api/README.md` ega `packages/simplestore/README.md` koos API kirjeldusega.
  **Soovitus:** Lisa README iga API paketile: endpointid, autentimine, näited.
- [ ] **1.3. Puudub interaktiivne API dokumentatsioon** — pole Swagger UI'd, Redoc'i ega Postman collection'it. Arendaja ei saa API-t brauseris proovida.
  **Soovitus:** Lisa Swagger UI (`/api/docs`) või ekspordi Postman collection.
- [ ] **1.4. Puuduvad koodinäited** — pole näiteid eri keeltes (JavaScript, Python, cURL). API tarbija peab ise välja mõtlema, kuidas päringuid teha.
  **Soovitus:** Lisa näited `docs/api/examples/` kataloogi.

## API disain

- [x] **2.1. REST-konventsioonid** — `POST /api/synthesize`, `GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks/:id`. Standardne REST.
- [x] **2.2. JSON request/response** — kõik API vastused on JSON formaadis.
- [ ] **2.3. Puudub API versioonihaldus** — pole `/api/v1/` prefiksit. Kui API muutub, pole tagasiühilduvuse garantiid.
  **Soovitus:** Lisa versiooniprefiksi: `/api/v1/synthesize`. Või kasuta header-põhist versioneerimist.
- [ ] **2.4. HTTP staatuskoodid pole järjepidevad** — `synthesize` tagastab `200 OK` (cache hit) ja `202 Accepted` (processing). Hea. Aga kas kõik endpointid kasutavad korrektseid koode?
  **Soovitus:** Dokumenteeri iga endpoindi staatuskoodid ja nende tähendus.
- [x] **2.5. Sünteesi pipeline on selge** — `POST /synthesize` → `202 Accepted` + `cacheKey` → polling `GET /synthesize/status/:cacheKey` → `200 OK` + `audioUrl`. Loogiline voog.
- [ ] **2.6. Puudub WebSocket alternatiiv** — sünteesi tulemust peab polliga kontrollima. WebSocket annaks reaalajas teavituse.
  **Soovitus:** Kaaluda WebSocket'i tulevikus pikemata sünteeside jaoks.

## Autentimine

- [x] **3.1. Cognito JWT autentimine** — standardne OAuth 2.0 + JWT. API tarbija saab kasutada olemasolevaid JWT teeke.
- [ ] **3.2. Puudub API key autentimine** — kolmanda osapoole integratsioonidele pole API key süsteemi. Ainult Cognito JWT.
  **Soovitus:** Lisa API key autentimine masina-masina integratsioonideks.
- [ ] **3.3. Puudub OAuth scope'ide süsteem** — kõik autenditud kasutajad saavad kõike teha. Pole `read:tasks`, `write:tasks`, `synthesize` scope'e.
  **Soovitus:** Lisa scope'id tulevikus, kui API avatakse kolmandatele osapooltele.

## Veateated

- [ ] **4.1. Veateated pole standardiseeritud** — mõned on `{ "message": "..." }`, mõned on `{ "error": "..." }`. Pole RFC 7807 (Problem Details) formaati.
  **Soovitus:** Kasuta ühte vigade formaati:
  ```json
  { "type": "error", "code": "INVALID_TEXT", "message": "...", "details": {} }
  ```
- [ ] **4.2. Veateated on inglise keeles** — "Missing or invalid text field". API tarbija peab need ise tõlkima.
  **Soovitus:** Tagasta veakood (`INVALID_TEXT`) ja inimloetav teade. Tarbija kasutab veakoodi lokaliseerimiseks.
- [ ] **4.3. Rate limit vastused pole informatiivsed** — throttling korral kas tagastatakse `429 Too Many Requests` koos `Retry-After` header'iga?
  **Soovitus:** Lisa `429` vastus koos `Retry-After` ja `X-RateLimit-Remaining` header'itega.

## SDK ja tööriistad

- [ ] **5.1. Puudub JavaScript/TypeScript SDK** — pole `@hak/client` npm paketti. Iga tarbija peab ise HTTP kliendi kirjutama.
  **Soovitus:** Loo lihtne SDK: `const hak = new HakClient({ apiKey }); const audio = await hak.synthesize("tere");`
- [ ] **5.2. Puudub Python SDK** — Python on populaarne keeleõppe ja NLP kogukondades.
  **Soovitus:** Loo `pip install hak-client` pakett.
- [ ] **5.3. Puudub CLI tööriist** — pole käsureatööriista: `hak synthesize "tere" --output tere.wav`.
  **Soovitus:** Loo CLI tööriist arendajatele ja skriptimiseks.

## Sandbox ja testimine

- [ ] **6.1. Puudub sandbox keskkond** — pole eraldi testkeskkonda API tarbijatele. Dev keskkond on sisemiseks arenduseks.
  **Soovitus:** Lisa avalik sandbox endpoind piiratud rate limit'iga.
- [ ] **6.2. Puudub API mocking** — pole mock-serverit, mida tarbija saaks kasutada ilma päris API-ta.
  **Soovitus:** Lisa mock server (MSW, Prism) või Postman mock.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Dokumentatsioon | 4 | 0 | 4 |
| API disain | 6 | 3 | 3 |
| Autentimine | 3 | 1 | 2 |
| Veateated | 3 | 0 | 3 |
| SDK ja tööriistad | 3 | 0 | 3 |
| Sandbox | 2 | 0 | 2 |
| **Kokku** | **21** | **4** | **17** |

## Prioriteedid

1. **P0:** OpenAPI spetsifikatsioon — API dokumentatsiooni alus (#1.1)
2. **P1:** Vigade formaadi standardiseerimine — järjepidev DX (#4.1)
3. **P1:** API versioonihaldus — tagasiühilduvuse garantii (#2.3)
4. **P2:** JavaScript SDK — lihtne integratsioon (#5.1)
5. **P2:** Rate limit header'id — läbipaistev throttling (#4.3)
