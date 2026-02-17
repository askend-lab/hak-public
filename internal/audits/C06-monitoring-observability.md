# Checklist: Monitooring / Jälgitavus (Observability)

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja Terraform analüüs — logid, mõõdikud, alarmid, dashboardid, jälgimine.

---

## Logid (Logging)

- [x] **1.1. CloudWatch Logs on konfigureeritud** — Lambda ja ECS logid lähevad CloudWatch'i. Retentsioon: 90 päeva (`retention_in_days = 90`).
- [x] **1.2. Sentry frontend vigade jaoks** — `Sentry.init()` on konfigureeritud. Vigade reaalajas jälgimine. Ainult nõusolekul (`hasTrackingConsent()`).
- [ ] **1.3. Logid pole struktureeritud** — Lambda funktsioonid kasutavad `console.log` / `logger.info` teksti. Pole JSON-struktureeritud logimist. CloudWatch Insights päringud on keerulisemad.
  **Soovitus:** Kasuta JSON logimist: `{ "level": "info", "message": "...", "requestId": "...", "duration": 123 }`.
- [ ] **1.4. Puudub korrelatsioonide ID** — päringuid ei saa jälgida üle teenuste (frontend → API Gateway → Lambda → SQS → Worker). Pole `X-Request-ID` ega `traceId` päist.
  **Soovitus:** Lisa `requestId` igale API päringule ja edasta see SQS sõnumiga Worker'ile.
- [ ] **1.5. Puudub audit log** — pole eraldi turvalogi: kes lõi/kustutas/muutis ülesandeid, kes logis sisse/välja, kes jagas ülesandeid. ISKE/GDPR nõuavad turvalogi.
  **Soovitus:** Lisa DynamoDB Streams + Lambda, mis salvestab muudatuste ajaloo eraldi tabelisse.
- [x] **1.6. Veadiagnostika tekstikatke logimine** — kuni 50 märki kasutaja tekstist logitakse veaotsingu eesmärgil. Privaatsuspoliitikas mainitud.
- [ ] **1.7. Frontend logid pole serverisse saadetud** — `logger.error()` ja `logger.warn()` kasutavad ainult brauseri konsooli. Ainult Sentry püüab kriitilised vead. Hoiatused ja infoteated kaovad.
  **Mõju:** Madal — Sentry on piisav kriitiliste vigade jaoks.

## Mõõdikud (Metrics)

- [x] **2.1. CloudWatch Dashboard on olemas** — `cloudwatch-dashboard.tf` defineerib dashboardi: Lambda Invocations, Errors, Duration, DynamoDB Read/Write, ECS CPU/Memory, SQS Queue Depth, CloudFront Requests/Bytes/Errors.
- [x] **2.2. Container Insights on lubatud** — `containerInsights = "enabled"` ECS klastril. Detailsed Fargate mõõdikud.
- [ ] **2.3. Puuduvad kohandatud mõõdikud** — ainult AWS standardmõõdikud. Pole äriloogilistemõõdikuid: sünteesipäringute arv, keskmine süteesi aeg, cache hit rate, unikaalsete kasutajate arv.
  **Soovitus:** Lisa CloudWatch Custom Metrics Lambda funktsioonidesse: `putMetricData({ MetricName: 'SynthesisRequests', Value: 1 })`.
- [ ] **2.4. Puudub Real User Monitoring (RUM)** — pole kasutaja perspektiivist jõudlusmõõdikuid: lehe laadimisaeg, API latentsus, Core Web Vitals (LCP, FID, CLS).
  **Soovitus:** Lisa Sentry Performance Monitoring või AWS CloudWatch RUM.
- [ ] **2.5. Puudub SLI/SLO definitsioon** — pole defineeritud teenustaseme indikaatoreid: "99% sünteesipäringuid valmib <5s", "API saadavus >99.5%". Pole eesmärke, mille vastu mõõta.
  **Soovitus:** Defineeri SLI-d ja SLO-d ning lisa nende jälgimine dashboardi.

## Alarmid (Alerting)

- [ ] **3.1. Puuduvad CloudWatch Alarmid** — pole konfigureeritud ühtegi alarmi. Lambda vead, DynamoDB throttling, SQS DLQ — kõik jäävad märkamata kuni keegi dashboardi vaatab.
  **Soovitus:** Lisa Terraform'iga:
  - Lambda Errors >5 (5 min perioodis) → SNS → e-post/Slack
  - DynamoDB UserErrors >0 → SNS
  - SQS DLQ ApproximateNumberOfMessagesVisible >0 → SNS
  - ECS RunningTaskCount <1 (prod) → SNS
- [ ] **3.2. Puudub SNS Topic teavitusteks** — pole SNS topic'ut alarmide teavituste jaoks. Pole e-posti ega Slack'i integratsitooni.
  **Soovitus:** Loo `aws_sns_topic` + `aws_sns_topic_subscription` (e-post + Slack webhook).
- [ ] **3.3. Puudub Sentry alarmide konfiguratsioon** — kas Sentry saadab teavitusi e-posti/Slack'i kaudu? Vaikimisi saadab, aga peaks olema konfigureeritud: millised vead on kriitilised, millised on ignoreeritud.
  **Soovitus:** Konfigureeri Sentry alarmid: kriitilised vead → Slack, korduvad vead → iganädalane kokkuvõte.
- [x] **3.4. API Gateway throttling on konfigureeritud** — `rateLimit: 2`, `burstLimit: 4`. Kaitseb ülekoormuse eest. Aga kasutajat ei teavitata throttling'ust.

## Jälgimine (Tracing)

- [ ] **4.1. Puudub distributed tracing** — pole AWS X-Ray, Jaeger ega muud jälgimissüsteemi. Ei saa jälgida päringu teekonda: API Gateway → Lambda → SQS → Worker → S3.
  **Soovitus:** Lisa AWS X-Ray Lambda funktsioonidesse. Serverless Framework toetab: `tracing: { lambda: true, apiGateway: true }`.
- [ ] **4.2. Puudub sünteesi pipeline jälgimine** — kui kasutaja ootab heli kaua, pole viisi tuvastada, kus pipeline'is viivitus tekkis: Lambda aeglane? SQS järjekorras ootamine? Worker'i töötlemine aeglane?
  **Soovitus:** Lisa timestampid igale pipeline'i sammule ja logi need.

## Dashboardid ja aruandlus

- [x] **5.1. CloudWatch Dashboard on põhjalik** — 5 rida mõõdikuid: Lambda, DynamoDB, ECS, SQS, CloudFront. Hea ülevaade.
- [ ] **5.2. Puudub äriloogika dashboard** — pole dashboardi ärimõõdikutega: päevaseid/nädala kasutajaid, populaarseid funktsioone, vigade trende, sünteesi mahtusid.
  **Soovitus:** Lisa eraldi "Business Metrics" dashboard.
- [ ] **5.3. Puudub automaatne iganädalane aruanne** — pole iganädalast kokkuvõtet: kasutus, vead, jõudlus, kulud. Meeskond peab ise dashboardi vaatama.
  **Soovitus:** Lisa SNS + Lambda, mis genereerib iganädalase aruande.
- [ ] **5.4. Puudub anomaaliate tuvastamine** — pole CloudWatch Anomaly Detection'it. Ebaharilikud mustrid (nt ootamatu koormuse kasv) jäävad märkamata.
  **Soovitus:** Lisa CloudWatch Anomaly Detection kriitiliste mõõdikute jaoks.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Logid | 7 | 3 | 4 |
| Mõõdikud | 5 | 2 | 3 |
| Alarmid | 4 | 1 | 3 |
| Jälgimine | 2 | 0 | 2 |
| Dashboardid | 4 | 1 | 3 |
| **Kokku** | **22** | **7** | **15** |

## Prioriteedid

1. **P0:** CloudWatch Alarmid + SNS teavitused — probleemide tuvastamine (#3.1, #3.2)
2. **P1:** Struktureeritud JSON logimine — logide analüüs (#1.3)
3. **P1:** Korrelatsioonide ID — päringute jälgimine üle teenuste (#1.4)
4. **P2:** AWS X-Ray distributed tracing — pipeline'i jälgimine (#4.1)
5. **P2:** Kohandatud ärimõõdikud — kasutusanalüütika (#2.3)
