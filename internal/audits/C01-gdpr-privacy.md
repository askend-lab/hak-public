# Checklist: GDPR / Privaatsus

**Tüüp:** Vastavuse kontrollnimekiri (compliance checklist)
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — privaatsuspoliitika, küpsiste haldamine, andmete töötlemine, kolmandad osapooled.

---

## Artikkel 5 — Töötlemise põhimõtted

- [x] **5.1. Eesmärgipärasus** — privaatsuspoliitika loetleb selged eesmärgid: teenuse osutamine, tekstianalüüs, turvalisus, veamonitooring. Igal eesmärgil on õiguslik alus.
- [x] **5.2. Minimaalsus** — kogutakse ainult vajalikud andmed: user ID (sub), e-post, ülesannete sisu, tehnilised logid. Pole üleliigseid andmeid.
- [ ] **5.3. Säilitamise piiramine** — privaatsuspoliitika ütleb "seni, kuni kasutaja taotleb kustutamist". Pole konkreetseid säilitamise tähtaegu (nt "logid kustutatakse 90 päeva pärast"). GDPR eelistab konkreetseid tähtaegu.
  **Soovitus:** Lisa konkreetsed säilitamise tähtajad: logid X päeva, kasutajaandmed Y kuud pärast viimast sisselogimist.
- [x] **5.4. Täpsus** — kasutaja saab oma ülesandeid muuta ja parandada. E-posti muutmine käib autentimisteenuse kaudu.
- [ ] **5.5. Terviklikkus ja konfidentsiaalsus** — token'id on mälus (mitte localStorage'is). Hea turvapraktika. Kuid puudub andmete krüpteerimise kirjeldus (DynamoDB encryption at rest, S3 encryption).
  **Soovitus:** Dokumenteeri krüpteerimise mehhanismid privaatsuspoliitikas.

## Artikkel 6 — Töötlemise seaduslikkus

- [x] **6.1. Nõusoleku põhine** — küpsiste nõusolek on implementeeritud (`CookieConsent`). Sentry laaditakse ainult nõusoleku korral (`hasTrackingConsent()`).
- [x] **6.2. Lepinguline alus** — teenuse osutamine (süntees, ülesanded) on lepingulisel alusel. Korrektne.
- [x] **6.3. Õigustatud huvi** — logid ja turvalisus on õigustatud huvi alusel. Korrektne.
- [ ] **6.4. Puudub nõusoleku tagasivõtmise mehhanism** — kasutaja saab küpsiste nõusolekut anda (`Nõustun`) ja keelduda (`Keeldun`), aga pole viisi MUUTA otsust hiljem. Pole "Küpsiste seaded" linki jaluses.
  **Soovitus:** Lisa "Küpsiste seaded" link, mis avab uuesti nõusoleku dialoogi.

## Artikkel 7 — Nõusoleku tingimused

- [x] **7.1. Vaba nõusolek** — kasutaja saab keelduda ja teenus töötab endiselt (süntees ilma kontota). Nõusolek pole sunduslik.
- [x] **7.2. Informeeritud nõusolek** — nõusoleku tekst selgitab, mida küpsised teevad: "kasutajakogemuse parandamiseks ning veahalduseks (Sentry)".
- [ ] **7.3. Nõusoleku granuleeritus puudub** — ainult üks "Nõustun/Keeldun" valik. Pole võimalust eraldi nõustuda: (a) vajalikud küpsised, (b) analüütika, (c) veamonitooring. GDPR eelistab granuleeritud nõusolekut.
  **Soovitus:** Lisa küpsiste kategooriad eraldi nõusolekuga.

## Artikkel 8 — Laste andmekaitse

- [ ] **8.1. Vanuse kontroll puudub** — pole vanuse kinnitamist ega vanema nõusoleku mehhanismi. Eestis on piir 13 aastat. Kui koolid kasutavad, on enamik kasutajaid alaealised.
  **Soovitus:** Lisa vanuse kinnituse mehhanism või koolide jaoks vanema nõusoleku töövoog.
- [ ] **8.2. Privaatsuspoliitika ei maini lapsi** — pole lõiku alaealiste andmete töötlemise kohta.
  **Soovitus:** Lisa lõik alaealiste andmekaitse kohta.

## Artikkel 12–14 — Läbipaistvus

- [x] **12.1. Privaatsuspoliitika on olemas** — `/privacy` leht, eesti keeles, selge struktuur.
- [x] **12.2. Vastutav töötleja on identifitseeritud** — EKI, Roosikrantsi 6, registrikood 70004011.
- [x] **12.3. Kontaktandmed on olemas** — eki@eki.ee.
- [x] **12.4. Töötlemise eesmärgid on loetletud** — teenuse osutamine, analüüs, turvalisus, veamonitooring.
- [x] **12.5. Kolmandad osapooled on loetletud** — AWS/Cognito, Google, TARA/RIA, Sentry. Iga teenuse privaatsuspoliitikale on viidatud.
- [x] **12.6. EL-ist väljaspoole edastamine on mainitud** — "rakendame edastuseks asjakohaseid kaitsemeetmeid".
- [ ] **12.7. Puudub andmekaitseametniku (DPO) kontakt** — EKI-l peaks olema DPO (riigiasutus). Privaatsuspoliitikas on ainult üldine eki@eki.ee.
  **Soovitus:** Lisa DPO kontaktandmed, kui DPO on määratud.
- [x] **12.8. Järelevalveasutus on mainitud** — Andmekaitse Inspektsioon, www.aki.ee, info@aki.ee, Tatari 39.

## Artikkel 15 — Juurdepääsuõigus

- [ ] **15.1. Puudub andmete ekspordi funktsioon** — kasutaja ei saa ise oma andmeid alla laadida. ZIP eksport on üksikutele ülesannetele, aga pole "Ekspordi kõik minu andmed" funktsiooni.
  **Soovitus:** Lisa "Minu andmed" leht koos ekspordi nupuga.

## Artikkel 17 — Kustutamisõigus

- [ ] **17.1. Puudub iseteeninduslik konto kustutamine** — privaatsuspoliitika ütleb ausalt: "teenuses puudub hetkel iseteeninduslik konto kustutamise võimalus". Kasutaja peab saatma e-kirja.
  **Soovitus:** Implementeeri "Kustuta minu konto ja andmed" funktsioon seadete lehel.
- [x] **17.2. Ülesannete kustutamine töötab** — `deleteTask` kustutab üksikuid ülesandeid. Kasutaja saab oma sisu kustutada.

## Artikkel 20 — Ülekandmisõigus

- [ ] **20.1. Andmete ülekandmine pole automatiseeritud** — pole masinloetavat eksporti (JSON/CSV). ZIP eksport on ülesandepõhine, mitte kõigi andmete koondeksport.
  **Soovitus:** Lisa "Ekspordi kõik andmed JSON-ina" funktsioon.

## Artikkel 25 — Lõimitud andmekaitse (Privacy by Design)

- [x] **25.1. Token'id mälus** — `AuthStorage` hoiab access/id token'eid ainult mälus, mitte localStorage'is. XSS ei saa token'eid varastada.
- [x] **25.2. Refresh token httpOnly küpsises** — kommentaar koodis: "Refresh token is stored in an httpOnly cookie set by the auth backend."
- [x] **25.3. Sentry ainult nõusolekul** — `Sentry.init({ enabled: import.meta.env.PROD && hasTrackingConsent() })`.
- [x] **25.4. Süntees ilma kontota** — anonüümne kasutamine on võimalik. Andmete minimaalsus.
- [ ] **25.5. Tekst logitakse serveris** — kuni 50 märki sisestatud tekstist logitakse veaotsingu eesmärgil. On privaatsuspoliitikas mainitud, aga kasutaja ei tea, et tema tekst salvestatakse.
  **Soovitus:** Lisa in-app teade sisestusvälja juurde: "Sisestatud tekst võidakse logida veaotsingu eesmärgil."

## Artikkel 28 — Volitatud töötleja

- [ ] **28.1. Andmetöötluslepingud (DPA)** — AWS, Sentry, Google — kas on sõlmitud DPA-d? Koodist pole võimalik kontrollida.
  **Soovitus:** Dokumenteeri DPA-de staatus iga volitatud töötlejaga.

## Artikkel 33–34 — Andmerikkumise teavitamine

- [ ] **33.1. Puudub incident response plaan** — pole dokumenteeritud protsessi andmerikkumise korral: kes teavitab, millal, kuidas.
  **Soovitus:** Loo andmerikkumise teavitamise protseduur (72h reegel AKI-le).

## ePrivacy / küpsised

- [x] **eP.1. Cookie consent banner** — olemas, nõustumise ja keeldumise nuppudega.
- [x] **eP.2. localStorage kasutus** — peamised funktsioonid (süntees) töötavad ilma küpsisteta. localStorage kasutus: lausete olek, kasutaja info, rolli valik, küpsiste nõusolek.
- [ ] **eP.3. Google Fonts jälgimine** — kui Google Fonts laetakse välistest serveritest, salvestab Google kasutaja IP-aadressi. Pole privaatsuspoliitikas eraldi mainitud.
  **Soovitus:** Kas Google Fonts on self-hosted või väline? Kui väline, maini privaatsuspoliitikas.

---

## Kokkuvõte

| GDPR artikkel | Punktid | ✅ Täidetud | ⚠️ Puudub |
|---------------|---------|------------|-----------|
| Art. 5 (põhimõtted) | 5 | 3 | 2 |
| Art. 6 (seaduslikkus) | 4 | 3 | 1 |
| Art. 7 (nõusolek) | 3 | 2 | 1 |
| Art. 8 (lapsed) | 2 | 0 | 2 |
| Art. 12–14 (läbipaistvus) | 8 | 7 | 1 |
| Art. 15 (juurdepääs) | 1 | 0 | 1 |
| Art. 17 (kustutamine) | 2 | 1 | 1 |
| Art. 20 (ülekandmine) | 1 | 0 | 1 |
| Art. 25 (lõimitud kaitse) | 5 | 4 | 1 |
| Art. 28 (töötleja) | 1 | 0 | 1 |
| Art. 33–34 (rikkumine) | 1 | 0 | 1 |
| ePrivacy | 3 | 2 | 1 |
| **Kokku** | **36** | **22** | **14** |

## Üldine hinnang

**Hea tase MVP jaoks.** Privaatsuspoliitika on põhjalik ja professionaalne. Token'ide turvalisus on eeskujulik (mälu + httpOnly). Peamised puudujäägid: alaealiste andmekaitse, konto kustutamise funktsioon, nõusoleku granuleeritus. Need on vajalikud enne koolide laialdast kasutamist.
