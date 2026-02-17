# Checklist: Disaster Recovery / Talitluspidevus

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Terraform, serverless ja infrastruktuuri konfiguratsioonide analüüs.

---

## Varukoopiad ja taastamine

- [x] **1.1. DynamoDB PITR lubatud** — `PointInTimeRecoveryEnabled: true`. Andmeid saab taastada mis tahes ajahetke seisuga (viimased 35 päeva).
- [ ] **1.2. Puudub DynamoDB regulaarne eksport** — pole S3-põhist perioodilist eksporti (DynamoDB Export to S3). PITR katab ainult 35 päeva.
  **Soovitus:** Lisa iganädalane DynamoDB eksport S3-sse pikaajaliseks säilitamiseks.
- [x] **1.3. S3 audio lifecycle** — 30-päevane aegumisreegel audio cache'le. Audio on taasloodav (sünteesitav uuesti).
- [ ] **1.4. Puudub S3 versioonimine** — audiofailide bucket'il pole versioneerimist. Kui fail rikutakse, pole eelmist versiooni.
  **Mõju:** Madal — audio on taasloodav. Aga Terraform state'i S3 bucket peaks olema versioneeritud.
- [ ] **1.5. Cognito backup puudub** — Cognito User Pool'i andmeid (kasutajate kontod) ei saa standardselt eksportida. Kui pool kustub, kaovad kõik kasutajate kontod.
  **Soovitus:** Dokumenteeri Cognito taastamise protseduur. Kaaluda perioodilist kasutajate nimekirja eksporti.
- [ ] **1.6. Terraform state backup** — kas Terraform state on S3-s koos versioneerimise ja DynamoDB lukuga? Kui state kaob, pole infrastruktuuri haldamine võimalik.
  **Soovitus:** Kontrolli, et Terraform backend S3 bucket on versioneeritud ja lukuga kaitstud.

## Stsenaariumi analüüs

### Stsenaarium A: AWS regioon (eu-west-1) on maas

- [ ] **2.1. Pole multi-region setup'i** — kogu infrastruktuur on ühes regioonis. Regiooni katkestus = täielik katkestus.
  **RTO:** Teadmata (tundid kuni päevad, sõltuvalt AWS-ist)
  **RPO:** 35 päeva (PITR)
  **Soovitus:** Dokumenteeri aktsepteeritud risk. MVP jaoks on üks regioon piisav.

### Stsenaarium B: DynamoDB tabel kustub

- [x] **2.2. PITR taastamine** — taastamine uueks tabeliks: ~minutid kuni tund, sõltuvalt andmemahust.
- [ ] **2.3. Puudub taastamise protseduur** — pole dokumenteeritud samm-sammult juhendit: kuidas taastada tabel, kuidas suunata teenus uuele tabelile, kuidas kontrollida andmete terviklikkust.
  **Soovitus:** Loo runbook: "DynamoDB taastamine PITR-ist".

### Stsenaarium C: S3 bucket kustub

- [ ] **2.4. Audio bucket ei ole kriitiline** — audio on taasloodav (sünteesitav uuesti). Cache kaotamine tähendab ajutist jõudluse langust, mitte andmete kaotust.
  **Mõju:** Madal — taastamine: loo uus bucket, kasutajad sünteesivad uuesti.
- [ ] **2.5. Frontend bucket kaotamine** — kui CloudFront origin S3 bucket kustub, pole veebileht saadaval. Taastamine: re-deploy frontend'i.
  **RTO:** ~10 minutit (CI/CD pipeline re-deploy)

### Stsenaarium D: Cognito User Pool rikutakse

- [ ] **2.6. Cognito taastamine on keeruline** — Cognito User Pool'i ei saa otse taastada. Kasutajad peavad uuesti registreeruma või kasutama "unustatud parool" voogu.
  **RTO:** Tundid (uue pooli loomine + kasutajate migratsioon)
  **Soovitus:** Dokumenteeri Cognito taastamise protseduur.

### Stsenaarium E: Merlin worker crashib

- [x] **2.7. ECS taaskäivitab automaatselt** — Fargate taaskäivitab crashinud konteinerid. SQS sõnumid on alles ja töödeldakse pärast taaskäivitust.
- [x] **2.8. DLQ püüab ebaõnnestunud sõnumid** — `maxReceiveCount: 3` + DLQ 14-päevase retentsiooniga. Andmed ei kao.

### Stsenaarium F: API Gateway / Lambda ebaõnnestumine

- [x] **2.9. Lambda automaatne taaskäivitus** — Lambda funktsioonid taaskäivituvad automaatselt. Pole stateful'i — iga päring on iseseisev.

## Intsidentide haldamine

- [ ] **3.1. Puudub runbook** — pole dokumenteeritud protseduure: "Mida teha, kui teenus on maas?", "Kuidas taastada andmeid?", "Keda teavitada?"
  **Soovitus:** Loo `internal/runbooks/` kataloog koos põhiliste protseduuridega.
- [ ] **3.2. Puudub on-call protsess** — pole selge, kes vastutab intsidentide eest: öösiti, nädalavahetusel, pühade ajal.
  **Soovitus:** Dokumenteeri on-call rotatsioon ja eskalatsiooni protseduur.
- [ ] **3.3. Puudub statusleht** — pole `status.haaldusabiline.ee` tüüpi lehte, mis teavitaks kasutajaid katkestustest.
  **Soovitus:** Kaaluda Atlassian Statuspage, Cachet või staatilist S3 statuslehte.
- [x] **3.4. Sentry teavitab vigadest** — arendajad saavad reaalajas veateateid. Proaktiivne monitooring.
- [ ] **3.5. Puudub CloudWatch Alarm → SNS teavitus** — pole alarmid, mis teavitaksid e-posti/Slack'i kaudu: Lambda vead >5%, DynamoDB throttling, SQS DLQ sõnumid >0.
  **Soovitus:** Lisa CloudWatch Alarms + SNS topic + e-posti teavitused.

## RTO/RPO kokkuvõte

| Komponent | RTO (taastamise aeg) | RPO (andmekadu) |
|-----------|----------------------|------------------|
| Frontend (S3+CloudFront) | ~10 min (re-deploy) | 0 (kood Git'is) |
| API (Lambda) | Automaatne (~sekundid) | 0 (stateless) |
| Andmebaas (DynamoDB) | ~1 tund (PITR) | Viimased 35 päeva |
| Audio (S3) | ~10 min (re-deploy) | Taasloodav |
| Kasutajakontod (Cognito) | Tundid | Keeruline taastamine |
| TTS worker (Fargate) | ~2 min (auto-restart) | 0 (SQS säilitab) |

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Varukoopiad | 6 | 2 | 4 |
| Stsenaariumid | 9 | 4 | 5 |
| Intsidentide haldamine | 5 | 1 | 4 |
| **Kokku** | **20** | **7** | **13** |

## Prioriteedid

1. **P0:** CloudWatch Alarms + teavitused — probleemide tuvastamine (#3.5)
2. **P1:** Runbook'ide loomine — intsidentide haldamine (#3.1)
3. **P1:** Cognito backup protseduur — kasutajakontode kaitse (#1.5)
4. **P2:** DynamoDB regulaarne eksport — pikaajaline backup (#1.2)
5. **P2:** Statusleht — kasutajate teavitamine (#3.3)
