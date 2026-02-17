# Checklist: Avatud lähtekoodi vastavus ja litsentsid

**Tüüp:** Õigusliku ja tehnilise vastavuse kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — litsentsid, sõltuvused, avatud lähtekoodi parimad tavad, kogukonna haldamine.

---

## Litsentsid

- [x] **1.1. MIT litsents** — selge, lubav litsents. Kood on vabalt kasutatav, muudetav, levitatav.
- [x] **1.2. SPDX identifikaator** — failide päises: `// SPDX-License-Identifier: MIT`. Standardne litsentsimärgistus.
- [x] **1.3. Autoriõiguse teade** — `// Copyright (c) 2024-2026 Askend Lab`. Identifitseeritud.
- [ ] **1.4. Sõltuvuste litsentsid pole auditeeritud** — kas kõik npm sõltuvused on MIT/Apache/BSD ühilduvad? Pole `license-checker` ega `fossa` integratsiooni.
  **Soovitus:** Käivita `npx license-checker --summary` ja kontrolli GPL/AGPL sõltuvusi.
- [ ] **1.5. Vabamorf'i litsents** — Vabamorf'i morfoloogiline analüsaator on EKI toode. Mis litsentsiga see on? Kas MIT projekt tohib seda kasutada?
  **Soovitus:** Dokumenteeri Vabamorf'i litsentsi staatus ja kasutustingimused.
- [ ] **1.6. Google Fonts litsents** — Material Symbols on Apache 2.0 litsentsiga. Ühilduv MIT-iga, aga peaks olema dokumenteeritud.
  **Soovitus:** Lisa kolmandate osapoolte litsentside fail (THIRD-PARTY-LICENSES.md).

## Avatud lähtekoodi parimad tavad

- [x] **2.1. README on olemas** — projekti kirjeldus ja setup juhised.
- [x] **2.2. LICENSE fail on olemas** — MIT litsents juurkataloogis.
- [ ] **2.3. CONTRIBUTING.md puudub** — pole panustamisjuhendit (vt C19).
- [ ] **2.4. CODE_OF_CONDUCT.md puudub** — pole käitumiskoodeksit (vt C19).
- [ ] **2.5. SECURITY.md puudub** — pole haavatavuste teavitamise protsessi (vt C19).
- [ ] **2.6. Issue templates puuduvad** — pole `.github/ISSUE_TEMPLATE/` bug report ja feature request template'e.
  **Soovitus:** Lisa issue template'd.
- [ ] **2.7. PR template puudub** — pole `.github/pull_request_template.md`.
  **Soovitus:** Lisa PR template.
- [ ] **2.8. GitHub Release puudub** — pole ühtegi ametlikku releasi (v0.1.0). Pole versiooninumbrit.
  **Soovitus:** Loo esimene GitHub Release koos CHANGELOG'iga.

## Kogukonna haldamine

- [ ] **3.1. GitHub Discussions pole lubatud** — pole foorrumit küsimusteks ja aruteludeks.
  **Soovitus:** Luba GitHub Discussions.
- [ ] **3.2. Issue labels pole konfigureeritud** — kas on `good first issue`, `help wanted`, `bug`, `enhancement` sildid?
  **Soovitus:** Konfigureeri standard issue labels.
- [ ] **3.3. Puudub "Built with" badge** — README-s pole badge'e: CI staatus, litsents, testide katvus, npm versioon.
  **Soovitus:** Lisa README badge'd.
- [ ] **3.4. Puudub Demo/Live link** — pole README-s linki live demole.
  **Soovitus:** Lisa live demo link.

## Sõltuvuste haldamine

- [x] **4.1. pnpm lockfile** — sõltuvuste versioonid on lukustatud.
- [x] **4.2. ECR lifecycle policy** — Docker pildid: max 10.
- [ ] **4.3. Puudub Renovate/Dependabot** — pole automatiseeritud sõltuvuste uuendamist. Vananenud sõltuvused võivad sisaldada turvavigu.
  **Soovitus:** Lisa Renovate bot sõltuvuste automaatseks uuendamiseks.
- [ ] **4.4. Puudub npm audit CI-s** — pole automatiseeritud haavatavuse kontrolli (pre-commit hookis on, aga kas CI-s ka?).
  **Soovitus:** Lisa `pnpm audit` CI sammuks.

## Avaldamine ja levitamine

- [ ] **5.1. npm paketid pole avaldatud** — pole `@hak/` npm pakette. Kolmandad osapooled ei saa sõltuvusi installida.
  **Soovitus:** Kaaluda tulevikus: `@hak/client` SDK npm paketina.
- [ ] **5.2. Docker Hub image puudub** — Merlin worker image on ainult ECR-is. Pole avalikku Docker Hub image'it.
  **Soovitus:** Kaaluda avalikku Docker image'it on-premise kasutuseks.
- [ ] **5.3. Puudub versioonihalduse strateegia** — pole SemVer, pole tag'imise protsessi, pole release notes'e.
  **Soovitus:** Defineeri SemVer strateegia ja release protsess.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Litsentsid | 6 | 3 | 3 |
| Parimad tavad | 8 | 2 | 6 |
| Kogukond | 4 | 0 | 4 |
| Sõltuvused | 4 | 2 | 2 |
| Avaldamine | 3 | 0 | 3 |
| **Kokku** | **25** | **7** | **18** |

## Prioriteedid

1. **P0:** Sõltuvuste litsentside audit (#1.4)
2. **P1:** CONTRIBUTING.md + SECURITY.md (#2.3, #2.5)
3. **P1:** Issue/PR templates (#2.6, #2.7)
4. **P1:** Renovate/Dependabot (#4.3)
5. **P2:** GitHub Release v0.1.0 (#2.8)
6. **P2:** README badge'd (#3.3)
