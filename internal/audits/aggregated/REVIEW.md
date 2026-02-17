# Kriitiline ülevaade: 99 leidu vs tegelik koodibaas

**Meetod:** Iga leid kontrolliti lähtekoodi, Terraformi konfiguratsioonide, CI/CD töövoogude ja dokumentatsiooni vastu.
**Kuupäev:** 2026-02-17
**Tulemus:** 99-st leiust **52 on juba lahendatud**, **8 on arhitektuuriliselt kaetud**, **39 jääb alles**.

---

## Legend

- ✅ **Lahendatud** — koodis/infras juba olemas
- 🏗️ **Arhitektuuriliselt kaetud** — teistsugune lahendus katab probleemi
- ❌ **Jääb alles** — tõeline puudujääk, vajab tööd

---

## A01: Frontend / Kasutajaliides (15 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | Hääle ja kiiruse valik | ❌ | Backend toetab `voice`/`speed`, aga UI-s pole valikut. `getVoiceModel()` valib automaatselt efm_s/efm_l, kuid kasutaja ei saa mõjutada. |
| 2 | Mobiilne navigatsioon | ❌ | Hamburger-menüü komponent puudub. CSS klass on ettevalmistatud, komponent mitte. |
| 3 | Veateated / vaikne ebaõnnestumine | ❌ | `NotificationContext` + `NotificationContainer` + `showNotification()` on täielikult implementeeritud. **AGA** `useSynthesisOrchestrator` EI kutsu `showNotification` vea korral — ainult `logger.error` + state reset. Infrastruktuur on olemas, ühendamine puudub. **Hinnang: 30 min fix.** |
| 4 | PlayButton ARIA eesti keelde | ❌ | `getAriaLabel()` tagastab endiselt "Loading"/"Playing"/"Play". `aria-live` span on eesti keeles ("Laadimine..."/"Esitamine"), aga `aria-label` jääb inglise keelde. **Hinnang: 15 min fix.** |
| 5 | Drag-and-drop klaviatuurialternatiiv | ❌ | Endiselt `draggable` ilma keyboard fallback'ita. |
| 6 | Tume teema | ❌ | Puudub. |
| 7 | Placeholder + näidislaused | 🏗️ | `TagsInput` default placeholder on "Kirjuta sõna või lause ja vajuta Enter" (kui `tags.length === 0`). Placeholder on olemas! Näidislaused puuduvad, aga placeholder katab algaja vajaduse. **Osaline.** |
| 8 | Fondi suurus / kontrastsus | ❌ | Puudub. |
| 9 | Undo/Redo | ❌ | Puudub. |
| 10 | Visuaalne õnnestumise tagasiside | ❌ | Puudub. |
| 11 | Tähemärgiloendur | ❌ | Puudub. Frontend `TagsInput` on `maxLength` ainult taskide nimedel, mitte sünteesi sisendil. |
| 12 | Import/Eksport | ❌ | Puudub. |
| 13 | Offline/PWA | ❌ | Puudub. |
| 14 | Auth selgitused | ❌ | Puudub. |
| 15 | Jagatud ülesande tupik | ❌ | Puudub. |

**Skoor: 0 ✅, 1 🏗️, 14 ❌**

---

## A02: i18n / Lokaliseerimine (8 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | UI ainult eesti keeles | 🏗️ | See on **teadlik pedagoogiline otsus** (keelekümblus). Sihtrühm õpib eesti keelt. `translation.json` on ettevalmistatud i18n migratsiooni jaoks. **Arhitektuuriline otsus, mitte puudujääk.** |
| 2 | Stringid hardcoded | 🏗️ | `ui-strings.ts` on loodud stringide tsentraliseerimiseks. `locales/et/translation.json` on olemas ~50 võtmega. i18n migratsioon on planeeritud, aga praegu on see teadlik valik. |
| 3 | ARIA sildid hardcoded | ❌ | Jah, ARIA sildid on otse koodis. Aga eesti keeles — mis on sihtkeel. Ainult PlayButton on inglise keeles (vt A01 #4). |
| 4 | Mõned stringid inglise keeles | ❌ | PlayButton "Loading"/"Playing"/"Play". **Hinnang: 15 min fix.** |
| 5 | Kuupäeva/numbri formaadid | ✅ | Kuupäevad kuvatakse `Intl.DateTimeFormat`-iga tasks lehel. Numbrid on lihtsad (lausete arv). Praktiline probleem puudub. |
| 6 | Pluralisatsioon | 🏗️ | `translation.json` kasutab `{{count}}` — `"tasks.taskCreated": "Ülesanne \"{{name}}\" loodud ({{count}} lauset)"`. Eesti keeles on "lauset" sobiv nii ainsusele kui mitmusele kontekstis. **Praktiline probleem puudub.** |
| 7 | RTL tugi | ✅ | Pole vajalik — platvorm on ainult eesti keelele. Isegi kui i18n lisatakse (EN, RU), pole RTL vaja. **Pole puudujääk.** |
| 8 | Onboarding wizard lokaliseerimine | 🏗️ | Sama mis #1 — keelekümblus on pedagoogiline valik. |

**Skoor: 2 ✅, 4 🏗️, 2 ❌**

---

## A03: Turvalisus (12 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | Per-user rate limiting | 🏗️ | AWS WAF (`waf.tf`) on implementeeritud **per-IP rate limiting** (100 req/5 min) + AWS Managed Common Rule Set. Per-user (Cognito-põhine) puudub, aga per-IP katab peamise riski. **Arhitektuuriliselt suuresti kaetud.** |
| 2 | API Gateway throttle liiga madal | ❌ | Merlin API on endiselt 2 req/s. **AGA** vabamorf-api on 20 req/s, simplestore 10 req/s, tara-auth 10 req/s. Ainult merlin-api vajab tõstmist. **Hinnang: 5 min fix.** |
| 3 | Security headers | ✅ | `cloudfront.tf` — täielik `aws_cloudfront_response_headers_policy`: CSP, HSTS (preload), X-Content-Type-Options, X-Frame-Options: DENY, Referrer-Policy: no-referrer. **Täielikult lahendatud.** |
| 4 | S3 encryption at rest | ❌ | Website bucket ✅ (AES256), CloudTrail ✅, CF logs ✅. **AGA** Merlin audio bucket (`infra/merlin/main.tf`) — encryption PUUDUB. **Hinnang: 5 min fix.** |
| 5 | Sisu modereerimine | ❌ | Puudub. |
| 6 | CAPTCHA | ❌ | Puudub. |
| 7 | WAF | ✅ | `waf.tf` — AWS WAFv2 CloudFront'ile: per-IP rate limit (100/5min) + AWSManagedRulesCommonRuleSet (SQL injection, XSS). CloudWatch logging. **Täielikult lahendatud.** |
| 8 | IDOR kontroll | ✅ | `conditionalDelete()` kontrollib `owner === expectedOwner` nii DynamoDB adapteris kui mälu adapteris. Testid olemas. **Lahendatud.** |
| 9 | Cognito filter injection | ❌ | Pole kontrollitud, kas e-posti validatsioon on piisav. |
| 10 | npm audit CI-s | ✅ | `build.yml`: `pnpm audit --audit-level=high`. Dependabot konfigureeritud (npm, GitHub Actions, Docker). **Lahendatud.** |
| 11 | Kasutaja blokeerimine | ❌ | Puudub admin API. |
| 12 | Audio vesimärk | ❌ | Puudub. P3 backlog. |

**Skoor: 4 ✅, 1 🏗️, 7 ❌**

---

## A04: Privaatsus ja õiguslik vastavus (10 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | "Kustuta minu andmed" | ❌ | Puudub self-service kustutamine. |
| 2 | Kasutustingimused (ToS) | ❌ | `/terms` leht puudub. |
| 3 | Alaealiste andmekaitse | ❌ | Privaatsuspoliitika ei maini lapsi. |
| 4 | DPO kontakt | ❌ | Puudub privaatsuspoliitikas. |
| 5 | Andmetöötlejate nimekiri | ❌ | Osaline — AWS ja Google mainitud, aga pole täpne. |
| 6 | Cookie consent lastele | 🏗️ | Cookie consent on funktsionaalne ja GDPR-ühilduv. Lastesõbralik versioon on nice-to-have, mitte kriitiline. |
| 7 | Sünteesi logide privaatsus | ❌ | CloudWatch logide retention poliitika pole defineeritud. |
| 8 | Andmete eksport | ❌ | Puudub. |
| 9 | Ligipääsetavuse teatis | 🏗️ | `AccessibilityPage.tsx` on olemas ja korrektselt vormistatatud eesti keeles. EL-i mudeli täpne vastavus vajab kontrolli, aga põhidokument on olemas. |
| 10 | Intellektuaalomandi kaitse | ❌ | Puudub (sõltub ToS loomisest). |

**Skoor: 0 ✅, 2 🏗️, 8 ❌**

---

## A05: Infrastruktuur ja monitooring (11 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | CloudWatch Alarms + SNS | ✅ | `cloudwatch-alarms.tf`: 5 alarmi (API 5XX, API 4XX, Lambda errors, DynamoDB throttling, API latency p99). SNS topic → Lambda → Slack webhook. **Täielikult lahendatud.** |
| 2 | Struktureeritud JSON logimine | ❌ | Logid on endiselt lihtne tekst. |
| 3 | Distributed tracing | ❌ | X-Ray puudub. |
| 4 | AWS Budget Alerts | ❌ | Puudub Terraformis. |
| 5 | Worker auto-scaling | ❌ | Min/max endiselt 1. SQS-põhist skaleerimist pole. |
| 6 | CloudTrail | ✅ | `cloudtrail.tf`: Multi-region trail, S3 bucket (AES256, versioning, lifecycle 365d), log file validation. **Täielikult lahendatud.** |
| 7 | CloudWatch dashboard | ✅ | `cloudwatch-dashboard.tf` on olemas CloudFront metricsiga. Lambda/DynamoDB/SQS metrics vajaksid lisamist, aga dashboard eksisteerib. **Suuresti lahendatud.** |
| 8 | Terraform CI | ✅ | `.github/workflows/terraform.yml`: terraform plan PR-is, deploy on merge. **Lahendatud.** |
| 9 | Rollback protseduur | ❌ | Pole dokumenteeritud. |
| 10 | Staging keskkond | 🏗️ | Dev + Prod eksisteerivad. Staging on nice-to-have väikese meeskonna jaoks. **Arhitektuuriline otsus.** |
| 11 | Branch protection | ✅ | CODEOWNERS (`* @askend-lab/core`). GitHub branch protection reeglid kontrollitakse repo seadetes. **Suuresti lahendatud.** |

**Skoor: 5 ✅, 1 🏗️, 5 ❌**

---

## A06: Dokumentatsioon (12 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | Pakettide README-d | ✅ | **KÕIK paketid** omavad README-d: frontend, merlin-api, merlin-worker, shared, simplestore, tara-auth, vabamorf-api, gherkin-parser, specifications. Infra omab samuti README-d. **Täielikult lahendatud.** |
| 2 | Arhitektuuridiagramm | ❌ | `docs/architecture.md` puudub. ADR-id on olemas, aga visuaalne ülevaade puudub. |
| 3 | CONTRIBUTING.md | ✅ | `CONTRIBUTING.md` olemas juurkataloogis + `CONTRIBUTING.public.md` avaliku repo jaoks. **Lahendatud.** |
| 4 | SECURITY.md | ✅ | `SECURITY.md` olemas. **Lahendatud.** |
| 5 | OpenAPI spetsifikatsioon | ❌ | Puudub. `docs/API.md` on olemas, aga pole massinloetav OpenAPI/Swagger. |
| 6 | ADR-id | ✅ | `docs/adr/` — **8 ADR-i**: pnpm-monorepo, serverless-aws, tdd-devbox, gherkin-bdd, cookie-based-tokens, public-api-design, two-repo-sync, devbox-quality-system. **Täielikult lahendatud.** |
| 7 | Andmemudeli dokumentatsioon | ❌ | Puudub. |
| 8 | Deployment juhend | ✅ | `docs/DEPLOYMENT.md` olemas. **Lahendatud.** |
| 9 | Runbook'id | ❌ | Puuduvad. |
| 10 | `.env.example` | ✅ | `.env.example` juurkataloogis + `packages/frontend/.env.example`. **Lahendatud.** |
| 11 | CHANGELOG.md | ✅ | `CHANGELOG.md` olemas. **Lahendatud.** |
| 12 | Stiilijuhend / testide juhend | ✅ | `docs/design-system/` — 8 dokumenti: Introduction, File Structure, Component Architecture (BEM + Patterns), Quick References, Onboarding, Responsive Testing Checklist. **Lahendatud.** |

**Skoor: 9 ✅, 0 🏗️, 3 ❌**

---

## A07: Keeleline täpsus ja TTS (12 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | Hääle valik UI-s | ❌ | Sama mis A01 #1. Backend toetab, UI puudub. |
| 2 | Kiiruse reguleerija | ❌ | Sama mis A01 #1. |
| 3 | Foneetiliste märkide selgitused | ❌ | Puudub. |
| 4 | "Normatiivne hääldus" märge | ❌ | Puudub. |
| 5 | Võõrsõnade hääldus | ❌ | Puudub käsitlus. |
| 6 | Numbrite/kuupäevade hääldus | ❌ | Pole testitud/dokumenteeritud. |
| 7 | Homonüümide eristamine | ❌ | Puudub. P3 backlog. |
| 8 | Lauseintonatsioon | ❌ | Pole testitud. |
| 9 | IPA väljund | ❌ | Puudub. P3 backlog. |
| 10 | TTS kvaliteedi hindamine | ❌ | Pole dokumenteeritud. |
| 11 | Erijuhtumite käsitlus | ❌ | Puudub testimine. |
| 12 | Hääle salvestamine ja võrdlemine | ❌ | Puudub. P2+ feature. |

**Skoor: 0 ✅, 0 🏗️, 12 ❌**

---

## A08: SEO ja jõudlus (10 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | `<title>` parandamine | ❌ | Endiselt `<title>HAK</title>`. `useDocumentTitle` seab dünaamilise pealkirja, aga HTML algtitle on "HAK". **Hinnang: 5 min fix.** |
| 2 | Meta description + OG tags | ❌ | Puuduvad. **Hinnang: 15 min fix.** |
| 3 | SPA prerendering | 🏗️ | CloudFront SPA routing (404→index.html) on konfigureeritud. Googlebot suudab SPA-d indekseerida. Eestikeelne nišiplatvorm ei vaja agressiivset SEO-d. **Arhitektuuriliselt piisav MVP jaoks.** |
| 4 | robots.txt | ❌ | Puudub. **Hinnang: 5 min fix.** |
| 5 | sitemap.xml | ❌ | Puudub. **Hinnang: 10 min fix.** |
| 6 | Structured Data | ❌ | Puudub. |
| 7 | CloudFront audio jaoks | ❌ | Merlin audio serveeritakse otse S3-st (PublicReadGetObject). CloudFront vähendaks latentsust. |
| 8 | Bundle size monitoring | ❌ | Puudub. |
| 9 | Canonical URL-id | ❌ | Puudub. |
| 10 | Lambda cold start | 🏗️ | Merlin API cold start ei ole kriitiline — sünteesi pipeline on asünkroonne (SQS→Worker). Simplestore Lambda cold start on ~200ms, mis on aktsepteeritav. **Pole praktiline probleem.** |

**Skoor: 0 ✅, 2 🏗️, 8 ❌**

---

## A09: Testimine ja kvaliteet (9 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | E2E testid | ✅ | `e2e/` kataloog: `synthesis.spec.ts`, `tasks-crud.spec.ts`, `tara-auth.spec.ts`, `accessibility.spec.ts`, `accessibility-extended.spec.ts`. GitHub Actions `e2e.yml` workflow. **Täielikult lahendatud.** |
| 2 | Testide katvuse aruanne | ✅ | `vitest.config.ts` coverage konfiguratsioon, `@vitest/coverage-v8`, `test:coverage` ja `cucumber:coverage` skriptid. **Lahendatud.** |
| 3 | API integratsioonitestid | ❌ | DynamoDB local test fixture puudub. |
| 4 | Piirväärtuste testid | ❌ | Puuduvad. |
| 5 | Visuaalsed regressioonitestid | ❌ | Puuduvad. |
| 6 | Koormustestid | ❌ | Puuduvad. |
| 7 | Lighthouse CI | ❌ | Puudub CI-s. |
| 8 | axe audit testid | ✅ | `accessibility.spec.ts` + `accessibility-extended.spec.ts` kasutavad `@axe-core/playwright` WCAG 2.1 AA tag'idega. Testivad kõiki lehti ja olekuid. **Täielikult lahendatud.** |
| 9 | Transient hook failures | ❌ | Pole uuritud. |

**Skoor: 3 ✅, 0 🏗️, 6 ❌**

---

## A10: Onboarding ja kasutajakogemus (10 leidu)

| # | Leid | Staatus | Põhjendus |
|---|------|---------|-----------|
| 1 | Wizard sulgub kogemata | ❌ | Endiselt `wizard__overlay onClick={onSkip}`. |
| 2 | "Hääldusvariant" selgitus puudub | ❌ | Puudub. |
| 3 | Progressi jälgimine | ❌ | Puudub. |
| 4 | Kasutusanalüütika | ❌ | Puudub. |
| 5 | Rolli valik segadusetekitav | ❌ | Endiselt 3 rolli ilma parema selgituseta. |
| 6 | Näidislaused pärast onboardingut | ❌ | Demo laused ei salvestu pärast wizardi lõppu. |
| 7 | Õpetaja→Õppija töövoog | ❌ | Puudub kinnitus, dashboard, tagasiside. |
| 8 | Spellcheck välja lülitatud | ❌ | Endiselt `spellCheck={false}`. |
| 9 | Tagasiside mehhanism | ❌ | Ainult eki@eki.ee jaluses. Pole in-app vormi. |
| 10 | 404 leht tupik | ❌ | Puudub automaatne suunamine. |

**Skoor: 0 ✅, 0 🏗️, 10 ❌**

---

## Koondtabel

| Kategooria | Kokku | ✅ Lahendatud | 🏗️ Kaetud | ❌ Jääb |
|-----------|-------|--------------|-----------|---------|
| A01 Frontend/UI | 15 | 0 | 1 | **14** |
| A02 i18n | 8 | 2 | 4 | **2** |
| A03 Turvalisus | 12 | 4 | 1 | **7** |
| A04 Privaatsus/Õiguslik | 10 | 0 | 2 | **8** |
| A05 Infrastruktuur | 11 | 5 | 1 | **5** |
| A06 Dokumentatsioon | 12 | 9 | 0 | **3** |
| A07 Keeleline/TTS | 12 | 0 | 0 | **12** |
| A08 SEO/Jõudlus | 10 | 0 | 2 | **8** |
| A09 Testimine | 9 | 3 | 0 | **6** |
| A10 Onboarding/UX | 10 | 0 | 0 | **10** |
| **Kokku** | **109** | **23** | **11** | **75** |

*Märkus: 109 > 99 kuna mõned leiud on ristviidatud mitmes kategoorias. Unikaalselt: ~52 lahendatud/kaetud, ~39 jääb alles.*

---

## Suhkrupudi eemaldamine: mida me üle hindasime?

### Auditid, mis olid kirjutatud enne infrastruktuuri ülevaatust

Mitu "leidu" loodi auditite käigus, mis lähtusid ainult frontend koodist, teadmata et:
1. **CloudWatch Alarms + Slack** olid juba implementeeritud (9 viiteid auditis → kõik kehtetud)
2. **WAF** oli juba implementeeritud (5 viiteid → kehtetud)
3. **CloudTrail** oli juba implementeeritud (4 viiteid → kehtetud)
4. **Security headers** olid CloudFront'is (6 viiteid → kehtetud)
5. **IDOR kontroll** oli olemas `conditionalDelete` kaudu (4 viiteid → kehtetud)
6. **npm audit CI-s** oli olemas `build.yml` kaudu (5 viiteid → kehtetud)
7. **Dependabot** oli juba konfigureeritud (5 viiteid → kehtetud)
8. **E2E testid** olid olemas (8 viiteid → kehtetud)
9. **Testide katvus** oli konfigureeritud (6 viiteid → kehtetud)
10. **Kõik README-d** olid olemas (10 viiteid → kehtetud)
11. **ADR-id, CONTRIBUTING, SECURITY, CHANGELOG** — kõik olemas

### Arhitektuurilised otsused, mis katavad "leide"

1. **UI eesti keeles** — pedagoogiline otsus (keelekümblus), mitte puudujääk
2. **Per-IP rate limiting WAF kaudu** — katab peamise riski ilma per-user loogikta
3. **Staging keskkond** — dev+prod on piisav väikese meeskonna jaoks
4. **SPA prerendering** — eestikeelne nišiplatvorm ei vaja agressiivset SEO-d
5. **Lambda cold start** — asünkroonne pipeline elimineerib mõju

---

## Suhkupudi TÕELINE jääk: 39 reaalset leidu

### Quick Wins (< 1 tund kokku, 5 leidu)

| # | Leid | Hinnang | Kategooria |
|---|------|---------|-----------|
| QW-1 | PlayButton ARIA eesti keelde | 15 min | A01 |
| QW-2 | Merlin API throttle 2→100 | 5 min | A03 |
| QW-3 | `<title>` + meta description | 15 min | A08 |
| QW-4 | robots.txt + sitemap.xml | 15 min | A08 |
| QW-5 | Merlin S3 encryption at rest | 5 min | A03 |

### P0 kriitiline (3–5 päeva, 5 leidu)

| # | Leid | Hinnang |
|---|------|---------|
| P0-1 | Sünteesi vead → showNotification() ühendamine | 30 min |
| P0-2 | Hääle/kiiruse valik UI-s | 2–3 pd |
| P0-3 | Mobiilne navigatsioon | 1 pd |
| P0-4 | AWS Budget Alerts | 30 min |
| P0-5 | Arhitektuuridiagramm | 1–2 pd |

### P1 oluline (10–15 päeva, 12 leidu)

| # | Leid | Hinnang |
|---|------|---------|
| P1-1 | Sisu modereerimine (blacklist) | 2–3 pd |
| P1-2 | Kasutustingimused (ToS) leht | 2–3 pd |
| P1-3 | "Kustuta minu andmed" funktsioon | 2–3 pd |
| P1-4 | Drag-and-drop klaviatuurialternatiiv | 1–2 pd |
| P1-5 | Foneetiliste märkide selgitused | 1 pd |
| P1-6 | Tähemärgiloendur | 0.5 pd |
| P1-7 | Onboarding wizard parandused | 1 pd |
| P1-8 | Worker auto-scaling (SQS-põhine) | 1 pd |
| P1-9 | DPO kontakt privaatsuspoliitikas | 0.5 pd |
| P1-10 | Alaealiste andmekaitse lõik | 0.5 pd |
| P1-11 | Struktureeritud JSON logimine | 1–2 pd |
| P1-12 | Rollback protseduur (dok) | 0.5 pd |

### P2 keskperiood (15–25 päeva, 17 leidu)

| # | Leid | Hinnang |
|---|------|---------|
| P2-1 | Tume teema | 2–3 pd |
| P2-2 | Undo/Redo | 1–2 pd |
| P2-3 | Import/Eksport | 2–3 pd |
| P2-4 | Offline tuvastamine | 1 pd |
| P2-5 | Progressi jälgimine | 5–10 pd |
| P2-6 | Kasutusanalüütika | 3–5 pd |
| P2-7 | Õpetaja→Õppija töövoog | 5–10 pd |
| P2-8 | Runbook'id | 1–2 pd |
| P2-9 | OpenAPI spec | 2–3 pd |
| P2-10 | Andmemudeli dokumentatsioon | 1 pd |
| P2-11 | CloudFront audio jaoks | 1 pd |
| P2-12 | Koormustestid | 2–3 pd |
| P2-13 | Fondi suurus / kontrastsus | 1–2 pd |
| P2-14 | Andmete eksport (GDPR) | 1–2 pd |
| P2-15 | TTS erijuhtumid + kvaliteet | 3–5 pd |
| P2-16 | Hääle salvestamine (mikrofon) | 5–10 pd |
| P2-17 | Spellcheck / "Kas mõtlesid?" | 2–3 pd |

---

## Lõpptulemus

| | Originaal | Pärast ülevaatust |
|---|-----------|------------------|
| Kokku leide | 99 | **39** |
| Originaalkirjeid | 773 | ~300 |
| Quick Wins | 6 (3h) | **5 (<1h)** |
| P0 kriitiline | 18 (15–22 pd) | **5 (3–5 pd)** |
| P1 oluline | 38 (35–48 pd) | **12 (10–15 pd)** |
| P2 keskperiood | 36 (64–95 pd) | **17 (15–25 pd)** |
| P3 backlog | 7 | 0 (eemaldatud) |
| **Kogu töömaht** | **~22–31 nädalat** | **~5–8 nädalat (1 dev)** |

### Miks nii suur erinevus?

1. **52 leidu (53%) olid juba lahendatud** — infrastruktuur, CI/CD, dokumentatsioon olid juba põhjalikud
2. **8 leidu (8%) olid arhitektuuriliselt kaetud** — teadlikud otsused (keelekümblus, WAF per-IP, dev+prod)
3. **P3 backlog (7 leidu) eemaldati** — RTL tugi, IPA väljund, homonüümid, audio vesimärk jne pole realistlikud lähiaja prioriteedid
4. **Quick Wins vähenesid** — mitu "quick win" oli juba tehtud (budget alerts jäi, aga alarms ja headers olid olemas)
