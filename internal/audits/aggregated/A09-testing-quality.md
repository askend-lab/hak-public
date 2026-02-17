# Agregeeritud leiud: Testimine ja kvaliteet

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. E2E testid puuduvad

**Viited: 8 kirjet** — #16, #20, C12, C20, C22, C23, C24, C25

Playwright on konfigureeritud, aga pole ühtegi kasutajateekonna E2E testi.

- [ ] Süntees: sisesta tekst → kuula → kontrolli audio
- [ ] Ülesande loomine: loo ülesanne → lisa laused → salvesta
- [ ] Jagamine: loo jagamislink → ava → kopeeri laused
- [ ] Sisselogimine: Google OAuth + TARA voog
- [ ] Onboarding: wizard läbimine kõigi sammudega

**Hinnang:** 3–5 päeva | **Prioriteet:** P0

---

## 2. Testide katvuse aruanne puudub

**Viited: 6 kirjet** — #16, C12, C20, C22, C24, C25

Pole `vitest --coverage` konfiguratsiooni. Pole teada, millised failid on testitud ja millised mitte. Pole minimaalse katvuse nõuet.

- [ ] Coverage konfiguratsioon `vitest.config.ts`-sse
- [ ] Min katvuse nõue: 80% (statements)
- [ ] Coverage badge README-sse

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 3. API integratsioonitestid puuduvad

**Viited: 5 kirjet** — #16, #17, C17, C22, C24

Pole teste, mis kontrolliksid API endpointe koos andmebaasiga (DynamoDB local, mocked SQS).

- [ ] Integratsioonitestid: synthesize, tasks CRUD, sharing
- [ ] DynamoDB local test fixture

**Hinnang:** 3–5 päeva | **Prioriteet:** P1

---

## 4. Piirväärtuste (edge case) testid puuduvad

**Viited: 5 kirjet** — #3, #16, C14, C18, C24

Mis juhtub: tekst 0 märki? 100,000 märki? 1000 ülesannet? localStorage täis?

- [ ] Piirväärtuste testid kriitiliste funktsioonide jaoks
- [ ] Vigaste sisendite testid (vigane JSON, aegunud token, 500 vastus)

**Hinnang:** 2–3 päeva | **Prioriteet:** P1

---

## 5. Visuaalsed regressioonitestid puuduvad

**Viited: 4 kirjet** — #15, #16, C20, C24

Pole screenshot-põhiseid teste. UI muudatused võivad jääda märkamata.

- [ ] Playwright visuaalse regressiooni testid: sünteesi vaade, ülesannete nimekiri, modaalid
- [ ] Eri viewport'ide testid: 320px, 768px, 1024px, 1440px

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 6. Koormustestid puuduvad

**Viited: 4 kirjet** — #17, #20, C09, C24

Pole koormusteste: mitu samaaegset kasutajat, mitu sünteesi/sekundis, API vastamise aeg koormuse all.

- [ ] k6 või Artillery koormustestid
- [ ] Stsenaariumid: 10, 50, 100 samaaegset kasutajat

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 7. Lighthouse CI puudub

**Viited: 3 kirjet** — C02, C23, C24

Pole automaatset Lighthouse skoori kontrolli CI-s: performance, accessibility, SEO, best practices.

- [ ] Lighthouse CI: min skoor 90 (accessibility), 80 (performance)

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 8. axe audit testid pole kõigile komponentidele

**Viited: 4 kirjet** — #7, C23, C24, C22

`runA11yAudit` on olemas, aga kas kõik olulised komponendid on testitud?

- [ ] axe audit: SynthesisView, TaskDetailView, AppHeader, BaseModal, SharedTaskPage

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 9. Transient test hook failures

**Viited: 3 kirjet** — C20, C24, C22

Pre-commit hook `run-tests` ebaõnnestub juhuslikult. Sama testide käivitamine eraldi õnnestub. Ebastabiilne hook vähendab usaldust.

- [ ] Uuri juhusliku ebaõnnestumise põhjust
- [ ] Lisa retry loogika hookidele

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | E2E testid | 8 | P0 |
| 2 | Testide katvuse aruanne | 6 | P1 |
| 3 | API integratsioonitestid | 5 | P1 |
| 4 | Piirväärtuste testid | 5 | P1 |
| 5 | Visuaalsed regressioonitestid | 4 | P2 |
| 6 | Koormustestid | 4 | P2 |
| 7 | Lighthouse CI | 3 | P2 |
| 8 | axe audit testid | 4 | P1 |
| 9 | Transient hook failures | 3 | P1 |
| **Kokku** | **9 unikaalset leidu** | **42 originaalkirjet** | |
