# Audit: Kogenud kasutaja (Power User)

**Vaatenurk:** Eesti keelt hästi valdav kasutaja, kes kasutab platvormi keeruliste sõnade häälduse kontrollimiseks, morfoloogiliseks analüüsiks ja intensiivseks tööks.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — kogu power-user töövoog: kiire sisestus, klaviatuurikäsud, batch-töötlus, eksport.

---

## Kasutajaprofiil

Mart, 38, tõlkija ja keeletoimetaja. Kasutab Hääldusabilist igapäevaselt, et kontrollida keeruliste sõnade hääldust ja lauserõhku. Töötleb päevas 50–100 lauset. Eelistab klaviatuuri, ei taha hiirt kasutada. Ootab kiiret ja tõhusat töövoolu.

---

## Power User töövoog

### 1. Klaviatuurikäsud ja kiire sisestus

- [x] **1.1. Enter käivitab sünteesi** — `useTagEditor.handleKeyDown` kuulab Enter-klahvi ja käivitab sünteesi automaatselt. Kasutaja saab sisestada teksti ja kuulata ilma hiireklikita.

- [x] **1.2. Tühik loob sõnamärgendi (tag)** — kui sisestusväljal on tekst ja märgendid juba olemas, loob tühik uue märgendi. See võimaldab sõnahaaval sisestust ja kontrolli.

- [x] **1.3. Backspace kustutab viimase märgendi** — tühja sisestusvälja korral eemaldab Backspace viimase sõna ja asetab selle tagasi sisestusväljale. Loogiline ja oodatud käitumine.

- [x] **1.4. Escape tühistab märgendi muutmise** — `useInlineTagEditor.handleEditTagKeyDown` käsitleb Escape-klahvi. Muudatus tühistatakse ilma salvestamata.

- [ ] **1.5. Puuduvad globaalsed klaviatuurikäsud** — pole Ctrl+Enter (esita kõik), Ctrl+S (salvesta ülesandesse), Ctrl+D (laadi alla), Ctrl+N (lisa lause) ega muid kiirklahve. Kogu interaktsioon toimub ühe lause sisestusvälja piires.
  **Mõju:** Kõrge — power user, kes töötleb 50+ lauset päevas, vajab globaalseid kiirklahve tõhususe jaoks. Praegu peab iga toimingu jaoks klõpsama menüüd.

- [ ] **1.6. Pole Tab-navigatsiooni lausete vahel** — Tab-klahv ei liigu järgmisele lauseväljale. Kasutaja peab hiirega klõpsama. `SentenceSynthesisItem` ei halda Tab-sündmust lausete vahel liikumiseks.
  **Mõju:** Kõrge — klaviatuuriga kasutaja ei saa lausete vahel kiiresti liikuda.

- [ ] **1.7. Pole kiirklahvi mängimise peatamiseks** — kui heli mängib, pole kiirklahvi (nt Escape või tühik) selle peatamiseks. Peab klõpsama Play-nuppu uuesti.
  **Mõju:** Keskmine — tavaline ootus meediarakendustes on tühiku-klahv pause jaoks.

### 2. Batch-töötlus ja tõhusus

- [ ] **2.1. Pole mitme lause korraga kleepimist** — kui kasutaja kleebib pikka teksti (nt 5 lauset punktidega eraldatult), läheb kõik ühte välja. Automaatne jagamine puudub. `handleTextChange` ei parsi teksti lauseteks.
  **Mõju:** Kõrge — tõlkija, kes töötleb dokumente, peab iga lause käsitsi sisestama.

- [ ] **2.2. Pole "Esita järjest" koos automaatse peatumisega** — `handlePlayAll` mängib kõik laused järjest ilma pausideta. Pole võimalust seadistada pausi lausete vahel (nt 2 sekundit), mis oleks kasulik häälduse õppimiseks.
  **Mõju:** Madal — MVP jaoks piisav, aga power user tahaks seadistatavat.

- [ ] **2.3. Pole ühe klikiga "kustuta kõik laused"** — lauset saab kustutada ainult ühekaupa menüüst "Eemalda". 20 lause kustutamine nõuab 20 × (menüü avamine → Eemalda). `handleClearSentence` tühjendab teksti, aga ei eemalda lauset.
  **Mõju:** Keskmine — "Tühjenda kõik" nupp oleks kasulik uue sessiooni alustamiseks.

- [x] **2.4. Lausete lohistamine ümberjärjestamiseks** — drag-and-drop töötab. Power user saab laused soovitud järjekorda seada.

- [ ] **2.5. Pole lausete valimist (multi-select)** — ei saa valida mitut lauset korraga (Ctrl+klikk / Shift+klikk) ja siis teha hulgioperatsioone (kustuta, lisa ülesandesse, ekspordi).
  **Mõju:** Keskmine — tavaline desktop rakenduse muster, mis siin puudub.

### 3. Märgendite (tag) haldus

- [x] **3.1. Sõnamärgendi muutmine kohapeal** — `useInlineTagEditor` võimaldab sõna muuta otse lauses. Enter kinnitab, tühik kinnitab, Escape tühistab. Hea interaktsioonimuster.

- [x] **3.2. Sõnamärgendi kustutamine** — märgendi menüüst "Kustuta sõna". Kiire viis liigsete sõnade eemaldamiseks.

- [x] **3.3. Variantide valimine märgendi menüüst** — "Vali sõna häälduskuju" avab variantide paneeli. Power user saab kiiresti kontrollida erinevaid hääldusi.

- [ ] **3.4. Märgendeid ei saa klaviatuuriga valida** — sõnal klõpsamine avab variantide paneeli, aga puudub keyboard shortcut (nt Tab sõnade vahel, Enter avab variandid). `TagsInput` ja `TagsList` kasutavad ainult onClick.
  **Mõju:** Keskmine — klaviatuurikasutaja ei saa märgendeid ilma hiireta uurida.

- [ ] **3.5. Häälduskuju (phonetic form) muutmine on mitme sammuga** — "Uuri häälduskuju" → avab paneeli → muuda → rakenda. Pole kiiret viisi foneetilise kuju otse sisestamiseks (nt `sõna[hääldus]` süntaks sisestusväljal).
  **Mõju:** Madal — erifunktsioon, mitme sammuga protsess on arusaadav.

### 4. Otsing ja navigatsioon

- [ ] **4.1. Pole globaalset otsingut** — kasutaja ei saa otsida oma lausetest ega ülesannetest. Synthesisi lehel pole otsingut; ülesannete lehel pole otsingut (ainult AddToTaskDropdown sisaldab otsingut).
  **Mõju:** Kõrge — power user 100+ lausega vajab otsingut.

- [ ] **4.2. Pole URL-põhist navigatsiooni lauseteni** — süntees ei kasuta URL parameetreid. Lehekülge ei saa jagada kolleegiga ("vaata minu lauset #5"). Ülesannete lehel on `/tasks/:taskId`, aga konkreetse entry'ni ei saa navigeerida.
  **Mõju:** Madal — deep linking oleks mugav, aga pole kriitiline.

- [ ] **4.3. Pole ajalugu (history/undo)** — `useSentenceState` salvestab seisu localStorage'sse, aga pole undo/redo funktsionaalsust. Kogemata kustutatud lauset ei saa taastada.
  **Mõju:** Kõrge — power user, kes teeb palju muudatusi, vajab Ctrl+Z tuge. Praegu on üksainus taastamatu kustutamine.

### 5. Eksport ja integratsioon

- [x] **5.1. WAV-faili allalaadimine** — `handleDownload` laadib alla üksiku lause helifaili. Failinimi on puhastatud (`sanitizeFilename`). Toimib.

- [x] **5.2. ZIP eksport ülesandest** — `downloadTaskAsZip` loob ZIP-faili koos `manifest.json`, `texts.txt` ja WAV-failidega. Professionaalne väljund.

- [ ] **5.3. Pole CSV/TSV eksporti** — ei saa eksportida ainult tekste (ilma audiota) tabelikujul. Tõlkija tahaks: tekst | häälduskuju | märkused.
  **Mõju:** Madal — texts.txt on ZIP-is olemas, aga eraldiseisev eksport oleks mugavam.

- [ ] **5.4. Pole API ligipääsu** — power user ei saa skriptida sünteesi. Pole avalikku API dokumentatsiooni, API võtmeid ega SDK-d.
  **Mõju:** Keskmine — tehniline kasutaja (arendaja/uurija) tahaks TTS-i integreerida oma töövooga.

- [ ] **5.5. Pole teksti importi** — ei saa laadida .txt/.csv faili lausetega. Kõik ainult käsitsi sisestus.
  **Mõju:** Keskmine — seotud #2.1-ga, aga eraldi use case: fail → laused.

### 6. Seadistused ja kohandamine

- [ ] **6.1. Pole hääle valikut** — sünteesi API toetab `voice` parameetrit (`applySynthesizeDefaults`), aga UI-s pole hääle valikut. Kasutaja ei saa valida mees-/naishääle vahel.
  **Mõju:** Kõrge — hääle valik on TTS rakenduse põhifunktsioon. Backend toetab, frontend mitte.

- [ ] **6.2. Pole kiiruse/kõrguse reguleerimist** — API toetab `speed` ja `pitch` parameetreid, aga UI-s puuduvad liugurid. Power user tahaks aeglasemat esitust häälduse uurimiseks.
  **Mõju:** Kõrge — backend toetab, frontend ei paku. Aeglane esitus on kriitiline häälduse õppimiseks.

- [ ] **6.3. Pole tumeda teema** — ainult hele teema. Pikad sessioonid (tõlkijatöö) on silmadele koormavad.
  **Mõju:** Madal — mugavusfunktsioon, mitte kriitiline.

- [ ] **6.4. Pole keele vahetust** — UI ainult eesti keeles. Mitterääkivad uurijad (soome, läti kolleegid) ei saa kasutada.
  **Mõju:** Keskmine — `ui-strings.ts` on juba eraldatud, mis lihtsustaks i18n lisamist.

### 7. Jõudlus ja usaldusväärsus

- [x] **7.1. Seis salvestatakse localStorage'sse** — `useSentenceState` salvestab laused automaatselt. Brauser sulgumisel andmed säilivad.

- [x] **7.2. QuotaExceededError käsitletud** — localStorage kvoodiületus logitakse hoiatusena, rakendus ei jookse kokku.

- [ ] **7.3. localStorage limit võib olla probleem** — 50+ lauset koos foneetiliste andmetega võib ületada 5MB localStorage piiri. Pole hoiatust kasutajale ega automaatset puhastamist.
  **Mõju:** Keskmine — power user suure andmemahuga võib kaotada uuemad laused vaikselt.

- [x] **7.4. Eksponentsiaalne backoff päringutel** — `pollForAudio` kasutab eksponentsiaalset backoff'i. Serveri ülekoormuse korral ei tekita klient lisa-koormust.

- [ ] **7.5. Pole offline-režiimi** — internetiühenduse katkemisel sünteesi päringud ebaõnnestuvad vaikselt. Pole visuaalset indikaatorit (offline banner). Eelnevalt sünteesitud audio ei ole vahemälust saadaval.
  **Mõju:** Keskmine — Service Worker puudub, seega pole PWA-funktsionaalsust.

- [ ] **7.6. Pole retry-nuppu pärast viga** — kui süntees ebaõnnestub, jääb laadimisruut lihtsalt seisma. Pole "Proovi uuesti" nuppu. `useSynthesisOrchestrator` logib vea, aga UI ei näita kasutajale midagi.
  **Mõju:** Kõrge — kordab audiit #1 leiud #2.6, aga power user jaoks eriti frustreeriv, sest ta töötleb palju lauseid.

### 8. Uurija-spetsiifiline (Specialist role)

- [x] **8.1. Uurija onboarding sisaldab foneetilist kuju** — specialist wizard'i viimane samm "Uuri häälduskuju" suunab menüü juurde. Õige fookus uurija jaoks.

- [x] **8.2. Foneetilise kuju paneel** — `SentencePhoneticPanel` võimaldab vaadata ja muuta lause häälduskuju. Spetsiifiline tööriist lingvistidele.

- [ ] **8.3. Pole IPA (International Phonetic Alphabet) väljundit** — foneetiline kuju kasutab eesti-spetsiifilist märgistust, aga pole IPA transkriptsiooni. Rahvusvaheline uurija ootaks IPA-d.
  **Mõju:** Madal — eesti keele foneetika märgistus on piisav sihtrühma jaoks.

- [ ] **8.4. Pole morfoloogilise analüüsi tulemuste kuvamist** — backend kasutab Vabamorf'i morfoloogiliseks analüüsiks, aga tulemused (sõnaliik, käänded, pöörded) ei ole kasutajale nähtavad. Lingvist tahaks näha analüüsi detaile.
  **Mõju:** Keskmine — andmed on olemas backend'is, aga frontend ei kuva neid.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Klaviatuurikäsud | 7 | 4 | 3 |
| Batch-töötlus | 5 | 1 | 4 |
| Märgendite haldus | 5 | 3 | 2 |
| Otsing ja navigatsioon | 3 | 0 | 3 |
| Eksport ja integratsioon | 5 | 2 | 3 |
| Seadistused | 4 | 0 | 4 |
| Jõudlus | 6 | 3 | 3 |
| Uurija-spetsiifiline | 4 | 2 | 2 |
| **Kokku** | **39** | **15** | **24** |

## Top-5 probleemid (mõju power user'ile)

1. **Puuduvad globaalsed kiirklahvid** (#1.5) — Ctrl+Enter, Ctrl+S, Ctrl+N jne puuduvad
2. **Pole hääle/kiiruse valikut** (#6.1, #6.2) — backend toetab, frontend mitte
3. **Pole undo/redo** (#4.3) — kustutatud lauset ei saa taastada
4. **Pole batch-sisestust** (#2.1) — mitu lauset korraga kleepida ei saa
5. **Pole veateadet sünteesi ebaõnnestumisel** (#7.6) — vaikne ebaõnnestumine

## Mis on hästi tehtud

- Klaviatuurikäsud sisestusväljal (Enter, Space, Backspace, Escape)
- Inline tag editing — kiire sõnade muutmine
- ZIP eksport koos manifest.json ja WAV failidega
- localStorage persistence koos QuotaExceeded käsitlusega
- Eksponentsiaalne backoff API päringutel
- Foneetilise kuju paneel uurijatele
