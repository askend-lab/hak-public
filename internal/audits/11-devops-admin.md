# Audit: DevOps / IT-administraator

**Vaatenurk:** DevOps insener, kes haldab platvormi: deploy, monitooring, skaleeritavus, logid, intsidentide haldamine.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja infrastruktuuri analüüs — CI/CD, Terraform, Docker, logid, monitooring, taastamine.

---

## Kasutajaprofiil

Andres, 35-aastane, DevOps insener EKI IT-osakonnas. Vastutab Hääldusabilise infrastruktuuri eest. Haldab AWS kontot, GitHub Actions pipeline'e, Terraform konfiguratsiooni. Peab tagama 99.5% uptime'i tööpäevadel.

---

## DevOps teekond

### Etapp 1: CI/CD pipeline

- [x] **1.1. GitHub Actions on kasutusel** — CI/CD toimub GitHub Actions'i kaudu. Pipeline'd on defineeritud `.github/workflows/` kataloogis.

- [x] **1.2. Pre-commit hookid on paigas** — `git commit` käivitab hookid, mis kontrollivad koodi kvaliteeti enne commitimist. Teated "✅ All hooks passed" kinnitavad.

- [ ] **1.3. CI/CD parandused on dokumenteeritud, aga osad on pooleli** — `CI-CD-Improvements.md` loetleb prioriteetseid parandusi P0–P5. Mõned on tehtud, mõned ootavad. DevOps peab jälgima nimekirja.
  **Mõju:** Keskmine — dokumenteeritud, aga vajab süstemaatilist jälgimist.

- [ ] **1.4. Build reprodutseeritavus pole tagatud** — `package.json` kasutab `^` versiooninumbreid sõltuvustele. Ilma `package-lock.json` / `pnpm-lock.yaml` lukustamiseta võivad erinevad buildid saada erinevaid sõltuvusversioone.
  **Mõju:** Keskmine — lukufail peaks olema versioneeritud ja CI peaks kasutama `--frozen-lockfile` lippu.

### Etapp 2: Infrastruktuur (AWS)

- [x] **2.1. Terraform on kasutusel** — infrastruktuur on defineeritud koodina (IaC). Muudatusi saab jälgida ja taastada.

- [x] **2.2. Serverless arhitektuur** — Lambda funktsioonid, API Gateway, DynamoDB, S3. Madal halduskoormus, automaatne skaleerimine.

- [ ] **2.3. Puudub multi-region setup** — tõenäoliselt üks AWS regioon. Kui regioon on maas, on kogu platvorm maas. Ei ole disaster recovery plaani.
  **Mõju:** Madal — MVP jaoks on üks regioon piisav. Kuid riigiasutuse platvormile peaks olema vähemalt DR plaan.

- [ ] **2.4. Fargate Spot katkestused** — `merlin-worker` töötab Fargate'l. Kui kasutatakse Spot instanse, võivad need katkeda. Worker'i `worker.py` püüab ainult `KeyboardInterrupt`, puudub `SIGTERM` käsitlus. Katkestus võib tekitada sõnumite topelttöötlemist.
  **Mõju:** Kõrge — eelnev audit tuvastas selle probleemi. SIGTERM handler on hädavajalik Fargate Spot kasutamisel.

- [ ] **2.5. Vabamorf protsessi automaatne taaskäivitamine puudub** — `vmetajson.ts` protsess ei taaskäivitu automaatselt crashimisel. Kui Vabamorf protsess katkeb, jäävad järjekorras olevad päringud ootele kuni ajalõpuni.
  **Mõju:** Kõrge — eelnev audit tuvastas selle probleemi. Automaatne taaskäivitamine on hädavajalik.

### Etapp 3: Monitooring ja logid

- [x] **3.1. Sentry on konfigureeritud** — frontend saadab vead Sentry'sse (`ErrorBoundary` ja `main.tsx`). DevOps saab reaalajas vigade teated.

- [ ] **3.2. Frontend logid pole struktureeritud** — `logger.error()` ja `logger.warn()` kasutavad konsoolilogi. Pole struktureeritud logimist (JSON format), pole korrelatsioonide ID-d, pole kasutaja konteksti.
  **Mõju:** Madal — frontend logid on peamiselt arendajatele. Sentry püüab kriitilised vead.

- [ ] **3.3. Puudub kasutajakogemuse monitooring (RUM)** — pole Real User Monitoring'ut: lehe laadimisaeg, API latentsus kasutaja perspektiivist, Core Web Vitals. Ainult serveri poolsed logid.
  **Mõju:** Keskmine — Sentry Performance on alternatiiv, aga pole konfigureeritud.

- [ ] **3.4. Puudub uptime monitooring** — pole selge, kas on kasutuses UptimeRobot, AWS CloudWatch Synthetics või muu sünteetiline monitooring, mis tuvastaks platvormi katkestuse enne kasutajaid.
  **Mõju:** Keskmine — riigiasutuse platvormil peaks olema automaatne katkestuse tuvastamine.

### Etapp 4: Turvalisus (DevOps perspektiivist)

- [x] **4.1. HTTPS on tagatud** — CloudFront serveerib ainult HTTPS-i kaudu. TLS sertifikaadid on AWS Certificate Manager'i hallata.

- [ ] **4.2. Secrets management** — Cognito seaded on keskkonnamuutujates. Pole selge, kas kasutatakse AWS Secrets Manager'it või Parameter Store'i. Hardcode'itud salajased puuduvad koodis (hea), aga haldus vajab kontrollimist.
  **Mõju:** Madal — standardne AWS praktika, aga peaks olema dokumenteeritud.

- [ ] **4.3. CloudTrail ja GuardDuty** — `INFRA_AUDIT_PLAN.md` mainib CloudTrail'i ja GuardDuty lubamist faas 3 tegevusena. Pole selge, kas need on juba lubatud.
  **Mõju:** Keskmine — AWS turvalogi on oluline intsidentide uurimiseks. Peaks olema faas 3 prioriteet.

- [ ] **4.4. Puudub WAF (Web Application Firewall)** — API Gateway ees pole AWS WAF-i. Pole IP-põhist blokeerimist, pole SQL injection / XSS filtrit API tasemel.
  **Mõju:** Keskmine — WAF oleks lisakaitsekiht, eriti avaliku API jaoks.

### Etapp 5: Skaleerimine ja jõudlus

- [x] **5.1. Lambda automaatne skaleerimine** — Lambda funktsioonid skaleeruvad automaatselt nõudluse järgi. Pole vaja hallata servereid.

- [x] **5.2. S3 audio cache** — sünteesitud audio salvestatakse S3-sse. Korduvad päringud teenindatakse cache'st. Vähendab TTS-i koormust.

- [ ] **5.3. DynamoDB läbilaskevõime pole teada** — pole selge, kas DynamoDB tabelid kasutavad on-demand või provisioned capacity'd. Äkiline koormuse kasv (nt 800 kooli algab samal ajal) võib ületada provisioned capacity piiri.
  **Mõju:** Madal — on-demand DynamoDB skaleerub automaatselt. Aga peaks olema dokumenteeritud.

- [ ] **5.4. TTS worker'i skaleerimine** — `merlin-worker` on Fargate task. Pole selge, kas on auto-scaling: kui SQS järjekord kasvab, kas käivitatakse lisatöötajaid?
  **Mõju:** Keskmine — suure koormuse ajal (koolipäeva algus) võib TTS-i järjekord kasvada ja kasutajad ootavad kaua.

### Etapp 6: Taastamine ja varukoopiad

- [ ] **6.1. DynamoDB varukoopiate poliitika pole teada** — kas on Point-in-Time Recovery (PITR) lubatud? Kui andmed kustuvad, saab neid taastada?
  **Mõju:** Keskmine — kasutajaandmete (ülesanded) kaotamine oleks tõsine probleem.

- [ ] **6.2. S3 versioonimine** — kas audiofailide S3 bucket'il on versioonimine lubatud? Kui fail rikutakse, saab taastada eelmise versiooni?
  **Mõju:** Madal — audiofailid on taasloodavad (sünteesitavad uuesti), seega kadu pole kriitiline.

- [ ] **6.3. Puudub dokumenteeritud DR (Disaster Recovery) plaan** — pole selge, mis juhtub, kui: AWS regioon on maas, DynamoDB tabel kustub, S3 bucket kustub, Cognito pool rikutakse. Pole taastamise protseduuri.
  **Mõju:** Keskmine — riigiasutuse platvormil peaks olema vähemalt dokumenteeritud DR plaan.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| CI/CD | 4 | 2 | 2 |
| AWS infrastruktuur | 5 | 2 | 3 |
| Monitooring | 4 | 1 | 3 |
| Turvalisus | 4 | 1 | 3 |
| Skaleerimine | 4 | 2 | 2 |
| Taastamine | 3 | 0 | 3 |
| **Kokku** | **24** | **8** | **16** |

## Top-5 probleemid (mõju DevOps'ile)

1. **Fargate Spot SIGTERM puudub** (#2.4) — sõnumite topelttöötlemine katkestuse korral
2. **Vabamorf automaatne taaskäivitamine puudub** (#2.5) — protsessi crash jätab päringud ootele
3. **Puudub DR plaan** (#6.3) — riigiasutuse platvormil kohustuslik
4. **Puudub uptime monitooring** (#3.4) — katkestuste tuvastamine on manuaalne
5. **Puudub WAF** (#4.4) — API-l puudub veebirakenduse tulemüür

## Mis on hästi tehtud

- Terraform IaC — infrastruktuur on koodis versioonitud
- Serverless arhitektuur — madal halduskoormus
- Sentry monitooring — vead tuvastatakse reaalajas
- S3 audio cache — vähendab TTS koormust
- Lambda automaatne skaleerimine
- HTTPS CloudFront'i kaudu
- Pre-commit hookid koodi kvaliteedile
