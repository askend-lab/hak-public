# Audit: Vandetõlk / Tõlkija

**Vaatenurk:** Professionaalne tõlkija, kes kasutab platvormi eesti keele häälduse kontrollimiseks tõlketöös: nimede hääldus, spetsiifiliste terminite hääldus, kliendile eestikeelse heli näidise pakkumine.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — tõlkija töövoog, terminoloogia, nime hääldus, ekspordi kvaliteet.

---

## Kasutajaprofiil

Olga, 42-aastane, vandetõlk (vene-eesti, inglise-eesti). Tõlgib ametlikke dokumente, lepinguid, kohtumaterjale. Peab kontrollima eesti nimede ja terminite hääldust, et nõustada välismaiseid kliente. Vajab kvaliteetset, autoriteetset hääldusmudelit.

---

## Tõlkija teekond

### Etapp 1: Nimede ja terminite hääldus

- [x] **1.1. Eesti nimede hääldus** — tõlkija saab sisestada eesti nime (nt "Jüriöö", "Tallinn", "Põlva") ja kuulda hääldust. TTS käsitleb eesti nimesid.

- [ ] **1.2. Võõrnimede hääldus eesti kontekstis** — tõlkija peab teadma, kuidas eestlased hääldavad võõrnimesid: "Brussels" → "Brüssel", "Helsinki" → "Helsingi". TTS ei pruugi tunda häälduse kohandamist.
  **Mõju:** Keskmine — TTS hääldab teksti foneetiliselt. Võõrnimede eestipärase häälduse reeglid on keerulised.

- [ ] **1.3. Lühendite ja akronüümide hääldus** — tõlkija sisestab "EKI", "HTM", "EL". Kas TTS loeb need tähthaaval ("E-K-I") või sõnana ("eki")? Pole selget kontrolli.
  **Mõju:** Keskmine — lühendite hääldus on kontekstipõhine ja nõuab reegleid.

- [ ] **1.4. Numbrite ja kuupäevade hääldus** — "01.02.2026" → "esimene veebruar kaks tuhat kakskümmend kuus"? Pole selge, kuidas TTS käsitleb numbreid, kuupäevi, summasid (€1,250.00).
  **Mõju:** Keskmine — juriidilistes tekstides on numbrite täpne hääldus oluline.

- [x] **1.5. Foneetilise märgistuse kontroll** — hääldusvariantide paneel võimaldab tõlkijal kontrollida konkreetset hääldust. Kolmanda välte ja rõhu kontroll on professionaalsele kasutajale väärtuslik.

### Etapp 2: Tõlketöö integratsioon

- [ ] **2.1. Puudub sõnastiku funktsioon** — tõlkija peab sageli sama terminit kontrollima. Pole "Lemmikud" ega "Ajalugu" funktsiooni, mis salvestaks varem kontrollitud sõnu.
  **Mõju:** Keskmine — tõlkija peab iga kord uuesti sisestama. Ajaloo funktsioon oleks väärtuslik.

- [ ] **2.2. Puudub batch-kontroll** — tõlkija tahab kontrollida 50 nime nimekirjast korraga. Peab iga nime eraldi sisestama ja kuulama.
  **Mõju:** Keskmine — kordab eelnevate auditite leide. Tõlkija kontekstis eriti oluline pikade nimekirjade korral.

- [ ] **2.3. Puudub CAT-tööriista integratsioon** — tõlkijad kasutavad SDL Trados, memoQ, OmegaT jt. Pole pluginat ega API-t, mis võimaldaks hääldust kontrollida otse tõlketööriistast.
  **Mõju:** Madal — nišifunktsioon, aga väärtuslik professionaalsele tõlkijale.

- [x] **2.4. Kiire sisestus-kuulamine** — tõlkija saab kiiresti sisestada sõna → Enter → kuulata. Minimaalne vaev. Hea.

### Etapp 3: Ekspordi ja jagamise vajadused

- [x] **3.1. WAV eksport** — tõlkija saab alla laadida häälduse näidise ja saata kliendile. "Nii hääldatakse seda nime eesti keeles."

- [ ] **3.2. Puudub häälduse viide** — tõlkija tahab viidata konkreetsele hääldusele (nt vandetõlgi ametlikus arvamuses). Pole püsilinki konkreetsele sünteesi tulemusele.
  **Mõju:** Madal — WAV-fail on piisav, aga püsilink oleks mugavam.

- [x] **3.3. Ülesannete jagamine** — tõlkija saab luua ülesande kliendi nimede nimekirjaga ja jagada linki kliendiga. Klient saab ise kuulata.

### Etapp 4: Autoriteedne allikas

- [x] **4.1. EKI kui autoriteet** — Eesti Keele Instituut on eesti keele häälduse autoriteet. Tõlkija saab viidata: "EKI hääldusabilise kohaselt..." See annab professionaalset usaldusväärsust.

- [ ] **4.2. Puudub "Ametlik hääldus" märge** — mõned hääldused on standardsed (EKI soovituslikud), mõned on alternatiivsed. Pole selget märget, milline variant on normatiivne.
  **Mõju:** Keskmine — kordab auditi #8 leidu #2.4. Tõlkija vajab kindlust, et viitab õigele hääldusele.

- [ ] **4.3. Puudub tsiteerimisvorming** — tõlkija tahab tsiteerida: "EKI Hääldusabiline, versioon X, päritud [kuupäev]". Pole versiooni numbrit ega tsiteerimisjuhendit.
  **Mõju:** Madal — akadeemilise/juriidilise konteksti jaoks oleks kasulik.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Nimede ja terminite hääldus | 5 | 2 | 3 |
| Tõlketöö integratsioon | 4 | 1 | 3 |
| Eksport ja jagamine | 3 | 2 | 1 |
| Autoriteedne allikas | 3 | 1 | 2 |
| **Kokku** | **15** | **6** | **9** |

## Top-5 probleemid (mõju tõlkijale)

1. **Lühendite ja numbrite hääldus** (#1.3, #1.4) — juriidilises kontekstis kriitiline
2. **Puudub sõnastiku/ajaloo funktsioon** (#2.1) — sama termini korduv sisestamine
3. **Puudub "Ametlik hääldus" märge** (#4.2) — tõlkija vajab kindlust normatiivsuse osas
4. **Puudub batch-kontroll** (#2.2) — pikad nimekirjad nõuavad ühekaupa sisestamist
5. **Võõrnimede eestipärane hääldus** (#1.2) — TTS ei pruugi kohandada

## Mis on hästi tehtud

- EKI kui autoriteetne allikas
- Kiire sisestus-kuulamine töövoog
- WAV eksport kliendile saatmiseks
- Ülesannete jagamine kliendiga
- Foneetilise märgistuse kontroll
- Hääldusvariantide paneel
