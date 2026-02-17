# Agregeeritud leiud: Privaatsus ja õiguslik vastavus

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. "Kustuta minu andmed" funktsioon puudub (GDPR art. 17)

**Viited: 8 kirjet** — #4, #9, #10, #19, C01, C10, C11, C22

Kasutaja ei saa ise oma andmeid kustutada. Peab kirjutama e-maili. GDPR nõuab self-service andmete kustutamist.

- [ ] "Kustuta minu konto ja andmed" nupp profiilis
- [ ] Backend endpoint: DELETE /api/user/me
- [ ] Cognito konto kustutamine + DynamoDB andmete puhastamine

**Hinnang:** 2–3 päeva | **Prioriteet:** P1

---

## 2. Kasutustingimuste (ToS) leht puudub

**Viited: 7 kirjet** — #9, #12, #14, #19, C01, C11, C22

Pole `/terms` lehte. Kasutaja ei tea, mida teenusega võib teha, mida mitte. Keelatud kasutus pole defineeritud.

- [ ] Kasutustingimuste leht (/terms)
- [ ] Nõustumise mehhanism registreerumisel

**Hinnang:** 2–3 päeva (juriidiline tekst + UI) | **Prioriteet:** P1

---

## 3. Alaealiste andmekaitse puudub

**Viited: 5 kirjet** — #4, #9, C01, C11, C22

Privaatsuspoliitika ei maini lapsi. Pole viidet COPPA-le ega lastele mõeldud andmekaitsenormidele. Koolide kontekstis on see oluline.

- [ ] Laste andmekaitse lõik privaatsuspoliitikas
- [ ] Vanuse kontroll / vanema nõusolek (kaaluda)

**Hinnang:** 1 päev (poliitikas) | **Prioriteet:** P1

---

## 4. Andmekaitseametniku (DPO) kontakt puudub

**Viited: 3 kirjet** — C01, C10, C11

GDPR artiklid 37-39 nõuavad DPO kontakti avalikustamist, kui töödeldakse suures mahus isikuandmeid.

- [ ] DPO kontakt privaatsuspoliitikasse
- [ ] Või: põhjendus, miks DPO pole vajalik

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 5. Andmetöötlejate (processors) nimekiri pole täielik

**Viited: 4 kirjet** — C01, C10, C11, C22

Privaatsuspoliitikas on mainitud AWS, Google, Sentry. Aga pole täpset nimekirja: milline teenus, kus hostatakse, mis andmeid töötleb.

- [ ] Täielik andmetöötlejate nimekiri: AWS (eu-west-1), Google (OAuth), Sentry (vealogimine)

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 6. Cookie consent pole lastesõbralik

**Viited: 3 kirjet** — #4, C01, C11

Cookie consent tekst on täiskasvanule mõeldud juriidiline tekst. Laps ei mõista seda.

- [ ] Lihtsustatud cookie consent versioon (kaaluda)

**Hinnang:** 0.5 päeva | **Prioriteet:** P3

---

## 7. Sünteesi API logib sisestatud teksti

**Viited: 4 kirjet** — #4, C01, C06, C10

Backend logib sünteesipäringuid (`logger.info`). Kasutaja sisestatud tekst salvestatakse serveri logidesse. Pole selge, kui kaua logisid hoitakse.

- [ ] CloudWatch logide retention poliitika defineerima
- [ ] Logimisest informeerimine privaatsuspoliitikas

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 8. Andmete ekspordi (portability) funktsioon puudub (GDPR art. 20)

**Viited: 3 kirjet** — C01, C10, C22

Kasutaja ei saa oma andmeid eksportida (JSON/CSV). GDPR nõuab andmete portability õigust.

- [ ] "Laadi alla minu andmed" nupp (JSON eksport)

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 9. Ligipääsetavuse teatis ei vasta EL-i mudelile

**Viited: 5 kirjet** — #7, #19, C11, C23, C22

Teatis on olemas, kuid puuduvad: vastavuse staatus, tagasiside mehhanism, jõustamisprotseduur, koostamise kuupäev.

- [ ] Uuenda teatis vastavalt EL-i mudelile
- [ ] Lisa tagasiside mehhanism
- [ ] Lisa viide TTJA-le

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 10. Intellektuaalomandi kaitse puudub

**Viited: 3 kirjet** — #12, C11, C25

Pole selgust: kas genereeritud audio on kasutaja oma? Kas seda tohib kommertseesmärgil kasutada? Kas seda tohib kasutada deepfake loomiseks?

- [ ] Kasutustingimustesse: genereeritud audio kasutamise reeglid
- [ ] Keeld deepfake loomiseks

**Hinnang:** Sisaldub ToS loomises | **Prioriteet:** P2

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | "Kustuta minu andmed" | 8 | P1 |
| 2 | Kasutustingimused (ToS) | 7 | P1 |
| 3 | Alaealiste andmekaitse | 5 | P1 |
| 4 | DPO kontakt | 3 | P1 |
| 5 | Andmetöötlejate nimekiri | 4 | P2 |
| 6 | Cookie consent lastele | 3 | P3 |
| 7 | Sünteesi logide privaatsus | 4 | P2 |
| 8 | Andmete eksport (portability) | 3 | P2 |
| 9 | Ligipääsetavuse teatis | 5 | P1 |
| 10 | Intellektuaalomandi kaitse | 3 | P2 |
| **Kokku** | **10 unikaalset leidu** | **45 originaalkirjet** | |
