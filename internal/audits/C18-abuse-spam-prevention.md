# Checklist: Kuritarvituse ennetamine (Abuse / Spam Prevention)

**Tüüp:** Turva- ja kulu kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — rate limiting, sisu modereerimine, kulude kaitse, automatiseeritud kuritarvitus.

---

## Rate Limiting

- [x] **1.1. API Gateway globaalne throttle** — `rateLimit: 2`, `burstLimit: 4`. Kaitseb massiivse koormuse eest.
- [ ] **1.2. Puudub per-user rate limiting** — üks kasutaja kasutab kogu globaalset limiiti. 2 req/s × 86400s = 172,800 päringut/päev ühe kasutaja poolt.
  **Soovitus:** Lisa per-user limiit: max 100 sünteesi/tunnis, 500/päev kasutaja kohta.
- [ ] **1.3. Puudub per-IP rate limiting** — anonüümsed endpointid (süntees ilma kontota) pole IP-põhiselt piiratud. Bot võib saata tuhandeid päringuid.
  **Soovitus:** Lisa AWS WAF IP rate rule: max 100 req/5min per IP.
- [ ] **1.4. Puudub CAPTCHA** — pole reCAPTCHA'd ega hCaptcha'd anonüümsele sünteesile. Bot'id saavad piiramatult sünteesida.
  **Soovitus:** Lisa CAPTCHA anonüümsele sünteesile pärast N päringut (nt 10 sünteesi ilma kontota).
- [ ] **1.5. Sünteesi teksti pikkus pole piiratud frontendis** — kas backend piirab teksti pikkust? `validateText` funktsioon kontrollib, et tekst on olemas, aga kas kontrollib max pikkust?
  **Test:** Saada 100,000 tähemärgiga tekst. Kas backend keeldub? Kas TTS worker crashib?
  **Soovitus:** Lisa max teksti pikkuse limiit (nt 5000 tähemärki).

## Sisu modereerimine

- [ ] **2.1. Puudub roppuste filter** — kasutaja saab sünteesida: solvanguid, ähvardusi, vihakõnet. TTS genereerib kõik.
  **Soovitus:** Lisa must nimekiri (blacklist) roppuste ja vihakõne jaoks. Blokeeri süntees keelatud sisuga.
- [ ] **2.2. Puudub PII tuvastamine** — kasutaja võib sünteesida isikuandmeid: isikukoode, telefoninumbreid, aadresse. TTS genereerib need audioks.
  **Soovitus:** Lisa hoiatus: "Ärge sisestage isikuandmeid." Kaaluda automaatset PII tuvastamist.
- [ ] **2.3. Jagatud ülesannete sisu pole modereeritud** — kasutaja jagab ülesande lingiga. Sisu võib olla sobimatu. Lingi saaja näeb sisu ilma modereerimiseta.
  **Soovitus:** Lisa "Teata sobimatust sisust" nupp jagatud ülesande vaatele.
- [ ] **2.4. Puudub sisu modereerimine API** — pole integratsitooni AWS Comprehend'i, Google Perspective API või muu modereerimise teenusega.
  **Soovitus:** Lisa lihtne regex-põhine filter esmalt. Tulevikus: ML-põhine modereerimine.

## Automatiseeritud kuritarvitus

- [ ] **3.1. TTS-i masskasutus on võimalik** — üks kasutaja saab sünteesida tuhandeid lauseid ja alla laadida WAV-faile. See on tasuta TTS teenuse kuritarvitus.
  **Soovitus:** Lisa päevaline sünteesi limiit: 500 sünteesi/päev kontoga, 50 ilma kontota.
- [ ] **3.2. Audio scraping** — audiofailid on avalikud S3-s (PublicReadGetObject). Keegi saab kõik audiofailid alla laadida ja luua konkureeriva TTS teenuse.
  **Soovitus:** Lisa CloudFront signed URLs audio jaoks. Või piira ligipääs ainult autenditud kasutajatele.
- [ ] **3.3. Account farming** — kas keegi saab luua sadu kontosid automaatselt? Cognito peaks piirama registreerimist, aga pole selge, kas on CAPTCHA registreerumisel.
  **Soovitus:** Lisa CAPTCHA registreerimisele.
- [ ] **3.4. API abuse for deepfake** — TTS-ga saab genereerida kõnet, mis kõlab nagu reaalne inimene. Kuritarvituse oht: fake kõned, desinformatsioon.
  **Soovitus:** Lisa vesimärk (watermark) genereeritud audios. Lisa kasutustingimustes keeld deepfake loomiseks.
- [ ] **3.5. DDoS amplification** — üks sünteesi päring genereerib ~100KB audio. Massiivne sünteesi päringute maht genereerib palju S3 andmemahtu. Kulu: ~$0.09/GB data transfer.
  **Soovitus:** Rate limiting + CAPTCHA + per-user limiidid.

## Teavitamine ja reageerimine

- [ ] **4.1. Puudub kuritarvituse teavitamise nupp** — kasutajad ei saa teatada sobimatust sisust jagatud ülesannetes.
  **Soovitus:** Lisa "Teata" nupp.
- [ ] **4.2. Puudub kuritarvituse logmmine** — pole eraldi logi kuritarvituse katsete jaoks (blokeeritud päringud, keelatud sisu, piiratud kasutajad).
  **Soovitus:** Lisa abuse log ja monitor.
- [ ] **4.3. Puudub kasutaja blokeerimise mehhanism** — pole admin-funktsitooni kasutaja blokeerimiseks. Kui keegi kuritarvitab, pole viisi teda peatada (v.a Cognito'st kasutaja kustutamine käsitsi).
  **Soovitus:** Lisa admin API: `POST /admin/block-user/{userId}`.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Rate Limiting | 5 | 1 | 4 |
| Sisu modereerimine | 4 | 0 | 4 |
| Automatiseeritud kuritarvitus | 5 | 0 | 5 |
| Teavitamine | 3 | 0 | 3 |
| **Kokku** | **17** | **1** | **16** |

## Prioriteedid

1. **P0:** Per-user rate limiting — kaitse kulu ja koormuse eest (#1.2)
2. **P0:** Teksti pikkuse limiit — kaitse TTS crashide eest (#1.5)
3. **P1:** Roppuste filter — sisu modereerimine (#2.1)
4. **P1:** CAPTCHA anonüümsele sünteesile (#1.4)
5. **P1:** Päevaline sünteesi limiit (#3.1)
6. **P2:** Kuritarvituse teavitamise nupp (#4.1)
7. **P2:** Audio vesimärk (#3.4)
