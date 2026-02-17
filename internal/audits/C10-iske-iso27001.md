# Checklist: ISKE / ISO 27001 / E-ITS vastavus

**Tüüp:** Infoturbe vastavuse kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi ja infrastruktuuri analüüs — ISKE/E-ITS nõuded, ISO 27001 kontrollid, andmete klassifitseerimine.

---

## Andmete klassifitseerimine (ISKE turvaklass)

- [ ] **1.1. Puudub andmete klassifitseerimine** — ISKE nõuab andmete klassifitseerimist kolme dimensiooni järgi: konfidentsiaalsus (K), terviklikkus (T), käideldavus (S). Pole dokumenteeritud turvaklass.
  **Soovitus:** Klassifitseeri: kasutajakontod (K2-T2-S1), ülesanded (K1-T2-S1), audiofailid (K0-T1-S0), logid (K2-T2-S1).
- [ ] **1.2. Puudub varade register** — pole dokumenteeritud infosüsteemi varade nimekirja: serverid, andmebaasid, teenused, kolmandate osapoolte integratsioonid.
  **Soovitus:** Loo varade register: AWS kontod, teenused, andmebaasid, kolmandad osapooled (Sentry, Google Fonts).

## Juurdepääsu haldamine (ISO 27001 A.9)

- [x] **2.1. Autentimise mehhanism** — TARA (riiklik) ja Google OAuth. Cognito User Pool haldab kasutajaid.
- [x] **2.2. Token'id mälus** — access/id token'id ei salvestata localStorage'sse. httpOnly küpsis refresh token'ile. Kaitseb XSS-i eest.
- [ ] **2.3. Puudub MFA** — Cognito toetab MFA-d, aga pole konfigureeritud. Administraatoritele peaks MFA olema kohustuslik.
  **Soovitus:** Luba MFA vähemalt admin-kasutajatele.
- [ ] **2.4. Puudub rollipõhine juurdepääs (RBAC)** — kõik autenditud kasutajad on samade õigustega. Pole admin-rolli, pole moderaatori-rolli. Iga kasutaja näeb ainult oma andmeid (hea), aga pole privilegeeritud toiminguid.
  **Soovitus:** Lisa admin-roll: kasutajate haldamine, statistika vaatamine, sisu modereerimine.
- [ ] **2.5. AWS IAM haldamine** — kas AWS konto kasutab root-kasutaja asemel IAM-kasutajaid? Kas MFA on lubatud AWS Console'is? Pole koodist kontrollitav.
  **Soovitus:** Kontrolli AWS IAM konfiguratsiooni: MFA, paroolipoliitika, juurdepääsu ülevaatused.
- [x] **2.6. IAM poliitikad on piiravad** — Lambda funktsioonidel on minimaalsed IAM õigused (least privilege). ECS task'il on ainult SQS, S3, CloudWatch õigused.

## Krüpteerimine (ISO 27001 A.10)

- [x] **3.1. HTTPS (TLS) kõikjal** — CloudFront serveerib HTTPS-i. API Gateway kasutab HTTPS-i. Kõik andmed liiguvad krüpteeritult.
- [x] **3.2. DynamoDB encryption at rest** — AWS DynamoDB krüpteerib andmed vaikimisi (AWS managed key).
- [ ] **3.3. S3 encryption at rest puudub** — audiofailide bucket pole konfigureeritud server-side krüpteerimisega (SSE-S3 või SSE-KMS). Terraform'is pole `aws_s3_bucket_server_side_encryption_configuration` ressurssi.
  **Soovitus:** Lisa S3 SSE-S3 krüpteerimine: `{ rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } } }`.
- [ ] **3.4. Puudub Customer Managed Key (CMK)** — AWS managed key'd on kasutusel. Riigiasutuse jaoks võib CMK olla nõutav (võtmete kontrolli säilitamiseks).
  **Soovitus:** Kaaluda KMS CMK kasutamist DynamoDB ja S3 jaoks.

## Logimine ja audit trail (ISO 27001 A.12.4)

- [x] **4.1. CloudWatch Logs** — Lambda ja ECS logid. 90-päevane retentsioon.
- [ ] **4.2. Puudub CloudTrail** — `INFRA_AUDIT_PLAN.md` mainib CloudTrail'i lubamist faas 3 tegevusena. Pole selge, kas on juba lubatud. CloudTrail logib kõik AWS API kutsed.
  **Soovitus:** Kontrolli ja luba CloudTrail, kui pole veel lubatud. Saada logid S3 bucket'isse pikaajaliseks säilitamiseks.
- [ ] **4.3. Puudub GuardDuty** — AWS GuardDuty tuvastab kahtlast tegevust (nt ootamatud API kutsed, kahtlased IP-d). Mainitud infra audit plaanis, aga pole kinnitatud.
  **Soovitus:** Luba GuardDuty.
- [ ] **4.4. Puudub audit trail kasutajatoimingutele** — pole logimist: kes lõi/kustutas/muutis ülesandeid, kes logis sisse, kes jagas. GDPR ja ISKE nõuavad.
  **Soovitus:** Lisa DynamoDB Streams → Lambda → audit log tabel.

## Turvalisuse meetmed (ISO 27001 A.12, A.13, A.14)

- [x] **5.1. CSP (Content Security Policy)** — meta-tag'is. Piirab script'e, stiillehtesid, ühendusi.
- [ ] **5.2. CSP on meta-tag'is, mitte HTTP header'is** — meta-tag ei toeta `frame-ancestors` ega `report-uri` direktiive. HTTP header oleks turvalisem.
  **Soovitus:** Liiguta CSP CloudFront response header'isse.
- [x] **5.3. CORS on konfigureeritud** — ainult lubatud domeenid (hak-dev, hak). Piirab ristdomeenitaotlusi.
- [x] **5.4. API throttling** — rate limiting on konfigureeritud.
- [ ] **5.5. Puudub WAF** — API Gateway ees pole AWS WAF-i. Pole IP-põhist blokeerimist, geofiltreid, SQL injection/XSS filtrit.
  **Soovitus:** Lisa AWS WAF API Gateway'le.
- [ ] **5.6. Puudub penetration testing aruanne** — pole dokumenteeritud pentesti tulemusi. ISKE nõuab perioodilisi turvakontrolle.
  **Soovitus:** Tellima perioodiline pentest (vähemalt aastas).

## Intsidentide haldamine (ISO 27001 A.16)

- [ ] **6.1. Puudub intsidentide haldamise protseduur** — pole dokumenteeritud: kuidas tuvastada, reageerida, analüüsida ja taastuda turvaintsidendist.
  **Soovitus:** Loo intsidentide haldamise plaan: tuvastamine → eskaleermine → reageerimine → taastamine → analüüs.
- [ ] **6.2. Puudub intsidentide logiraamat** — pole kohta, kuhu dokumenteerida toimunud intsidente.
  **Soovitus:** Loo `internal/incidents/` kataloog.
- [x] **6.3. Sentry teavitab vigadest** — reaalajas veateated arendajatele.

## Talitluspidevus (ISO 27001 A.17)

- [x] **7.1. DynamoDB PITR** — 35-päevane taastamine.
- [ ] **7.2. Puudub DR plaan** — vt C05-disaster-recovery.md.
- [ ] **7.3. Puudub BCP (Business Continuity Plan)** — pole dokumenteeritud, kuidas teenus jätkub katkestuse korral.
  **Soovitus:** Loo BCP: kriitilised teenused, taastamise prioriteedid, rollid ja vastutused.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Andmete klassifitseerimine | 2 | 0 | 2 |
| Juurdepääsu haldamine | 6 | 3 | 3 |
| Krüpteerimine | 4 | 2 | 2 |
| Logimine | 4 | 1 | 3 |
| Turvalisus | 6 | 3 | 3 |
| Intsidentide haldamine | 3 | 1 | 2 |
| Talitluspidevus | 3 | 1 | 2 |
| **Kokku** | **28** | **11** | **17** |

## Prioriteedid

1. **P0:** S3 encryption at rest — lihtne parandus (#3.3)
2. **P0:** CloudTrail lubramine — AWS turvalogi (#4.2)
3. **P1:** Andmete klassifitseerimine — ISKE nõue (#1.1)
4. **P1:** Audit trail kasutajatoimingutele — GDPR + ISKE (#4.4)
5. **P1:** WAF lisamine — API kaitse (#5.5)
6. **P2:** CSP HTTP header'isse — turvalisuse paranemine (#5.2)
7. **P2:** Intsidentide haldamise protseduur (#6.1)
