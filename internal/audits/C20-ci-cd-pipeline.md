# Checklist: CI/CD Pipeline

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** GitHub Actions, pre-commit hookid, deployment protsessi analüüs.

---

## Pre-commit hookid

- [x] **1.1. Hookid on olemas ja blokeerivad** — pre-commit hookid käivitavad: lint, testid, tüübikontroll, turvakontroll, jscpd, circular deps, failisuuruse kontroll, secret scanning.
- [x] **1.2. 12 hook'i** — Security, Deps, Circular-Deps, JSCPD, SRC-SIZE, MD-SIZE, SECRET, LANG + lint metrics. Põhjalik.
- [x] **1.3. Testid jooksevad enne commiti** — `run-tests` hook tagab, et testid läbivad enne koodi committimist.
- [ ] **1.4. Hookid on aeglased** — ~15.7s kogu hook'ide käivitamiseks. Tihedas arenduses on see märgatav viivitus.
  **Soovitus:** Optimeeri: käivita ainult muutunud failide testid, paralleelista hook'e.
- [ ] **1.5. Hookide ebaõnnestumine on juhuslik** — audiitide käigus tekkis transient `run-tests` hook failure. Sama testide käivitamine eraldi õnnestus. Ebastabiilne hook vähendab usaldust.
  **Soovitus:** Uuri juhusliku ebaõnnestumise põhjust. Lisa retry loogika.

## GitHub Actions

- [ ] **2.1. CI pipeline struktuur pole siin kontrollitud** — `.github/workflows/` failide sisu vajab eraldi kontrollimist. Kas kõik samad kontrollid, mis pre-commit hookides?
  **Soovitus:** Kontrolli CI pipeline'i vastavust pre-commit hookidele.
- [ ] **2.2. Puudub branch protection audit** — kas `main` branch on kaitstud: required reviews, required status checks, no force push, no delete?
  **Soovitus:** Kontrolli GitHub branch protection reegleid.
- [ ] **2.3. Puudub automated deployment** — kas CI käivitab automaatse deploymendi pärast merge'i? Serverless deploy, Terraform apply, frontend S3 sync?
  **Soovitus:** Dokumenteeri deployment pipeline.
- [ ] **2.4. Puudub staging keskkond** — kas on dev → staging → prod pipeline? Või ainult dev → prod?
  **Soovitus:** Kaaluda staging keskkonna lisamist.

## Build ja testid

- [x] **3.1. 3130+ testi** — põhjalik testkomplekt. Kõrge katvus.
- [ ] **3.2. Puudub testide katvuse aruanne** — pole `vitest --coverage` konfiguratsiooni. CI-s pole minimaalne katvuse nõue.
  **Soovitus:** Lisa coverage aruanne CI-sse. Seadista minimaalne katvuse nõue (nt 80%).
- [ ] **3.3. Puuduvad E2E testid** — Playwright on konfigureeritud, aga pole kasutajateekonna E2E teste. CI-s pole E2E sammu.
  **Soovitus:** Lisa vähemalt 3 E2E testi: süntees, ülesande loomine, jagamine.
- [ ] **3.4. Puudub visuaalne regressioonitest** — pole screenshot'i põhiseid teste. UI muudatused võivad jääda märkamata.
  **Soovitus:** Lisa Playwright visuaalse regressiooni testid kriitiliste vaadete jaoks.
- [x] **3.5. TypeScript tüübikontroll** — tsc käivitub hookides. Tüübivead blokeerivad commiti.

## Deployment turvalisus

- [ ] **4.1. Terraform apply pole CI-s** — Terraform muudatused tehakse tõenäoliselt käsitsi. Pole automatiseeritud `terraform plan` PR kommentaari ega `terraform apply` pärast merge'i.
  **Soovitus:** Lisa Terraform CI: `plan` PR-i kommentaariks, `apply` pärast merge'i (manual approval).
- [ ] **4.2. Secrets haldamine** — kas AWS credentials, Sentry DSN, Cognito konfiguratsioon on GitHub Secrets'is? Kas on rotation?
  **Soovitus:** Kontrolli secrets haldamist. Lisa secrets rotation protseduur.
- [ ] **4.3. Puudub rollback protseduur** — kui deploy ebaõnnestub, kuidas tagasi minna? Serverless rollback? Terraform state?
  **Soovitus:** Dokumenteeri rollback protseduur iga teenuse jaoks.
- [ ] **4.4. Puudub canary / blue-green deployment** — uus versioon läheb kohe kõigile. Pole järk-järgulist rulimist.
  **Soovitus:** Kaaluda tulevikus: Lambda versioning + alias → canary deployment.

## Koodi kvaliteedi kontroll

- [x] **5.1. ESLint** — koodi stiili ja kvaliteedi kontroll.
- [x] **5.2. Prettier** — koodi vormindamine.
- [x] **5.3. JSCPD** — duplikaatkoodi tuvastamine (≤5% piir).
- [x] **5.4. Circular dependency kontroll** — tsirkulaarsete sõltuvuste tuvastamine.
- [x] **5.5. Secret scanning** — salajaste võtmete tuvastamine koodis.
- [x] **5.6. Failisuuruse kontroll** — SRC ≤400L, MD ≤200L. Hoiab failid kompaktsed.
- [ ] **5.7. Puudub `npm audit` CI-s** — haavatavate sõltuvuste kontroll pole CI pipeline'is (pre-commit kontrollib, aga kas CI ka?).
  **Soovitus:** Lisa `pnpm audit` CI sammuks.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Pre-commit hookid | 5 | 3 | 2 |
| GitHub Actions | 4 | 0 | 4 |
| Build ja testid | 5 | 2 | 3 |
| Deployment turvalisus | 4 | 0 | 4 |
| Koodi kvaliteet | 7 | 6 | 1 |
| **Kokku** | **25** | **11** | **14** |

## Prioriteedid

1. **P0:** Branch protection kontroll — turvaline merge protsess (#2.2)
2. **P1:** E2E testid CI-sse — kasutajateekonna regressioonikaitse (#3.3)
3. **P1:** Testide katvuse aruanne — kvaliteedi mõõdik (#3.2)
4. **P1:** Terraform CI (plan/apply) — infrastruktuuri muudatuste kontroll (#4.1)
5. **P2:** Rollback protseduur — deployment turvalisus (#4.3)
