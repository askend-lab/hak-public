# Audit: EL-i hankespetsialist / Õigusnõuetele vastavus

**Vaatenurk:** Avaliku sektori hankespetsialist, kes hindab platvormi vastavust EL-i regulatsioonidele, Eesti seadustele ja avaliku sektori standarditele.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja dokumentatsiooni analüüs — GDPR, ePrivacy, ligipääsetavuse direktiiv, autoriõigus, avatud lähtekoodi litsents.

---

## Kasutajaprofiil

Maris, 45-aastane, Haridus- ja Teadusministeeriumi IT-osakonna hankespetsialist. Hindab, kas Hääldusabiline vastab avaliku sektori nõuetele ja kas seda saab soovitada koolidele üle-eestiliselt.

---

## Vastavuse analüüs

### Etapp 1: GDPR vastavus

- [x] **1.1. Privaatsuspoliitika on olemas** — `/privacy` leht on olemas ja saadaval.

- [x] **1.2. Küpsiste nõusolek** — `CookieConsent` komponent pakub nõustumist ja keeldumist. GDPR artikkel 7 nõue.

- [ ] **1.3. Alaealiste andmekaitse** — GDPR artikkel 8: alla 16-aastaste (Eestis alla 13-aastaste) jaoks on vaja vanema nõusolekut. Platvorm ei küsi vanuse kinnitust ega vanema nõusolekut. Kui koolid kasutavad platvormi, on enamik kasutajaid alaealised.
  **Mõju:** Kõrge — compliance-risk. Koolide kasutus nõuab vanema nõusoleku mehhanismi.

- [ ] **1.4. Õigus andmete kustutamisele (artikkel 17)** — puudub "Kustuta minu andmed" funktsioon. Kasutaja ei saa ise oma kontot ja andmeid kustutada. Peab pöörduma eki@eki.ee.
  **Mõju:** Kõrge — GDPR artikkel 17 nõuab, et andmesubjekt saab oma andmed kustutada. Automatiseeritud funktsioon peaks olemas olema.

- [ ] **1.5. Andmete ülekantavus (artikkel 20)** — puudub "Ekspordi minu andmed" funktsioon. ZIP eksport on olemas üksikutele ülesannetele, aga pole kõigi andmete koondeksporti.
  **Mõju:** Keskmine — GDPR artikkel 20 nõuab andmete ülekantavust masinloetavas formaadis.

- [ ] **1.6. Andmetöötluse registreerimine** — pole selge, kas EKI on registreerinud andmetöötlustoimingud Andmekaitse Inspektsioonis. Koodis pole selle kohta teavet.
  **Mõju:** Keskmine — organisatsiooniline nõue, mitte tehniline. Aga peaks olema dokumenteeritud.

### Etapp 2: ePrivacy ja küpsised

- [x] **2.1. Cookie consent on implementeeritud** — kasutaja saab nõustuda või keelduda. Hea.

- [ ] **2.2. Kolmandate osapoolte küpsised** — Sentry ja Google Fonts laetakse välistest allikatest. Kas need seavad küpsiseid? Sentry SDK tavaliselt ei sea küpsiseid, aga Google Fonts võib jälgida IP-aadresse.
  **Mõju:** Madal — minimaalsed välised allikad. Aga peaks olema privaatsuspoliitikas loetletud.

- [x] **2.3. Peamised funktsioonid töötavad ilma küpsisteta** — süntees töötab ilma kontota ja küpsisteta. localStorage on kasutuses, aga pole küpsis. Hea.

### Etapp 3: Veebilehe ligipääsetavuse direktiiv

- [x] **3.1. Ligipääsetavuse teatis on olemas** — `/accessibility` leht on olemas. EL-i veebilehe ligipääsetavuse direktiiv (2016/2102) nõuab ligipääsetavuse teatist.

- [ ] **3.2. WCAG 2.1 AA vastavus on osaline** — audit #7 tuvastas mitu probleemi: PlayButton ARIA inglise keeles, puuduv aria-live, drag-drop klaviatuurita. Need on WCAG 2.1 AA rikkumised.
  **Mõju:** Kõrge — Eesti avaliku sektori veebilehed peavad vastama WCAG 2.1 AA-le. Rikkumised on raporteeritavad.

- [ ] **3.3. Ligipääsetavuse teatise sisu pole kontrollitud** — teatise leht on olemas, aga sisu (teadaolevad piirangud, kontaktandmed, kaebuse esitamise kord) vajab eraldi kontrolli.
  **Mõju:** Keskmine — teatise formaat peab vastama EL-i mudelile.

### Etapp 4: Autoriõigus ja litsents

- [x] **4.1. MIT litsents** — avatud lähtekood MIT litsentsi all. Avaliku sektori jaoks ideaalne: tasuta, modifitseeritav, jagatatav.

- [x] **4.2. EKI kui autoriõiguse omanik** — "Copyright (c) 2024-2026 Askend Lab" — selge omanik. Avaliku sektori tellimus eraettevõttelt, litsents on avatud.

- [ ] **4.3. TTS mudeli litsents** — TTS-i heli genereeritakse mudeli abil. Pole selge, mis litsentsi all TTS-mudel on. Kas genereeritud heli on autoriõigusega kaitstud? Kas seda tohib kommertsiaalselt kasutada?
  **Mõju:** Keskmine — TTS-mudeli litsents peaks olema dokumenteeritud. Koolide jaoks pole probleem (hariduslik kasutus), aga kolmandatel osapooltel peab olema selgus.

### Etapp 5: Avaliku sektori standardid

- [ ] **5.1. Puudub ISKE/E-ITS vastavus** — Eesti infosüsteemide turvameetmete süsteem nõuab turvaklassi määramist. Pole selge, kas Hääldusabiline on ISKE/E-ITS-i alusel klassifitseeritud.
  **Mõju:** Keskmine — riigi infosüsteemide register (RIHA) nõuab registreerimist ja turvataset.

- [ ] **5.2. Puudub RIHA registreering** — Eesti riigi infosüsteemid peavad olema registreeritud RIHA-s. Pole selge, kas Hääldusabiline on registreeritud.
  **Mõju:** Keskmine — organisatsiooniline nõue, mitte tehniline.

- [x] **5.3. Eestikeelne liides** — keeleseaduse nõue: avaliku sektori teenused peavad olema eesti keeles. Täidetud.

- [ ] **5.4. Puudub mitmekeelne tugi** — kuigi eesti keel on nõutud, peaks avaliku sektori teenus olema kättesaadav ka vene keeles (Eestis levinuim vähemuskeelne). Eriti hariduse kontekstis.
  **Mõju:** Keskmine — keeleseadus nõuab eesti keelt, aga praktikas on vene- ja ingliskeelne tugi oodatav.

### Etapp 6: Rahastus ja jätkusuutlikkus

- [ ] **6.1. Jätkusuutlikkuse plaan pole nähtav** — EKI on riigiasutus, aga kas rahastus on püsiv? Kas platvorm on projekti- või baasirahastusega? Koolid peavad teadma, kas teenus jätkub.
  **Mõju:** Keskmine — haridusasutused vajavad kindlust, et tööriist on pikaajaline.

- [ ] **6.2. Puudub SLA** — koolide jaoks: mis on uptime garantii? Kes vastutab koolipäeval tekkinud katkestuse eest?
  **Mõju:** Keskmine — kordab auditi #9 leidu #5.2.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| GDPR | 6 | 2 | 4 |
| ePrivacy | 3 | 2 | 1 |
| Ligipääsetavuse direktiiv | 3 | 1 | 2 |
| Autoriõigus | 3 | 2 | 1 |
| Avaliku sektori standardid | 4 | 1 | 3 |
| Rahastus ja jätkusuutlikkus | 2 | 0 | 2 |
| **Kokku** | **21** | **8** | **13** |

## Top-5 probleemid (mõju hankeotsusele)

1. **Alaealiste andmekaitse puudub** (#1.3) — GDPR artikkel 8, koolide kasutus nõuab vanema nõusolekut
2. **Andmete kustutamise funktsioon puudub** (#1.4) — GDPR artikkel 17 nõue
3. **WCAG 2.1 AA vastavus on osaline** (#3.2) — ligipääsetavuse direktiivi rikkumine
4. **ISKE/RIHA registreering** (#5.1, #5.2) — Eesti avaliku sektori nõuded
5. **Jätkusuutlikkuse plaan pole nähtav** (#6.1) — koolid vajavad pikaajalist kindlust

## Mis on hästi tehtud

- MIT litsents — ideaalne avaliku sektori jaoks
- Privaatsuspoliitika ja ligipääsetavuse teatis olemas
- Cookie consent implementeeritud
- Eestikeelne liides
- Põhifunktsioonid töötavad ilma küpsisteta
- EKI kui usaldusväärne riigiasutus
