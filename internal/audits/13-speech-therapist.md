# Audit: Logopeed / Kõneterapeut

**Vaatenurk:** Logopeed, kes kasutab platvormi kõnehäiretega klientide jaoks: hääldusmudeli kuulamine, harjutusmaterjalide loomine, foneetilise täpsuse kontrollimine.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — heli kvaliteet, foneetilise märgistuse täpsus, kliendi töövoog, individuaalne kohandamine.

---

## Kasutajaprofiil

Kristiina, 38-aastane, logopeed Tartu Kõnekeskuses. Töötab lastega (5–12 a) ja täiskasvanutega, kellel on düsleksia, kogelus, aktsent või kuulmispuue. Kasutab platvormi hääldusmudeli kuulamiseks ja harjutusmaterjalide loomiseks. Vajab aeglast, selget kõnet ja sõna-haaval kontrollitavust.

---

## Logopeedi teekond

### Etapp 1: Kliinilise töö vajadused

- [x] **1.1. Sõna-haaval esitus on võimalik** — logopeed saab sisestada ühe sõna ja kuulata selle hääldust. `SentenceSynthesisItem` toetab nii üksikuid sõnu kui lauseid.

- [x] **1.2. Hääldusvariantide paneel** — logopeed saab klõpsata sõnal ja näha erinevaid häälduse variante. Kasulik, kui klient vajab konkreetset hääldust (nt rõhuasetus).

- [ ] **1.3. Puudub aeglane esitus** — logopeed vajab märkimisväärselt aeglasemat kõnet, et klient saaks järele korrata. Backend toetab `speed` parameetrit, aga UI-s puudub kiiruse reguleerija. See on logopeedi jaoks kriitiline.
  **Mõju:** Kõrge — aeglane, selge esitus on kõneteraapia põhivahend. Ilma selleta on platvorm logopeedi jaoks piiratud väärtusega.

- [ ] **1.4. Puudub silphaaval esitus** — logopeed tahab sõna kuulata silphaaval: "koo-li" mitte "kooli". Puudub silbipiiri märgistus UI-s (kuigi Vabamorf toetab `.` silbipiiri märki, on see UI-st välja filtreeritud).
  **Mõju:** Kõrge — silphaaval esitus on logopeedi standardtööriist düsleksia ja kogeluse teraapiaks.

- [ ] **1.5. Puudub kordus-funktsioon** — logopeed tahab sama sõna/lauset kuulata 5–10 korda järjest automaatselt (paus vahel). Praegu peab iga kord Play-nuppu vajutama.
  **Mõju:** Keskmine — manuaalne kordamine töötab, aga automaatne kordus oleks tunduvalt mugavam.

- [ ] **1.6. Puudub heli salvestamine (kliendi kõne)** — logopeed tahab salvestada kliendi hääldust ja võrrelda TTS mudeliga. Pole mikrofoni funktsionaalsust, pole A/B võrdlust.
  **Mõju:** Kõrge — kõneteraapia põhitöövoog: mudeli kuulamine → kliendi katse → võrdlus. Ilma salvestamiseta on kolmas samm võimatu.

### Etapp 2: Materjalide loomine

- [x] **2.1. Ülesannete loomine töötab** — logopeed saab luua ülesande konkreetse kliendi jaoks: nt "Jüri harjutus — r-häälik" koos sõnadega, mis sisaldavad r-häälikut.

- [x] **2.2. Jagamine ilma kontota** — logopeed saab jagada linki kliendiga/vanemaga. Klient ei pea kontot looma. Eriti oluline lastega töötamisel.

- [ ] **2.3. Puudub sõnade kategoriseerimine** — logopeed tahab grupeerida sõnu: "r-häälik alguses", "r-häälik keskel", "r-häälik lõpus". Ülesande sees pole alamrühmi ega kategooriaid.
  **Mõju:** Keskmine — logopeed saab luua eraldi ülesandeid, aga ühe ülesande sees grupeerimine oleks mugavam.

- [ ] **2.4. Puudub minimaalpaaride tööriist** — logopeed kasutab sageli minimaalpaaride (nt "kass" vs "kass'", "saal" vs "saal'") harjutusi. Pole tööriista, mis aitaks automaatselt leida minimaalpaaride.
  **Mõju:** Keskmine — logopeed peab minimaalpaarid ise välja mõtlema ja sisestama. Automaatne genereerimine oleks väärtuslik.

- [ ] **2.5. Puudub piltide lisamine** — lastele mõeldud kõneteraapia kasutab sageli pilte koos sõnadega. Ülesande kirjele ei saa pilti lisada. Ainult tekst ja audio.
  **Mõju:** Keskmine — logopeedi harjutused lastega on sageli pildipõhised. Tekst+pilt+audio oleks ideaalne kombinatsioon.

### Etapp 3: Foneetilise analüüsi vajadused

- [x] **3.1. Foneetilise märgistuse süsteem** — `phoneticMarkers.ts` näitab kolmandat väldet, rõhulist silpi, palatalisatsiooni ja liitsõna piiri. Logopeedile on see oluline info.

- [ ] **3.2. Puudub formantide analüüs** — logopeed tahab näha vokaali formantväärtusi (F1, F2), mis aitavad diagnoosida hääldusvigasid. Pole spektrogrammi ega formantide graafikut.
  **Mõju:** Madal — nõuab spetsialiseeritud akustilise analüüsi tööriista (Praat). Pole realistlik MVP-le.

- [ ] **3.3. Puudub foneemide eraldamine** — logopeed tahab kuulda üksikuid foneeme: "k", "o", "l", "i" eraldi. Praegu on minimaalne üksus terve sõna.
  **Mõju:** Keskmine — foneemitasemel TTS on tehniline väljakutse, aga oleks kõneteraapia jaoks väga väärtuslik.

- [ ] **3.4. Puudub häälduse hindamine** — logopeed tahab, et süsteem hindaks kliendi hääldust automaatselt: kas hääldus vastab mudelile? Pole ASR-i (Automatic Speech Recognition) ega häälduse hindamise funktsionaalsust.
  **Mõju:** Kõrge — automaatne häälduse hindamine oleks revolutsiooniline kõneteraapia tööriist. Praegu peab logopeed hindama käsitsi.

### Etapp 4: Kliendi haldus

- [ ] **4.1. Puudub kliendi profiil** — logopeed ei saa luua kliendi profiili: nimi, diagnoosi kirjeldus, teraapia eesmärgid, progressi märkmed. Kõik ülesanded on ühes nimekirjas ilma kliendiseoseta.
  **Mõju:** Kõrge — 20+ kliendiga logopeed vajab organiseerimissüsteemi. Praegu peab ülesande nimesse kirjutama kliendi nime.

- [ ] **4.2. Puudub progressi jälgimine** — logopeed ei saa jälgida kliendi progressi: millised sõnad on harjutatud, kui tihti, mis kuupäevadel. Pole progressi graafikut ega ajalugu.
  **Mõju:** Kõrge — kõneteraapia nõuab süstemaatilist progressi jälgimist. EHIS-sse raporteerimiseks vajalik.

- [ ] **4.3. Puudub teraapiaseansi dokumenteerimine** — logopeed peab dokumenteerima iga seansi: mis harjutusi tehti, kuidas klient reageeris, millised eesmärgid seati. Pole märkmete süsteemi.
  **Mõju:** Keskmine — logopeed kasutab eraldi süsteemi (nt Excel, iStar), aga integreeritud dokumenteerimine oleks väärtuslik.

### Etapp 5: Privaatsus ja eetika

- [x] **5.1. Kliendi andmeid ei koguta süntesiks** — TTS töötab ilma kontota, tekst ei seostata isikuga. Logopeed ei pea muretsema kliendi andmete lekkimise pärast sünteesi kasutamisel.

- [ ] **5.2. Ülesannete nimed võivad sisaldada kliendi andmeid** — logopeed nimetab ülesande "Jüri Kask — r-häälik harjutus". Ülesande nimi salvestatakse serverisse. See on terviseandmete piirimail (kõneteraapia klient).
  **Mõju:** Keskmine — logopeed peaks olema teadlik, et ülesande nimi salvestatakse. Hoiatus või juhend oleks kasulik.

- [ ] **5.3. Jagamislink paljastab teraapia sisu** — kui logopeed jagab linki ja see lekib, on näha teraapia harjutusmaterjalid. Kuigi sisu ise pole sensitiivne, võib kontekst (nt ülesande nimi "Kogeluse harjutus") paljastada terviseandmeid.
  **Mõju:** Madal — jagamislink ei sisalda kliendi nime ega diagnoosi (ainult sisu). Aga logopeed peaks olema ettevaatlik nimetamisel.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Kliinilise töö vajadused | 6 | 2 | 4 |
| Materjalide loomine | 5 | 2 | 3 |
| Foneetilise analüüs | 4 | 1 | 3 |
| Kliendi haldus | 3 | 0 | 3 |
| Privaatsus ja eetika | 3 | 1 | 2 |
| **Kokku** | **21** | **6** | **15** |

## Top-5 probleemid (mõju logopeedile)

1. **Puudub aeglane esitus** (#1.3) — kõneteraapia põhivahend, backend toetab
2. **Puudub heli salvestamine / võrdlus** (#1.6) — mudel → katse → võrdlus töövoog on võimatu
3. **Puudub kliendi profiil ja progressi jälgimine** (#4.1, #4.2) — 20+ kliendiga logopeed vajab süsteemi
4. **Puudub silphaaval esitus** (#1.4) — düsleksia ja kogeluse teraapia standardvahend
5. **Puudub häälduse hindamine** (#3.4) — automaatne tagasiside puudub

## Mis on hästi tehtud

- Sõna-haaval esitus on võimalik
- Hääldusvariantide paneel spetsialistile
- Ülesannete loomine ja jagamine ilma kontota
- Foneetilise märgistuse süsteem
- Kliendi andmeid ei koguta sünteesiks
- ZIP eksport offline harjutamiseks
