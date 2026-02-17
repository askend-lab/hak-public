# Checklist: Tootmisvalmidus (Production Readiness)

**Tüüp:** Koondkontrollnimekiri — kõigi auditite P0 leiud
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Konsolideerimine 25 rolliauditist ja 21 kontrollnimekirjast.

---

## 🔴 Kriitiline — kohesed parandused (P0)

### Frontend UI (hinnang: 3–5 päeva)

- [ ] **P0-01. Hääle valik + kiiruse liugur** — backend toetab `voice`, `speed`, `pitch`. Frontend UI puudub.
  **Viited:** Audit #1, #5, #8, #13, #21, #23, C21
  **Hinnang:** 2–3 päeva

- [ ] **P0-02. Mobiilne hamburger-menüü** — CSS klass `.header-nav--mobile` on ettevalmistatud, komponent puudub. Navigatsioon mobiilil peidetud.
  **Viited:** Audit #6, #15, #18
  **Hinnang:** 1 päev

- [ ] **P0-03. Veateated → kasutajasõbralikud eestikeelsed teated** — vaikne ebaõnnestumine, ingliskeelsed backend veateated. Lisa `aria-live` piirkond + toast-teated sünteesi vigadele.
  **Viited:** Audit #1, #3, #5, #7, #15, #16, C07
  **Hinnang:** 1–2 päeva

- [ ] **P0-04. PlayButton ARIA eesti keelde** — "Loading"→"Laadimine", "Playing"→"Esitamine", "Play"→"Esita".
  **Viited:** Audit #7, C07
  **Hinnang:** 0.5 päeva

### Turvalisus (hinnang: 2–3 päeva)

- [ ] **P0-05. Per-user rate limiting** — praegu ainult globaalne 2 req/s. Üks kasutaja blokeerib teised.
  **Viited:** Audit #10, C08, C09, C14, C18
  **Hinnang:** 1 päev

- [ ] **P0-06. API Gateway throttle tõstmine** — 2 req/s on blocker >30 kasutajat. Tõsta prod: 100 req/s.
  **Viited:** C08, C09
  **Hinnang:** 0.5 päeva (üks rida konfiguratsioonis)

- [ ] **P0-07. Security headers** — puuduvad `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. Lisa CloudFront response headers policy.
  **Viited:** C14
  **Hinnang:** 1 päev

- [ ] **P0-08. S3 encryption at rest** — audio bucket'il pole server-side krüpteerimist. Lisa SSE-S3.
  **Viited:** C10, C14
  **Hinnang:** 0.5 päeva

### Monitooring (hinnang: 1–2 päeva)

- [ ] **P0-09. CloudWatch Alarms + SNS teavitused** — pole ühtegi alarmi. Lambda vead, DynamoDB throttle, SQS DLQ — kõik jäävad märkamata.
  **Viited:** C05, C06
  **Hinnang:** 1 päev

- [ ] **P0-10. AWS Budget Alerts** — pole kuluhoiatusi. Ootamatu kulukasv jääb märkamata.
  **Viited:** C03, C13
  **Hinnang:** 0.5 päeva

### SEO (hinnang: 1 päev)

- [ ] **P0-11. `<meta name="description">` ja `<title>` parandamine** — "HAK" → "Hääldusabiline — Eesti keele häälduse harjutamine".
  **Viited:** C02
  **Hinnang:** 30 minutit

- [ ] **P0-12. Open Graph tag'id** — jagamisel pole eelvaadet.
  **Viited:** C02
  **Hinnang:** 30 minutit

---

## 🟡 Oluline — lähiperiood (P1)

### Frontend (hinnang: 5–8 päeva)

- [ ] **P1-01. Sisu modereerimine** — roppuste filter sisendi tasemel.
  **Viited:** Audit #4, #9, #10, #14, C18

- [ ] **P1-02. Drag-and-drop klaviatuurialternatiiv** — ArrowUp/ArrowDown + puuteekraani polyfill.
  **Viited:** Audit #6, #7, #15

- [ ] **P1-03. Bulk lausete sisestamine** — "Kleebi mitu lauset" funktsioon.
  **Viited:** Audit #2, #3, #21, #25

- [ ] **P1-04. "Kustuta minu andmed" funktsioon** — GDPR artikkel 17.
  **Viited:** Audit #4, #9, #19, C01

- [ ] **P1-05. Foneetiliste märkide tooltip'id** — kasutajasõbralik selgitus.
  **Viited:** Audit #8, C21

### Turvalisus ja vastavus (hinnang: 3–5 päeva)

- [ ] **P1-06. CloudTrail lubamine** — AWS turvalogi.
  **Viited:** C10

- [ ] **P1-07. WAF lisamine** — API Gateway kaitse.
  **Viited:** C10, C14

- [ ] **P1-08. Audit trail kasutajatoimingutele** — kes lõi/kustutas/jagas.
  **Viited:** C06, C10

### Dokumentatsioon (hinnang: 3–5 päeva)

- [ ] **P1-09. Pakettide README-d** — iga pakett vajab minimaalselt README-d.
  **Viited:** C12, C19

- [ ] **P1-10. Arhitektuuridiagramm** — kogu süsteemi ülevaade.
  **Viited:** C12, C19

- [ ] **P1-11. CONTRIBUTING.md + SECURITY.md** — open source standard.
  **Viited:** C12, C19

- [ ] **P1-12. Kasutustingimuste leht** — õiguslikult hädavajalik.
  **Viited:** C11

### Infrastruktuur (hinnang: 2–3 päeva)

- [ ] **P1-13. Merlin worker auto-scaling** — SQS-põhine: 0→1→N.
  **Viited:** C08, C09

- [ ] **P1-14. Struktureeritud JSON logimine** — logide analüüs.
  **Viited:** C06

- [ ] **P1-15. E2E testid CI-sse** — kasutajateekonna regressioonikaitse.
  **Viited:** C20

---

## 🟢 Keskperiood (P2)

- [ ] **P2-01. i18n raamistik (react-i18next)** — ~200+ stringi migratsioon
- [ ] **P2-02. PWA / Service Worker** — offline-tugi, "Lisa avakuvale"
- [ ] **P2-03. OpenAPI spetsifikatsioon** — API dokumentatsioon
- [ ] **P2-04. Terraform CI (plan/apply)** — infrastruktuuri muudatuste kontroll
- [ ] **P2-05. Testide katvuse aruanne** — min 80% nõue
- [ ] **P2-06. Prerendering teenus** — SEO parandamine
- [ ] **P2-07. CloudFront audio jaoks** — data transfer kulu vähendamine
- [ ] **P2-08. Rollback protseduur** — dokumenteeritud
- [ ] **P2-09. DynamoDB pagineerimise tugi** — skaleerimiseks
- [ ] **P2-10. Andmete valideerimise kiht** — Zod/joi backend'is

---

## Ajahinnang kokkuvõte

| Prioriteet | Punktid | Hinnanguline aeg |
|-----------|---------|-----------------|
| P0 (kriitiline) | 12 | ~7–11 päeva |
| P1 (oluline) | 15 | ~13–21 päeva |
| P2 (keskperiood) | 10 | ~15–25 päeva |
| **Kokku** | **37** | **~35–57 päeva** |

*1 arendaja, full-time. Paralleelne töö vähendab aega ~30%.*
