# Audit: Jõudlusinsener (Performance Engineer)

**Vaatenurk:** Jõudlusinsener, kes hindab rakenduse kiirust, mälukasutust, bundle suurust, renderdamise efektiivsust ja API latentsust.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — React renderdamine, memo-iseerimine, bundle splitting, API polling, mälu lekked, cache strateegia.

---

## Kasutajaprofiil

Siim, 31-aastane, jõudlusinsener, kes optimeerib veebirakendusi. Analüüsib: renderdamise kiirust, re-render'eid, mälu kasutamist, bundle suurust ja API efektiivsust.

---

## Jõudlusanalüüs

### Etapp 1: React renderdamine

- [x] **1.1. React.memo kasutusel** — `SentenceSynthesisItem` on `React.memo()` abil memoistatud. Vähendab tarbetuid re-renderdamisi, kui lause olek ei muutu.

- [x] **1.2. useCallback ja useMemo** — `useSynthesis` tagastab `useMemo` mähitud objekti. Hookid kasutavad `useCallback` sündmuskäsitlejatele. Hea praktika.

- [ ] **1.3. useSynthesis useMemo sõltuvuste loend on pikk** — `useSynthesis` hook'i `useMemo` sõltuvuste loendis on 18 elementi. Iga muutus mis tahes sõltuvuses loob uue objekti. Praktikas tähendab see, et peaaegu iga interaktsioon loob uue `synthesis` objekti.
  **Mõju:** Keskmine — pikk sõltuvuste loend vähendab memo efektiivsust. Kuid React on piisavalt kiire, et see pole tõenäoliselt tajutav probleem.

- [ ] **1.4. setSentences põhjustab kogu nimekirja re-renderdamist** — `useSentenceState` kasutab ühte `sentences` state massiivi. Iga muutus ühes lauses (nt ühe lause `currentInput` muutus) loob uue massiivi, mis põhjustab kõigi lausete re-renderdamist. `React.memo` peaks seda leevendama, aga ainult kui props ei muutu.
  **Mõju:** Madal — 10–20 lause korral pole probleem. 100+ lause korral võib muutuda tajutavaks.

- [ ] **1.5. handleKeyDown luuakse igal renderdusel uuesti** — `useSynthesis` hook'is on `handleKeyDown` defineeritud `useCallback` abil, aga see sõltub `tagEditor.handleKeyDown`-ist ja `synthesizeWithText/synthesizeAndPlay`-st. Kui need muutuvad, luuakse uus funktsioon.
  **Mõju:** Madal — väike jõudluskulu, aga pole tajutav.

### Etapp 2: Mälu haldamine

- [x] **2.1. Audio cleanup on olemas** — `useSentenceActions` ja `usePlaylistControl` peatavad ja puhastavad audio objektid (`audio.pause(); audio.src = ""`). Pole mälu lekkeid audio elementidest.

- [ ] **2.2. localStorage salvestamine igal muutusel** — `useSentenceState` salvestab localStorage'sse igal lausete oleku muutusel. See on sünkroonne operatsioon, mis blokeerib peamist lõime. Suure lausete arvu korral (50+) võib `JSON.stringify` olla aeglane.
  **Mõju:** Madal — `sanitizeForStorage` eemaldab audioUrl ja muud mahukad väljad. Aga debounce oleks parem.

- [ ] **2.3. Audio URL-id akumuleeruvad** — iga sünteesitud lause salvestab `audioUrl` olekusse. Kui kasutaja sünteesib 100 lauset, on mälus 100 blob URL-i. Pole automaatset puhastamist (`URL.revokeObjectURL`).
  **Mõju:** Madal — blob URL-id on väikesed viited, mitte failid ise. Aga pikaajalise kasutamise korral võib akumuleeruda.

- [x] **2.4. useRef audio viidete puhastamine** — `PronunciationVariants` ja `SentencePhoneticPanel` kasutavad `audioRef.current = null` pärast peatamist. Hea.

### Etapp 3: Bundle suurus ja laadimine

- [x] **3.1. Lazy loading** — `SpecsRoute`, `Dashboard` ja mõned muud komponendid on `React.lazy()` abil laetud. Vähendab esmast bundle'i suurust.

- [ ] **3.2. JSZip on suur sõltuvus** — `downloadTaskAsZip` impordib JSZip'i. JSZip on ~100KB (minified). Kui see on põhi-bundle'is (mitte lazy loaded), suurendab see iga kasutaja esmast laadimist, kuigi enamik kasutajaid ei kasuta ZIP eksporti.
  **Mõju:** Keskmine — JSZip peaks olema dynamic import: `const JSZip = (await import('jszip')).default`.

- [ ] **3.3. Sentry SDK suurus** — Sentry SDK on ~30–50KB (minified+gzip). Laetakse iga kasutaja jaoks, isegi kui vigu pole. Tree-shaking peaks vähendama, aga peaks kontrollima.
  **Mõju:** Madal — Sentry on vajalik monitooringuks. Kuid `Sentry.init` peaks olema lazy, kui võimalik.

- [ ] **3.4. Google Fonts laadimine** — välised fondid lisavad latentsust (DNS lookup + download). Peaks kasutama `font-display: swap` ja preload'i.
  **Mõju:** Madal — standardne optimeerimise võimalus.

### Etapp 4: API efektiivsus

- [x] **4.1. Eksponentsiaalne backoff** — `pollForAudio` kasutab eksponentsiaalset backoff'i. Vähendab serveri koormust ja võrgu liiklust.

- [x] **4.2. Cache-põhine sünteesi arhitektuur** — sama tekst + parameetrid = sama cacheKey. Kordussünteesid teenindatakse S3 cache'st. Vähendab TTS koormust.

- [ ] **4.3. Puudub päringute deduplikeerimine** — kui kasutaja vajutab Play 2 korda kiiresti, saadetakse 2 identset päringut. Puudub inflight request deduplication (nt `AbortController` eelmise päringu tühistamiseks).
  **Mõju:** Keskmine — topeltpäringud raiskavad ressursse. `AbortController` oleks lihtne lahendus.

- [ ] **4.4. Polling vs WebSocket** — `pollForAudio` kasutab HTTP polling'ut (intervall + backoff) sünteesi tulemuse ootamiseks. WebSocket oleks efektiivsem: server saadab teate, kui audio on valmis. Pole tulevase ühenduse hoidmist.
  **Mõju:** Madal — polling töötab ja on lihtsam implementeerida. WebSocket oleks efektiivsem suure koormuse korral, aga lisab keerukust.

- [ ] **4.5. Ülesannete nimekiri laetakse täielikult** — `getUserTasks` laeb kõik kasutaja ülesanded korraga. 100+ ülesandega kasutajal on see aeglane. Pole pagineerimist ega virtuaalset kerimist.
  **Mõju:** Keskmine — pagineerimise puudumine muutub probleemiks suuremahulise kasutuse korral.

### Etapp 5: CSS jõudlus

- [x] **5.1. SCSS token'id** — design token'id CSS custom property'tena (`:root`). Efektiivne: üks muutuja, mitu kasutust.

- [ ] **5.2. Animations puuduvad → repaint on minimaalne** — animatsioonide puudumine tähendab vähem repaint'e ja reflow'e. See on kogemata jõudluseelis, kuigi UX kannatab.
  **Mõju:** — positiivne jõudlusele, negatiivne UX-ile. Neutraalne.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| React renderdamine | 5 | 2 | 3 |
| Mälu haldamine | 4 | 2 | 2 |
| Bundle suurus | 4 | 1 | 3 |
| API efektiivsus | 5 | 2 | 3 |
| CSS jõudlus | 2 | 1 | 1 |
| **Kokku** | **20** | **8** | **12** |

## Top-5 probleemid (mõju jõudlusele)

1. **JSZip on põhi-bundle'is** (#3.2) — ~100KB, mida enamik kasutajaid ei vaja; peaks olema dynamic import
2. **Puudub päringute deduplikeerimine** (#4.3) — topelt-Play tekitab topeltpäringuid
3. **Ülesannete nimekiri pole pagineeritud** (#4.5) — suuremahulise kasutuse korral aeglane
4. **localStorage salvestamine igal muutusel** (#2.2) — sünkroonne, blokeeriv, debounce puudub
5. **useSynthesis memo sõltuvuste loend** (#1.3) — 18 sõltuvust vähendab memo efektiivsust

## Mis on hästi tehtud

- React.memo SentenceSynthesisItem'il — vähendab tarbetuid re-renderdamisi
- useCallback ja useMemo — hea praktika hookides
- Audio cleanup — pole mälu lekkeid
- Eksponentsiaalne backoff — serveri kaitse
- Cache-põhine sünteesi arhitektuur
- Lazy loading komponentidele
- CSS custom property'd — efektiivsed token'id
