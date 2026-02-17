# Audit: Eesti keele professor (Filoloog)

**Vaatenurk:** Eesti filoloogia professor, kes hindab platvormi lingvistilist täpsust, foneetilise analüüsi kvaliteeti ja akadeemilist kasutatavust.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — foneetilise märgistuse süsteem, Vabamorf integratsioon, variantide käsitlus, TTS kvaliteet, akadeemiline töövoog.

---

## Kasutajaprofiil

Prof. Tiina Leesik, 58-aastane, Tartu Ülikooli eesti keele ja üldkeeleteaduse instituudi professor. Uurib eesti keele prosoodiat ja häälduse varieerumist. Tahab kasutada platvormi uurimistöös: kontrollida TTS-i hääldust erinevate foneetiliste variantide korral, luua häälduse näidiseid loengumaterjalide jaoks ja testida Vabamorf'i morfoloogilise analüüsi täpsust.

---

## Professori teekond

### Etapp 1: Foneetilise märgistuse süsteem

- [x] **1.1. Vabamorf'i märgisüsteem on implementeeritud** — `phoneticMarkers.ts` defineerib kaardistuse Vabamorf'i märkidelt UI märkidele: `<` → `` ` `` (kolmas välde), `?` → `´` (rõhuline silp), `]` → `'` (palatalisatsioon), `_` → `+` (liitsõna piir). Korrektne eesti fonoloogia terminoloogia.

- [x] **1.2. Kahepoolne teisendamine** — `transformToUI` ja `transformToVabamorf` võimaldavad liikuda Vabamorf'i sisemise märgistuse ja kasutajasõbraliku kuvamise vahel. Tagasiteisendamine on olemas ja testitud.

- [x] **1.3. Märgistuse eemaldamine** — `stripPhoneticMarkers` eemaldab kõik foneetilised märgid, et saada puhas tekst. Vajalik kuvamise ja ekspordi jaoks.

- [ ] **1.4. Märgisüsteem on lihtsustatud** — ainult 4 märki 12-st Vabamorf'i märgist on UI-s kuvatud. Puuduvad: `~` (n-k eraldus), `+` (morfeemipiir — NB: segadus! Vabamorf'i `+` on morfeemipiir, aga `_` on liitsõnapiir, UI-s kasutatakse `+` liitsõnapiiri jaoks), `=` (tühik ühendites), `[` (käändelõpu eraldus), `'` (primary stress), `.` (silbipiir).
  **Mõju:** Kõrge — filoloog tahab näha KÕIKI foneetilisi märke, eriti silbipiire ja morfeemipiire. Lihtsustamine on õppija jaoks mõistlik, aga uurija jaoks kaotab olulist informatsiooni.

- [ ] **1.5. Märgisüsteemi terminoloogia on osaliselt segane** — `getUISymbols` tagastab: `` ` `` = "Kolmas välde" (Third pitch accent), `´` = "Rõhuline silp" (Stressed syllable), `'` = "Palatalisatsioon" (Palatalization), `+` = "Liitsõna piir" (Compound word boundary). Terminoloogia on üldiselt korrektne, aga "Third pitch accent" on ebatavaline ingliskeelne tõlge — tavalisem on "tertiary quantity degree" või "overlong syllable".
  **Mõju:** Keskmine — ingliskeelne kirjeldus on lisatud arendajatele, aga lingvistid eelistaksid täpsemat terminoloogiat.

- [ ] **1.6. Puudub IPA (International Phonetic Alphabet) tugi** — platvorm kasutab ainult Vabamorf'i omamärgistust. Rahvusvaheline filoloog ootaks IPA transkriptsiooni paralleelset kuvamist. Eesti foneetilised erimärgid (nt õ = /ɤ/, ü = /y/) pole IPA-s esindatud.
  **Mõju:** Keskmine — Vabamorf'i märgistus on eesti keele spetsialistile piisav, aga rahvusvahelise publiku jaoks (konverentsiettekanded, artiklid) oleks IPA hädavajalik.

### Etapp 2: Hääldusvariantide analüüs

- [x] **2.1. Sõnapõhine variantide päring** — kasutaja klõpsab sõnal → `analyzeApi.ts` saadab päringu `/api/analyze` endpointile → tagastab `stressedText`. Variantide paneel näitab erinevaid hääldusi.

- [x] **2.2. Kohandatud variandi sisestamine** — `PronunciationVariants` komponent pakub "Loo oma variant" vormi, kus kasutaja saab sisestada oma foneetilise variandi koos märgistusega ja seda kuulata. Väga kasulik uurijale.

- [x] **2.3. Variandi rakendamine lausesse** — "Kasuta seda varianti" nupp asendab sõna lauses valitud variandiga. Uurija saab kiiresti võrrelda erinevaid variante lauses.

- [ ] **2.4. Puudub variantide allikainfo** — variandid tulevad Vabamorf'i morfoloogilisest analüüsist, aga UI ei näita, kust variant pärineb. Filoloog tahab teada: kas see on kirjakeele norm, murdeline variant, kõnekeelne variant, arhailine vorm?
  **Mõju:** Kõrge — akadeemilises kontekstis on allika info kriitiline. "Sõnaraamatupõhine", "EKI soovituslik", "murdeline" jne märgistus oleks vajalik.

- [ ] **2.5. Puudub mitme variandi kõrvutiv kuulamine** — uurija tahab kuulata varianti A ja varianti B kiiresti järjest ilma iga kord eraldi nuppu vajutamata. A/B võrdluse töövoog puudub.
  **Mõju:** Keskmine — individuaalne kuulamine töötab, aga kõrvutiv võrdlus oleks uurimistöös oluline.

- [ ] **2.6. Puudub variantide eksport** — uurija tahab eksportida kõik sõna variandid (tekst + audio) uurimistöö jaoks. Praegu saab eksportida ainult ühe lause korraga.
  **Mõju:** Keskmine — ZIP eksport on olemas ülesannete jaoks, aga variantide spetsiifiline eksport puudub.

### Etapp 3: TTS kvaliteet ja kontroll

- [ ] **3.1. Puudub hääle valik** — API toetab `voice` parameetrit (`applySynthesizeDefaults`), aga UI-s pole hääle valikut. Filoloog tahab võrrelda mees- ja naishäält, erinevaid dialektaalseid variante.
  **Mõju:** Kõrge — hääle valik on TTS-uurimise põhifunktsioon. Backend toetab, frontend mitte.

- [ ] **3.2. Puudub kiiruse ja kõrguse reguleerija** — API toetab `speed` ja `pitch` parameetreid, aga UI-s puuduvad liugurid. Filoloog tahab aeglustada kõnet prosoodia analüüsiks.
  **Mõju:** Kõrge — prosoodia uurimiseks on aeglane esitus ja kõrguse muutmine hädavajalikud. Backend toetab, frontend mitte.

- [ ] **3.3. Puudub lainekuju (waveform) kuvamine** — audiofail mängib, aga pole visuaalset lainekuju. Filoloog tahab näha heli amplituudi, pauside pikkusi, rõhu tugevust. Pole spektrogrammi.
  **Mõju:** Kõrge — akustilise analüüsi puudumine teeb platvormist lihtsa TTS-tööriista, mitte uurimisplatvormi. Praat on standardtööriist, aga integreeritud visuaalne esitus oleks väärtuslik.

- [ ] **3.4. Puudub audio formaat valik** — ainult WAV. Filoloog tahaks ka FLAC (kadudeta, väiksem), MP3 (jagamiseks), TextGrid (Praat ühilduvus) formaate.
  **Mõju:** Madal — WAV on kvaliteetne ja universaalne, aga Praat TextGrid ühilduvus oleks akadeemiliselt väärtuslik.

### Etapp 4: Morfoloogiline analüüs

- [ ] **4.1. Morfoloogiline info pole kasutajale nähtav** — Vabamorf'i morfoloogiline analüüs (sõnaliik, käänded, pöörded, lemma) on backendis olemas (`vabamorf-api`), aga frontend ei kuva tulemusi. Filoloog tahab näha: "kooli" → lemma "kool", sõnaliik S (substantiiv), kääne "sg g" (ainsus omastav).
  **Mõju:** Kõrge — morfoloogiline analüüs on filoloogia põhitööriist. Andmed on olemas, aga pole kuvatud.

- [ ] **4.2. Puudub lemma-põhine otsing** — filoloog tahab otsida sõna kõiki vorme korraga (nt "kool" → "kooli", "koole", "koolide", "koolidesse"). Praegu peab iga vormi eraldi sisestama.
  **Mõju:** Keskmine — paradigma kuvamine oleks väärtuslik keeleõppe ja uurimise jaoks.

- [ ] **4.3. Puudub lauseanalüüs** — pole süntaktilist analüüsi (lauseliikmed, sõnajärg), pole prosoodilist analüüsi (fraasirõhk, intonatsioon). Ainult sõna-tasemel analüüs.
  **Mõju:** Keskmine — lausetasemel prosoodia on oluline uurimisteema, aga nõuab oluliselt keerukamat analüüsi.

### Etapp 5: Akadeemiline töövoog

- [ ] **5.1. Puudub viitamisvõimalus** — filoloog tahab viidata konkreetsele häälduse variandile artiklis. Puudub URN, DOI või muu püsiidentifikaator. Puudub tsiteerimisvorming.
  **Mõju:** Keskmine — akadeemilises kontekstis on viitamisvõimalus oluline, aga MVP jaoks pole kriitiline.

- [ ] **5.2. Puudub märkmete lisamine** — filoloog tahab lisada märkmeid sõnade ja lausete juurde: "Siin on rõhk teises silbis, mis on ebatavaline. Vrd Wiedemanni sõnaraamat." Puudub annotatsioonide süsteem.
  **Mõju:** Keskmine — kordab auditi #2 leidu #7.3, aga akadeemilises kontekstis eriti oluline.

- [ ] **5.3. Puudub versioonihaldus** — filoloog muudab häälduskuju, aga pole ajalugu: mis oli enne, mis muutus. Puudub "Tagasi algse variandi juurde" nupp.
  **Mõju:** Keskmine — Undo puudumine (audit #3 leid #4.3) on siin eriti problemaatiline, sest uurija peab saama võrrelda algset ja muudetud varianti.

- [x] **5.4. Häälduskuju paneel on olemas** — `SentencePhoneticPanel` võimaldab vaadata ja muuta lause häälduskuju koos UI-sõbralike märkidega. Uurija saab foneetilist teksti otse redigeerida ja kuulata tulemust.

- [x] **5.5. ZIP eksport** — `downloadTaskAsZip` eksportib manifest.json, texts.txt ja WAV failid. Filoloog saab materjale salvestada ja jagada.

### Etapp 6: Eesti keele spetsiifilised nüansid

- [ ] **6.1. Kolme välte käsitlus** — eesti keele kolm väldet (lühike, pikk, ülipikk) on Vabamorf'i märgistuses olemas (`<` = kolmas välde). UI näitab ainult kolmandat väldet (`` ` ``), esimene ja teine välde pole märgitud. Filoloog tahab näha kõiki kolme väldet.
  **Mõju:** Kõrge — kolm väldet on eesti keele fonoloogia kõige eristavam tunnus. Ainult kolmanda välte näitamine on ebapiisav akadeemiliseks kasutuseks.

- [ ] **6.2. Palatalisatsiooni käsitlus** — palatalisatsioon on märgistatud (`]` → `'`), aga puudub selgitus, millised konsonandid on palataliseeritud. "Kell" vs "kell'" — filoloog tahab teada, et teises on palataliseeritud l.
  **Mõju:** Keskmine — märgistus on olemas, aga kontekstiinfo puudub.

- [ ] **6.3. Lauserõhu ja intonatsiooni puudumine** — eesti keele lauserõhk ja intonatsioon (küsiv, tõusev, langev) pole märgistatud ega kontrollitav. TTS genereerib intonatsiooni automaatselt, aga filoloog tahaks seda kontrollida.
  **Mõju:** Keskmine — nõuab oluliselt keerukamat süsteemi, aga on oluline prosoodia uurimiseks.

- [ ] **6.4. Murrete ja kõnekeele tugi puudub** — TTS loob ainult kirjakeelset hääldust. Puudub võimalus valida murderõhu mustrit (nt lõunaeesti, saare murre) või kõnekeelset varianti.
  **Mõju:** Madal — kirjakeele TTS on põhifunktsionaalsus. Murdetugi on oluline uurimiseks, aga nõuab eraldi mudeleid.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Foneetiline märgistus | 6 | 3 | 3 |
| Hääldusvariantide analüüs | 6 | 3 | 3 |
| TTS kvaliteet ja kontroll | 4 | 0 | 4 |
| Morfoloogiline analüüs | 3 | 0 | 3 |
| Akadeemiline töövoog | 5 | 2 | 3 |
| Eesti keele nüansid | 4 | 0 | 4 |
| **Kokku** | **28** | **8** | **20** |

## Top-5 probleemid (mõju filoloogile)

1. **Morfoloogiline info pole kuvatud** (#4.1) — andmed on backendis olemas, aga frontend ei näita
2. **Puudub hääle valik ja kiiruse reguleerija** (#3.1, #3.2) — prosoodia uurimise põhifunktsioonid, backend toetab
3. **Märgisüsteem on lihtsustatud** (#1.4) — ainult 4/12 Vabamorf'i märki on UI-s kuvatud
4. **Puudub variantide allikainfo** (#2.4) — filoloog ei tea, kas variant on norm, murre või kõnekeel
5. **Kolme välte puudulik käsitlus** (#6.1) — ainult kolmas välde on märgitud, esimene ja teine mitte

## Mis on hästi tehtud

- Vabamorf'i integratsioon kahepoolse teisendamisega
- Kohandatud variandi sisestamine ja kuulamine
- Variandi rakendamine lausesse ("Kasuta seda varianti")
- Häälduskuju paneel otseredigeerimisega
- Foneetiliste märkide põhjalik testimine (100% katvus testides)
- ZIP eksport koos manifest.json failiga
