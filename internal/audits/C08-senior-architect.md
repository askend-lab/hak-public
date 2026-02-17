# Checklist: Vanemarhitekt (Skaleeritavus, tehniline võlg)

**Tüüp:** Arhitektuurne kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — abstraktsioonid, sõltuvused, bottleneck'id, tech debt, skaleerimise piirangud.

---

## Arhitektuurne ülevaade

- [x] **1.1. Selge kihiline arhitektuur** — Frontend (React SPA) → API Gateway → Lambda → DynamoDB/SQS → Fargate Worker → S3. Iga kiht on eraldatud ja asendatav.
- [x] **1.2. Monorepo hea struktuuriga** — `packages/` eraldab: `frontend`, `merlin-api`, `merlin-worker`, `vabamorf-api`, `tara-auth`, `simplestore`, `task-channel`, `shared`. Iga pakett on iseseisev.
- [x] **1.3. Infrastructure as Code** — Terraform + Serverless Framework. Infrastruktuur on versioonitud ja reprodutseeritav.
- [ ] **1.4. Kaks IaC tööriista** — Terraform haldab ECS/S3/SQS, Serverless Framework haldab Lambda/API Gateway. Kaks eraldi tööriista = kaks oleku allikat. Sünkroniseerimine nõuab tähelepanu.
  **Soovitus:** Pikaajaliselt: migreerituda ühele tööriistale (Terraform + AWS CDK Lambda jaoks).

## Skaleerimise piirangud

- [ ] **2.1. Merlin worker = single point of bottleneck** — üks Fargate task (max 1 prod). Kui SQS järjekorras on 1000 sõnumit, töötleb üks worker neid järjest. Skaleerimise plaan on olemas (`appautoscaling_target`), aga max on 1.
  **Soovitus:** Muuda `max_capacity = 3–5`. Lisa SQS-põhine auto-scaling: QueueDepth >50 → lisa worker.
- [ ] **2.2. Vabamorf on protsessipõhine bottleneck** — `vmetajson.ts` haldab ühte child process'i. Üks päring korraga. Järjekord ootab. Kui protsess crashib, pole auto-restart'i.
  **Soovitus:** Lisa protsessi taaskäivitamise loogika. Kaaluda mitme protsessi pool'i.
- [x] **2.3. DynamoDB skaleerub automaatselt** — On-demand billing. Pole provisioned capacity piiri. Automaatne adaptive capacity.
- [x] **2.4. Lambda skaleerub automaatselt** — kuni 1000 samaaegset käivitust (vaikimisi). Piisav enamikule stsenaariumidele.
- [ ] **2.5. API Gateway throttle on madal** — `rateLimit: 2`, `burstLimit: 4`. See on 2 päringut sekundis kogu API jaoks. 30 kasutajat samal ajal = throttling.
  **Soovitus:** Tõsta tootmiskeskkonnas: `rateLimit: 50`, `burstLimit: 100`. Või seadista per-user throttling.
- [ ] **2.6. S3 audio on avalikult ligipääsetav** — `PublicReadGetObject`. Pole CloudFront'i vahel. Iga päring on otse S3-st. S3 toetab ~5500 GET/s partitsiooni kohta, aga andmeedastuse kulu on kõrgem kui CloudFront'iga.
  **Soovitus:** Lisa CloudFront audio bucket'i ette.

## Tehniline võlg (Tech Debt)

- [ ] **3.1. Serverless Framework v3 → v4 migratsioon** — Serverless v3 on EOL. v4 muudab litsentsimudelit (tasuline >$2M revenue). Alternatiiv: SST, AWS CDK, Terraform.
  **Soovitus:** Planeeri migratsioon: Serverless v3 → SST v3 või AWS CDK.
- [ ] **3.2. useSynthesis hook on ülekoormatud** — komponeerib 5+ alamhook'i, tagastab 18+ väljaga objekti. `useMemo` sõltuvuste loend on pikk. Raskesti testitav ja hooldatav.
  **Soovitus:** Dekomponeeri: eraldi `useSynthesisPlayback`, `useSynthesisInput`, `useSynthesisState`.
- [ ] **3.3. State management on hajutatud** — olek on jaotatud: `useSentenceState` (localStorage), `useTaskCRUD` (API + local state), `usePlaylistControl` (audio), `useInlineTagEditor` (editing). Pole keskset olekuhaldust (Redux, Zustand, Jotai).
  **Soovitus:** Kaaluda Zustand'i kasutuselevõttu kogu sünteesi oleku jaoks.
- [ ] **3.4. CSS-in-JS vs SCSS** — praegu SCSS + BEM. See töötab, aga pole komponentidega seotud (CSS Modules, styled-components). CSS muudatus võib mõjutada teist komponenti.
  **Soovitus:** Kaaluda CSS Modules'i kasutuselevõttu uutele komponentidele.
- [x] **3.5. TypeScript kogu projektis** — tüübid on järjekindlad ja kasulikud. Pole `any` kuritarvitamist.
- [x] **3.6. Feature-based failistruktuur** — `features/synthesis/`, `features/tasks/`, `features/auth/`. Iga feature on eraldatud. Hea hooldatavus.

## Abstraktsioonid ja mustrid

- [x] **4.1. Hook'ide koosseisu muster** — `useSynthesis` koondab alamhook'id. Hea muster, kuigi praegu ülekoormatud.
- [x] **4.2. Korduskasutatavad komponendid** — `BaseModal`, `PlayButton`, `ConfirmationModal`, `PageLoadingState`. DRY põhimõte.
- [ ] **4.3. Puudub API abstraktsioonikiht** — frontend kutsub API-t otse `fetch`-iga erinevatest failidest. Pole tsentraalset API klienti (nt `apiClient.get('/tasks')`) ega automaatset autentimise päise lisamist.
  **Soovitus:** Loo `apiClient` wrapper koos interceptorite, retry loogika ja autentimise päisega.
- [ ] **4.4. Puudub vigade tüübisüsteem** — vead on stringid ("Analysis failed") või Error objektid. Pole struktureeritud vigade tüüpe (nt `ApiError`, `ValidationError`, `NetworkError`).
  **Soovitus:** Loo vigade hierarhia: `AppError → ApiError | ValidationError | NetworkError`.

## 10x koormuse stsenaarium

Mis läheb katki 10,000 samaaegse kasutajaga?

- [ ] **5.1. API Gateway throttle** — 2 req/s kogu API-le → ebapiisav. **Läheb katki.**
- [ ] **5.2. Merlin worker** — 1 worker, ~10s/süntees → max ~360 sünteesi/tunnis → pikk järjekord. **Läheb katki.**
- [x] **5.3. DynamoDB** — on-demand skaleerub. **Peab vastu.**
- [x] **5.4. Lambda** — skaleerub 1000 samaaegseni. **Peab vastu.**
- [ ] **5.5. S3 ilma CloudFront'ita** — 10,000 kasutajat laevad audio'd otse S3-st. Andmeedastuse kulu kasvab kiiresti. **Kulukas, mitte katkine.**

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Arhitektuur | 4 | 3 | 1 |
| Skaleerimise piirangud | 6 | 2 | 4 |
| Tehniline võlg | 6 | 2 | 4 |
| Abstraktsioonid | 4 | 2 | 2 |
| 10x stsenaarium | 5 | 2 | 3 |
| **Kokku** | **25** | **11** | **14** |

## Prioriteedid

1. **P0:** API Gateway throttle tõstmine — blocker skaleerimisele (#2.5)
2. **P0:** Merlin worker auto-scaling — bottleneck sünteesile (#2.1)
3. **P1:** Vabamorf auto-restart — stabiilsuse probleem (#2.2)
4. **P1:** API abstraktsioonikiht — hooldatavus (#4.3)
5. **P2:** Serverless v3 → alternatiiv migratsioon (#3.1)
6. **P2:** useSynthesis refactoring (#3.2)
