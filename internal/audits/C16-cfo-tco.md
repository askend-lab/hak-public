# Checklist: Finantsdirektor / TCO (Total Cost of Ownership)

**Tüüp:** Finants- ja strateegiline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Infrastruktuuri, litsentside ja tööjõukulu analüüs — kogu omamiskulu stsenaariumide kaupa.

---

## Igakuised AWS kulud (praegune MVP)

| Teenus | Hinnang €/kuu | Märkused |
|--------|---------------|----------|
| Lambda (merlin-api, simplestore, tara-auth, vabamorf-api) | ~€1–3 | Free tier katab suurema osa |
| API Gateway | ~€1 | Free tier: 1M päringut |
| DynamoDB (on-demand) | ~€1–2 | Minimaalne kasutus |
| ECS Fargate Spot (merlin-worker, 24/7) | ~€12–18 | 0.5 vCPU + 1GB RAM |
| S3 (audio cache + frontend) | ~€1 | <5GB salvestust |
| CloudFront | ~€1–2 | <50GB andmeedastust |
| SQS | ~€0.50 | <1M sõnumit |
| Cognito | €0 | Free tier: 50K MAU |
| CloudWatch Logs | ~€1–3 | Sõltub logide mahust |
| Route 53 | ~€1 | Hosted zone |
| ECR | ~€0.50 | <1GB pildid |
| **Kokku AWS** | **~€20–35/kuu** | |

## Litsentsikulud

| Teenus | Kulu | Märkused |
|--------|------|----------|
| Sentry | €0 | Free tier: 5K events/kuu |
| Serverless Framework v3 | €0 | Open source (v3) |
| GitHub | €0 (või ~€4/kasutaja) | Public repo tasuta |
| Domeen (askend-lab.com) | ~€12/aasta = ~€1/kuu | |
| **Kokku litsentsid** | **~€1–5/kuu** | |

## Tööjõukulu (hinnang)

- [ ] **1.1. Hooldustööjõud** — minimaalne MVP hooldus: turvauuendused, vigade parandamine, kasutajate tugi. Hinnang: ~4–8 tundi/kuu = ~€200–400/kuu (€50/h).
- [ ] **1.2. Arendustööjõud** — uute funktsioonide lisamine (hääle valik, i18n, mobiilne menüü). Hinnang: ~40–80 tundi/kuu = ~€2,000–4,000/kuu.
- [ ] **1.3. Sisu ja tugi** — FAQ uuendamine, kasutajapäringutele vastamine, koolituste läbiviimine. Hinnang: ~2–4 tundi/kuu = ~€100–200/kuu.

## TCO stsenaariumid

### Stsenaarium A: Minimaalne hooldus (MVP jätkamine)

| Kulu | €/kuu | €/aasta |
|------|-------|---------|
| AWS | ~€30 | ~€360 |
| Litsentsid | ~€3 | ~€36 |
| Tööjõud (8h/kuu) | ~€400 | ~€4,800 |
| **Kokku** | **~€433** | **~€5,196** |

### Stsenaarium B: Aktiivne arendus (10 kooli piloot)

| Kulu | €/kuu | €/aasta |
|------|-------|---------|
| AWS (~1000 kasutajat) | ~€50 | ~€600 |
| Litsentsid | ~€10 | ~€120 |
| Tööjõud (60h/kuu arendus + 8h hooldus) | ~€3,400 | ~€40,800 |
| **Kokku** | **~€3,460** | **~€41,520** |

### Stsenaarium C: Üle-eestiline (100+ kooli)

| Kulu | €/kuu | €/aasta |
|------|-------|---------|
| AWS (~10,000 kasutajat) | ~€150 | ~€1,800 |
| Litsentsid (Sentry Pro, GitHub Teams) | ~€50 | ~€600 |
| Tööjõud (1 FTE arendaja + 0.5 FTE tugi) | ~€6,000 | ~€72,000 |
| **Kokku** | **~€6,200** | **~€74,400** |

## ROI (Return on Investment)

- [x] **2.1. Avatud lähtekood vähendab TCO-d** — pole litsentsikulusid. Kogukond saab panustada. Fork'imine on võimalik.
- [x] **2.2. Serverless vähendab infrastruktuuri kulu** — null-koormusel null-kulu. Skaleerimine on automaatne.
- [ ] **2.3. ROI on keeruline mõõta** — platvormi väärtus on eesti keele häälduse paranemine. Kuidas mõõta: paraneb häälduskvaliteet koolides? Väheneb keeleõpetajate koormus? Tõuseb PISA tulemus?
  **Soovitus:** Defineeri mõõdetavad tulemused: kasutajate arv, kasutusaktiivsus, õpetajate tagasiside.

## Riskid

- [ ] **3.1. AWS hinnakasvu risk** — AWS võib hinnakirja muuta. Serverless v4 litsentsi muutus on näide.
  **Soovitus:** Dokumenteeri alternatiivne infrastruktuur (vt C15).
- [ ] **3.2. Tööjõu sõltuvuse risk** — kui peamine arendaja lahkub, kes teab süsteemi? Onboarding uuele arendajale on ~1–2 nädalat (vt C12).
  **Soovitus:** Dokumenteeri süsteemi arhitektuur ja kriitilised protseduurid.
- [ ] **3.3. Sentry free tier ületamise risk** — suure kasutajaskonnaga 5K events/kuu ei pruugi piisata. Sentry Pro: ~€26/kuu.
  **Mõju:** Madal — €26/kuu on minimaalne.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| AWS kulud | (info) | — | — |
| Litsentsid | (info) | — | — |
| Tööjõud | 3 | 0 | 3 |
| ROI | 3 | 2 | 1 |
| Riskid | 3 | 0 | 3 |
| **Kokku** | **9** | **2** | **7** |

## Peamine järeldus

**Infrastruktuuri kulu on minimaalne** (~€30/kuu). **Suurim kulu on tööjõud** (~90% TCO-st). Investeering dokumentatsiooni ja automatiseerimisse vähendab pikaajalist tööjõukulu.
