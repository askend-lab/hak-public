# 39 jäänud leidu: mis vajab otsust vs mis on straightforward

**Eesmärk:** Eraldada ülesanded, mida saab kohe teostada, nendest, mis vajavad enne tööd arhitektuurilist otsust, disaini arutelu või välist sisendit.

---

## 🟢 Straightforward — "lihtsalt tee" (22 ülesannet)

Need ülesanded on tehniliselt selged, pole ambiguity'd, saab kohe käima panna.

### Quick Wins (< 1 tund)

| # | Ülesanne | Miks straightforward |
|---|----------|---------------------|
| SF-1 | **PlayButton ARIA eesti keelde** | Üks rida: `"Loading"→"Laadimine"`. Test uuendada. 15 min. |
| SF-2 | **Merlin API throttle 2→100** | `serverless.yml` üks number. 5 min. |
| SF-3 | **`<title>` parandamine** | `index.html`: "HAK" → "Hääldusabiline — Eesti keele häälduse harjutamine". 5 min. |
| SF-4 | **Meta description + OG tags** | Standardsed meta tag'id `index.html`-i. 15 min. |
| SF-5 | **robots.txt + sitemap.xml** | Staatilised failid `public/` kausta. 15 min. |
| SF-6 | **Merlin S3 encryption** | `aws_s3_bucket_server_side_encryption_configuration` Terraformi. 5 min. |

### P0 straightforward (1–2 päeva)

| # | Ülesanne | Miks straightforward |
|---|----------|---------------------|
| SF-7 | **Sünteesi vead → showNotification()** | Infrastruktuur on 100% olemas. Ainult `useSynthesisOrchestrator.ts` `catch` plokis lisada `showNotification({ type: "error", message: "..." })`. 30 min. |
| SF-8 | **AWS Budget Alerts** | Standardne Terraform `aws_budgets_budget` ressurss. 30 min. |
| SF-9 | **Mobiilne navigatsioon** | Standard hamburger-menüü muster. Design system on olemas. 1 pd. |

### P1 straightforward (5–7 päeva)

| # | Ülesanne | Miks straightforward |
|---|----------|---------------------|
| SF-10 | **Tähemärgiloendur** | `TagsInput`-le `{text.length}/1000` kuvamine. 0.5 pd. |
| SF-11 | **DPO kontakt privaatsuspoliitikas** | Teksti lisamine `PrivacyPage.tsx`-sse. 0.5 pd. |
| SF-12 | **Alaealiste andmekaitse lõik** | Teksti lisamine `PrivacyPage.tsx`-sse. 0.5 pd. |
| SF-13 | **Rollback protseduur** | `docs/operations/rollback.md` kirjutamine. 0.5 pd. |
| SF-14 | **Struktureeritud JSON logimine** | Standardmuster: `JSON.stringify({ timestamp, level, message, requestId })`. 1–2 pd. |
| SF-15 | **Andmemudeli dokumentatsioon** | `docs/data-model.md` — DynamoDB PK/SK mustrid, mis on koodis juba selgelt nähtavad. 1 pd. |
| SF-16 | **Arhitektuuridiagramm** | `docs/architecture.md` Mermaid diagramm — komponendid on teada, tuleb lihtsalt joonistada. 1–2 pd. |
| SF-17 | **Onboarding wizard overlay fix** | `onClick={onSkip}` eemaldamine overlay'lt või kinnitusdialoog. 0.5 pd. |
| SF-18 | **Runbook'id** | 5 dokumenti: Lambda fail, DynamoDB throttle, SQS DLQ, Fargate crash, SSL expire. 1–2 pd. |

### P2 straightforward (3–5 päeva)

| # | Ülesanne | Miks straightforward |
|---|----------|---------------------|
| SF-19 | **Fondi suurus / kontrastsus** | CSS custom properties + A+/A- toggle. Standard pattern. 1–2 pd. |
| SF-20 | **Offline tuvastamine** | `navigator.onLine` + `online`/`offline` event → showNotification. 1 pd. |
| SF-21 | **CloudFront audio jaoks** | Terraform: CloudFront origin + OAC. S3 public read eemaldada. 1 pd. |
| SF-22 | **Andmete eksport (GDPR)** | Backend endpoint GET /api/user/data → JSON dump + frontend nupp. 1–2 pd. |

---

## 🔴 Vajab otsust enne teostamist (17 ülesannet)

Need ülesanded on ambiguoossed, vajavad disainiotsuseid, välist sisendit, või on tehniliselt mitmeharulised.

### 1. Hääle ja kiiruse valik UI-s

**Miks pole straightforward:**
- Milliseid hääli üldse saab valida? Praegu on `efm_s` (üksik sõna) ja `efm_l` (lause). Kas need on "mees" ja "naine"? Kas on rohkem?
- Kas kasutaja valib hääle, või jääb automaatne valik (`getVoiceModel`)?
- Kus UI-s paikneb hääle valik? Globaalne seade vs per-lause valik?
- Kiiruse diapasoon: kas backend toetab 0.5x–2.0x? Mis on tegelik vahemik?

**Vaja otsust:** Milliseid hääli backend tegelikult pakub + kus UI-s see paikneb.

---

### 2. Sisu modereerimine

**Miks pole straightforward:**
- Mis keeles roppsõnad? Eesti keeles? Vene keeles? Inglise keeles?
- Kas blacklist-põhine (sõnade nimekiri) või AI-põhine (AWS Comprehend)?
- Kas blokeerida sünteesi (viga) või lubada, aga logida?
- Kõneteraapia kontekst: "perse" on legaalne eesti sõna, mida harjutatakse. Kas blokeerida?
- Jagatud ülesanded: kas modereerida ainult jagatud sisu või ka isiklikku?
- Kes haldab blacklisti? Kus see salvestatakse?

**Vaja otsust:** Modereerimise strateegia ja ulatus.

---

### 3. Kasutustingimused (ToS)

**Miks pole straightforward:**
- Juriidiline tekst — kes kirjutab? Jurist? EKI juriidiline osakond?
- Mis sisaldub: keelatud kasutus, genereeritud audio omand, vastutuse piirang?
- Kas deepfake keeld?
- Kas nõustumise mehhanism (checkbox registreerumisel) → backend muudatus?
- Milline versioonihaldus (ToS muutmisel peab kasutaja uuesti nõustuma)?

**Vaja otsust:** Juriidiline sisend + nõustumise UX.

---

### 4. "Kustuta minu andmed" (GDPR art. 17)

**Miks pole straightforward:**
- Mida kustutada? Cognito konto + DynamoDB andmed + S3 audio + CloudWatch logid?
- Soft delete (30 päeva) vs hard delete (kohe)?
- Kas jagatud ülesanded jäävad alles (teised kasutajad viitavad)?
- Mis juhtub, kui kasutaja logib uuesti sisse pärast kustutamist (TARA/Google)?
- Kas kinnituse e-mail enne kustutamist?

**Vaja otsust:** Kustutamise skoop ja protsess.

---

### 5. Drag-and-drop klaviatuurialternatiiv

**Miks pole straightforward:**
- Kas kasutada raamatukogu (dnd-kit, react-beautiful-dnd) või custom implementatsioon?
- ArrowUp/ArrowDown vs muu klaviatuurimuster?
- Puuteekraani tugi: kas samuti lisada (touch-dnd polyfill)?
- Kuidas interakteerub olemasoleva `draggable` atribuudiga?

**Vaja otsust:** Raamatukogu valik ja scope (ainult keyboard? ka touch?).

---

### 6. Worker auto-scaling

**Miks pole straightforward:**
- Scale-to-zero? Kui jah, siis cold start aeg (ECS Fargate: ~30-60s).
- SQS → 0→1→N: mis on max? 5? 10?
- Kulude mõju: iga worker on ~$0.04/h. 5 workerit = $144/kuu.
- Kas scale-down on aeglane (ECS cooldown)?
- Dev vs prod: dev=0, prod idle=0 vs prod idle=1?

**Vaja otsust:** Min/max capacity + scale-to-zero otsus + kulude aktsepteeritavus.

---

### 7. CAPTCHA

**Miks pole straightforward:**
- Milline teenus: reCAPTCHA v3 (invisible) vs hCaptcha vs Cloudflare Turnstile?
- Kus triggerida: anonüümne süntees? Pärast N päringut? Iga kord?
- Kuidas interakteerub WAF-iga (WAF juba piirab IP-d)?
- UX mõju: CAPTCHA enne sünteesi on friction keeleõppijale.

**Vaja otsust:** Teenuse valik + triggeri loogika.

---

### 8. Tume teema

**Miks pole straightforward:**
- CSS-i ümbertöötamine: kas design system toetab muutujaid?
- `prefers-color-scheme` automaatne tuvastus vs manuaalne toggle?
- Kus toggle paikneb (header? footer? seaded)?
- Kas salvestada localStorage'sse?
- Kui palju CSS-i tuleb ümber kirjutada?

**Vaja otsust:** Ulatus (ainult põhivärvid vs täielik teema) + CSS strateegia.

---

### 9. Import/Eksport

**Miks pole straightforward:**
- Importformaat: .txt (üks lause per rida)? .csv (tekst, hääldus)? .xlsx?
- Bulk import: kas iga importitud lause sünteesitakse kohe? Või ainult tekst?
- Eksportformaat: JSON? CSV? ZIP koos audiofailidega?
- Max ridade arv importimisel?

**Vaja otsust:** Formaadid ja bulk-sünteesi käitumine.

---

### 10. Progressi jälgimine

**Miks pole straightforward:**
- Mida jälgida: sünteeside arv? Unikaalsed sõnad? Aeg? Kordused?
- Kus salvestada: localStorage (pole seadmete vahel)? Backend (vajab andmemudelit)?
- Privaatsus: kas kasutusandmeid salvestatakse? GDPR implikatsioonid?
- Gamification: streak counter? Badge'd? Päevaeesmärgid?
- Minimalistlik vs täielik: ainult "X sõna kuulatud" vs dashboard?

**Vaja otsust:** Mida jälgida + kus salvestada + privaatsus.

---

### 11. Kasutusanalüütika

**Miks pole straightforward:**
- Milline tööriist: Plausible (privacy-respecting)? Umami? PostHog? Custom?
- GDPR: kas vajab eraldi nõusolekut? Kas anonüümsed andmed?
- Milliseid sündmusi jälgida: page views? Sünteesid? Jagamised?
- Kus hostatakse: SaaS vs self-hosted?
- Cookie consent mõju: kui kasutaja keeldub, kas analüütika puudub täielikult?

**Vaja otsust:** Tööriista valik + GDPR strateegia.

---

### 12. Õpetaja→Õppija töövoog

**Miks pole straightforward:**
- "Valmis!" kinnitus: kes kinnitab? Õppija vajutab nuppu? Automaatne (kuulas kõik laused)?
- Õpetaja dashboard: reaalajas vs async? WebSocket vs polling?
- Andmemudel: uus DynamoDB olem (TaskSubmission)?
- Tagasiside mehhanism: tekstiline? Hindamine (1-5)?
- Privacy: kas õpetaja näeb, mida õppija sisestas (sh lisatud lauseid)?

**Vaja otsust:** Töövoo disain + andmemudel + privaatsus.

---

### 13. Hääle salvestamine ja võrdlemine

**Miks pole straightforward:**
- Browser API: `MediaRecorder` → WebM/OGG. Kõik brauserid?
- Privaatsus: salvestatakse serverisse? Ainult brauser? Mikrofoni permission.
- Võrdlusalgoritm: ainult kõrvuti kuulamine? Või automaatne (DTW, MCD)?
- UX: kus nupp? Iga lause juures? Eraldi vaade?
- GDPR: kasutaja hääle salvestamine on biomeetrilised andmed.

**Vaja otsust:** Kus salvestatakse + kas automaatne võrdlus + privaatsus.

---

### 14. Spellcheck / "Kas mõtlesid?"

**Miks pole straightforward:**
- Eesti keele spellcheck: brauseri sisseehitatud vs Vabamorf'i integratsioon?
- "Kas mõtlesid?" soovituste loogika: Levenshtein distance? Vabamorf? Hunspell?
- Jõudlus: reaalajas (iga klahvivajutuse järel) vs pärast Enter?
- Kas blokeerida vigane sisend või lubada ja näidata hoiatust?

**Vaja otsust:** Spellcheck'i allikas + UX käitumine.

---

### 15. Foneetiliste märkide selgitused

**Miks pole straightforward:**
- Kes kirjutab selgitused? Lingvist? Audiitor ei ole keeleteadlane.
- Mitu märki on vaja selgitada? (`<`, `>`, `]`, `?` jne)
- Tooltip vs modal vs eraldi leht?
- Kas erinev selgitus algajale vs uurijale?

**Vaja otsust:** Sisu loomise vastutus + UX formaat.

---

### 16. Undo/Redo

**Miks pole straightforward:**
- Mis on "undo": kustutamine? Teksti muutmine? Variandi valik? Kõik?
- Implementatsioon: command pattern? State snapshot? Mitu sammu?
- localStorage: kas undo stack salvestatakse sessioonide vahel?
- Kuidas interakteerub bulk-toimingutega (kõigi kustutamine)?

**Vaja otsust:** Undo scope + implementatsioonistrateegia.

---

### 17. Cognito filter injection

**Miks pole straightforward:**
- Vaja esmalt reprodutseerida: kas erimärgid (', ", \) tegelikult rikuvad filtrit?
- Milline on tegelik risk? Read-only päring, mis tagastab kasutaja enda andmed.
- Fix: e-posti regex validatsioon vs Cognito filter escaping vs parameterized query?

**Vaja otsust:** Esmalt riski hindamine, siis fix.

---

## Kokkuvõte

| Kategooria | Arv | % | Töömaht |
|-----------|-----|---|---------|
| 🟢 Straightforward | **22** | 56% | ~12–18 pd |
| 🔴 Vajab otsust | **17** | 44% | ~20–35 pd (pärast otsuseid) |
| **Kokku** | **39** | 100% | ~32–53 pd |

### Soovituslik tegevusjärjekord

1. **Kohe:** Tee 6 Quick Win'i (< 1 tund)
2. **Sel nädalal:** Tee 6 straightforward P0/P1 ülesannet (SF-7..SF-12)
3. **Nädal 2:** Tee ülejäänud straightforward P1 ülesanded (SF-13..SF-18)
4. **Paralleelselt:** Otsusta 17 "vajab otsust" ülesannet (disaini dokumendid, ADR-id)
5. **Nädal 3+:** Teosta otsustatud ülesanded

### 17 otsust prioriteedi järgi

| # | Otsus | Kes otsustab |
|---|-------|-------------|
| 1 | Hääle/kiiruse valik (milliseid hääli on?) | **Backend dev / EKI** |
| 2 | ToS (juriidiline tekst) | **Jurist / EKI** |
| 3 | GDPR kustutamine (skoop) | **Product owner + jurist** |
| 4 | Sisu modereerimine (strateegia) | **Product owner** |
| 5 | Worker auto-scaling (capacity) | **DevOps + product owner (kulu)** |
| 6 | CAPTCHA (teenuse valik) | **Backend dev** |
| 7 | DnD keyboard (raamatukogu) | **Frontend dev** |
| 8 | Tume teema (CSS strateegia) | **Frontend dev + designer** |
| 9 | Import/Eksport (formaadid) | **Product owner** |
| 10 | Progressi jälgimine (mis andmed) | **Product owner + GDPR** |
| 11 | Kasutusanalüütika (tööriist) | **Product owner + GDPR** |
| 12 | Õpetaja→Õppija (töövoo disain) | **Product owner** |
| 13 | Hääle salvestamine (privaatsus) | **Product owner + GDPR** |
| 14 | Spellcheck (allikas) | **Backend dev + lingvist** |
| 15 | Foneetika selgitused (sisu) | **Lingvist / EKI** |
| 16 | Undo/Redo (scope) | **Frontend dev** |
| 17 | Cognito injection (riski hindamine) | **Security + backend dev** |
