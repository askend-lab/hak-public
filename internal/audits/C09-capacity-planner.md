# Checklist: Capacity Planner (Võimsuse planeerimine)

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Terraform ja serverless konfiguratsioonide analüüs — AWS teenuste limiidid, bottleneck'id, skaleerimise läved.

---

## AWS teenuste limiidid

### API Gateway

- [ ] **1.1. Throttle on madal** — `rateLimit: 2`, `burstLimit: 4` (merlin-api). See on 2 päringut sekundis kogu API jaoks. 30 kasutajat samaaegselt = throttling.
  **Kriitilne lävend:** ~30 samaaegset kasutajat
  **Soovitus:** Tõsta: `rateLimit: 100`, `burstLimit: 200` prod jaoks.
- [x] **1.2. API Gateway default limit** — AWS API Gateway HTTP API: 10,000 req/s. Piisav kogu eluea jooksul.

### Lambda

- [x] **2.1. Concurrent executions** — AWS default: 1000 samaaegset. Iga API päring = ~100–500ms. 1000 samaaegset = ~2000–10,000 req/s. Piisav.
- [ ] **2.2. Cold start mõju** — esimene päring pärast jõudeolekut: ~200–500ms lisa. Node.js 20.x on kiire, aga provisioned concurrency puudub.
  **Kriitilne lävend:** Pole kriitiline — kasutajakogemus, mitte võimsus.
- [ ] **2.3. Lambda payload limit** — 6MB sünkroonne, 256KB asünkroonne. Sünteesi tekst on väike (<1KB). Pole probleem praegu, aga bulk-sisestus (100 lauset) peaks mahtuma.
  **Mõju:** Madal — praegune kasutus on limiidist kaugel.

### DynamoDB

- [x] **3.1. On-demand throughput** — automaatne skaleerimine. Pole provisioned capacity piiri. Ühe tabeli max: 40,000 RCU / 40,000 WCU.
- [ ] **3.2. Item size limit** — 400KB per item. Kui ülesandel on 100+ kirjet (entries) ja iga kirje sisaldab stressedText + audioUrl, võib item suuruse limiit saada probleemiks.
  **Kriitilne lävend:** ~200–500 kirjet ühe ülesande all (sõltuvalt teksti pikkusest).
  **Soovitus:** Monitoori itemite suurust. Vajadusel eraldada entries eraldi itemitesse.
- [ ] **3.3. Query result limit** — 1MB per query. `getUserTasks` ilma pagineerimiseta: ~100–200 ülesannet = ~1MB.
  **Kriitilne lävend:** ~100–200 ülesannet kasutaja kohta.
  **Soovitus:** Lisa pagineerimise tugi enne, kui kasutajatel on >100 ülesannet.

### SQS

- [x] **4.1. SQS throughput** — peaaegu piiramatu: 3000 sõnumit/s standard queue. Pole bottleneck.
- [x] **4.2. Message retention** — 1 päev (86400s). Piisav, kuna worker töötleb reaalajas.
- [x] **4.3. Visibility timeout** — 300s (5 min). Piisav TTS genereerimiseks.

### ECS Fargate (Merlin Worker)

- [ ] **5.1. Worker throughput** — 1 worker, ~5–15s per süntees = max ~240–720 sünteesi/tunnis. Tippkoormusel (koolipäeva algus, 800 õpilast) on see ebapiisav.
  **Kriitilne lävend:** ~500 sünteesi/tunnis = 1 worker max.
  **Soovitus:** Auto-scaling: min=1, max=5. SQS QueueDepth >50 → lisa worker.
- [ ] **5.2. Fargate CPU/Memory** — konfigureeritud `var.merlin_cpu` ja `var.merlin_memory` kaudu. TTS genereerimine on CPU-intensiivne. Alakonfigureeitud CPU pikendab sünteesi aega.
  **Soovitus:** Profili CPU kasutust ja optimeeri CPU/memory suhet.
- [ ] **5.3. Fargate Spot katkestused** — Spot instansid võivad katkeda. Ühe workeri korral = kogu sünteesi pipeline peatub kuni uus instance käivitub (~2 min).
  **Soovitus:** Lisa SIGTERM handler ja kaaluda base=1 FARGATE (mitte Spot) + ülejäänud Spot.

### S3

- [x] **6.1. S3 request rate** — 5,500 GET/s, 3,500 PUT/s per prefix. Piisav.
- [ ] **6.2. S3 storage growth** — 30-päevane lifecycle. ~100KB per audiofail × 1000 sünteesi/päev = ~3GB/kuu. Lifecycle kustutab 30 päeva pärast. Max ~3GB korraga.
  **Mõju:** Madal — salvestuskulu ~$0.07/kuu. Minimaalne.

### CloudFront

- [x] **7.1. CloudFront edge caching** — frontend on CDN-is cache'tud. Pole bottleneck.

### Cognito

- [x] **8.1. Cognito Free Tier** — 50,000 MAU tasuta. Kriitilne lävend: 50,001 kasutajat/kuu = tasuline ($0.0055/MAU).
  **Mõju:** Minimaalne — isegi 100,000 kasutajat = ~$275/kuu.

## Bottleneck'ide kokkuvõte

| Komponent | Praegune max | 100 kasutajat | 1000 kasutajat | 10,000 kasutajat |
|-----------|-------------|---------------|----------------|------------------|
| API Gateway | 2 req/s | ⚠️ Throttle | ❌ Blocker | ❌ Blocker |
| Lambda | 1000 concurrent | ✅ OK | ✅ OK | ✅ OK |
| DynamoDB | ~40K RCU | ✅ OK | ✅ OK | ✅ OK |
| SQS | ~3000 msg/s | ✅ OK | ✅ OK | ✅ OK |
| Merlin Worker | ~500 synth/h | ✅ OK | ⚠️ Järjekord | ❌ Blocker |
| S3 | 5500 GET/s | ✅ OK | ✅ OK | ✅ OK |
| Cognito | 50K MAU tasuta | ✅ OK | ✅ OK | ✅ OK |

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| API Gateway | 2 | 1 | 1 |
| Lambda | 3 | 1 | 2 |
| DynamoDB | 3 | 1 | 2 |
| SQS | 3 | 3 | 0 |
| Fargate | 3 | 0 | 3 |
| S3 | 2 | 1 | 1 |
| CloudFront | 1 | 1 | 0 |
| Cognito | 1 | 1 | 0 |
| **Kokku** | **18** | **9** | **9** |

## Top-3 bottleneck'id (prioriteedijärjekorras)

1. **API Gateway throttle** (#1.1) — **blocker** >30 kasutajat. Lihtne parandada: üks rida konfiguratsioonis.
2. **Merlin Worker** (#5.1) — **bottleneck** >500 sünteesi/tunnis. Vajab auto-scaling'ut.
3. **DynamoDB item size** (#3.2) — **potentsiaalne** >200 kirjega ülesannetel. Vajab monitoorimist.
