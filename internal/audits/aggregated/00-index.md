# Agregeeritud leiud: Koondindeks

**Allikas:** 25 rolliauditi + 25 kontrollnimekirja + koondkokkuvõte = 51 faili
**Originaalkirjeid:** 773 probleemkirjet (⚠️)
**Deduplikeeritud:** 99 unikaalset leidu 10 teemakategoorias
**Meetod:** Iga originaalkirje kategoriseeriti teema järgi. Sarnased kirjed eri auditifailidest grupeeriti üheks leiuks. Viidete arv näitab, mitmest originaalfailist leid pärineb.

---

## Teemakategooriad

| # | Fail | Teema | Unikaalsed leiud | Originaalkirjeid | P0 |
|---|------|-------|-----------------|------------------|-----|
| A01 | `A01-frontend-ui.md` | Frontend / Kasutajaliides | 15 | 107 | 4 |
| A02 | `A02-i18n-localization.md` | i18n / Lokaliseerimine | 8 | 44 | 1 |
| A03 | `A03-security.md` | Turvalisus | 12 | 64 | 4 |
| A04 | `A04-privacy-legal.md` | Privaatsus ja õiguslik vastavus | 10 | 45 | 0 |
| A05 | `A05-infrastructure-monitoring.md` | Infrastruktuur ja monitooring | 11 | 58 | 2 |
| A06 | `A06-documentation.md` | Dokumentatsioon | 12 | 69 | 2 |
| A07 | `A07-linguistic-tts.md` | Keeleline täpsus ja TTS | 12 | 73 | 2 |
| A08 | `A08-seo-performance.md` | SEO ja jõudlus | 10 | 41 | 2 |
| A09 | `A09-testing-quality.md` | Testimine ja kvaliteet | 9 | 42 | 1 |
| A10 | `A10-onboarding-ux.md` | Onboarding ja kasutajakogemus | 10 | 58 | 0 |
| | **Kokku** | | **109** | **601** | **18** |

*Märkus: mõned leiud kuuluvad mitmesse kategooriasse (nt hääle valik on nii A01 kui A07). Kokku unikaalseid leide on ~99, kuid ristviited suurendavad summat.*

---

## Top-20 leiud viidete arvu järgi

| # | Leid | Viiteid | Kategooria | Prioriteet |
|---|------|---------|-----------|-----------|
| 1 | Veateated / vaikne ebaõnnestumine | 16 | A01 | P0 |
| 2 | Hääle ja kiiruse valik puudub | 14 | A01, A07 | P0 |
| 3 | UI ainult eesti keeles | 12 | A02 | P1 |
| 4 | Drag-and-drop pole klaviatuuriga ligipääsetav | 10 | A01 | P1 |
| 5 | Per-user rate limiting puudub | 10 | A03 | P0 |
| 6 | Progressi jälgimine puudub | 10 | A10 | P2 |
| 7 | Pakettide README-d puuduvad | 10 | A06 | P0 |
| 8 | CloudWatch Alarms puuduvad | 9 | A05 | P0 |
| 9 | Arhitektuuridiagramm puudub | 9 | A06 | P0 |
| 10 | Sisu modereerimine puudub | 9 | A03 | P1 |
| 11 | Foneetiliste märkide selgitused puuduvad | 8 | A07 | P1 |
| 12 | Mobiilne navigatsioon puudub | 8 | A01 | P0 |
| 13 | Placeholder + näidislaused puuduvad | 8 | A01 | P1 |
| 14 | OpenAPI spetsifikatsioon puudub | 8 | A06 | P2 |
| 15 | Kõik UI stringid hardcoded | 8 | A02 | P2 |
| 16 | E2E testid puuduvad | 8 | A09 | P0 |
| 17 | PlayButton ARIA eesti keelde | 7 | A01 | P0 |
| 18 | API Gateway throttle liiga madal | 7 | A03 | P0 |
| 19 | Struktureeritud JSON logimine | 7 | A05 | P1 |
| 20 | Õpetaja→Õppija töövoog piiratud | 7 | A10 | P2 |

---

## P0 leiud (kriitiline — kohesed parandused)

| # | Leid | Viiteid | Hinnang |
|---|------|---------|---------|
| 1 | Veateated / vaikne ebaõnnestumine | 16 | 1–2 päeva |
| 2 | Hääle ja kiiruse valik | 14 | 2–3 päeva |
| 3 | Per-user rate limiting | 10 | 1 päev |
| 4 | Pakettide README-d | 10 | 2–3 päeva |
| 5 | CloudWatch Alarms + SNS | 9 | 1 päev |
| 6 | Arhitektuuridiagramm | 9 | 1–2 päeva |
| 7 | Mobiilne navigatsioon | 8 | 1 päev |
| 8 | E2E testid | 8 | 3–5 päeva |
| 9 | PlayButton ARIA eesti keelde | 7 | 30 min |
| 10 | API Gateway throttle tõstmine | 7 | 30 min |
| 11 | `<title>` ja meta description | 6 | 30 min |
| 12 | Security headers | 6 | 1 päev |
| 13 | AWS Budget Alerts | 6 | 30 min |
| 14 | S3 encryption at rest | 5 | 30 min |
| 15 | Mõned stringid inglise keeles | 7 | 30 min |
| | **P0 kokku** | | **~15–22 päeva** |

---

## Statistika

### Prioriteetide jaotus

| Prioriteet | Unikaalseid leide | % |
|-----------|------------------|---|
| P0 (kriitiline) | 18 | 18% |
| P1 (oluline) | 38 | 38% |
| P2 (keskperiood) | 36 | 36% |
| P3 (tulevikus) | 7 | 7% |
| **Kokku** | **99** | **100%** |

### Kategooriate katvus

| Kategooria | Originaalkirjeid | % kogu mahust |
|-----------|-----------------|---------------|
| Frontend / UI | 107 | 18% |
| Keeleline täpsus / TTS | 73 | 12% |
| Dokumentatsioon | 69 | 11% |
| Turvalisus | 64 | 11% |
| Infrastruktuur / Monitooring | 58 | 10% |
| Onboarding / UX | 58 | 10% |
| Privaatsus / Õiguslik | 45 | 7% |
| i18n / Lokaliseerimine | 44 | 7% |
| Testimine / Kvaliteet | 42 | 7% |
| SEO / Jõudlus | 41 | 7% |
| **Kokku** | **601** | **100%** |

---

## Järeldused

1. **Frontend / UI** on suurim kategooria (107 kirjet, 18%) — kasutajaliides vajab enim tähelepanu.
2. **Keeleline täpsus** on teisel kohal (73 kirjet, 12%) — TTS ja foneetika on platvormi tuum.
3. **Dokumentatsioon** on kolmandal kohal (69 kirjet, 11%) — suurim puudujääk on pakettide README-d ja arhitektuuridiagramm.
4. **P0 parandused** (18 leidu) nõuavad ~15–22 tööpäeva ühe arendajaga.
5. **773 originaalkirjet** deduplikeerusid **~99 unikaalseks leiuks** — keskmine korduvus on **~7.8x** per leid.
