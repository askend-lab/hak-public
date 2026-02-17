# Agregeeritud leiud: Dokumentatsioon

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. Pakettide README-d puuduvad

**Viited: 10 kirjet** — #11, #12, #17, C12, C17, C19, C20, C22, C24, C25

Üheski paketil (merlin-api, merlin-worker, vabamorf-api, tara-auth, simplestore, frontend, shared) pole README-d: eesmärk, konfiguratsioon, käivitamine, API.

- [ ] README igale paketile (7 tk)

**Hinnang:** 2–3 päeva | **Prioriteet:** P0

---

## 2. Arhitektuuridiagramm puudub

**Viited: 9 kirjet** — #11, #12, #17, #19, C08, C12, C19, C22, C25

Pole süsteemi ülevaadet: komponendid, andmevoog, infrastruktuur. Uus arendaja peab ise koodi kaevates aru saama.

- [ ] `docs/architecture.md` koos Mermaid diagrammiga
- [ ] Komponentide seos ja andmevoog

**Hinnang:** 1–2 päeva | **Prioriteet:** P0

---

## 3. CONTRIBUTING.md puudub

**Viited: 7 kirjet** — #12, C12, C19, C20, C22, C24, C25

Pole panustamisjuhendit: fork workflow, koodi stiil, commit message formaat, PR protsess.

- [ ] CONTRIBUTING.md juurkataloogi

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 4. SECURITY.md puudub

**Viited: 5 kirjet** — C10, C14, C19, C22, C25

Pole haavatavuste teavitamise protsessi. Responsible disclosure puudub.

- [ ] SECURITY.md: teavitamise protsess, kontaktandmed

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 5. OpenAPI / Swagger spetsifikatsioon puudub

**Viited: 8 kirjet** — #3, #12, #17, C12, C17, C19, C22, C24

Pole massinloetavat API dokumentatsiooni. API tarbija peab koodi lugema.

- [ ] `docs/api/openapi.yaml` — OpenAPI 3.0 spec
- [ ] Swagger UI või Redoc interaktiivse dokumentatsioonina

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 6. ADR-id (Architecture Decision Records) puuduvad

**Viited: 4 kirjet** — C08, C12, C19, C22

Pole selgitust: miks DynamoDB? Miks SQS? Miks Serverless Framework? Miks Vabamorf?

- [ ] `docs/decisions/` kataloog ADR-idega

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 7. Andmemudeli dokumentatsioon puudub

**Viited: 5 kirjet** — #12, C04, C12, C19, C22

Pole DynamoDB tabelistruktuuri, PK/SK mustrite, pääsumustrite kirjeldust.

- [ ] `docs/data-model.md`

**Hinnang:** 1 päev | **Prioriteet:** P2

---

## 8. Deployment juhend puudub

**Viited: 5 kirjet** — #11, C05, C12, C19, C20

Pole samm-sammult juhist: kuidas deployda uus versioon, kuidas rollback'ida.

- [ ] `docs/operations/deployment.md`

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 9. Runbook'id puuduvad

**Viited: 4 kirjet** — C05, C06, C19, C22

Pole intsidentide käsitlemise protseduure: "Mis teha, kui Lambda failib?", "Mis teha, kui DynamoDB throttle?"

- [ ] `docs/operations/runbooks/` — vähemalt 5 runbook'i

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 10. `.env.example` puudub

**Viited: 4 kirjet** — #11, #12, C12, C19

Pole näidiskeskkonnamuutujate faili. Uus arendaja peab ise otsima, milliseid muutujaid vaja on.

- [ ] `.env.example` iga paketi jaoks

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 11. CHANGELOG.md puudub

**Viited: 3 kirjet** — C19, C25, C22

Pole muudatuste logi. Pole versiooninumbrit, pole release notes'e.

- [ ] CHANGELOG.md (Conventional Changelog formaat)
- [ ] SemVer strateegia ja release protsess

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 12. Stiilijuhend ja testide juhend puuduvad

**Viited: 5 kirjet** — C12, C19, C20, C24, C25

Pole koodi stiili dokumenti ega testide konventsioone.

- [ ] `docs/development/style-guide.md`
- [ ] `docs/development/testing.md`

**Hinnang:** 1 päev | **Prioriteet:** P2

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | Pakettide README-d | 10 | P0 |
| 2 | Arhitektuuridiagramm | 9 | P0 |
| 3 | CONTRIBUTING.md | 7 | P1 |
| 4 | SECURITY.md | 5 | P1 |
| 5 | OpenAPI spetsifikatsioon | 8 | P2 |
| 6 | ADR-id | 4 | P2 |
| 7 | Andmemudeli dokumentatsioon | 5 | P2 |
| 8 | Deployment juhend | 5 | P1 |
| 9 | Runbook'id | 4 | P1 |
| 10 | `.env.example` | 4 | P1 |
| 11 | CHANGELOG.md | 3 | P2 |
| 12 | Stiilijuhend / testide juhend | 5 | P2 |
| **Kokku** | **12 unikaalset leidu** | **69 originaalkirjet** | |
