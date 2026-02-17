# Tegevuskava: 99 leidu → 5 paralleelset töövoogu

**Allikas:** `aggregated/00-index.md` — 99 unikaalset leidu
**Eesmärk:** Prioritiseeritud plaan, kus mitu arendajat saavad paralleelselt töötada ilma üksteist blokeerimata.

---

## Töövoogude ülevaade

| Töövoog | Nimi | Osalejad | Peamine vastutus |
|---------|------|----------|-----------------|
| **WS-1** | Frontend & UI | Frontend dev | React komponendid, CSS, ligipääsetavus |
| **WS-2** | Backend & Turvalisus | Backend dev | API, rate limiting, turvapäised, auth |
| **WS-3** | Infrastruktuur & DevOps | DevOps | CloudWatch, Terraform, CI/CD, monitooring |
| **WS-4** | Dokumentatsioon & Sisu | Keegi/kõik | README-d, docs, juriidilised tekstid, i18n ettevalmistus |
| **WS-5** | Testimine & QA | QA / iga dev | E2E testid, integratsioonitestid, katvus |

*Töövoogud on sõltumatud — iga arendaja saab oma haru(d) luua ja töötada paralleelselt.*

---

## Sprint 1: P0 kriitiline (nädalad 1–2)

### WS-1: Frontend & UI — Sprint 1

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS1-01 | **PlayButton ARIA sildid eesti keelde** — "Loading"→"Laadimine", "Playing"→"Esitamine", "Play"→"Esita" | 30 min | 7 | `fix/aria-labels-et` |
| WS1-02 | **Mõned UI stringid inglise keelde jäänud** — kontrolli kõik komponendid, tõlgi eesti keelde | 30 min | 7 | `fix/aria-labels-et` |
| WS1-03 | **Veateated / vaikne ebaõnnestumine** — toast-teadete süsteem, `aria-live` piirkond, "Proovi uuesti" nupp | 1–2 pd | 16 | `feat/error-toasts` |
| WS1-04 | **Hääle ja kiiruse valik** — hääle dropdown, kiiruse liugur (0.5x–2.0x) | 2–3 pd | 14 | `feat/voice-speed-controls` |
| WS1-05 | **Mobiilne navigatsioon** — hamburger-menüü komponent, puuteekraani nupud 44×44px | 1 pd | 8 | `feat/mobile-nav` |
| WS1-06 | **`<title>` ja meta description** — index.html parandamine, OG tags, Twitter Card | 30 min | 6 | `fix/meta-tags` |

**WS-1 Sprint 1 kokku:** ~5–7 päeva | 6 ülesannet | 58 viiteid

### WS-2: Backend & Turvalisus — Sprint 1

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS2-01 | **API Gateway throttle tõstmine** — 2→100 req/s, burst 4→200 `serverless.yml` muudatus | 30 min | 7 | `fix/api-throttle` |
| WS2-02 | **Per-user rate limiting** — Lambda middleware: max 100 sünteesi/h kasutaja kohta, DynamoDB loendur | 1 pd | 10 | `feat/rate-limiting` |
| WS2-03 | **Security headers** — CloudFront response headers policy: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | 1 pd | 6 | `feat/security-headers` |
| WS2-04 | **S3 encryption at rest** — SSE-S3 (AES-256) kõigile bucket'idele, Terraform muudatus | 30 min | 5 | `fix/s3-encryption` |

**WS-2 Sprint 1 kokku:** ~3 päeva | 4 ülesannet | 28 viiteid

### WS-3: Infrastruktuur & DevOps — Sprint 1

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS3-01 | **AWS Budget Alerts** — Terraform: €50/kuu hoiatus, €100/kuu kriitiline, Cost Anomaly Detection | 30 min | 6 | `feat/budget-alerts` |
| WS3-02 | **CloudWatch Alarms + SNS** — Lambda Error, SQS DLQ, DynamoDB throttle, ECS failure + e-maili teavitused | 1 pd | 9 | `feat/cloudwatch-alarms` |

**WS-3 Sprint 1 kokku:** ~1.5 päeva | 2 ülesannet | 15 viiteid

### WS-4: Dokumentatsioon & Sisu — Sprint 1

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS4-01 | **Arhitektuuridiagramm** — `docs/architecture.md` Mermaid diagramm: komponendid, andmevoog, infrastruktuur | 1–2 pd | 9 | `docs/architecture` |
| WS4-02 | **Pakettide README-d** — 7 paketti × README: eesmärk, konfiguratsioon, käivitamine | 2–3 pd | 10 | `docs/package-readmes` |

**WS-4 Sprint 1 kokku:** ~3–5 päeva | 2 ülesannet | 19 viiteid

### WS-5: Testimine & QA — Sprint 1

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS5-01 | **E2E testid Playwright'iga** — 5 kasutajateekonda: süntees, ülesanne, jagamine, auth, onboarding | 3–5 pd | 8 | `test/e2e-tests` |

**WS-5 Sprint 1 kokku:** ~3–5 päeva | 1 ülesanne | 8 viiteid

### Sprint 1 kokkuvõte

| Töövoog | Ülesanded | Päevad | Viiteid kaetud |
|---------|----------|--------|---------------|
| WS-1 Frontend | 6 | 5–7 | 58 |
| WS-2 Backend | 4 | 3 | 28 |
| WS-3 DevOps | 2 | 1.5 | 15 |
| WS-4 Docs | 2 | 3–5 | 19 |
| WS-5 QA | 1 | 3–5 | 8 |
| **Kokku** | **15** | **2 nädala sprint** | **128 viiteid** |

*5 paralleelset arendajat → Sprint 1 valmib 2 nädalaga.*
*1 arendaja → Sprint 1 valmib ~16–21 päevaga.*

---

## Sprint 2: P1 oluline (nädalad 3–4)

### WS-1: Frontend & UI — Sprint 2

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS1-07 | **Drag-and-drop klaviatuurialternatiiv** — ArrowUp/ArrowDown + puuteekraani polyfill | 1–2 pd | 10 | `feat/keyboard-dnd` |
| WS1-08 | **Placeholder + näidislaused** — placeholder sisestusväljale, "Proovi näidislauset" nupp | 0.5 pd | 8 | `feat/placeholder-examples` |
| WS1-09 | **Tähemärgiloendur** — sisestusvälja juures, hoiatus 1000 märgi limiidile lähenemisel | 0.5 pd | 5 | `feat/char-counter` |
| WS1-10 | **Onboarding wizard parandused** — overlay klõps ei sulge, "hääldusvariant" selgitus, näidislaused pärast wizardi | 1 pd | 16 | `fix/onboarding-wizard` |
| WS1-11 | **Import/Eksport** — bulk sisestamine, CSV eksport, .txt import | 2–3 pd | 6 | `feat/import-export` |
| WS1-12 | **Foneetiliste märkide selgitused** — tooltip'id märkide juurde, "Mida need tähendavad?" link | 1 pd | 8 | `feat/phonetic-tooltips` |

**WS-1 Sprint 2 kokku:** ~6–8 päeva | 6 ülesannet | 53 viiteid

### WS-2: Backend & Turvalisus — Sprint 2

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS2-05 | **Sisu modereerimine** — must nimekiri roppuste/vihakõne jaoks, "Teata" nupp | 2–3 pd | 9 | `feat/content-moderation` |
| WS2-06 | **CAPTCHA** — reCAPTCHA anonüümsele sünteesile pärast N päringut | 1–2 pd | 4 | `feat/captcha` |
| WS2-07 | **WAF** — AWS WAF API Gateway'le: IP rate rule, SQL injection, XSS | 1 pd | 5 | `feat/waf` |
| WS2-08 | **IDOR kontroll** — verifitseeri userId vastavust task endpointidel | 1 pd | 4 | `fix/idor-check` |
| WS2-09 | **Cognito filter sanitization** — e-posti validatsioon enne Cognito päringut | 0.5 pd | 3 | `fix/cognito-filter` |
| WS2-10 | **npm audit CI-s** — `pnpm audit` CI samm + Renovate bot | 0.5 pd | 5 | `feat/npm-audit-ci` |

**WS-2 Sprint 2 kokku:** ~6–8 päeva | 6 ülesannet | 30 viiteid

### WS-3: Infrastruktuur & DevOps — Sprint 2

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS3-03 | **Struktureeritud JSON logimine** — JSON formaat kõigile Lambda'dele, requestId, userId, duration | 1–2 pd | 7 | `feat/json-logging` |
| WS3-04 | **Worker auto-scaling** — SQS-põhine: ApproximateNumberOfMessages → 0→1→5 | 1 pd | 7 | `feat/worker-autoscaling` |
| WS3-05 | **CloudTrail** — management events, S3 bucket logidele | 0.5 pd | 4 | `feat/cloudtrail` |
| WS3-06 | **CloudWatch dashboard** — Lambda, DynamoDB, SQS metrics lisamine | 1 pd | 4 | `feat/cw-dashboard` |
| WS3-07 | **Terraform CI** — `terraform plan` PR kommentaar, manual approval `apply` | 1–2 pd | 5 | `feat/terraform-ci` |
| WS3-08 | **Rollback protseduur** — dokumenteeritud rollback Serverless, Terraform, S3 | 1 pd | 4 | `docs/rollback` |
| WS3-09 | **Branch protection** — kontrolli ja dokumenteeri reeglid | 0.5 pd | 3 | `fix/branch-protection` |

**WS-3 Sprint 2 kokku:** ~6–8 päeva | 7 ülesannet | 34 viiteid

### WS-4: Dokumentatsioon & Sisu — Sprint 2

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS4-03 | **CONTRIBUTING.md** — fork workflow, koodi stiil, commit format, PR protsess | 0.5 pd | 7 | `docs/contributing` |
| WS4-04 | **SECURITY.md** — haavatavuste teavitamine, responsible disclosure | 0.5 pd | 5 | `docs/security` |
| WS4-05 | **Deployment juhend** — samm-sammult deploy, rollback | 1 pd | 5 | `docs/deployment` |
| WS4-06 | **Runbook'id** — 5 intsidendi käsitlemise protseduuri | 1–2 pd | 4 | `docs/runbooks` |
| WS4-07 | **`.env.example`** — iga paketi näidiskeskkonnamuutujad | 0.5 pd | 4 | `docs/env-examples` |
| WS4-08 | **Kasutustingimused (ToS)** — `/terms` leht, nõustumise mehhanism | 2–3 pd | 7 | `feat/terms-of-service` |
| WS4-09 | **"Kustuta minu andmed"** — GDPR art. 17, DELETE /api/user/me | 2–3 pd | 8 | `feat/gdpr-delete` |
| WS4-10 | **Ligipääsetavuse teatis** — EL-i mudelile vastavus, tagasiside mehhanism | 1 pd | 5 | `fix/accessibility-statement` |
| WS4-11 | **DPO kontakt** — privaatsuspoliitikasse | 0.5 pd | 3 | `fix/dpo-contact` |
| WS4-12 | **Alaealiste andmekaitse** — laste andmekaitse lõik privaatsuspoliitikas | 1 pd | 5 | `fix/children-privacy` |

**WS-4 Sprint 2 kokku:** ~10–12 päeva | 10 ülesannet | 53 viiteid

### WS-5: Testimine & QA — Sprint 2

| # | Ülesanne | Hinnang | Viiteid | Haru |
|---|----------|---------|---------|------|
| WS5-02 | **Testide katvuse aruanne** — coverage konfiguratsioon, min 80%, badge | 0.5 pd | 6 | `test/coverage` |
| WS5-03 | **API integratsioonitestid** — DynamoDB local, synthesize, tasks CRUD, sharing | 3–5 pd | 5 | `test/api-integration` |
| WS5-04 | **Piirväärtuste testid** — tühi sisend, max pikkus, 1000 ülesannet, localStorage täis | 2–3 pd | 5 | `test/edge-cases` |
| WS5-05 | **axe audit kõigile komponentidele** — SynthesisView, TaskDetailView, AppHeader, BaseModal | 1 pd | 4 | `test/a11y-audit` |
| WS5-06 | **Transient hook failures** — uurimine ja parandamine | 0.5 pd | 3 | `fix/flaky-hooks` |

**WS-5 Sprint 2 kokku:** ~7–10 päeva | 5 ülesannet | 23 viiteid

### Sprint 2 kokkuvõte

| Töövoog | Ülesanded | Päevad | Viiteid kaetud |
|---------|----------|--------|---------------|
| WS-1 Frontend | 6 | 6–8 | 53 |
| WS-2 Backend | 6 | 6–8 | 30 |
| WS-3 DevOps | 7 | 6–8 | 34 |
| WS-4 Docs/Legal | 10 | 10–12 | 53 |
| WS-5 QA | 5 | 7–10 | 23 |
| **Kokku** | **34** | **2 nädala sprint** | **193 viiteid** |

*WS-4 on suurim — kaaluda jaotamist mitme inimese vahel.*

---

## Sprint 3: P2 keskperiood (nädalad 5–8)

### WS-1: Frontend & UI — Sprint 3

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS1-13 | Tume teema (dark mode) | 2–3 pd | 6 |
| WS1-14 | Fondi suurus / kontrastsuse reguleerija | 1–2 pd | 6 |
| WS1-15 | Undo/Redo | 1–2 pd | 5 |
| WS1-16 | Visuaalne õnnestumise tagasiside | 0.5 pd | 4 |
| WS1-17 | Auth selgitused ("Nõuab sisselogimist" tooltip) | 0.5 pd | 4 |
| WS1-18 | Jagatud ülesande tupik → navigatsioon | 0.5 pd | 3 |
| WS1-19 | Offline tuvastamine + kasutajale teade | 1 pd | 5 |

**WS-1 Sprint 3:** ~7–9 päeva | 7 ülesannet | 33 viiteid

### WS-2: Backend & Turvalisus — Sprint 2→3

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS2-11 | Kasutaja blokeerimise mehhanism | 1–2 pd | 3 |

**WS-2 Sprint 3:** ~1–2 päeva | 1 ülesanne | 3 viiteid

### WS-3: Infrastruktuur — Sprint 3

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS3-10 | Distributed tracing (X-Ray) | 1–2 pd | 5 |
| WS3-11 | Staging keskkond | 2–3 pd | 4 |

**WS-3 Sprint 3:** ~3–5 päeva | 2 ülesannet | 9 viiteid

### WS-4: Dokumentatsioon & Sisu — Sprint 3

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS4-13 | OpenAPI spetsifikatsioon | 2–3 pd | 8 |
| WS4-14 | ADR-id (Architecture Decision Records) | 1–2 pd | 4 |
| WS4-15 | Andmemudeli dokumentatsioon | 1 pd | 5 |
| WS4-16 | CHANGELOG.md + SemVer strateegia | 0.5 pd | 3 |
| WS4-17 | Stiilijuhend + testide juhend | 1 pd | 5 |
| WS4-18 | Andmetöötlejate nimekiri | 0.5 pd | 4 |
| WS4-19 | Sünteesi logide privaatsus | 0.5 pd | 4 |
| WS4-20 | Andmete eksport (GDPR portability) | 1–2 pd | 3 |
| WS4-21 | Intellektuaalomandi kaitse (ToS-sse) | 0.5 pd | 3 |

**WS-4 Sprint 3:** ~8–11 päeva | 9 ülesannet | 39 viiteid

### WS-5: Testimine — Sprint 3

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS5-07 | Visuaalsed regressioonitestid (Playwright) | 2–3 pd | 4 |
| WS5-08 | Koormustestid (k6/Artillery) | 2–3 pd | 4 |
| WS5-09 | Lighthouse CI | 0.5 pd | 3 |

**WS-5 Sprint 3:** ~5–7 päeva | 3 ülesannet | 11 viiteid

### WS-6: i18n & Keeleline (uus töövoog Sprint 3-st)

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS6-01 | `react-i18next` raamistik + `locales/et.json` | 5–8 pd | 8 |
| WS6-02 | ARIA sildid i18n kaudu | Sisaldub ülal | 5 |
| WS6-03 | Kuupäeva/numbri formaadid (Intl API) | 1 pd | 3 |
| WS6-04 | Pluralisatsioon (eesti reeglid) | Sisaldub ülal | 3 |
| WS6-05 | Onboarding wizard EN/RU versioon | 2–3 pd | 4 |

**WS-6 Sprint 3:** ~8–12 päeva | 5 ülesannet | 23 viiteid

### WS-7: Keeleline / TTS (uus töövoog Sprint 3-st)

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS7-01 | "Normatiivne hääldus" märge | 0.5 pd | 5 |
| WS7-02 | Võõrsõnade/nimede häälduskäsitlus | 3–5 pd | 6 |
| WS7-03 | Numbrite/kuupäevade hääldusreeglid | 2–3 pd | 4 |
| WS7-04 | Lauseintonatsiooni testimine | 1 pd | 3 |
| WS7-05 | Erijuhtumite käsitlus (tühi sisend, emojid) | 1–2 pd | 5 |
| WS7-06 | TTS kvaliteedi hindamine (MOS uuring) | 2–3 pd | 4 |
| WS7-07 | Hääle salvestamine ja võrdlemine (mikrofon) | 5–10 pd | 6 |

**WS-7 Sprint 3:** ~15–25 päeva | 7 ülesannet | 33 viiteid

### WS-8: UX & Onboarding (uus töövoog Sprint 3-st)

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| WS8-01 | Progressi jälgimine (kasutusstatistika) | 5–10 pd | 10 |
| WS8-02 | Kasutusanalüütika pipeline | 3–5 pd | 7 |
| WS8-03 | Rolli valiku parandamine/lihtsustamine | 0.5 pd | 5 |
| WS8-04 | Spellcheck / "Kas mõtlesid?" | 2–3 pd | 5 |
| WS8-05 | In-app tagasiside mehhanism | 1–2 pd | 5 |
| WS8-06 | Õpetaja→Õppija töövoog (kinnitus, dashboard) | 5–10 pd | 7 |

**WS-8 Sprint 3:** ~17–30 päeva | 6 ülesannet | 39 viiteid

### Sprint 3 kokkuvõte

| Töövoog | Ülesanded | Päevad | Viiteid |
|---------|----------|--------|---------|
| WS-1 Frontend | 7 | 7–9 | 33 |
| WS-2 Backend | 1 | 1–2 | 3 |
| WS-3 DevOps | 2 | 3–5 | 9 |
| WS-4 Docs | 9 | 8–11 | 39 |
| WS-5 QA | 3 | 5–7 | 11 |
| WS-6 i18n | 5 | 8–12 | 23 |
| WS-7 TTS | 7 | 15–25 | 33 |
| WS-8 UX | 6 | 17–30 | 39 |
| **Kokku** | **40** | **4 nädala sprint** | **190 viiteid** |

---

## Backlog: P3 (tulevikus)

| # | Ülesanne | Hinnang | Viiteid |
|---|----------|---------|---------|
| BL-01 | RTL (paremalt vasakule) tugi | 2–3 pd | 2 |
| BL-02 | Cookie consent lastesõbralik versioon | 0.5 pd | 3 |
| BL-03 | 404 automaatne suunamine | 0.5 pd | 3 |
| BL-04 | PWA / Service Worker | 3–5 pd | 5 |
| BL-05 | Audio vesimärk (deepfake kaitse) | 3–5 pd | 3 |
| BL-06 | Homonüümide kontekstipõhine eristamine | 5+ pd | 4 |
| BL-07 | IPA (International Phonetic Alphabet) väljund | 3–5 pd | 4 |
| BL-08 | SPA prerendering (SSR) | 2–3 pd | 5 |
| BL-09 | Structured Data (JSON-LD) | 1 pd | 3 |
| BL-10 | Lambda cold start optimeerimine | 0.5 pd | 4 |

**Backlog kokku:** 10 ülesannet | ~21–33 päeva | 36 viiteid

---

## Koondkokkuvõte

| Sprint | Ülesanded | Unikaalsed leiud | Paralleelsus | Aeg (5 devs) | Aeg (1 dev) |
|--------|----------|-----------------|--------------|--------------|-------------|
| Sprint 1 (P0) | 15 | 18 | 5 töövoogu | **2 nädalat** | ~3–4 nädalat |
| Sprint 2 (P1) | 34 | 38 | 5 töövoogu | **2 nädalat** | ~7–9 nädalat |
| Sprint 3 (P2) | 40 | 36 | 8 töövoogu | **4 nädalat** | ~12–18 nädalat |
| Backlog (P3) | 10 | 7 | - | backlog | backlog |
| **Kokku** | **99** | **99** | | **~8 nädalat** | **~22–31 nädalat** |

### Gantt (5 paralleelset arendajat)

```
Nädal  1  2  3  4  5  6  7  8
WS-1  [===Sprint 1===][===Sprint 2===][========Sprint 3========]
WS-2  [==Spr 1==][=====Sprint 2======][S3]
WS-3  [S1][====Sprint 2=====][==Sprint 3==]
WS-4  [==Spr 1==][========Sprint 2=========][========Sprint 3========]
WS-5  [==Spr 1==][=====Sprint 2======][===Sprint 3====]
WS-6                                  [========Sprint 3========]
WS-7                                  [===========Sprint 3===========]
WS-8                                  [===========Sprint 3===========]
```

### Sõltuvused

| Ülesanne | Sõltub |
|----------|--------|
| WS6-02 (ARIA i18n) | WS6-01 (react-i18next raamistik) |
| WS1-19 (Offline) | WS1-03 (toast süsteem) |
| WS8-06 (Õpetaja dashboard) | WS2-02 (rate limiting infra) |
| WS5-03 (API integratsioonitestid) | WS2-08 (IDOR kontroll) |
| WS4-21 (IP kaitse ToS-sse) | WS4-08 (ToS leht) |

*Kõik teised ülesanded on sõltumatud ja saavad paralleelselt toimida.*

---

## Quick Wins (< 1 tund, teha kohe)

| # | Ülesanne | Hinnang |
|---|----------|---------|
| QW-1 | PlayButton ARIA eesti keelde | 30 min |
| QW-2 | API Gateway throttle 2→100 | 30 min |
| QW-3 | `<title>` + meta description | 30 min |
| QW-4 | AWS Budget Alert €50/€100 | 30 min |
| QW-5 | S3 encryption at rest | 30 min |
| QW-6 | Mõned inglise stringid eesti keelde | 30 min |
| **Kokku** | | **~3 tundi** |

*Need 6 ülesannet katavad 38 originaalviiteid ja on tehtavad 3 tunniga.*
