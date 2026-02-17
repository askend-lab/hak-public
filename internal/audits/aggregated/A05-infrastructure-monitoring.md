# Agregeeritud leiud: Infrastruktuur ja monitooring

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. CloudWatch Alarms + SNS teavitused puuduvad

**Viited: 9 kirjet** — #11, #16, #20, C05, C06, C08, C10, C13, C22

Pole ühtegi alarmi. Lambda vead, DynamoDB throttle, SQS DLQ sõnumid, Fargate crashid — kõik jäävad märkamata.

- [ ] Lambda Error alarm (>5 viga/5min)
- [ ] SQS DLQ alarm (>0 sõnumit)
- [ ] DynamoDB throttle alarm
- [ ] ECS task failure alarm
- [ ] SNS teema + e-maili teavitused

**Hinnang:** 1 päev | **Prioriteet:** P0

---

## 2. Struktureeritud JSON logimine puudub

**Viited: 7 kirjet** — #11, #20, C06, C08, C10, C22, C24

Logid on lihtne tekst (`logger.info`). Pole JSON formaati, pole `requestId`, `userId`, `duration` välju. Logide analüüs on raske.

- [ ] JSON logimine: `{ timestamp, level, message, requestId, userId, duration }`
- [ ] CloudWatch Insights päringud

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 3. Distributed tracing puudub

**Viited: 5 kirjet** — #11, #20, C06, C08, C22

Pole X-Ray'd ega muud tracing'ut. Sünteesi pipeline (API → SQS → Worker → S3) pole otsast-otsani jälgitav.

- [ ] AWS X-Ray Lambda funktsioonidele
- [ ] Correlation ID SQS sõnumites

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 4. AWS Budget Alerts puuduvad

**Viited: 6 kirjet** — #11, C03, C05, C13, C16, C22

Pole kuluhoiatusi. Ootamatu kulukasv jääb märkamata kuni kuu lõpu arveni.

- [ ] AWS Budget: hoiatus €50/kuu ja €100/kuu
- [ ] Cost Anomaly Detection

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 5. Merlin worker auto-scaling puudub

**Viited: 7 kirjet** — #3, #11, #17, #20, C08, C09, C22

Min/max capacity = 1. Worker ei skaleeru SQS järjekorra sügavuse põhjal. Kõrge koormus → pikk ooteaeg.

- [ ] SQS-põhine auto-scaling: 0→1→N (ApproximateNumberOfMessagesVisible)
- [ ] Dev: 0, Prod idle: 0, Prod queue>0: 1–5

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 6. CloudTrail pole lubatud

**Viited: 4 kirjet** — #11, C06, C10, C22

Pole AWS-i turvaaradit. Kes muutis infrastruktuuri? Kes kusttas S3 bucket'i? Pole jälgitav.

- [ ] CloudTrail lubamine (management events)
- [ ] S3 bucket logide jaoks

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 7. CloudWatch dashboard on puudulik

**Viited: 4 kirjet** — #11, C06, C08, C22

Dashboard eksisteerib (CloudFront metrics), aga puuduvad: Lambda metrics, DynamoDB metrics, SQS metrics, Error rates.

- [ ] Lisa Lambda: Invocations, Errors, Duration, Throttles
- [ ] Lisa DynamoDB: Read/WriteCapacity, ThrottleEvents
- [ ] Lisa SQS: visible, in-flight, DLQ

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 8. Terraform CI (plan/apply) puudub

**Viited: 5 kirjet** — #11, C10, C20, C22, C25

Terraform muudatused tehakse käsitsi. Pole PR-i `terraform plan` kommentaari ega automaatset `apply`.

- [ ] GitHub Actions: `terraform plan` PR kommentaariks
- [ ] `terraform apply` pärast merge'i (manual approval)

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 9. Rollback protseduur puudub

**Viited: 4 kirjet** — #11, C05, C20, C22

Kui deploy ebaõnnestub, pole dokumenteeritud rollback protsessi.

- [ ] Serverless rollback protseduur
- [ ] Terraform state rollback
- [ ] Frontend S3 rollback (previous version)

**Hinnang:** 1 päev (dokumentatsioon) | **Prioriteet:** P1

---

## 10. Staging keskkond puudub

**Viited: 4 kirjet** — #11, #16, C20, C22

Ainult dev → prod. Pole staging keskkonda enne prod deploy'd.

- [ ] Staging keskkond (valikuline, kuluefektiivne)

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 11. Branch protection pole auditeeritud

**Viited: 3 kirjet** — C10, C20, C25

Kas `main` branch on kaitstud: required reviews, required status checks, no force push?

- [ ] Kontrolli ja dokumenteeri branch protection reeglid

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | CloudWatch Alarms | 9 | P0 |
| 2 | Struktureeritud JSON logimine | 7 | P1 |
| 3 | Distributed tracing | 5 | P2 |
| 4 | AWS Budget Alerts | 6 | P0 |
| 5 | Worker auto-scaling | 7 | P1 |
| 6 | CloudTrail | 4 | P1 |
| 7 | CloudWatch dashboard | 4 | P1 |
| 8 | Terraform CI | 5 | P1 |
| 9 | Rollback protseduur | 4 | P1 |
| 10 | Staging keskkond | 4 | P2 |
| 11 | Branch protection | 3 | P1 |
| **Kokku** | **11 unikaalset leidu** | **58 originaalkirjet** | |
