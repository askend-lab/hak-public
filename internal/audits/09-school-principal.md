# Audit: Koolijuht (Institutsionaalne vaatenurk)

**Vaatenurk:** Koolijuht, kes otsustab, kas võtta Hääldusabiline koolis kasutusele. Hindab vastavust, aruandlust, integreeritavust, turvalisust ja kulusid.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja infrastruktuuri analüüs — GDPR vastavus, ligipääsetavuse nõuded, aruandlus, haldus, integratsioonid.

---

## Kasutajaprofiil

Margus Tamm, 52-aastane, Tallinna Pelgulinna Gümnaasiumi direktor. 800 õpilast, 60 õpetajat. Otsib digitaalseid tööriistu eesti keele õpetamiseks venekeelsetele õpilastele. Peab vastama HTM (Haridus- ja Teadusministeeriumi) nõuetele, GDPR-ile ja riigihanke reeglitele. IT-osakond on 2 inimest.

---

## Koolijuhi teekond

### Etapp 1: Vastavus ja regulatsioonid

- [x] **1.1. GDPR küpsiste nõusolek** — `CookieConsent` komponent pakub "Nõustun" ja "Keeldun" nuppe. GDPR-i nõue on täidetud küpsiste osas.

- [x] **1.2. Privaatsuspoliitika olemas** — `/privacy` leht on olemas. Riigiasutuse (EKI) platvormina on see oodatav.

- [x] **1.3. Ligipääsetavuse teatis olemas** — `/accessibility` leht on olemas. Eesti avaliku sektori veebilehtede nõue (WCAG 2.1 AA).

- [ ] **1.4. Privaatsuspoliitika ei käsitle alaealiste andmeid** — koolis kasutamisel on enamik kasutajaid alaealised (7–18 a). Privaatsuspoliitika peaks sisaldama lõiku alaealiste andmete töötlemise kohta, vanema nõusoleku nõuet ja andmete säilitamise tähtaegu.
  **Mõju:** Kõrge — GDPR artikkel 8 nõuab alla 16-aastaste (Eestis alla 13-aastaste) puhul vanema nõusolekut. Kui platvorm on koolide jaoks, on see compliance-probleem.

- [ ] **1.5. Puudub andmetöötlusleping (DPA)** — kooli ja EKI vahel peaks olema andmetöötlusleping, mis reguleerib: millised andmed kogutakse, kus neid hoitakse, kes vastutab, millal kustutatakse. Koodist selgub, et sünteesi tekst logitakse serveris, aga DPA info puudub.
  **Mõju:** Kõrge — koolid peavad sõlmima DPA iga andmetöötlejaga. Ilma DPA-ta ei saa kool ametlikult platvormi kasutusele võtta.

- [ ] **1.6. Andmete asukoht pole selge** — AWS infrastruktuur (Cognito, Lambda, S3, DynamoDB) — millises regioonis? GDPR nõuab, et EL-i kodanike andmed oleksid EL-is. Koodist selgub, et Terraform konfiguratsioon peaks seda määrama, aga kasutajale/koolile pole see nähtav.
  **Mõju:** Keskmine — tõenäoliselt eu-north-1 või eu-west-1, aga peaks olema privaatsuspoliitikas kirjas.

### Etapp 2: Haldus ja kontroll

- [ ] **2.1. Puudub kooli administraatori roll** — pole admin-paneeli, kus koolijuht saaks: vaadata õpetajate ja õpilaste kasutust, hallata kontosid, seadistada reegleid. Kõik kasutajad on võrdsed.
  **Mõju:** Kõrge — kooli IT-osakond ei saa hallata kasutajaid ega jälgida kasutust. Pole "Kooli X kasutajad" grupeerimist.

- [ ] **2.2. Puudub kasutusstatistika** — koolijuht ei saa näha: mitu õpetajat kasutab platvormi, mitu ülesannet on loodud, mitu õpilast on jagatud ülesandeid avanud. Pole dashboard'i ega aruannet.
  **Mõju:** Kõrge — HTM nõuab digipädevuse aruandlust. Koolijuht peab tõendama, et digitaalsed tööriistad on kasutusel.

- [ ] **2.3. Puudub SSO (Single Sign-On) tugi** — koolid kasutavad sageli Microsoft 365 / Google Workspace kontosid. Praegu on ainult TARA ja Google auth. Puudub SAML/OIDC SSO, mis võimaldaks kooli Azure AD-ga integreeruda.
  **Mõju:** Keskmine — Google auth on olemas, aga Microsoft 365 (levinuim koolides) puudub. TARA on hea Eesti kontekstis, aga alaealised ei pruugi omada ID-kaarti.

- [ ] **2.4. Puudub kasutajate hulgiimport** — koolijuht ei saa importida õpilaste nimekirja CSV-failist. Iga kasutaja peab ise registreeruma.
  **Mõju:** Madal — kuna süntees töötab ilma kontota, pole hulgiimport kriitiline. Aga ülesannete jaoks oleks kasulik.

### Etapp 3: Pedagoogiline sobivus

- [x] **3.1. Rollipõhine onboarding** — õpetaja ja õppija saavad erineva juhendi. Pedagoogiliselt mõistlik lähenemine.

- [x] **3.2. Ülesannete jagamine** — õpetaja saab luua ülesandeid ja jagada linke õpilastega. Põhiline pedagoogiline töövoog on olemas.

- [ ] **3.3. Puudub õppekava sidumine** — pole võimalust siduda ülesandeid õppekava teemade, tasemete (A1, A2, B1) ega ainekavaga. Koolijuht ei näe, kuidas platvorm toetab konkreetset õppekava.
  **Mõju:** Keskmine — õppekava sidumine on oluline pedagoogilise planeerimise jaoks, aga MVP-le pole kriitiline.

- [ ] **3.4. Puudub hindamine ja tagasiside** — õpilane teeb ülesande, aga puudub automaatne hindamine (kas hääldus oli õige?) ja õpetaja tagasiside funktsioon. Pole punkte, hindeid ega märkusi.
  **Mõju:** Kõrge — kooli kontekstis on hindamine ja tagasiside põhifunktsioonid. Ilma nendeta on platvorm ainult harjutamisvahend, mitte õpetamisvahend.

- [ ] **3.5. Puudub progressi jälgimine klassiti** — õpetaja ei näe klassi koondtulemusi: kes on harjutanud, kes mitte, millised sõnad on rasked. Koolijuht ei näe kooli koondpilti.
  **Mõju:** Kõrge — kordab varasemate auditite leide (#2 ja #4), aga institutsionaalses kontekstis on see otsustav.

### Etapp 4: Tehniline sobivus koolis

- [x] **4.1. Veebirakendus, pole installatsiooni** — töötab brauseris, pole vaja midagi installida. IT-osakonna jaoks lihtne: pole tarkvara haldamist.

- [x] **4.2. Töötab koolide tulemüüri taga** — HTTPS, standardsed pordid. Pole WebSocket'e ega ebatavalisi protokolle, mis võiksid tulemüüris blokeeruda.

- [ ] **4.3. Puudub offline-tugi** — koolides on mõnikord aeglane või katkendlik internet. Pole Service Worker'it ega PWA-d. Tunni ajal internetikatkestus = platvorm ei tööta.
  **Mõju:** Keskmine — ZIP eksport võimaldab offline kasutamist (laadi alla enne tundi), aga reaalajas kasutamine nõuab ühendust.

- [ ] **4.4. Puudub LTI (Learning Tools Interoperability) tugi** — koolid kasutavad õpihaldussüsteeme (Moodle, Google Classroom, eKool). LTI standard võimaldaks platvormi integreerida nendesse süsteemidesse. Praegu on integratsioon ainult jagamislingi kaudu.
  **Mõju:** Keskmine — LTI on haridussektori standard. Integratsioon eKool'iga oleks Eesti kontekstis eriti väärtuslik.

- [x] **4.5. Autentimine TARA-ga** — Eesti riigiautentimine on kooli kontekstis usaldusväärne. Õpetajad saavad ID-kaardiga sisse logida.

### Etapp 5: Kulude ja riskide hindamine

- [x] **5.1. Tasuta kasutamine** — platvorm on EKI (riigiasutuse) pakutav. Pole litsentsitasusid ega liitumismakseid. Koolile kulusid pole.

- [ ] **5.2. Puudub SLA (Service Level Agreement)** — kooli jaoks on oluline teada: mis on uptime garantii? Kes vastutab, kui platvorm ei tööta koolipäeva ajal? Millal on hooldusaken?
  **Mõju:** Keskmine — riigiasutuse platvormil pole tavaliselt formaalset SLA-d, aga kooli jaoks on ootus, et see töötab 8:00–16:00.

- [ ] **5.3. Puudub tugi ja abi** — pole help desk'i, KKK-d ega õpetaja juhendit. Ainult eki@eki.ee kontakt jaluses. Kui õpetajal on probleem, pole selget tuge.
  **Mõju:** Keskmine — koolid ootavad vähemalt KKK-d ja õpetaja juhendit (PDF/video).

- [ ] **5.4. Puudub andmeekspordi / -kustutamise võimalus** — GDPR artikkel 17 (õigus olla unustatud). Kasutaja peab saama oma andmed kustutada. Koodist selgub, et `deleteTask` kustutab ülesandeid, aga pole "Kustuta minu konto ja kõik andmed" funktsiooni.
  **Mõju:** Kõrge — GDPR compliance nõue. Kooli lõpetamisel peab õpilane saama oma andmed kustutada.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Vastavus ja regulatsioonid | 6 | 3 | 3 |
| Haldus ja kontroll | 4 | 0 | 4 |
| Pedagoogiline sobivus | 5 | 2 | 3 |
| Tehniline sobivus | 5 | 3 | 2 |
| Kulud ja riskid | 4 | 1 | 3 |
| **Kokku** | **24** | **9** | **15** |

## Top-5 probleemid (mõju koolijuhile)

1. **Puudub andmetöötlusleping (DPA)** (#1.5) — kooli jaoks on DPA kohustuslik, ilma selleta ei saa ametlikult kasutusele võtta
2. **Puudub administraatori roll ja kasutusstatistika** (#2.1, #2.2) — pole hallata ega aruandeid esitada
3. **Alaealiste andmekaitse pole käsitletud** (#1.4) — GDPR artikkel 8 nõue
4. **Puudub hindamine ja progressi jälgimine** (#3.4, #3.5) — pedagoogiliselt ebapiisav kooli kontekstis
5. **Puudub "Kustuta minu andmed" funktsioon** (#5.4) — GDPR artikkel 17 nõue

## Mis on hästi tehtud

- Tasuta kasutamine riigiasutuse platvormina
- TARA autentimine — usaldusväärne kooli kontekstis
- Privaatsuspoliitika ja ligipääsetavuse teatis olemas
- Veebirakendus ilma installeerimiseta — IT-osakonnale lihtne
- Rollipõhine onboarding pedagoogilise väärtusega
- HTTPS ja standardsed pordid — tulemüürisõbralik
- Ülesannete jagamine ilma õpilase kontota
