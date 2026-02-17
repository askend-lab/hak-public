# Audit: QA testija (Kvaliteedi tagamine)

**Vaatenurk:** QA insener, kes hindab testimise katvust, äärmusjuhtumeid, regressiooniriske ja automatiseerimise võimalusi.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — testifailid, äärmusjuhtumid, veakäsitlus, regressiooniriskid, testimise infrastruktuur.

---

## Kasutajaprofiil

Rainer, 29-aastane, QA insener, kes vastutab platvormi kvaliteedi eest. Peab tagama, et iga release on stabiilne ja uued muudatused ei riku olemasolevat funktsionaalsust.

---

## QA analüüs

### Etapp 1: Testimise infrastruktuur

- [x] **1.1. Vitest on testiraamistik** — kiire, kaasaegne testiraamistik. React Testing Library integratsiooniga. Hea valik.

- [x] **1.2. jest-axe ligipääsetavuse testid** — `a11y-helpers.ts` pakub WCAG 2.1 AA kontrolli. Infrastruktuur on olemas.

- [x] **1.3. Pre-commit hookid** — testid jooksevad enne commitimist. 3130/3132 testi läbivad. Kiire tagasiside arendajale.

- [ ] **1.4. 2 testi ebaõnnestuvad** — 3130/3132 testi läbivad, 2 ebaõnnestuvad. Need tuleb uurida ja parandada. Ebaõnnestuvad testid CI-s on ohtlikud — arendajad harjuvad neid ignoreerima.
  **Mõju:** Keskmine — 2 ebaõnnestuvat testi 3132-st on madal protsent, aga peaks olema 0.

- [ ] **1.5. E2E testid puuduvad** — Playwright on mainitud hookides (`PLAYWRIGHT PASS`), aga pole selge, kas on tegelikke E2E teste. Kasutaja töövoogude automatiseeritud testimine puudub.
  **Mõju:** Kõrge — ühikutestid ei kata kasutaja töövoogusid. E2E testid on hädavajalikud: "kasutaja sisestab lause → kuulab → loob ülesande → jagab".

- [ ] **1.6. Testide katvuse aruanne puudub** — pole `vitest --coverage` konfiguratsiooni. QA ei tea, millised failid ja harud on testidega kaetud.
  **Mõju:** Keskmine — katvuse aruanne aitab prioriseerida testimist.

### Etapp 2: Äärmusjuhtumid (Edge Cases)

- [ ] **2.1. Tühi sisend** — kasutaja vajutab Enter tühja sisestusväljaga. `handleKeyDown` kontrollib `sentence.currentInput.trim()` ja `sentence.tags.length > 0`. Tühi sisend ei tee midagi. ✅ Käsitletud koodis, aga puudub spetsiifiline test.
  **Mõju:** Madal — käsitletud, aga testida.

- [ ] **2.2. Ülipikk sisend** — kasutaja kleebib 10000 tähemärki. Frontend ei piira, backend piirab 1000 tähemärgiga. Vahepeal kasutaja ei saa veateadet. Puudub frontendi piirang ja veateade.
  **Mõju:** Keskmine — kordab auditi #10 leidu #2.2.

- [ ] **2.3. Erimärgid sisendis** — kasutaja sisestab `<script>alert(1)</script>`, emoji'd 🇪🇪, RTL teksti (araabia), null-byte'e. React escapeerib XSS-i, aga TTS-i käitumine erimärkidega on teadmata.
  **Mõju:** Keskmine — XSS on kaetud, aga TTS-i käitumine erimärkidega vajab testimist.

- [ ] **2.4. Samaaegne interaktsioon** — kasutaja vajutab Play, samal ajal kustutab lause. `handlePlay` alustab sünteesi, `handleRemoveSentence` eemaldab lause. Race condition: audio callback viitab eemaldatud lausele.
  **Mõju:** Keskmine — optimistlik UI ja React state management peaks käsitlema, aga spetsiifiline test puudub.

- [ ] **2.5. Kiire järjestikune Play** — kasutaja vajutab Play 5 korda kiiresti. Iga vajutus käivitab sünteesi päringu. Kas eelmine tühistatakse? `useSynthesisOrchestrator` peaks haldama, aga pole selge.
  **Mõju:** Keskmine — debounce puudub Play-nupul.

- [ ] **2.6. localStorage täis** — `useSentenceState` käsitleb `QuotaExceededError` logimisega, aga ei teavita kasutajat. Andmed ei salvestu, kasutaja ei tea.
  **Mõju:** Madal — harv juhtum, aga käsitletud (logitakse).

### Etapp 3: Veakäsitluse katvus

- [x] **3.1. ErrorBoundary on olemas** — React ErrorBoundary püüab renderdamise vead. Sentry saab vead kätte.

- [x] **3.2. API vead on käsitletud** — `synthesize`, `analyzeText`, `dataService` funktsioonid kasutavad try-catch mustreid. Vead logitakse.

- [ ] **3.3. Veateated pole kasutajasõbralikud** — tehniline veateade (nt "Analysis failed") vs kasutajasõbralik ("Häälduse analüüs ebaõnnestus. Proovige uuesti."). Kasutajale suunatud veateated on ebapiisavad.
  **Mõju:** Keskmine — kordab mitme auditi leidu. QA perspektiivist: iga veaoluk vajab kasutajasõbralikku teadet.

- [ ] **3.4. Võrguühenduse kaotus** — kasutaja kaotab internetiühenduse keskel sünteesi. Pole `navigator.onLine` kontrolli ega offline-teadet. Päring ebaõnnestub vaikselt.
  **Mõju:** Keskmine — offline tuvastus ja teade oleksid kasulikud.

- [ ] **3.5. API rate-limit vastus (429)** — kui backend tagastab 429 (Too Many Requests), frontend ei käsitle seda spetsiifiliselt. Kasutaja ei saa teada, et peab ootama.
  **Mõju:** Madal — harv juhtum, aga peaks olema käsitletud.

### Etapp 4: Regressiooniriskid

- [ ] **4.1. Sünteesi pipeline on keerukas** — Frontend → API Gateway → Lambda → SQS → Worker → S3 → Frontend (polling). Mitu kohta, kus asjad võivad katki minna. Iga muudatus mis tahes kihi peaks käivitama integratsioonitestid.
  **Mõju:** Kõrge — pipeline'i keerukus nõuab integratsiooniteste, mis kataksid kogu voogu.

- [ ] **4.2. State management on hajutatud** — olekut hallatakse mitmes kohas: `useSentenceState` (localStorage), `useTaskCRUD` (API + state), `usePlaylistControl` (audio state), `useInlineTagEditor` (editing state). Olek on sünkroniseerimata nende vahel.
  **Mõju:** Keskmine — hajutatud olekuhaldamine on regressiooni allikas. Iga muudatus ühes hookis võib mõjutada teist.

- [ ] **4.3. CSS muudatused pole testidega kaetud** — pole visuaalseid regressiooniteste (snapshot'e, Percy, Chromatic). CSS muudatus võib rikkuda paigutust ilma et testid seda tuvastaksid.
  **Mõju:** Keskmine — visuaalsed regressioonitestid oleksid väärtuslikud, eriti responsive paigutuse jaoks.

### Etapp 5: Testide kvaliteet

- [x] **5.1. phoneticMarkers testid on põhjalikud** — 100% katvus: kõik funktsioonid, kõik harud, äärmusjuhtumid (null, tühi, mitu märki). Eeskujulik.

- [x] **5.2. useSynthesis.branches testid** — keyboard handling testid: tühik, Enter, Backspace. Selge struktuur.

- [ ] **5.3. Testide nimetamise konventsioon pole ühtlane** — mõned testid kasutavad `*.test.ts`, mõned `*.test.tsx`, mõned `*.branches.test.ts`. Pole selget konventsiooni.
  **Mõju:** Madal — kosmeetiline, aga ühtlane konventsioon aitab navigeerida.

- [ ] **5.4. Mock'ide kasutus pole standardiseeritud** — iga test loob oma mock'id. Puuduvad jagatud testutility'd ja fixture'd (peale a11y-helpers). Palju duplikatsiooni testides.
  **Mõju:** Madal — iga test on iseseisev (hea), aga jagatud mock'id vähendaksid koodi duplikatsiooni.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Testimise infrastruktuur | 6 | 3 | 3 |
| Äärmusjuhtumid | 6 | 0 | 6 |
| Veakäsitluse katvus | 5 | 2 | 3 |
| Regressiooniriskid | 3 | 0 | 3 |
| Testide kvaliteet | 4 | 2 | 2 |
| **Kokku** | **24** | **7** | **17** |

## Top-5 probleemid (mõju kvaliteedile)

1. **E2E testid puuduvad** (#1.5) — kasutaja töövoogude automatiseeritud testimine puudub
2. **Sünteesi pipeline integratsioonitestid** (#4.1) — mitu kihti ilma end-to-end kontrollita
3. **Äärmusjuhtumid pole testitud** (#2.1–2.6) — tühi sisend, pikk sisend, race condition'd
4. **Veateated pole kasutajasõbralikud** (#3.3) — tehniline vs kasutajasõbralik
5. **Visuaalsed regressioonitestid puuduvad** (#4.3) — CSS muudatused pole kaetud

## Mis on hästi tehtud

- Vitest + React Testing Library — kaasaegne testiraamistik
- jest-axe ligipääsetavuse testid
- Pre-commit hookid — kiire tagasiside
- ErrorBoundary ja API veakäsitlus
- phoneticMarkers testid — eeskujulik katvus
- 3130+ testi — suur testide arv
