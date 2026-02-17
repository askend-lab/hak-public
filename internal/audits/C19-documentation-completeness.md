# Checklist: Dokumentatsiooni täielikkus

**Tüüp:** Dokumentatsiooni kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Failisüsteemi ja lähtekoodi analüüs — README-d, juhendid, API dokumentatsioon, arhitektuur.

---

## Juurkataloogis

- [x] **1.1. README.md on olemas** — juurkataloogis on README projekti kirjelduse ja setup juhistega.
- [x] **1.2. LICENSE fail on olemas** — MIT litsents.
- [ ] **1.3. Puudub CONTRIBUTING.md** — pole panustamisjuhendit: fork workflow, koodi stiil, commit message formaat, PR protsess.
  **Soovitus:** Loo CONTRIBUTING.md.
- [ ] **1.4. Puudub CHANGELOG.md** — pole muudatuste logi. Kasutajad ja arendajad ei tea, mis on muutunud versioonide vahel.
  **Soovitus:** Loo CHANGELOG.md (Conventional Changelog formaat).
- [ ] **1.5. Puudub CODE_OF_CONDUCT.md** — open source projekti standard. Defineerib käitumisreeglid kogukonna jaoks.
  **Soovitus:** Lisa Contributor Covenant Code of Conduct.
- [ ] **1.6. Puudub SECURITY.md** — pole turvaprobleemide teavitamise protsessi. Kuhu teatada haavatavusi?
  **Soovitus:** Lisa SECURITY.md: responsible disclosure protsess, kontaktandmed.

## Pakettide dokumentatsioon

- [ ] **2.1. `merlin-api/` README puudub** — pole API endpointide kirjeldust, konfiguratsiooni, käivitamise juhendit.
- [ ] **2.2. `merlin-worker/` README puudub** — pole TTS worker'i kirjeldust: kuidas töötab, konfiguratsioon, Docker käsk.
- [ ] **2.3. `vabamorf-api/` README puudub** — pole morfoloogilise analüüsi API kirjeldust.
- [ ] **2.4. `tara-auth/` README puudub** — pole autentimise voo kirjeldust: TARA → Cognito → token'id.
- [ ] **2.5. `simplestore/` README puudub** — pole DynamoDB API kirjeldust: endpointid, andmemudel, autentimine.
- [ ] **2.6. `frontend/` README puudub** — pole frontendi arenduskeskkonna setup'i, komponentide ülevaate, stiilijuhendi.
- [ ] **2.7. `shared/` README puudub** — pole jagatud tüüpide ja utiliitide kirjeldust.
  **Soovitus:** Lisa minimaalne README igale paketile: eesmärk, konfiguratsioon, käivitamine, API.

## Arhitektuurne dokumentatsioon

- [ ] **3.1. Puudub arhitektuuridiagramm** — pole süsteemi ülevaadet: komponendid, andmevoog, infrastruktuur.
  **Soovitus:** Lisa `docs/architecture.md` koos Mermaid diagrammiga.
- [ ] **3.2. Puuduvad ADR-id** — pole Architecture Decision Records'eid: miks DynamoDB? Miks SQS? Miks Serverless?
  **Soovitus:** Lisa `docs/decisions/` kataloog.
- [ ] **3.3. Puudub andmemudeli dokumentatsioon** — pole DynamoDB tabelistruktuuri, PK/SK mustrite, pääsumustrite kirjeldust.
  **Soovitus:** Lisa `docs/data-model.md`.
- [ ] **3.4. Puudub infrastruktuuri dokumentatsioon** — pole AWS teenuste ülevaate, Terraform'i struktuuri, keskkondade (dev/prod) kirjeldust.
  **Soovitus:** Lisa `docs/infrastructure.md`.

## API dokumentatsioon

- [ ] **4.1. Puudub OpenAPI/Swagger** — pole massinloetavat API spetsifikatsiooni (vt C17 #1.1).
- [ ] **4.2. Puudub autentimise juhend** — pole kirjeldust: kuidas saada token'it, kuidas kasutada API-t programmaatiliselt.
  **Soovitus:** Lisa `docs/api/authentication.md`.
- [ ] **4.3. Puuduvad API koodinäited** — pole näiteid JavaScript, Python, cURL-iga (vt C17 #1.4).

## Operatsioonidokumentatsioon

- [ ] **5.1. Puudub deployment juhend** — pole samm-sammult juhist: kuidas deployda uus versioon, kuidas rollback'ida.
  **Soovitus:** Lisa `docs/operations/deployment.md`.
- [ ] **5.2. Puuduvad runbook'id** — pole intsidentide käsitlemise protseduure (vt C05 #3.1).
  **Soovitus:** Lisa `docs/operations/runbooks/`.
- [ ] **5.3. Puudub monitooringu juhend** — pole CloudWatch dashboardi, Sentry, logide vaatamise juhendit.
  **Soovitus:** Lisa `docs/operations/monitoring.md`.

## Arendajakogemuse dokumentatsioon

- [ ] **6.1. Puudub testide kirjutamise juhend** — pole konventsiooni: milline raamistik, mock strateegia, nimetamine, min katvus (vt C12 #4.3).
- [ ] **6.2. Puudub stiilijuhend** — pole koodi stiili dokumenti: nimetamiskonventsioonid, failistruktuur, commit message formaat.
  **Soovitus:** Lisa `docs/development/style-guide.md`.
- [ ] **6.3. Puudub domeenijuhend** — pole eesti keele foneetika selgitust arendajatele (vt C12 #6.1).
- [ ] **6.4. Puudub `.env.example`** — pole näidiskeskkonnamuutujate faili (vt C12 #2.5).

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Olemas | ⚠️ Puudub |
|------------|---------|----------|-----------|
| Juurkataloog | 6 | 2 | 4 |
| Pakettide README-d | 7 | 0 | 7 |
| Arhitektuur | 4 | 0 | 4 |
| API | 3 | 0 | 3 |
| Operatsioonid | 3 | 0 | 3 |
| Arendajakogemus | 4 | 0 | 4 |
| **Kokku** | **27** | **2** | **25** |

## Prioriteedid

1. **P0:** Pakettide README-d — iga pakett vajab minimaalselt: eesmärk, setup, käivitamine (#2.1–#2.7)
2. **P0:** Arhitektuuridiagramm — kogu süsteemi ülevaade (#3.1)
3. **P1:** CONTRIBUTING.md — open source panustamise juhend (#1.3)
4. **P1:** SECURITY.md — haavatavuste teavitamine (#1.6)
5. **P1:** Deployment juhend — operatsioonidokumentatsioon (#5.1)
6. **P2:** OpenAPI spetsifikatsioon (#4.1)
7. **P2:** ADR-id (#3.2)
