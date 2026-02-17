# Checklist: Testimisstrateegia ja kvaliteet

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — testiraamistik, katvus, testimise mustrid, puuduvad testid.

---

## Testiraamistik ja infrastruktuur

- [x] **1.1. Vitest on kasutusel** — kiire, Vite-ühilduv testiraamistik. Hea valik.
- [x] **1.2. Testing Library** — `@testing-library/react` ja `@testing-library/user-event` kasutajapõhiste testide jaoks.
- [x] **1.3. jest-axe ligipääsetavuse testideks** — `a11y-helpers.ts` defineerib `runA11yAudit` WCAG 2.1 AA konfiguratsiooniga.
- [x] **1.4. Playwright on konfigureeritud** — E2E testide raamistik on olemas.
- [ ] **1.5. Playwright teste pole kirjutatud** — Playwright on konfigureeritud, aga pole ühtegi E2E kasutajateekonna testi.
  **Soovitus:** Lisa vähemalt 5 E2E testi: süntees, ülesande loomine, jagamine, sisselogimine, onboarding.
- [ ] **1.6. Puudub testide katvuse aruanne** — pole `vitest --coverage` konfiguratsiooni. Pole teada, millised failid on testitud ja millised mitte.
  **Soovitus:** Lisa `vitest.config.ts`-sse coverage konfiguratsioon. Seadista min katvuse nõue (nt 80%).

## Testide arv ja jaotus

- [x] **2.1. 3130+ testi** — põhjalik testkomplekt.
- [x] **2.2. Testid on hästi struktureeritud** — `describe` → `it` muster. Kirjeldavad nimetused.
- [ ] **2.3. Testide jaotus pole dokumenteeritud** — mitu unit testi? Mitu integratsioonitesti? Mitu snapshot testi? Pole teada.
  **Soovitus:** Lisa testide kokkuvõte CI väljundisse.

## Unit testid

- [x] **3.1. Hook'id on testitud** — `useSynthesis`, `useTagEditor`, `useInlineTagEditor`, `useSentenceState` jt.
- [x] **3.2. Utiliidid on testitud** — `phoneticMarkers.test.ts` on põhjalik.
- [x] **3.3. Komponendid on testitud** — `CookieConsent.test.tsx`, `TaskEditModal` jt.
- [ ] **3.4. Backend testid** — `dynamodbAdapter.test.ts` on olemas, aga mõned testid omavad lint vigu (`Cannot find name 'expect'`). Kas kõik backend paketid on testitud?
  **Soovitus:** Kontrolli iga paketi testide olemasolu: merlin-api, vabamorf-api, tara-auth, simplestore.

## Integratsioonitestid

- [ ] **4.1. Puuduvad API integratsioonitestid** — pole teste, mis kontrolliksid API endpointe koos andmebaasiga (DynamoDB local, mocked SQS).
  **Soovitus:** Lisa integratsioonitestid kriitiliste API endpointide jaoks: süntees, ülesanded, jagamine.
- [ ] **4.2. Puuduvad autentimise integratsioonitestid** — TARA → Cognito → token voo testimine pole automatiseeritud.
  **Soovitus:** Lisa mocked autentimise integratsioonitestid.

## Edge case testid

- [ ] **5.1. Puuduvad piirväärtuste testid** — mis juhtub, kui: tekst on 0 märki? 100,000 märki? Ülesandel on 0 kirjet? 1000 kirjet? Kasutajal on 0 ülesannet? 1000 ülesannet?
  **Soovitus:** Lisa piirväärtuste testid kriitiliste funktsioonide jaoks.
- [ ] **5.2. Puuduvad vigaste sisendite testid** — mis juhtub, kui: JSON on vigane? Token on aegunud? API tagastab 500? Võrguühendus katkeb?
  **Soovitus:** Lisa vigaste sisendite testid.
- [ ] **5.3. Puuduvad samaaegse kasutuse testid** — mis juhtub, kui: kaks vahekaarti muudavad sama ülesannet? localStorage on täis? Browser tab kaotab fookuse sünteesi ajal?
  **Soovitus:** Lisa samaaegse kasutuse testid.

## Visuaalne testimine

- [ ] **6.1. Puuduvad visuaalsed regressioonitestid** — pole screenshot'i-põhiseid teste. UI muudatused võivad jääda märkamata.
  **Soovitus:** Lisa Playwright visuaalse regressiooni testid: sünteesi vaade, ülesannete nimekiri, modaalid.
- [ ] **6.2. Puuduvad responsive testid** — pole teste eri ekraanilaiustele: 320px, 768px, 1024px, 1440px.
  **Soovitus:** Lisa Playwright teste eri viewport'idele.

## Jõudluse testimine

- [ ] **7.1. Puuduvad load testid** — pole koormusteste API-le: mitu samaaegset kasutajat, mitu sünteesi/sekundis.
  **Soovitus:** Lisa k6 või Artillery koormustestid.
- [ ] **7.2. Puuduvad bundle size testid** — pole automaatset kontrolli, et frontend bundle ei kasvaks liiga suureks.
  **Soovitus:** Lisa bundlesize CI kontroll: max 200KB gzipped.

## Testide kvaliteet

- [x] **8.1. Testid on loetavad** — selge `describe/it` struktuur, kirjeldavad nimetused.
- [x] **8.2. Mock'imine on korrektselt kasutatud** — `vi.mock`, `vi.fn`, `vi.spyOn`. Pole üle-mock'itud.
- [ ] **8.3. Puudub testide stiilijuhend** — pole dokumenteeritud: milline mock strateegia, kuidas nimetada teste, millised testid on nõutud PR-i jaoks.
  **Soovitus:** Lisa `docs/testing.md`.
- [ ] **8.4. Puudub mutation testing** — pole Stryker ega sarnast tööriista. Testide kvaliteeti pole mõõdetud.
  **Soovitus:** Kaaluda mutation testing'ut tulevikus.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Raamistik | 6 | 4 | 2 |
| Arv ja jaotus | 3 | 2 | 1 |
| Unit testid | 4 | 3 | 1 |
| Integratsioonitestid | 2 | 0 | 2 |
| Edge case testid | 3 | 0 | 3 |
| Visuaalne testimine | 2 | 0 | 2 |
| Jõudluse testimine | 2 | 0 | 2 |
| Testide kvaliteet | 4 | 2 | 2 |
| **Kokku** | **26** | **11** | **15** |

## Prioriteedid

1. **P0:** E2E testid Playwright'iga — kasutajateekonna kaitse (#1.5)
2. **P0:** Testide katvuse aruanne — nähtavus katvuse kohta (#1.6)
3. **P1:** API integratsioonitestid (#4.1)
4. **P1:** Piirväärtuste testid (#5.1)
5. **P2:** Visuaalsed regressioonitestid (#6.1)
6. **P2:** Koormustestid (#7.1)
