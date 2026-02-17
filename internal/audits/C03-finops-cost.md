# Checklist: FinOps / Kuluanalüüs

**Tüüp:** Finants- ja infrastruktuuri kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Terraform ja serverless konfiguratsioonide analüüs — AWS teenuste hinnakirjad, skaleerimise prognoosid.

---

## AWS teenuste kulustruktuur

### Lambda (merlin-api, simplestore, tara-auth, vabamorf-api)

- [x] **1.1. Serverless arhitektuur** — Lambda funktsioonid: maks tasutakse ainult kasutamise eest. Null-koormusel null-kulu. Hea valik MVP jaoks.
- [x] **1.2. API Gateway throttle on seadistatud** — `rateLimit: 2`, `burstLimit: 4` (`merlin-api/serverless.yml`). Kaitseb ootamatu kulu eest.
- [ ] **1.3. Lambda cold start kulu** — Node.js 20.x Lambda cold start on ~200–500ms. Pole provisioned concurrency'd. Harva kasutamisel on igal päringu esimene kutse aeglane.
  **Hinnang:** Cold start ei suurenda rahalist kulu, aga mõjutab kasutajakogemust.
- [ ] **1.4. Lambda mälu konfiguratsioon pole optimeeritud** — pole selge, mis mälusuurus on konfigureeritud. Väiksem mälu = aeglasem, aga odavam. Suurem mälu = kiirem, aga kallim. Tuleks profilrida AWS Lambda Power Tuning'iga.
  **Soovitus:** Käivita Lambda Power Tuning tööriist optimaalse mälu leidmiseks.

### ECS Fargate (merlin-worker)

- [x] **1.5. Fargate Spot kasutusel** — `capacity_provider = "FARGATE_SPOT"`, `weight = 100`. Kuni 70% soodsam tavalise Fargate'ga võrreldes.
- [ ] **1.6. Worker töötab 24/7 produs** — `min_capacity = 1` (prod). Isegi öösiti, kui päringuid pole. Fargate Spot ~0.5 vCPU + 1GB: ~$10–15/kuu 24/7.
  **Soovitus:** Lisa ajaline skaleerimine: 0 öösiti (23:00–07:00), 1 päeval. Säästab ~33%.
- [ ] **1.7. Puudub auto-scaling SQS järjekorra järgi** — `desired_count = 0`, auto-scaling target on `min=1, max=1` (prod). Pole SQS-põhist skaleerimist: kui järjekorras on 100 sõnumit, töötab endiselt 1 worker.
  **Soovitus:** Lisa SQS-põhine auto-scaling: 0→1 kui sõnumeid >0, 1→2 kui sõnumeid >50.

### DynamoDB (simplestore)

- [x] **1.8. On-demand (PAY_PER_REQUEST)** — `BillingMode: PAY_PER_REQUEST`. Ideaalne ebaühtlase koormusega teenusele. Pole üleprovisioned capacity'd.
- [x] **1.9. TTL on lubatud** — `ttl` atribuut on konfigureeritud. Aegunud andmed kustutatakse automaatselt. Vähendab salvestuskulu.
- [x] **1.10. PITR on lubatud** — `PointInTimeRecoveryEnabled: true`. Andmete taastamine on võimalik. Lisab ~20% salvestuskulu, aga on hädavajalik.

### S3 (audio cache)

- [x] **1.11. Lifecycle policy** — `expire-old-audio`: cache/ prefix'iga failid aeguvad 30 päeva pärast. Vähendab salvestuskulu.
- [ ] **1.12. Puudub Intelligent-Tiering** — kõik failid on S3 Standard klassis. Harva ligipääsetavad failid (vanad cache'd) võiksid olla S3 Intelligent-Tiering klassis.
  **Soovitus:** Lisa `transition` reegel: 7 päeva → Intelligent-Tiering. Säästab ~40% salvestuskulu.
- [ ] **1.13. S3 on avalikult ligipääsetav** — `PublicReadGetObject` policy. Audiofailid on otse S3-st serveeritud. Pole CloudFront CDN-i vahel (audio jaoks).
  **Soovitus:** Lisa CloudFront distribution audio S3 bucket'i ette. Vähendab S3 data transfer kulu ja parandab latentsust.

### CloudFront

- [x] **1.14. CloudFront on kasutusel frontendile** — `aws_cloudfront_distribution.website`. CDN vähendab S3 päringute ja data transfer kulu.
- [ ] **1.15. Puudub CloudFront audio jaoks** — audio S3 bucket pole CloudFront'i taga. Iga audio allalaadimine on otsene S3 päring ($0.09/GB data transfer vs CloudFront $0.085/GB).
  **Soovitus:** Lisa CloudFront audio bucket'ile.

### SQS

- [x] **1.16. SQS on minimaalne kulu** — SQS hinnakirj: ~$0.40 per million requests. Madal kulu isegi suure kasutuse korral.
- [x] **1.17. DLQ on konfigureeritud** — Dead Letter Queue 14-päevase retentsiooniga. Ebaõnnestunud sõnumid ei kao.
- [x] **1.18. Long polling** — `receive_wait_time_seconds = 20`. Vähendab tühje päringuid ja SQS kulu.

### Cognito

- [x] **1.19. Cognito Free Tier** — esimesed 50,000 MAU (Monthly Active Users) on tasuta. MVP jaoks kulu puudub.

### Sentry

- [ ] **1.20. Sentry hinnaklass** — tasuta plaan: 5,000 events/kuu. Suure kasutajaskonnaga võib ületada. Peaks jälgima.
  **Soovitus:** Monitoori Sentry kasutust ja vajadusel uppida plaani.

### ECR

- [x] **1.21. ECR lifecycle policy** — "Keep last 10 images". Vähendab salvestuskulu.

## Kulude jälgimine

- [ ] **2.1. Puuduvad AWS Budget Alerts** — pole konfigureeritud kuluhoiatusi. Ootamatu kulukasv jääb märkamata.
  **Soovitus:** Lisa Terraform'iga `aws_budgets_budget` ressurss: hoiatus $50, $100, $200 kuus.
- [ ] **2.2. Puudub Cost Anomaly Detection** — AWS Cost Anomaly Detection pole lubatud.
  **Soovitus:** Lisa `aws_ce_anomaly_monitor`.
- [x] **2.3. Tagging on paigas** — `Project`, `Environment`, `Service`, `ManagedBy` tag'id. Cost allocation tag'id on kasutuses.
- [ ] **2.4. Puudub kuude kaupa kuluaruanne** — pole automatiseeritud kuluaruannet meeskonnale.
  **Soovitus:** Lisa AWS Cost Explorer'i iganädalane aruanne e-postiga.

## Kuluprognoos stsenaariumide kaupa

| Stsenaarium | Kasutajad/kuu | Sünteesi päringuid/kuu | Hinnang €/kuu |
|-------------|---------------|------------------------|---------------|
| Praegune (MVP) | ~100 | ~5,000 | ~€15–25 |
| Koolide piloot (10 kooli) | ~1,000 | ~50,000 | ~€30–50 |
| Üle-eestiline (100 kooli) | ~10,000 | ~500,000 | ~€80–150 |
| Massiline kasutus | ~50,000 | ~2,000,000 | ~€300–500 |

*Hinnangud põhinevad: Lambda ~$0.20/1M päringut, DynamoDB ~$1.25/1M kirjutust, S3 ~$0.023/GB, Fargate Spot ~$15/kuu 24/7, CloudFront ~$0.085/GB.*

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Lambda | 4 | 2 | 2 |
| Fargate | 3 | 1 | 2 |
| DynamoDB | 3 | 3 | 0 |
| S3 | 3 | 1 | 2 |
| CloudFront | 2 | 1 | 1 |
| SQS | 3 | 3 | 0 |
| Cognito/Sentry/ECR | 3 | 2 | 1 |
| Kulude jälgimine | 4 | 1 | 3 |
| **Kokku** | **25** | **14** | **11** |

## Top-5 optimeerimise võimalused

1. **Worker öine seiskamine** — ~33% Fargate kulu sääst (~€5/kuu)
2. **AWS Budget Alerts** — kaitse ootamatu kulu eest
3. **CloudFront audio jaoks** — vähendab S3 data transfer kulu
4. **S3 Intelligent-Tiering** — ~40% salvestuskulu sääst
5. **Lambda Power Tuning** — optimaalne mälu/kulu suhe
