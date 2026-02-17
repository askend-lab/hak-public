# Auditite kokkuvõte (Consolidated Summary)

**25 auditi tulemused** | **Kuupäev:** 2026-02-17
**Audiitor:** Luna | **Meetod:** Lähtekoodi analüüs

---

## Ülevaade

| # | Audit | Leide kokku | ✅ Hea | ⚠️ Probleem | ❓ |
|---|-------|------------|--------|-------------|-----|
| 1 | Algaja õppija | 39 | 18 | 21 | 0 |
| 2 | Õpetaja | 43 | 19 | 24 | 0 |
| 3 | Kogenud kasutaja | 39 | 15 | 24 | 0 |
| 4 | Lapsevanem | 30 | 12 | 18 | 0 |
| 5 | Eakas kasutaja | 26 | 7 | 19 | 0 |
| 6 | Mobiilne kasutaja | 27 | 8 | 19 | 0 |
| 7 | Puudega kasutaja (WCAG) | 31 | 16 | 10 | 5 |
| 8 | Professor (filoloogia) | 28 | 8 | 20 | 0 |
| 9 | Koolijuht | 24 | 9 | 15 | 0 |
| 10 | Pahatahtlik kasutaja | 25 | 9 | 16 | 0 |
| 11 | DevOps admin | 24 | 8 | 16 | 0 |
| 12 | Open Source panustaja | 25 | 13 | 9 | 3 |
| 13 | Logopeed | 21 | 6 | 15 | 0 |
| 14 | Ajakirjanik | 18 | 8 | 10 | 0 |
| 15 | UX-disainer | 27 | 12 | 15 | 0 |
| 16 | QA testija | 24 | 7 | 17 | 0 |
| 17 | Integratsioonipartner | 20 | 5 | 15 | 0 |
| 18 | Pagulane/immigrant | 19 | 6 | 13 | 0 |
| 19 | EL hankespetsialist | 21 | 8 | 13 | 0 |
| 20 | Jõudlusinsener | 20 | 8 | 12 | 0 |
| 21 | Sisulooja/podcaster | 18 | 5 | 13 | 0 |
| 22 | i18n spetsialist | 18 | 3 | 15 | 0 |
| 23 | Konkurendianalüütik | 18 | 6 | 8 | 4 |
| 24 | Andmeanalüütik | 12 | 1 | 11 | 0 |
| 25 | Vandetõlk/tõlkija | 15 | 6 | 9 | 0 |
| | **KOKKU** | **587** | **217** | **362** | **12** |

---

## Korduvad probleemid (Cross-Audit Issues)

Järgnevad probleemid tuvastati **mitmes auditis**, mis näitab nende kõrget prioriteeti:

### 🔴 Kriitiline (tuvastatud 5+ auditis)

| Probleem | Auditid | Mõju |
|----------|---------|------|
| **Puudub hääle valik ja kiiruse/tooni reguleerija** | #1, #5, #8, #13, #21, #23 | Backend toetab `voice`, `speed`, `pitch` parameetreid, aga frontend ei paku UI-d. Kõrge mõju: logopeed, professor, sisulooja, eakas kasutaja. |
| **Vaikne ebaõnnestumine (silent failures)** | #1, #3, #5, #7, #15, #16 | Sünteesi viga, variantide laadimine, API vead — kasutaja ei saa tagasisidet. Puudub `aria-live`, `role="alert"` sünteesile. |
| **Puudub sisu modereerimine** | #4, #9, #10, #14 | Kasutaja saab sünteesida sobimatut teksti. Eriti kriitiline kooli kontekstis (lapsed). Avaliku sektori nõue. |
| **Puudub mobiilne hamburger-menüü** | #6, #15, #18 | Navigatsioon on mobiilil peidetud (`display: none`), aga pole alternatiivi. CSS klass on ettevalmistatud (`.header-nav--mobile`), komponent puudub. |
| **Drag-and-drop ei tööta puuteekraanil / klaviatuuriga** | #6, #7, #15 | HTML5 drag-and-drop ei tööta mobiilil. Puudub `onKeyDown` lohistamiskäepidemele. WCAG 2.1.1 rikkumine. |
| **Puudub Undo funktsioon** | #3, #5, #8, #15 | Kustutamised ja muudatused on pöördumatud. Pole "Tühista" toast-teadet. Standard UX muster puudub. |

### 🟡 Oluline (tuvastatud 3–4 auditis)

| Probleem | Auditid | Mõju |
|----------|---------|------|
| **Puudub PWA / Service Worker / offline-tugi** | #6, #11, #18 | Pole "Lisa avakuvale", pole offline-vahemälu. Eriti oluline mobiilsetele kasutajatele ja piiratud internetiga piirkondadele. |
| **i18n puudub (ainult eesti keel)** | #18, #22, #7 | Liides on ainult eesti keeles. Sihtgrupp (keeleõppijad) ei oska eesti keelt. Vähemalt inglise ja vene keele tugi vajalik. |
| **Puudub progressi jälgimine** | #2, #4, #9, #13 | Õpetaja/logopeed/koolijuht ei näe õpilaste/klientide progressi. Pedagoogiline ja administratiivne puudujääk. |
| **Puudub bulk sisestus** | #2, #3, #21, #25 | Mitu lauset korraga sisestamine pole võimalik. Õpetaja, sisulooja, tõlkija vajavad seda. |
| **GDPR compliance puudujäägid** | #4, #9, #19 | Alaealiste andmekaitse, "Kustuta minu andmed" funktsioon, andmetöötlusleping puuduvad. |
| **Puudub morfoloogiline info UI-s** | #8, #23 | Vabamorf'i andmed on backendis, aga frontend ei kuva sõnaliiki, lemmat, käändevorme. |
| **E2E testid puuduvad** | #12, #16 | Playwright on konfigureeritud, aga pole E2E kasutajateekonna teste. |

### 🟢 Tähelepanuväärne (tuvastatud 2 auditis)

| Probleem | Auditid |
|----------|---------|
| Puudub LTI (hariduse integratsioon) | #9, #17 |
| Puudub admin-paneel / dashboard | #9, #24 |
| Puudub API dokumentatsioon | #17, #23 |
| Puudub otsing ülesannetes | #2, #3 |
| Puudub "Teave/Meist" leht | #14, #23 |
| Puudub SLA / uptime garantii | #9, #19 |
| Puudub tsiteerimisvorming | #8, #25 |

---

## Top-10 prioriteedid (soovituslik teekond)

### P0 — Kohesed parandused (madal pingutus, kõrge väärtus)

1. **Hääle valik + kiiruse liugur UI-sse** — backend toetab juba. Frontendi UI: 2–3 päeva.
2. **Mobiilne hamburger-menüü** — CSS klass on olemas. Komponendi lisamine: 1 päev.
3. **Vaikne ebaõnnestumine → veateated** — `aria-live` piirkond + toast-teated sünteesi vigadele: 1–2 päeva.
4. **PlayButton ARIA eesti keelde** — "Loading"→"Laadimine", "Playing"→"Esitamine", "Play"→"Esita": 0.5 päeva.

### P1 — Lähiperiood (keskmine pingutus, kõrge väärtus)

5. **Sisu modereerimine** — vähemalt roppuste filter sisendi tasemel: 2–3 päeva.
6. **Drag-and-drop klaviatuurialternatiiv** — ArrowUp/ArrowDown ümberjärjestamine + puuteekraani polyfill: 2–3 päeva.
7. **Bulk lausete sisestamine** — "Kleebi mitu lauset" funktsioon: 2–3 päeva.
8. **"Kustuta minu andmed" funktsioon** — GDPR artikkel 17: 1–2 päeva.

### P2 — Keskperiood (kõrge pingutus, kõrge väärtus)

9. **i18n raamistik (react-i18next)** — ~200+ stringi migratsioon + vene/inglise tõlge: 5–7 päeva.
10. **PWA / Service Worker** — offline-vahemälu, "Lisa avakuvale": 3–5 päeva.

---

## Mis on hästi tehtud (kogu platvormi tugevused)

1. **Vabamorf'i integratsioon** — unikaalne, eesti keele spetsiifiline foneetiline analüüs
2. **Hääldusvariantide valik** — funktsionaalsus, mida konkurendid ei paku
3. **Modaalide fookuse haldamine** — professionaalne WCAG-konformne implementatsioon
4. **ARIA rollid ja semantiline HTML** — korrektsed menüüd, dialoogid, nupud
5. **Tag-põhine sisestusmudel** — innovatiivne UX sõnade interaktiivseks käsitlemiseks
6. **Lazy loading** — jõudluse optimeerimine komponentide laadimiseks
7. **Cache-põhine TTS** — S3 cache vähendab serverikoormust ja latentsust
8. **MIT litsents** — avatud lähtekood, tasuta kasutamine
9. **Kontota kasutamine** — süntees töötab ilma registreerimiseta
10. **Pre-commit hookid + 3130+ testi** — koodi kvaliteedi tagamine

---

## Auditite failid

| # | Fail | Vaatenurk |
|---|------|-----------|
| 1 | `01-learner-beginner.md` | Algaja õppija |
| 2 | `02-teacher.md` | Õpetaja |
| 3 | `03-power-user.md` | Kogenud kasutaja |
| 4 | `04-parent.md` | Lapsevanem |
| 5 | `05-elderly-user.md` | Eakas kasutaja |
| 6 | `06-mobile-user.md` | Mobiilne kasutaja |
| 7 | `07-accessibility.md` | Puudega kasutaja (WCAG) |
| 8 | `08-professor-philology.md` | Eesti keele professor |
| 9 | `09-school-principal.md` | Koolijuht |
| 10 | `10-adversarial-user.md` | Pahatahtlik kasutaja |
| 11 | `11-devops-admin.md` | DevOps / IT-admin |
| 12 | `12-open-source-contributor.md` | Open Source panustaja |
| 13 | `13-speech-therapist.md` | Logopeed |
| 14 | `14-journalist.md` | Ajakirjanik |
| 15 | `15-ux-designer.md` | UX-disainer |
| 16 | `16-qa-tester.md` | QA testija |
| 17 | `17-integration-partner.md` | Integratsioonipartner |
| 18 | `18-refugee-immigrant.md` | Pagulane / immigrant |
| 19 | `19-eu-procurement.md` | EL hankespetsialist |
| 20 | `20-performance-engineer.md` | Jõudlusinsener |
| 21 | `21-content-creator.md` | Sisulooja / podcaster |
| 22 | `22-i18n-specialist.md` | i18n spetsialist |
| 23 | `23-competitor-analyst.md` | Konkurendianalüütik |
| 24 | `24-data-analyst.md` | Andmeanalüütik |
| 25 | `25-translator.md` | Vandetõlk / tõlkija |

---

## Tehnilised kontrollnimekirjad (Checklists)

| # | Fail | Teema | Punktid | ✅ | ⚠️ |
|---|------|-------|---------|----|----|
| C01 | `C01-gdpr-privacy.md` | GDPR / Privaatsus | 36 | 22 | 14 |
| C02 | `C02-seo.md` | SEO | 22 | 9 | 13 |
| C03 | `C03-finops-cost.md` | FinOps / Kuluanalüüs | 25 | 14 | 11 |
| C04 | `C04-dynamodb-database.md` | DynamoDB / Andmebaas | 24 | 13 | 11 |
| C05 | `C05-disaster-recovery.md` | Disaster Recovery | 20 | 7 | 13 |
| C06 | `C06-monitoring-observability.md` | Monitooring / Jälgitavus | 22 | 7 | 15 |
| C07 | `C07-content-copywriter.md` | Sisu / Copywriter | 22 | 10 | 12 |
| C08 | `C08-senior-architect.md` | Vanemarhitekt | 25 | 11 | 14 |
| C09 | `C09-capacity-planner.md` | Võimsuse planeerimine | 18 | 9 | 9 |
| C10 | `C10-iske-iso27001.md` | ISKE / ISO 27001 | 28 | 11 | 17 |
| C11 | `C11-legal-tos.md` | Õiguslik / Kasutustingimused | 22 | 8 | 14 |
| C12 | `C12-junior-developer.md` | Junior-arendaja onboarding | 26 | 10 | 16 |
| C13 | `C13-budget-auditor.md` | Eelarve audiitor | 17 | 4 | 13 |
| C14 | `C14-pentester-redteam.md` | Pentester / Red Team (OWASP) | 28 | 11 | 17 |
| C15 | `C15-vendor-lockin.md` | Vendor Lock-in / Migratsioon | 18 | 6 | 12 |
| C16 | `C16-cfo-tco.md` | CFO / TCO analüüs | 9 | 2 | 7 |
| C17 | `C17-api-developer-experience.md` | API / Arendajakogemus | 21 | 4 | 17 |
| | **Kokku** | | **383** | **158** | **225** |

---

## Kogu auditi kokkuvõte

| Kategooria | Failid | Leide/Punkte | ✅ Hea | ⚠️ Probleem |
|------------|--------|-------------|--------|-------------|
| Rolliauditid (#1–#25) | 25 | 587 | 217 | 362 |
| Kontrollnimekirjad (C01–C17) | 17 | 383 | 158 | 225 |
| Koondkokkuvõte (00-summary) | 1 | — | — | — |
| **Kokku** | **43** | **970** | **375** | **587** |
