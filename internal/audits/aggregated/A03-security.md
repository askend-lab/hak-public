# Agregeeritud leiud: Turvalisus

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. Per-user rate limiting puudub

**Viited: 10 kirjet** — #3, #10, #16, #17, #20, C08, C09, C14, C18, C22

Ainult globaalne API Gateway throttle (2 req/s). Üks kasutaja blokeerib teised. Bot saab ammendada kogu limiidi.

- [ ] Per-user rate limit: max 100 sünteesi/tunnis, 500/päev
- [ ] Per-IP rate limit anonüümsetele endpointidele

**Hinnang:** 1 päev | **Prioriteet:** P0

---

## 2. API Gateway throttle on liiga madal

**Viited: 7 kirjet** — #3, #10, #17, #20, C08, C09, C22

2 req/s on blocker >30 samaaegset kasutajat. Kooli klassiruumis (25 õpilast) tekib kiiresti probleem.

- [ ] Tõsta prod throttle: 100 req/s, burst 200

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 3. Security headers puuduvad

**Viited: 6 kirjet** — #10, #16, C10, C14, C20, C22

Puuduvad: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

- [ ] CloudFront response headers policy
- [ ] CSP CloudFront'i päisena (praegu ainult meta-tag)

**Hinnang:** 1 päev | **Prioriteet:** P0

---

## 4. S3 encryption at rest puudub

**Viited: 5 kirjet** — #10, #11, C10, C14, C22

Audio bucket pole serveripoolselt krüpteeritud. ISKE/ISO 27001 nõuab encryption at rest.

- [ ] Lisa SSE-S3 (AES-256) kõigile S3 bucket'idele

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 5. Sisu modereerimine puudub

**Viited: 9 kirjet** — #4, #9, #10, #14, C07, C14, C18, C22, C25

Kasutaja saab sünteesida roppuseid, vihakõnet, ähvardusi. Pole filtrit. Jagatud sisu pole modereeritud.

- [ ] Must nimekiri (blacklist) roppuste/vihakõne jaoks
- [ ] "Teata sobimatust sisust" nupp jagatud ülesandel

**Hinnang:** 2–3 päeva | **Prioriteet:** P1

---

## 6. CAPTCHA puudub

**Viited: 4 kirjet** — #10, C14, C18, C22

Pole reCAPTCHA'd anonüümsele sünteesile ega registreerimisele. Bot'id saavad piiramatult kasutada.

- [ ] CAPTCHA anonüümsele sünteesile pärast N päringut
- [ ] CAPTCHA registreerimisele

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 7. WAF (Web Application Firewall) puudub

**Viited: 5 kirjet** — #10, #11, C10, C14, C22

Pole AWS WAF reegleid. Pole IP-põhist blokeerimist, pole SQL/XSS kaitse reegleid.

- [ ] AWS WAF API Gateway'le
- [ ] IP rate rule, SQL injection rule, XSS rule

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 8. IDOR / ligipääsukontrolli verifitseerimine

**Viited: 4 kirjet** — #10, #16, C14, C22

Kas kasutaja saab lugeda teise kasutaja ülesandeid UUID arvamise kaudu? Backend peaks kontrollima userId vastavust.

- [ ] Verifitseeri: GET /api/tasks/{id} kontrollib userId vastavust
- [ ] Kirjuta integratsioonitestid ligipääsukontrollile

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 9. Cognito filter injection risk

**Viited: 3 kirjet** — #10, C14, C22

`findUserByEmail` kasutab e-posti otse Cognito `Filter` stringis. Erimärgid võivad rikkuda filtrit.

- [ ] Valideeri e-posti formaat enne Cognito päringut

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 10. npm audit / haavatavad sõltuvused pole CI-s

**Viited: 5 kirjet** — C14, C20, C24, C25, C22

Pre-commit hook kontrollib, aga CI pipeline'is pole automatiseeritud `pnpm audit`.

- [ ] Lisa `pnpm audit` CI sammuks
- [ ] Lisa Renovate/Dependabot sõltuvuste uuendamiseks

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 11. Kasutaja blokeerimise mehhanism puudub

**Viited: 3 kirjet** — #10, C18, C22

Kui keegi kuritarvitab, pole viisi teda peatada (v.a Cognito'st käsitsi kustutamine).

- [ ] Admin API: block/unblock kasutaja

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 12. Audio vesimärk (watermark) puudub

**Viited: 3 kirjet** — #10, C18, C25

TTS-ga saab genereerida kõnet deepfake jaoks. Vesimärk aitaks tuvastada genereeritud kõne.

- [ ] Audio vesimärk tulevikus

**Hinnang:** 3–5 päeva | **Prioriteet:** P3

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | Per-user rate limiting | 10 | P0 |
| 2 | API Gateway throttle liiga madal | 7 | P0 |
| 3 | Security headers | 6 | P0 |
| 4 | S3 encryption at rest | 5 | P0 |
| 5 | Sisu modereerimine | 9 | P1 |
| 6 | CAPTCHA | 4 | P1 |
| 7 | WAF | 5 | P1 |
| 8 | IDOR kontroll | 4 | P1 |
| 9 | Cognito filter injection | 3 | P1 |
| 10 | npm audit CI-s | 5 | P1 |
| 11 | Kasutaja blokeerimine | 3 | P2 |
| 12 | Audio vesimärk | 3 | P3 |
| **Kokku** | **12 unikaalset leidu** | **64 originaalkirjet** | |
