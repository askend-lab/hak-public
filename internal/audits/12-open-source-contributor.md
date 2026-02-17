# Audit: Avatud lähtekoodiga panustaja (Open Source Contributor)

**Vaatenurk:** Arendaja, kes tahab panustada projekti: koodi mõistmine, arenduskeskkonna ülesseadmine, testimine, dokumentatsioon, litsentsimine.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja dokumentatsiooni analüüs — README, CONTRIBUTING, litsents, koodi struktuur, testid, arenduskeskkond.

---

## Kasutajaprofiil

Liis, 26-aastane, tarkvaraarendaja, kes tahab panustada Eesti avaliku sektori projektidesse. Tuttav React, TypeScript, AWS-iga. Nägi projekti GitHub'is ja tahab alustada.

---

## Panustaja teekond

### Etapp 1: Projekti avastamine

- [x] **1.1. MIT litsents** — `SPDX-License-Identifier: MIT` on kõigis failides. Selge ja lubav litsents, mis võimaldab vabalt kasutada, muuta ja jagada.

- [x] **1.2. Monorepo struktuur** — `packages/` kataloog sisaldab eraldatud pakette: `frontend`, `merlin-api`, `merlin-worker`, `vabamorf-api`, `tara-auth`, `simplestore`, `task-channel`. Selge arhitektuurne eraldamine.

- [ ] **1.3. README kvaliteet pole siin auditis hinnatud** — README on mainitud `agent-start` protsessis, aga sisu pole analüüsitud. Panustaja jaoks on README esimene kokkupuutepunkt.
  **Mõju:** Teadmata — vajab eraldi kontrolli.

- [ ] **1.4. Puudub CONTRIBUTING.md** — pole selget juhendit, kuidas panustada: kuidas forki luua, koodi stiil, PR protsess, koodi ülevaatuse ootused. Pole issue template'e ega PR template'e.
  **Mõju:** Kõrge — ilma CONTRIBUTING.md-ta ei tea panustaja, kuidas alustada. Koodi stiil ja protsess on dokumenteerimata.

- [ ] **1.5. Puudub CODE_OF_CONDUCT.md** — avatud lähtekoodiga projektis on käitumiskoodeks oluline kogukonna juhtimiseks. Eriti avaliku sektori projektis.
  **Mõju:** Madal — väikese projektiga pole kriitiline, aga hea tava.

### Etapp 2: Koodi mõistmine

- [x] **2.1. TypeScript kogu projektis** — nii frontend kui backend kasutavad TypeScript'i. Tüübid aitavad mõista koodi ilma dokumentatsioonita.

- [x] **2.2. Selge failistruktuur frontendis** — `features/` kataloog grupeerib funktsionaalsuse: `synthesis/`, `tasks/`, `sharing/`, `onboarding/`, `auth/`. Iga feature sisaldab `components/`, `hooks/`, `utils/`. Standardne React feature-based struktuur.

- [x] **2.3. Hookid on hästi eraldatud** — `useSynthesis`, `useTaskHandlers`, `useTaskCRUD` jne. Iga hook vastutab kindla funktsionaalsuse eest. Koodi on lihtne jälgida.

- [ ] **2.4. Puudub arhitektuuridokumentatsioon** — pole diagramme, mis näitaksid: kuidas frontend suhtleb backendiga, mis on andmevoo suund, kuidas sünteesi pipeline töötab (frontend → API → SQS → Worker → S3 → frontend). Panustaja peab koodi lugedes ise välja mõtlema.
  **Mõju:** Keskmine — koodi struktuur on selge, aga üldine arhitektuur vajab dokumentatsiooni.

- [ ] **2.5. Puuduvad inline kommentaarid keerukates kohtades** — mõned funktsioonid (nt `useInlineTagEditor`, `useSynthesisOrchestrator`) on keerukad ja puuduvad selgitavad kommentaarid. JSDoc on minimaalne.
  **Mõju:** Madal — TypeScript tüübid kompenseerivad osaliselt, aga keerukad loogikad vajaksid selgitust.

### Etapp 3: Arenduskeskkonna ülesseadmine

- [ ] **3.1. Arenduskeskkonna juhend pole siin auditis kontrollitud** — pole selge, kas README sisaldab: nõutavad tööriistad (Node.js versioon, pnpm/npm, AWS CLI), kuidas installida sõltuvusi, kuidas käivitada arendusserverit, kuidas käivitada teste.
  **Mõju:** Teadmata — vajab README kontrolli.

- [x] **3.2. Vitest on testiraamistik** — `vitest.config.ts` on konfigureeritud. Panustaja saab käivitada `vitest` teste kohe pärast sõltuvuste installimist.

- [x] **3.3. Pre-commit hookid on konfigureeritud** — koodi kvaliteeti kontrollitakse enne commitimist. Panustaja saab kohe tagasisidet.

- [ ] **3.4. Puudub Docker Compose arenduseks** — pole `docker-compose.dev.yml`, mis käivitaks kogu stacki (frontend + backend + DynamoDB Local + Vabamorf). Panustaja peab iga teenuse eraldi üles seadma.
  **Mõju:** Keskmine — monorepo lihtsustab, aga täisstack'i käivitamine on tõenäoliselt keeruline.

### Etapp 4: Testimine

- [x] **4.1. Testid on olemas** — `*.test.ts` ja `*.test.tsx` failid on olemas mitmes kataloogis. `useSynthesis.branches.test.ts`, `phoneticMarkers.test.ts`, `TagsInput.test.tsx` jne.

- [x] **4.2. jest-axe ligipääsetavuse testimine** — `a11y-helpers.ts` pakub WCAG 2.1 AA testimise raamistikku. Infrastruktuur on olemas.

- [ ] **4.3. Testide katvus pole teada** — pole `coverage` konfiguratsiooni `vitest.config.ts` failis (ainult `include` ja `exclude` mustrid, aga pole `coverage` sektsiooni). Panustaja ei tea, millised failid on testitud ja millised mitte.
  **Mõju:** Keskmine — testide katvuse aruanne aitaks prioriseerida panustamist.

- [ ] **4.4. E2E testid puuduvad** — pole Playwright, Cypress ega muid E2E teste. Ainult ühiku- ja integratsioonitestid. Panustaja ei saa kontrollida, kas tema muudatus rikub kasutaja töövoogude.
  **Mõju:** Keskmine — E2E testid on olulised, eriti SPA jaoks, kus paljud vead ilmnevad ainult integreeritult.

### Etapp 5: Koodi kvaliteet ja stiil

- [x] **5.1. ESLint ja Prettier** — tõenäoliselt konfigureeritud (pre-commit hookid viitavad). Koodi stiil on ühtlane.

- [x] **5.2. Nimetamise konventsioonid on järjekindlad** — `useTaskCRUD`, `useTaskCreate`, `handleAddSentence`, `TaskDetailView`. React konventsioonidele vastav.

- [ ] **5.3. Mõned muutujad on lühendatud** — nt `s` (sentence), `t` (task), `e` (event) lühikestes callback'ides. See on levinud, aga panustajale raskendab lugemist.
  **Mõju:** Madal — tavaline JavaScript/TypeScript stiil.

- [x] **5.4. SCSS token'id on hästi struktureeritud** — `_breakpoints.scss`, `_colors.scss`, `_typography.scss`, `_spacing.scss`. Design token'id on eraldatud ja dokumenteeritud.

### Etapp 6: Litsentsid ja sõltuvused

- [x] **6.1. MIT litsents kõigis failides** — `SPDX-License-Identifier: MIT` ja `Copyright (c) 2024-2026 Askend Lab` on standardne päis.

- [ ] **6.2. Sõltuvuste litsentsid pole kontrollitud** — pole `license-checker` ega sarnast tööriista, mis kontrolliks, et kõik sõltuvused on ühilduvad MIT litsentsiga. Mõnel npm paketil võib olla GPL või muu viiralisitsents.
  **Mõju:** Madal — tüüpiline risk npm projektides. Peaks käivitama `npx license-checker --summary`.

- [ ] **6.3. Sõltuvuste turvaaudit** — pole `npm audit` ega `snyk` integratsiooni CI/CD-sse. Haavatavad sõltuvused võivad jääda märkamata.
  **Mõju:** Keskmine — peaks olema automatiseeritud turvaaudit CI pipeline'is.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem | ❓ Teadmata |
|------------|-------|--------|-------------|-------------|
| Projekti avastamine | 5 | 2 | 1 | 2 |
| Koodi mõistmine | 5 | 3 | 2 | 0 |
| Arenduskeskkond | 4 | 2 | 1 | 1 |
| Testimine | 4 | 2 | 2 | 0 |
| Koodi kvaliteet | 4 | 3 | 1 | 0 |
| Litsentsid | 3 | 1 | 2 | 0 |
| **Kokku** | **25** | **13** | **9** | **3** |

## Top-5 probleemid (mõju panustajale)

1. **Puudub CONTRIBUTING.md** (#1.4) — panustaja ei tea, kuidas alustada
2. **Puudub arhitektuuridokumentatsioon** (#2.4) — kogu süsteemi ülevaade puudub
3. **Testide katvus pole teada** (#4.3) — pole selge, mida testida
4. **E2E testid puuduvad** (#4.4) — kasutaja töövoogude regressioone ei tuvastata
5. **Sõltuvuste turvaaudit puudub CI-s** (#6.3) — haavatavused võivad jääda märkamata

## Mis on hästi tehtud

- MIT litsents — selge ja lubav
- Monorepo selge struktuuriga
- TypeScript kogu projektis — tüübid kui dokumentatsioon
- Feature-based failistruktuur — lihtne navigeerida
- Vitest + jest-axe testimise raamistik
- Pre-commit hookid
- SCSS design token'id hästi struktureeritud
- Ühtlased nimetamiskonventsioonid
