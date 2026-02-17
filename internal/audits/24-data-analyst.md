# Audit: Andmeanalüütik

**Vaatenurk:** Andmeanalüütik, kes hindab platvormi andmekogumise, analüütika ja aruandluse võimalusi: kasutusstatistika, TTS kasutamise mustrid, hariduse mõjuhinnang.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — andmemudel, logid, analüütika integratsioon, aruandluse võimalused.

---

## Kasutajaprofiil

Kati, 29-aastane, andmeanalüütik HTM (Haridus- ja Teadusministeeriumi) digipädevuse osakonnas. Peab hindama Hääldusabilise mõju eesti keele õppele ja koostama kasutusaruandeid.

---

## Andmeanalüüsi võimalused

### Etapp 1: Andmete kogumine

- [ ] **1.1. Puudub kasutusanalüütika** — pole Google Analytics'it, Matomo't, Plausible'it ega muud analüütika tööriista. Ainult Sentry vigade jaoks. Pole teada: mitu kasutajat, mitu sünteesipäringut, millised lehed on populaarsed.
  **Mõju:** Kõrge — ilma analüütikadata pole võimalik hinnata platvormi mõju ega koostada aruandeid.

- [ ] **1.2. Puudub sündmuste jälgimine** — pole custom sündmusi: "kasutaja sünteesis lause", "kasutaja lõi ülesande", "kasutaja jagas ülesannet", "kasutaja kuulas varianti". Need sündmused on vajalikud kasutuskäitumise analüüsiks.
  **Mõju:** Kõrge — ilma sündmusteta pole võimalik analüüsida kasutajateekonda ega levinumaid töövoogusid.

- [x] **1.3. Serveri logid on olemas** — Lambda funktsioonid logivad päringuid CloudWatch'i. Backend logid sisaldavad sünteesipäringuid, vigu, API kutseid.

- [ ] **1.4. Serveri logid pole analüüsiks struktureeritud** — logid on tekstipõhised (`logger.info`, `logger.error`). Pole JSON-struktureeritud logimist, pole korrelatsioonide ID-d, pole kasutaja ID-d (privacy tõttu).
  **Mõju:** Keskmine — CloudWatch Insights saab päringuid teha, aga struktureeritud logid oleksid tõhusamad.

### Etapp 2: Kasutusstatistika

- [ ] **2.1. Puudub dashboard** — pole admin-paneeli ega analüütika dashboardi: kasutajate arv, aktiivsed kasutajad, sünteesipäringute arv, populaarsed sõnad/laused, geograafiline jaotus.
  **Mõju:** Kõrge — HTM nõuab regulaarseid kasutusaruandeid. Praegu peab andmed käsitsi logidest kaevandama.

- [ ] **2.2. Puudub kasutajate segmenteerimine** — pole teada, kui palju on õpetajaid vs õppijaid vs uurijaid. Rolli valik salvestatakse `localStorage`'sse, mitte serverisse.
  **Mõju:** Keskmine — rolli info kaotamine tähendab, et pole võimalik analüüsida kasutajagruppe.

- [ ] **2.3. Puudub retentsiooni analüüs** — pole teada, mitu kasutajat tuleb tagasi. Pole DAU/MAU (Daily/Monthly Active Users) mõõdikuid. Pole kohordianalüüsi.
  **Mõju:** Keskmine — retentsioon on platvormi edukuse võtmenäitaja.

### Etapp 3: Hariduse mõjuhinnang

- [ ] **3.1. Puudub õpitulemuste andmed** — pole teada, kas platvorm parandab eesti keele hääldust. Pole eel- ja järelteste, pole häälduse hindamise andmeid.
  **Mõju:** Kõrge — mõjuhinnang nõuab tulemuste andmeid. Praegu on ainult kasutusandmed (kui needki oleksid).

- [ ] **3.2. Puudub õpetajate tagasiside kogumine** — pole in-app küsitlust, NPS (Net Promoter Score) küsimust, tagasisidevormi. Ainus tagasisidekanal on eki@eki.ee.
  **Mõju:** Keskmine — kvalitatiivne tagasiside on kvantitatiivse analüüsi täiendus.

- [ ] **3.3. Puudub A/B testimise raamistik** — pole võimalust testida erinevaid UI variante, onboarding voogusid, heli kvaliteete. Pole feature flag'e ega eksperimentide süsteemi.
  **Mõju:** Madal — A/B testimine on optimeerimise tööriist, mitte MVP nõue.

### Etapp 4: Andmete eksport ja aruandlus

- [ ] **4.1. Puudub andmete ekspordi API** — pole endpointi, mis tagastaks koondstatistikat: sünteesipäringute arv kuude kaupa, unikaalsete kasutajate arv, populaarsed sõnad.
  **Mõju:** Keskmine — CloudWatch Logs ja DynamoDB päringud on alternatiiv, aga API oleks mugavam.

- [ ] **4.2. Puudub automaatne aruanne** — pole iganädalast/igakuist automaatset aruannet: kasutusstatistika, vigade arv, jõudlusmõõdikud.
  **Mõju:** Madal — saab luua CloudWatch Dashboardi ja SNS teavitusi, aga pole vaikimisi seadistatud.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Andmete kogumine | 4 | 1 | 3 |
| Kasutusstatistika | 3 | 0 | 3 |
| Hariduse mõjuhinnang | 3 | 0 | 3 |
| Andmete eksport | 2 | 0 | 2 |
| **Kokku** | **12** | **1** | **11** |

## Top-5 probleemid (mõju andmeanalüütikule)

1. **Puudub kasutusanalüütika** (#1.1) — pole andmeid kasutajate arvu ega käitumise kohta
2. **Puudub sündmuste jälgimine** (#1.2) — kasutajateekonda pole võimalik analüüsida
3. **Puudub dashboard** (#2.1) — HTM nõuab aruandeid, andmeid pole kust võtta
4. **Puudub õpitulemuste andmed** (#3.1) — mõjuhinnang on võimatu
5. **Puudub kasutajate segmenteerimine** (#2.2) — rollide jaotust pole teada

## Mis on hästi tehtud

- Serveri logid CloudWatch'is — minimaalne alus analüütikale
