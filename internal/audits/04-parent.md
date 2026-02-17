# Audit: Lapsevanem (Lapse eest hoolitseja)

**Vaatenurk:** Lapsevanem, kelle laps õpib koolis eesti keelt. Vanem aitab kodus hääldust harjutada.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — sisu turvalisus, lihtsus, häirivate elementide puudumine, progressi jälgimine.

---

## Kasutajaprofiil

Jelena, 40-aastane, venekeelne ema Tallinnas. Tema 10-aastane poeg Artjom õpib eesti keelt 4. klassis. Õpetaja saatis lingi Hääldusabilise ülesandele. Jelena tahab kontrollida, et platvorm on lapsele turvaline, ja aidata pojal kodus harjutada. Kasutab telefoni, eesti keel B1 tasemel.

---

## Vanema teekond

### Etapp 1: Esimene kokkupuude (jagatud ülesande kaudu)

- [x] **1.1. Jagatud ülesanne avaneb ilma kontota** — `/shared/task/:token` ei nõua sisselogimist. Laps saab lingi õpetajalt ja avab kohe. Vanem ei pea kontot looma.

- [x] **1.2. Ülesande sisu on kohe nähtav** — `SharedTaskPage` näitab laused ja Play-nupud. Vanem näeb, mida laps peab harjutama.

- [x] **1.3. Audiofailid mängivad kohe** — laps vajutab Play ja kuuleb hääldust. Pole vaja midagi installida ega seadistada.

- [ ] **1.4. Puudub juhend vanemale** — pole teksti "Kuidas aidata last harjutamisel" ega soovitusi (nt "Kuulake lauset 3 korda, seejärel proovige järele öelda"). Vanem peab ise välja mõtlema, kuidas platvormi kasutada.
  **Mõju:** Keskmine — pedagoogiline kontekst puudub. Vanem ei tea, kas laps peaks ainult kuulama või ka järele ütlema.

- [ ] **1.5. Pole võimalust salvestada lapse hääldust** — laps kuulab õiget hääldust, aga pole mikrofoni-nuppu oma häälduse salvestamiseks ja võrdlemiseks. Pole speech-to-text kontrolli.
  **Mõju:** Keskmine — häälduse harjutamise tööriistal puudub feedback-loop. Laps kuuleb, aga ei tea, kas ütleb õigesti.

### Etapp 2: Sisu turvalisus

- [ ] **2.1. Puudub sisu modereerimine** — `handleTextChange` võtab vastu suvalise teksti ilma filtreerimiseta. Pole roppuste filtrit, pole sisu kontrolli. Laps võib sisestada sobimatut teksti ja kuulda seda sünteesitud kõnes.
  **Mõju:** Kõrge — TTS-süsteem loeb ette mis tahes sisestatud teksti. Laps (või tema klassikaaslased) võivad sisestada sobimatuid sõnu ja kuulda neid "ametliku häälega" etteloetuna. Koolides on see teadaolev probleem TTS-tööriistadega.

- [ ] **2.2. Jagatud ülesannete sisu pole kontrollitud** — õpetaja loob ülesande ja jagab linki. Pole süsteemset kontrolli, et jagatud sisu on sobilik. Kui keegi loob sobimatut sisu ja jagab linki, pole teavitamise võimalust.
  **Mõju:** Keskmine — õpetaja vastutab sisu eest, aga pole abuse-reporting mehhanismi.

- [ ] **2.3. Pole "raporteeri sobimatut sisu" nuppu** — jagatud ülesande lehel pole viisi, kuidas vanem saaks teatada sobimatust sisust. Puudub flag/report funktsioon.
  **Mõju:** Keskmine — avaliku sektori platvormil peaks olema vähemalt tagasiside kanal.

- [x] **2.4. Pole reklaame ega häirivaid elemente** — platvorm on puhas, pole reklaame, pop-up'e ega muid häirivaid elemente. Riigiasutuse platvormile kohane.

- [x] **2.5. Pole kolmandate osapoolte jälgijaid (peale Sentry)** — `main.tsx` laadib ainult Sentry vigade jälgimiseks. Pole Google Analytics'it, Facebook Pixel'it ega muid jälgijaid. Google Fonts'i laetakse, aga see on minimaalne.

- [ ] **2.6. Cookie consent pole lastesõbralik** — `CookieConsent` tekst on täiskasvanule mõeldud juriidiline tekst. 10-aastane laps ei saa aru, mida "küpsised" tähendavad ja mida "Nõustun" teeb.
  **Mõju:** Madal — GDPR nõue, aga lastele mõeldud platvormil võiks olla lihtsam selgitus.

### Etapp 3: Kasutamise lihtsus lapsele

- [x] **3.1. Lihtne liides** — üks sisestusväli ja Play-nupp. 10-aastane saab aru. Pole ülekoormatud menüüsid esimesel ekraanil.

- [ ] **3.2. Menüü on lapsele keeruline** — `SentenceMenu` valikud nagu "Uuri häälduskuju", "Lae alla .wav fail" on lapsele arusaamatud. Laps ei tea, mis on WAV-fail ega häälduskuju.
  **Mõju:** Madal — laps ignoreerib menüüd ja kasutab ainult Play-nuppu. Aga segadus on võimalik.

- [x] **3.3. Play-nupp on suur ja selge** — visuaalselt arusaadav, spinner näitab laadimist. Laps mõistab intuitiivselt.

- [ ] **3.4. Puudub fondi suuruse muutmine** — laps võib vajada suuremat fonti. Pole liideses fondi suuruse valikut. Brauser zoom töötab, aga laps ei tea sellest.
  **Mõju:** Madal — standardne brauser-zoom on piisav, aga ligipääsetavuse menüü oleks parem.

- [ ] **3.5. Puudub visuaalne tagasiside õnnestumise korral** — kui süntees õnnestub ja heli mängib, pole visuaalset kinnitust peale Play-nupu oleku muutumise. Lapsele oleks motiveeriv: roheline linnuke, animatsioon, "Tubli!" teade.
  **Mõju:** Madal — funktsionaalselt töötab, aga gamification elemendid motiveerisid lapsi.

### Etapp 4: Privaatsus ja andmekaitse

- [x] **4.1. Süntees töötab ilma kontota** — lapse andmeid ei koguta. Pole vaja nime, e-posti ega muid isikuandmeid.

- [x] **4.2. Laused salvestatakse ainult localStorage'sse** — `useSentenceState` salvestab andmeid ainult kohalikult. Serverisse saadetakse ainult tekst sünteesimiseks, ei seota kasutajaga.

- [ ] **4.3. Sünteesi API logib sisestatud teksti** — backend logib sünteesipäringuid (`logger.info`). Lapse sisestatud tekst salvestatakse serveri logidesse. Pole selge, kui kaua logisid hoitakse.
  **Mõju:** Keskmine — GDPR kontekstis: lapse tekst on isikuandmete piirimail. Logide retentsioonipoliitika peaks olema selge.

- [ ] **4.4. Privaatsuspoliitika ei maini lapsi** — `/privacy` leht ei sisalda spetsiifilist lõiku laste andmete kohta. Pole viidet COPPA-le ega lastele mõeldud andmekaitsenormidele.
  **Mõju:** Keskmine — kui platvorm on mõeldud koolides kasutamiseks, peaks privaatsuspoliitika käsitlema alaealiste andmeid.

- [x] **4.5. Pole kasutajakonto loomist lapsele** — kuna süntees töötab ilma kontota, pole vaja luua lapsele kontot. See on hea: vähem andmeid, vähem riske.

### Etapp 5: Vanema kontroll ja jälgimine

- [ ] **5.1. Puudub vanema töölaud** — vanem ei saa jälgida, mida laps on harjutanud, kui kaua, millised sõnad olid rasked. Pole progressi ülevaadet.
  **Mõju:** Kõrge — vanem ei saa hinnata lapse pingutusi ega aidata suunata harjutamist.

- [ ] **5.2. Puudub ajaline piiramine** — pole "Harjuta 15 minutit päevas" funktsionaalsust ega ajalimiidi seadistust. Laps võib platvormi kasutada lõputult (või üldse mitte).
  **Mõju:** Madal — pole tüüpiline TTS-tööriista funktsioon, aga haridusplatvormil oleks kasulik.

- [ ] **5.3. Puudub kodutöö kinnituse mehhanism** — õpetaja saadab lingi, laps peab harjutama. Pole viisi kinnitada, et laps tegi harjutuse (pole "Valmis!" nuppu, pole õpetajale tagasisidet).
  **Mõju:** Kõrge — kordab auditi #2 leidu #5.4, kuid vanema vaatenurgast: vanem ei saa kinnitada, et kodutöö on tehtud.

- [ ] **5.4. Puudub jagatud seade tugi** — kui vanem ja laps kasutavad sama telefoni, on localStorage jagatud. Vanema laused ja lapse laused segunvad. Pole profiilide vahetamist.
  **Mõju:** Keskmine — praktiline probleem perekondades, kus on üks arvuti/telefon.

### Etapp 6: Mobiilne kasutamine

- [ ] **6.1. Responsive disain pole kontrollitud selles auditis** — CSS-i pole siin auditis analüüsitud. Kuid koodist selgub, et `SentenceSynthesisItem` ja `TaskDetailView` ei kasuta mobiilispetsiifilisi kompomente. Lohistamine (drag-and-drop) ei tööta puuteekraanil ilma spetsiaalse käsitluseta.
  **Mõju:** Keskmine — `draggable` atribuut HTML5-s töötab puuteekraanidel halvasti. Mobiilsel kasutamisel pole lausete ümberjärjestamine võimalik.

- [ ] **6.2. Automaatne esitus (autoplay) võib telefonis blokeeritud olla** — mõned mobiilsed brauserid blokeerivad automaatse heli esituse. `useAudioPlayer` ei käsitle spetsiaalselt mobiilset autoplay poliitikat. Play-all funktsioon võib telefonis ebaõnnestuda vaikselt.
  **Mõju:** Keskmine — kasutaja peab iga lauset eraldi mängima, mis on tüütu.

### Etapp 7: Turvaline jagamine

- [x] **7.1. Jagamislink on tokenipõhine** — `/shared/task/:token` kasutab juhuslikku tokenni. Pole arvatatav, pole järjestikune.

- [ ] **7.2. Jagamislink pole parooliga kaitstud** — igaüks, kellel on link, näeb sisu. Kui link lekib (nt laps jagab seda sotsiaalmeedia kaudu), saavad kõik sisu näha.
  **Mõju:** Madal — haridussisu puhul on risk minimaalne. Kuid vanemale oleks rahustavam, kui oleks valikuvõimalus parooliga kaitsta.

- [x] **7.3. Jagamislink aegub 90 päeva pärast** — automaatne aegumine piirab riski.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Esimene kokkupuude | 5 | 3 | 2 |
| Sisu turvalisus | 6 | 2 | 4 |
| Kasutamise lihtsus lapsele | 5 | 2 | 3 |
| Privaatsus ja andmekaitse | 5 | 3 | 2 |
| Vanema kontroll | 4 | 0 | 4 |
| Mobiilne kasutamine | 2 | 0 | 2 |
| Turvaline jagamine | 3 | 2 | 1 |
| **Kokku** | **30** | **12** | **18** |

## Top-5 probleemid (mõju vanemale ja lapsele)

1. **Puudub sisu modereerimine** (#2.1) — laps saab sisestada sobimatut teksti ja kuulda seda sünteesitud kõnes
2. **Puudub vanema töölaud / progressi jälgimine** (#5.1) — vanem ei tea, mida laps harjutas
3. **Puudub kodutöö kinnituse mehhanism** (#5.3) — pole viisi kinnitada, et laps tegi harjutuse
4. **Privaatsuspoliitika ei käsitle lapsi** (#4.4) — koolide kasutus nõuab alaealiste andmekaitset
5. **Puudub häälduse salvestamine / tagasiside** (#1.5) — laps kuulab, aga ei saa oma hääldust kontrollida

## Mis on hästi tehtud

- Süntees ilma kontota — lapse andmeid ei koguta
- Puhas liides ilma reklaamide ja häirivate elementideta
- Minimaalsed kolmandate osapoolte jälgijad
- Lihtne Play-nupp, mida laps mõistab intuitiivselt
- Tokenipõhine jagamine automaatse aegumisega
- localStorage ainult kohalik — andmed ei leki serverisse (välja arvatud sünteesi tekst)
