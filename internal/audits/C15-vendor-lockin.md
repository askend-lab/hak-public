# Checklist: Vendor Lock-in / Pilve migratsiooni valmidus

**Tüüp:** Arhitektuurne kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja infrastruktuuri analüüs — AWS-spetsiifilised sõltuvused, abstraktsioonikihid, migratsiooni keerukus.

---

## AWS sõltuvuste kaart

### Asendatavad teenused (madal lock-in)

- [x] **1.1. S3 → muu objektivaramu** — S3 API on de facto standard. MinIO, GCS, Azure Blob Storage toetavad S3 ühilduvat API-t. Migreerimine on lihtne.
- [x] **1.2. SQS → muu sõnumijärjekord** — SQS kasutus on lihtne (send, receive, delete). Asendatav RabbitMQ, Redis Streams, Azure Service Bus'iga. SDK abstraktsioon on vajalik.
- [x] **1.3. CloudWatch Logs → muu logisüsteem** — logid on teksti/JSON formaadis. Asendatav ELK Stack, Grafana Loki, Datadog'iga.
- [x] **1.4. CloudFront → muu CDN** — staatiline sisu. Asendatav Cloudflare, Fastly, Azure CDN-iga.

### Raskesti asendatavad teenused (keskmine lock-in)

- [ ] **2.1. Lambda → muu serverless** — Lambda funktsioonid kasutavad AWS SDK-d (SQS, S3, DynamoDB). Koodi loogika on portable, aga handler'ite signatuurid ja kontekst on Lambda-spetsiifilised.
  **Migratsiooni maht:** Keskmine — handler'ite ümberkirjutamine (Google Cloud Functions, Azure Functions) + AWS SDK asendamine.
- [ ] **2.2. API Gateway → muu API gateway** — Serverless Framework'i konfiguratsioon on AWS-spetsiifiline. Endpointid, CORS, throttling tuleb ümber konfigureerida.
  **Migratsiooni maht:** Keskmine — alternatiiv: Express/Fastify serveri sees käitamine.
- [ ] **2.3. ECS Fargate → muu konteineriteenus** — Docker image on portable. Fargate-spetsiifilised on: task definition, service discovery, auto-scaling konfiguratsioon.
  **Migratsiooni maht:** Madal — Docker töötab kõikjal. Ainult orkestreerimise konfiguratsioon muutub.

### Kõrge lock-in teenused

- [ ] **3.1. DynamoDB → muu andmebaas** — single-table design, PK/SK muster, conditional writes, DynamoDB Streams. Pole standardne relatsiooniline mudel. Migratsioon PostgreSQL-i nõuaks andmemudeli ümberkujundamist.
  **Migratsiooni maht:** Kõrge — andmemudeli, päringute ja API kihi ümberkirjutamine. ~2–4 nädalat.
- [ ] **3.2. Cognito → muu autentimisteenus** — kasutajakontod, OAuth vood, token'id, TARA integratsioon on Cognito-spetsiifilised. Kasutajate migratsioon nõuab paroolide resetti.
  **Migratsiooni maht:** Kõrge — alternatiiv: Keycloak, Auth0, Supabase Auth. Kasutajate migratsioon on keeruline. ~1–2 nädalat.
- [ ] **3.3. Terraform + Serverless Framework → muu IaC** — kaks AWS-spetsiifilist IaC tööriista. Migratsioon teisele pilve nõuab kogu infrastruktuuri ümberdefineerimist.
  **Migratsiooni maht:** Kõrge — ~1–2 nädalat.

## Abstraktsioonikihtide analüüs

- [ ] **4.1. Puudub andmebaasi abstraktsioon** — `simplestore` kutsub DynamoDB SDK-d otse. Pole repository/adapter mustrit, mis eraldaks äriloogika andmebaasist.
  **Soovitus:** Lisa `StorageAdapter` interface: `getItem()`, `putItem()`, `query()`. Implementeeri `DynamoDBAdapter` ja tulevikus `PostgresAdapter`.
- [ ] **4.2. Puudub sõnumijärjekorra abstraktsioon** — `merlin-api` kutsub SQS SDK-d otse. Pole `QueueAdapter` interface'i.
  **Soovitus:** Lisa `QueueAdapter` interface: `sendMessage()`, `receiveMessages()`, `deleteMessage()`.
- [ ] **4.3. Puudub objektivaramu abstraktsioon** — S3 SDK kutsed on otse koodis. Pole `StorageAdapter` interface'i failide jaoks.
  **Soovitus:** Lisa `FileStorageAdapter` interface: `putFile()`, `getFile()`, `getPresignedUrl()`.
- [x] **4.4. TTS worker on Docker'is** — portable. Pole AWS-spetsiifilist koodi (v.a SQS client).
- [x] **4.5. Frontend on SPA** — React SPA töötab mis tahes staatilise hostingu peal. Pole AWS sõltuvusi.

## On-premise migratsiooni valmidus

- [ ] **5.1. Minimaalsed nõuded on dokumenteerimata** — kui riik nõuab Eesti pinnal hostimist, millised on minimaalsed nõuded? CPU, RAM, kettaruum, GPU (TTS)?
  **Soovitus:** Dokumenteeri minimaalsed nõuded: `docs/on-premise-requirements.md`.
- [ ] **5.2. Docker Compose on-premise jaoks puudub** — pole `docker-compose.prod.yml`, mis käivitaks kogu stacki: PostgreSQL, Redis, TTS worker, API server, frontend.
  **Soovitus:** Loo on-premise Docker Compose alternatiiv.
- [ ] **5.3. GPU nõue TTS-ile** — Merlin TTS nõuab tõenäoliselt GPU-d (või on väga aeglane CPU-l). On-premise GPU server on kallis.
  **Mõju:** Kõrge — GPU on on-premise migratsiooni suurim kulu.

## Lock-in score

| Komponent | AWS teenus | Lock-in tase | Migratsiooni maht |
|-----------|-----------|-------------|-------------------|
| Frontend | CloudFront + S3 | 🟢 Madal | ~1 päev |
| Audio cache | S3 | 🟢 Madal | ~1 päev |
| Sõnumijärjekord | SQS | 🟡 Keskmine | ~2–3 päeva |
| API | Lambda + API GW | 🟡 Keskmine | ~3–5 päeva |
| TTS worker | ECS Fargate | 🟢 Madal | ~1–2 päeva |
| Andmebaas | DynamoDB | 🔴 Kõrge | ~2–4 nädalat |
| Autentimine | Cognito | 🔴 Kõrge | ~1–2 nädalat |
| Logid | CloudWatch | 🟢 Madal | ~1 päev |
| IaC | Terraform + SLS | 🔴 Kõrge | ~1–2 nädalat |

**Kogu migratsiooni hinnang:** ~5–8 nädalat (1 inimene, full-time)

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Portable | ⚠️ Lock-in |
|------------|---------|------------|-----------|
| Asendatavad teenused | 4 | 4 | 0 |
| Raskesti asendatavad | 3 | 0 | 3 |
| Kõrge lock-in | 3 | 0 | 3 |
| Abstraktsioonid | 5 | 2 | 3 |
| On-premise | 3 | 0 | 3 |
| **Kokku** | **18** | **6** | **12** |

## Prioriteedid (kui migratsioon on tulevikuplaan)

1. **P1:** StorageAdapter interface — DynamoDB abstraheerimmine (#4.1)
2. **P1:** QueueAdapter interface — SQS abstraheerimmine (#4.2)
3. **P2:** On-premise nõuete dokumenteerimine (#5.1)
4. **P2:** Docker Compose alternatiiv (#5.2)
5. **P3:** FileStorageAdapter — S3 abstraheerimmine (#4.3)
