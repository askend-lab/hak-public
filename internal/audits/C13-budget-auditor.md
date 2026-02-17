# Checklist: Eelarve audiitor (Budget Auditor)

**Tüüp:** Finants- ja kulude jälgimise kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Terraform ja infrastruktuuri analüüs — AWS billing, kuluhoiatused, tagging, anomaaliate tuvastamine.

---

## Kulude jälgimise infrastruktuur

- [ ] **1.1. Puuduvad AWS Budget Alerts** — pole Terraform'is `aws_budgets_budget` ressurssi. Igakuine kulu võib ületada oodatu ilma hoiatuseta.
  **Soovitus:** Lisa Terraform'iga:
  ```hcl
  resource "aws_budgets_budget" "monthly" {
    budget_type  = "COST"
    limit_amount = "100"
    limit_unit   = "USD"
    time_unit    = "MONTHLY"
    notification { threshold = 50 }   # 50%
    notification { threshold = 80 }   # 80%
    notification { threshold = 100 }  # 100%
  }
  ```
- [ ] **1.2. Puudub Cost Anomaly Detection** — AWS Cost Anomaly Detection pole konfigureeritud. Ootamatu kulukasv (nt DDoS, viga sünteesi pipeline'is) jääb märkamata.
  **Soovitus:** Lisa `aws_ce_anomaly_monitor` ja `aws_ce_anomaly_subscription`.
- [x] **1.3. Tagging on paigas** — `Project`, `Environment`, `Service`, `ManagedBy` tag'id kõigil ressurssidel. Cost allocation tag'id on kasutuses.
- [ ] **1.4. Puudub cost allocation tag'ide aktiveerimine** — tag'id on ressurssidel, aga kas need on AWS Billing console'is aktiveeritud cost allocation jaoks? Pole koodist kontrollitav.
  **Soovitus:** Kontrolli AWS Billing → Cost Allocation Tags → aktiveeri `Project`, `Environment`, `Service`.

## Kuluriskid

- [ ] **2.1. Üks kasutaja võib genereerida suure kulu** — API throttle on 2 req/s, aga 2 req/s × 3600s = 7200 sünteesi/tunnis. Iga süntees on ~$0.001 (Lambda + SQS + S3). 7200 × $0.001 = $7.2/tunnis. Automaatse skriptiga 24h = ~$173/päev.
  **Soovitus:** Lisa per-user rate limiting (mitte ainult globaalne). Nt: max 100 sünteesi/kasutaja/tunnis.
- [ ] **2.2. S3 data transfer kulu** — audio on otse S3-st serveeritud (pole CloudFront'i). S3 data transfer: $0.09/GB. 10,000 kasutajat × 10 heli × 100KB = ~10GB/päev = ~$0.90/päev = ~$27/kuu.
  **Soovitus:** CloudFront vähendaks data transfer kulu ($0.085/GB + caching).
- [ ] **2.3. CloudWatch Logs kulu** — 90-päevane retentsioon. Logide maht kasvab kasutamisega. CloudWatch Logs: $0.50/GB ingest + $0.03/GB stored. Suure koormuse korral võib logide kulu ületada arvutuskulu.
  **Soovitus:** Monitoori logide mahtu. Kaaluda retentsiooni vähendamist (30 päeva) või logide S3-sse arhiveerimist.
- [x] **2.4. DynamoDB on-demand ei tekita ootamatut kulu** — on-demand billing skaleerub järk-järgult. Pole provisioned capacity ületamise riski.
- [x] **2.5. Fargate Spot vähendab arvutuskulu** — kuni 70% soodsam. Hea valik.
- [x] **2.6. Lambda free tier** — esimesed 1M päringut ja 400,000 GB-s on tasuta. MVP jaoks on Lambda kulu minimaalne.

## Kuluoptimeerimise võimalused

- [ ] **3.1. Fargate öine seiskamine** — prod worker töötab 24/7. Öösiti (23:00–07:00) pole kasutajaid. ~33% Fargate kulu sääst.
  **Soovitus:** Lisa scheduled scaling: `desired_count = 0` öösiti.
- [ ] **3.2. S3 Intelligent-Tiering** — harva ligipääsetavad audiofailid (>7 päeva) võiksid automaatselt liikuda odavamasse salvestusklassi.
  **Soovitus:** Lisa S3 lifecycle transition: 7 päeva → Intelligent-Tiering.
- [ ] **3.3. CloudWatch Logs retentsiooni optimeerimine** — 90 päeva on pikk. Kas on vaja kõiki logisid 90 päeva? ECS logid: 30 päeva piisab. Lambda logid: 14 päeva.
  **Soovitus:** Diferentseeri logide retentsioon teenuse kaupa.
- [ ] **3.4. ECR pildide piirang** — "Keep last 10 images" on paigas. Hea. Aga kas dev ja prod ECR-id on eraldatud?
  **Mõju:** Madal — ECR salvestuskulu on minimaalne.
- [ ] **3.5. Puudub Savings Plan / Reserved Instances** — Fargate Savings Plans pakuvad kuni 52% säästu. Aga nõuab 1–3 aasta kohustust.
  **Soovitus:** Kui Fargate kulu on stabiilne >6 kuud, kaaluda Compute Savings Plan'i.

## Igakuise kuluaruande struktuur

- [ ] **4.1. Puudub automaatne kuluaruanne** — pole iganädalast/igakuist kokkuvõtet meeskonnale.
  **Soovitus:** Lisa AWS Cost Explorer'i kuluaruanne e-postiga. Või Terraform'iga SNS + Lambda kuluaruande genereerimiseks.
- [ ] **4.2. Puudub kulude prognoos** — pole edasisuunatud prognoosi: "Praeguse kasvuga kulutame detsembris $X."
  **Soovitus:** Kasuta AWS Cost Explorer Forecast'i.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Kulude jälgimine | 4 | 1 | 3 |
| Kuluriskid | 6 | 3 | 3 |
| Optimeerimine | 5 | 0 | 5 |
| Aruandlus | 2 | 0 | 2 |
| **Kokku** | **17** | **4** | **13** |

## Prioriteedid

1. **P0:** AWS Budget Alerts — hoiatus enne ootamatut kulu (#1.1)
2. **P0:** Per-user rate limiting — kaitse kuritarvituse eest (#2.1)
3. **P1:** Cost Anomaly Detection — automaatne anomaaliate tuvastamine (#1.2)
4. **P1:** Fargate öine seiskamine — ~33% sääst (#3.1)
5. **P2:** CloudFront audio jaoks — data transfer kulu vähendamine (#2.2)
