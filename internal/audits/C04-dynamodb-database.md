# Checklist: DynamoDB / Andmebaasi arhitektuur

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja Terraform analüüs — tabelistruktuur, võtmekujundus, pääsumustrid, skaleeritavus.

---

## Tabelistruktuur

- [x] **1.1. Single-table design** — üks DynamoDB tabel (`simplestore-{stage}`) koos `PK` (partition key) ja `SK` (sort key). Standardne single-table design muster.
- [x] **1.2. On-demand billing** — `BillingMode: PAY_PER_REQUEST`. Pole üleprovisioned capacity'd. Automaatne skaleerimine.
- [x] **1.3. TTL on konfigureeritud** — `ttl` atribuut. Aegunud kirjed kustutatakse automaatselt. Vähendab salvestuskulu.
- [x] **1.4. PITR on lubatud** — `PointInTimeRecoveryEnabled: true`. Andmeid saab taastada mis tahes ajahetke seisuga (viimased 35 päeva).

## Võtmekujundus (Key Design)

- [x] **2.1. PK/SK kompositsioon** — kasutaja ülesanded: `PK = USER#{userId}`, `SK = TASK#{taskId}`. Ülesande kirjed: `PK = TASK#{taskId}`, `SK = ENTRY#{entryId}`. Selge ja efektiivne.
- [ ] **2.2. Hot partition risk** — kui üks kasutaja loob väga palju ülesandeid, koonduvad kõik tema kirjed ühte partitsiooni (`USER#{userId}`). On-demand DynamoDB käsitleb seda automaatselt (adaptive capacity), aga äärmuslikul juhul võib tekkida throttling.
  **Mõju:** Madal — MVP tasemel pole probleem. 10,000+ kirjet ühe partitsiooni all võib tekitada probleeme.
- [ ] **2.3. Puudub GSI (Global Secondary Index)** — pole sekundaarseid indekseid. Praegu pole vaja (ainult PK/SK päringud). Aga tulevikus: "Leia kõik jagatud ülesanded" või "Leia ülesanded kuupäeva järgi" nõuaks GSI-d.
  **Soovitus:** Planeeri GSI vajadus ette: `GSI1PK = SHARED`, `GSI1SK = createdAt` jagatud ülesannete jaoks.
- [x] **2.4. Sort key võimaldab range päringuid** — `SK = TASK#{taskId}` võimaldab: `begins_with(SK, 'TASK#')` kõigi ülesannete leidmiseks.

## Andmemudel

- [x] **3.1. Ülesande (Task) mudel on selge** — `id`, `userId`, `name`, `description`, `entries[]`, `createdAt`, `updatedAt`. Kompaktne ja funktsionaalne.
- [x] **3.2. Kirje (Entry) mudel on selge** — `text`, `stressedText`, `audioUrl`. Minimaalsed väljad.
- [ ] **3.3. Puudub versioonihaldamine** — pole `version` atribuuti optimistlikuks lukustamiseks. Kui kaks sessiooni muudavad sama ülesannet samaaegselt, viimane kirjutab üle.
  **Soovitus:** Lisa `version` atribuut ja kasuta DynamoDB conditional write'e (`ConditionExpression: 'version = :expectedVersion'`).
- [ ] **3.4. Puudub soft delete** — kustutamine on füüsiline (`DeleteItem`). Pole `deletedAt` atribuuti ega prügikasti funktsiooni. Kogemata kustutatud andmed on kadunud (v.a PITR taastamine).
  **Soovitus:** Kaaluda soft delete'i: `deletedAt` timestamp + TTL 30 päeva pärast.
- [ ] **3.5. Jagamise token salvestatakse ülesandega** — jagamise token on ülesande atribuut. Pole eraldi jagamiste tabelit. Tähendab: ülesande kustutamine kustutab ka jagamislingi. Jagamislingi tühistamiseks tuleb ülesannet muuta.
  **Mõju:** Madal — lihtne mudel, mis töötab. Eraldi jagamiste tabel oleks keerukam, aga paindlikum.

## Pääsumustrid (Access Patterns)

- [x] **4.1. Kasutaja ülesannete nimekiri** — `Query(PK = 'USER#{userId}', begins_with(SK, 'TASK#'))`. Efektiivne ühe partitsiooni päring.
- [x] **4.2. Üksiku ülesande lugemine** — `GetItem(PK = 'TASK#{taskId}', SK = 'META')`. O(1) päring.
- [ ] **4.3. Puudub pagineerimise tugi** — `getUserTasks` laeb kõik kasutaja ülesanded korraga. DynamoDB tagastab max 1MB tulemust. 100+ ülesandega kasutajal võib olla >1MB andmeid.
  **Soovitus:** Lisa pagineerimise tugi: `Limit` + `ExclusiveStartKey` DynamoDB päringutes.
- [ ] **4.4. Puudub sortimise paindlikkus** — ülesanded sorteeritakse SK järgi (loomise järjekord). Pole võimalik sorteerida nime, muutmise kuupäeva või suuruse järgi ilma GSI-ta.
  **Soovitus:** Lisa `GSI1SK = updatedAt` sortimiseks muutmise kuupäeva järgi.
- [ ] **4.5. Jagatud ülesande päring** — `GetItem(PK = 'SHARED#{shareToken}')` või sarnane. Efektiivne, aga vajab eraldi indeksit, kui token pole PK-s.
  **Mõju:** Madal — praegune implementatsioon töötab.

## Turvalisus

- [x] **5.1. IAM polisid on piiravad** — Lambda funktsioonidel on minimaalsed õigused: ainult vajalikud DynamoDB toimingud.
- [ ] **5.2. Puudub andmete krüpteerimine** — DynamoDB vaikimisi krüpteerib andmed (AWS managed key). Aga pole Customer Managed Key (CMK). Riigiasutuse andmete jaoks võib CMK olla nõutav.
  **Soovitus:** Kaaluda CMK kasutamist, kui ISKE/E-ITS nõuab.
- [x] **5.3. Cognito authorizer** — API Gateway kasutab Cognito authorizer'it. Ainult autenditud kasutajad saavad andmeid lugeda/muuta.

## Migratsioon ja haldamine

- [ ] **6.1. Puudub migratsiooniraamistik** — pole DynamoDB skeemi muudatuste haldamist. Kui atribuut muutub, peab käsitsi migreerima.
  **Soovitus:** Loo migratsiooni skriptide kataloog (`migrations/`) ja dokumenteeri skeemi ajalugu.
- [ ] **6.2. Puudub andmete valideerimise kiht** — DynamoDB ei valideeri andmeid (skemaless). Kui frontend saadab vale formaadi, salvestatakse see otse. Pole valideerimist backend'is enne kirjutamist.
  **Soovitus:** Lisa Zod/joi valideerimise kiht simplestore API-sse.
- [x] **6.3. Terraform haldab infrastruktuuri** — DynamoDB tabel on Terraform'is defineeritud. Muudatused on versioonitud.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Tabelistruktuur | 4 | 4 | 0 |
| Võtmekujundus | 4 | 2 | 2 |
| Andmemudel | 5 | 2 | 3 |
| Pääsumustrid | 5 | 2 | 3 |
| Turvalisus | 3 | 2 | 1 |
| Migratsioon | 3 | 1 | 2 |
| **Kokku** | **24** | **13** | **11** |

## Prioriteedid

1. **P1:** Pagineerimise tugi — vajalik skaleerimiseks (#4.3)
2. **P1:** Andmete valideerimise kiht — kaitseb andmete terviklikkust (#6.2)
3. **P2:** Versioonimine (optimistlik lukustamine) — kaitseb samaaegsuse eest (#3.3)
4. **P2:** GSI planeerimne — sortimise ja otsingu jaoks (#2.3, #4.4)
5. **P3:** Soft delete — kogemata kustutamise kaitse (#3.4)
