# Audit: Integratsioonipartner (eKool / Moodle / Google Classroom)

**Vaatenurk:** Haridusplatvormi arendaja, kes tahab integreerida Hääldusabilist oma süsteemiga: API, LTI, embed, andmevahetus.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — API struktuur, autentimise mehhanism, andmeformaadid, integratsioonivõimalused.

---

## Kasutajaprofiil

Tarmo, 34-aastane, eKooli arendaja. Tahab integreerida Hääldusabilise eKooli platvormiga, et õpetajad saaksid kodutöid määrata otse eKoolis ja õpilaste tulemused kajastuksid eKooli päevikus.

---

## Integratsioonipartneri teekond

### Etapp 1: API ja integratsioonivõimalused

- [ ] **1.1. Puudub avalik API dokumentatsioon** — pole Swagger/OpenAPI spetsifikatsiooni, pole API reference'i. Partnerarendaja peab koodi lugema, et mõista API endpointe.
  **Mõju:** Kõrge — ilma API dokumentatsioonita pole integratsioon võimalik ilma tihedata koostööta EKI meeskonnaga.

- [ ] **1.2. Puudub LTI (Learning Tools Interoperability)** — LTI 1.3 on haridussektori standard. Võimaldab platvormi embedida Moodlesse, Google Classroomi, eKooli. Pole LTI endpointe ega konfiguratsiooni.
  **Mõju:** Kõrge — LTI puudumine tähendab, et iga integratsioon nõuab kohandatud arendust. Standardne LTI toetaks kümneid haridusplatvorme korraga.

- [ ] **1.3. Puudub OAuth2 scope'idega API ligipääs** — praegune auth on kasutajapõhine (TARA/Google). Pole masin-masin autentimist (client credentials flow), pole API-võtmeid, pole scope'e (nt "read:tasks", "write:synthesis").
  **Mõju:** Kõrge — integratsioonipartner vajab API-ligipääsu ilma kasutaja sessioonita. Praegune süsteem ei toeta seda.

- [ ] **1.4. Puudub webhook'ide süsteem** — pole viisi saada reaalajas teavitusi: "ülesanne loodud", "ülesanne jagatud", "audio sünteesitud". Partner peab poll'ima.
  **Mõju:** Keskmine — webhook'id oleksid vajalikud reaalajas integratsioonide jaoks.

- [x] **1.5. RESTful API struktuur** — backend kasutab REST mustreid: `POST /api/synthesize`, `GET /api/tasks`, `POST /api/tasks`. Standardne ja arusaadav.

- [x] **1.6. JSON andmeformaat** — kõik API vastused on JSON-is. Standardne ja parseritav.

### Etapp 2: Andmevahetus

- [x] **2.1. Ülesande andmemudel on selge** — `Task` sisaldab: id, userId, name, description, entries, createdAt, updatedAt. `TaskEntry` sisaldab: text, stressedText, audioUrl. Selge struktuur.

- [ ] **2.2. Puudub bulk API** — pole endpointi mitme ülesande/kirje korraga loomiseks. Integratsioonipartner peab igaühe eraldi saatma. 100 ülesande importimine nõuab 100 API päringut.
  **Mõju:** Keskmine — batch operatsioonid on olulised suuremahuliste integratsioonide jaoks.

- [ ] **2.3. Puudub xAPI / cmi5 tugi** — haridussektori andmevahetusstandardid (Experience API) puuduvad. Pole võimalik saata õpitulemusi (nt "õpilane kuulas 10 lauset") LRS-i (Learning Record Store).
  **Mõju:** Keskmine — xAPI on kasvav standard, aga pole veel universaalselt nõutud.

- [ ] **2.4. Puudub kasutajate sidumine** — integratsioonipartner ei saa siduda eKooli kasutajat Hääldusabilise kasutajaga. Pole external user ID toetust. Pole federated identity'd.
  **Mõju:** Kõrge — ilma kasutajate sidumiseta pole võimalik progressi jälgida platvormiüleselt.

### Etapp 3: Embed ja iframe

- [ ] **3.1. Puudub embed-režiim** — pole `/embed/synthesis` ega `/embed/task/:id` endpointi, mis renderdaks platvormi ilma päise, jaluse ja navigatsioonita. iframe'i embedimine näitab kogu lehte koos navigatsiooniga.
  **Mõju:** Keskmine — embed-režiim on tavaline integratsioonimuster. Ilma selleta on iframe'i kasutamine ebapraktiline.

- [ ] **3.2. CSP frame-ancestors pole konfigureeritud** — CSP meta-tag ei toeta `frame-ancestors` direktiivi. HTTP header oleks vajalik, et lubada iframe'ist laadimist ainult lubatud domeenidelt.
  **Mõju:** Keskmine — turvalisuse ja integratsiooniga seotud: kas platvorm lubab iframe embedimist?

- [ ] **3.3. Puudub postMessage API** — pole `window.postMessage` põhist suhtlust iframe'i ja emarakenduse vahel. Partner ei saa saata sündmusi (nt "ülesanne tehtud") emarakendusele.
  **Mõju:** Keskmine — postMessage on standardne iframe suhtluse muster.

### Etapp 4: Sünteesi API partnerile

- [x] **4.1. Sünteesi API on selge** — `POST /api/synthesize` võtab: text, voice, speed, pitch. Tagastab: status, cacheKey, audioUrl. Lihtne ja funktsionaalne.

- [x] **4.2. Cache-põhine arhitektuur** — sama tekst + parameetrid = sama cacheKey. Partner saab cache'da audioUrl-e ja vähendada päringuid.

- [ ] **4.3. Puudub batch-süntees** — partner ei saa saata 100 lauset korraga sünteesimiseks. Iga lause nõuab eraldi päringut + pollimist.
  **Mõju:** Keskmine — batch-süntees oleks oluline suuremahuliste integratsioonide jaoks.

- [ ] **4.4. Puudub rate-limit info päises** — API vastus ei sisalda `X-RateLimit-Remaining` ega `X-RateLimit-Reset` päiseid. Partner ei tea, kui palju päringuid ta veel teha saab.
  **Mõju:** Keskmine — rate-limit info on API best practice. Ilma selleta peab partner arvama.

### Etapp 5: Dokumentatsioon ja tugi

- [ ] **5.1. Puudub arendaja portaal** — pole developer.häälduabiline.ee tüüpi portaali: API docs, sandbox, API-võtmete haldamine, kasutusstatistika.
  **Mõju:** Kõrge — ilma arendaja portaalita on integratsioon keeruline ja aeglane.

- [ ] **5.2. Puudub sandbox/test keskkond** — partner peab testima tootmiskeskkonnas. Pole eraldi test-API-d, kus saab proovida ilma tootmisandmeid mõjutamata.
  **Mõju:** Keskmine — sandbox on standardne praktika API pakkujatele.

- [ ] **5.3. Puudub SDK** — pole eelehitatud teeke (npm, Python, Java) API kasutamiseks. Partner peab HTTP päringuid ise ehitama.
  **Mõju:** Madal — MVP jaoks pole SDK vajalik. API on piisavalt lihtne otse kasutamiseks.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| API ja integratsioon | 6 | 2 | 4 |
| Andmevahetus | 4 | 1 | 3 |
| Embed ja iframe | 3 | 0 | 3 |
| Sünteesi API | 4 | 2 | 2 |
| Dokumentatsioon ja tugi | 3 | 0 | 3 |
| **Kokku** | **20** | **5** | **15** |

## Top-5 probleemid (mõju integratsioonipartnerile)

1. **Puudub LTI tugi** (#1.2) — haridussektori standard, toetaks kümneid platvorme korraga
2. **Puudub avalik API dokumentatsioon** (#1.1) — integratsioon on võimatu ilma dokumentatsioonita
3. **Puudub masin-masin autentimine** (#1.3) — partner vajab API-ligipääsu ilma kasutaja sessioonita
4. **Puudub kasutajate sidumine** (#2.4) — platformideülene progressi jälgimine on võimatu
5. **Puudub arendaja portaal** (#5.1) — integratsioon on aeglane ja keeruline

## Mis on hästi tehtud

- RESTful API struktuur — standardne ja arusaadav
- JSON andmeformaat
- Selge ülesande andmemudel
- Cache-põhine sünteesi arhitektuur — vähendab koormust
- Sünteesi API lihtne liides: text → audioUrl
