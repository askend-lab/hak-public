# Checklist: Junior-arendaja onboarding

**Tüüp:** Arendajakogemuse kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja dokumentatsiooni analüüs — README, projekti struktuur, arenduskeskkond, nimetamiskonventsioonid, esimese PR kogemus.

---

## Esimene päev: projekti mõistmine

- [x] **1.1. Monorepo on loogiliselt struktureeritud** — `packages/` kataloog: `frontend`, `merlin-api`, `merlin-worker`, `vabamorf-api`, `tara-auth`, `simplestore`, `task-channel`, `shared`. Iga pakett on selgelt nimetatud.
- [x] **1.2. TypeScript kogu projektis** — tüübid aitavad mõista koodi ilma dokumentatsioonita. IDE annab automaatse abi.
- [x] **1.3. Feature-based struktuur frontendis** — `features/synthesis/`, `features/tasks/`, `features/auth/`. Uus arendaja leiab kiiresti õige koha.
- [ ] **1.4. Puudub arhitektuuridiagramm** — uus arendaja ei näe kogu süsteemi: kuidas frontend suhtleb backendiga, mis on andmevoo suund, kuidas sünteesi pipeline töötab.
  **Soovitus:** Lisa `docs/architecture.md` koos diagrammiga (Mermaid/PlantUML).
- [ ] **1.5. Puudub ADR (Architecture Decision Records)** — miks valiti DynamoDB mitte PostgreSQL? Miks Serverless mitte AWS CDK? Miks SQS mitte Step Functions? Uus arendaja ei mõista otsuste tagamaid.
  **Soovitus:** Lisa `docs/decisions/` kataloog ADR-idega.
- [ ] **1.6. Puudub glossary / sõnastik** — "välde", "Vabamorf", "palatalisatsioon", "TARA", "merlin" — uus arendaja (eriti mitte-eestlane) ei mõista domeeni termineid.
  **Soovitus:** Lisa `docs/glossary.md` projekti terminite selgitusega.

## Arenduskeskkonna ülesseadmine

- [ ] **2.1. README setup juhend** — README on mainitud, aga sisu pole siin auditis kontrollitud. Kriitiline küsimus: kas junior saab projekti tööle 30 minutiga?
  **Soovitus:** Testi "0 → tööle" kogemust: klooni repo → installi → käivita → testi.
- [ ] **2.2. Puudub `.nvmrc` / `.node-version`** — pole Node.js versiooni fikseerimist. Junior võib kasutada vale versiooni.
  **Soovitus:** Lisa `.nvmrc` failiga `20` (Node.js 20.x).
- [x] **2.3. Pre-commit hookid on paigas** — junior saab kohe tagasisidet: lint, testid, tüübikontroll.
- [ ] **2.4. Puudub Docker Compose arenduseks** — pole `docker-compose.dev.yml`, mis käivitaks kogu stacki. Junior peab iga teenuse eraldi üles seadma.
  **Soovitus:** Loo `docker-compose.dev.yml` kohaliku arenduskeskkonna jaoks.
- [ ] **2.5. Puudub `.env.example`** — pole näidiskeskkonnamuutujate faili. Junior ei tea, millised keskkonnamuutujad on vajalikud.
  **Soovitus:** Lisa `.env.example` iga paketi juurde.

## Koodi mõistmine

- [x] **3.1. Hookide nimetamine on selge** — `useSynthesis`, `useTaskCRUD`, `useTaskCreate`, `useDocumentTitle`. Funktsioon on nimest arusaadav.
- [x] **3.2. Komponentide nimetamine on järjekindel** — `SentenceSynthesisItem`, `TaskDetailView`, `BaseModal`, `PlayButton`. PascalCase, kirjeldav.
- [ ] **3.3. Mõned hookid on keerukad** — `useSynthesis` koondab 5+ alamhook'i ja tagastab 18+ väljaga objekti. Junior vajab aega mõistmiseks.
  **Soovitus:** Lisa JSDoc kommentaarid keerukamatele hookidele.
- [ ] **3.4. Puuduvad README-d pakettide sees** — `packages/merlin-api/`, `packages/vabamorf-api/` jt ei sisalda README'd, mis selgitaks paketi eesmärki, API endpointe, konfiguratsiooni.
  **Soovitus:** Lisa minimaalne README igale paketile: eesmärk, API, konfiguratsioon, käivitamine.
- [x] **3.5. SCSS token'id on hästi struktureeritud** — `_breakpoints.scss`, `_colors.scss`, `_typography.scss`. Design token'id on intuitiivsed.

## Testimine

- [x] **4.1. Testid on olemas ja jooksevad** — 3130+ testi. Junior saab kohe testida.
- [x] **4.2. Testid on loetavad** — `describe("CookieConsent", () => { it("shows banner when no consent stored") })` — selge struktuur.
- [ ] **4.3. Puudub "Kuidas kirjutada teste" juhend** — pole konventsiooni dokumenti: milline testiraamistik, milline mock'imise strateegia, kuidas nimetada testifaile, millised testid on nõutud PR-i jaoks.
  **Soovitus:** Lisa `docs/testing.md` juhend.
- [ ] **4.4. Puudub testide katvuse aruanne** — junior ei tea, millised failid vajavad teste. Pole `vitest --coverage` konfiguratsiooni.
  **Soovitus:** Lisa coverage konfiguratsioon ja minimaalne katvuse nõue.

## Esimene PR

- [x] **5.1. Pre-commit hookid annavad tagasisidet** — lint, testid, tüübid. Junior teab enne PR-i, kas kood on korras.
- [ ] **5.2. Puudub PR template** — pole `.github/pull_request_template.md`, mis juhendaks: mida muutsid, miks, kuidas testisid, milline on visuaalne tulemus.
  **Soovitus:** Lisa PR template: kirjeldus, screenshot, testid, seotud issue.
- [ ] **5.3. Puudub issue template** — pole `.github/ISSUE_TEMPLATE/`, mis juhendaks vigade raporteerimist ja feature request'e.
  **Soovitus:** Lisa bug report ja feature request template'd.
- [ ] **5.4. Puudub CONTRIBUTING.md** — pole juhendit: kuidas forki luua, koodi stiil, commit message formaat, PR protsess.
  **Soovitus:** Lisa CONTRIBUTING.md.

## Domeeni teadmised

- [ ] **6.1. Puudub domeeni juhend** — uus arendaja ei tea eesti keele foneetikat: mis on välde, mis on palatalisatsioon, kuidas Vabamorf töötab, mis on foneetiline transkriptsioon.
  **Soovitus:** Lisa `docs/domain.md` — eesti keele foneetika põhitõed arendajatele.
- [ ] **6.2. Puudub API dokumentatsioon** — pole Swagger/OpenAPI spetsifikatsiooni. Junior peab koodi lugema, et mõista API endpointe.
  **Soovitus:** Lisa OpenAPI spec `merlin-api` ja `simplestore` jaoks.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Projekti mõistmine | 6 | 3 | 3 |
| Arenduskeskkond | 5 | 1 | 4 |
| Koodi mõistmine | 5 | 3 | 2 |
| Testimine | 4 | 2 | 2 |
| Esimene PR | 4 | 1 | 3 |
| Domeeni teadmised | 2 | 0 | 2 |
| **Kokku** | **26** | **10** | **16** |

## "Aeg esimese PR-ini" hinnang

- **Praegu:** ~3–5 päeva (koodi mõistmine, keskkonna ülesseadmine, domeeni õppimine)
- **Dokumentatsiooniga:** ~1–2 päeva (README, arhitektuur, domeenijuhend)

## Prioriteedid

1. **P0:** Arhitektuuridiagramm — kogu süsteemi ülevaade (#1.4)
2. **P0:** `.env.example` failid — keskkonna ülesseadmine (#2.5)
3. **P1:** CONTRIBUTING.md — PR protsess (#5.4)
4. **P1:** Pakettide README-d — API ja konfiguratsioon (#3.4)
5. **P2:** Domeenijuhend — foneetika arendajatele (#6.1)
6. **P2:** ADR-id — otsuste tagamaad (#1.5)
