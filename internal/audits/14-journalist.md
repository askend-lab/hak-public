# Audit: Ajakirjanik / Meedia

**Vaatenurk:** Ajakirjanik, kes kirjutab artiklit Hääldusabilisest: kas platvorm täidab lubadusi, milline on kasutajakogemus, millised on piirangud.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — põhifunktsionaalsuse kontroll, lubaduste vs tegelikkuse võrdlus, kasutajaliidese kvaliteet.

---

## Kasutajaprofiil

Maria, 32-aastane, Postimehe haridusajakirjanik. Kirjutab artiklit EKI uuest keeleõppe tööriistast. Peab testima platvormi, tegema screenshoti ja andma hinnangu. Tema lugejad on õpetajad, lapsevanemad ja haridusametnikud.

---

## Ajakirjaniku teekond

### Etapp 1: Esmamulje ja narratiiv

- [x] **1.1. Selge väärtuspakkumine** — platvorm teeb selgeks, mida ta teeb: eesti keele häälduse harjutamine TTS-i abil. Rolli valik (Õppija, Õpetaja, Uurija) annab kohe konteksti.

- [x] **1.2. Kiire demo** — ajakirjanik saab kohe sisestada lause ja kuulda hääldust. Pole vaja registreeruda. Esmamulje on positiivne: "See töötab!"

- [x] **1.3. Wizard on hea tour** — onboarding wizard näitab platvormi võimalusi sammhaaval. Ajakirjanik saab kiiresti ülevaate funktsioonidest.

- [ ] **1.4. Puudub "Teave" / "Meist" leht** — ajakirjanik otsib taustinfot: kes lõi, millal, mis rahastusel, mis tehnoloogiat kasutab. Pole selget "About" lehte. Jaluses on EKI kontaktandmed, aga mitte projekti kirjeldus.
  **Mõju:** Keskmine — ajakirjanik peab eraldi EKI-ga ühendust võtma taustinfo saamiseks.

- [ ] **1.5. Puudub pressimaterjalid / meedia kit** — pole logo allalaadimise linki, pole projekti kirjeldust pressijaoks, pole statistikat (kasutajate arv, sünteesitud lausete arv).
  **Mõju:** Madal — enamik avaliku sektori platvorme ei paku meediale eraldi materjale. Aga see lihtsustaks kajastust.

### Etapp 2: Funktsionaalsuse kontroll

- [x] **2.1. TTS töötab** — teksti sisestamine ja heli esitamine toimib. Põhifunktsioon on olemas ja töötab.

- [x] **2.2. Ülesannete süsteem töötab** — ülesande loomine, lausete lisamine, jagamine — kõik toimib. Ajakirjanik saab demonstreerida õpetaja töövoogu.

- [ ] **2.3. Mõned funktsioonid nõuavad sisselogimist** — ülesannete loomine ja haldamine nõuab kontot. Ajakirjanik, kes testib kiiresti, peab sisse logima. TARA nõuab ID-kaarti — ajakirjanik ei pruugi seda käepärast omada.
  **Mõju:** Madal — Google auth on alternatiiv. Aga "Ma pean sisse logima, et testida?" on halb esmamulje artiklile.

- [x] **2.4. Jagamislink töötab anonüümselt** — ajakirjanik saab jagamislinki testida ilma kontota. Oluline demo jaoks.

- [ ] **2.5. Mõned lubatud funktsioonid on poolikud** — onboarding lubab, aga puuduvad: heli kiiruse reguleerija, mobiilne menüü, otsing ülesannetes. Ajakirjanik paneb tähele: "Platvorm lubab rohkem, kui tegelikult pakub."
  **Mõju:** Keskmine — kriitiline ajakirjaniku jaoks: lubaduste ja tegelikkuse vahe on uudislugu.

### Etapp 3: Visuaalne kvaliteet

- [x] **3.1. Puhas, professionaalne liides** — pole reklaame, pole häirivaid elemente. Riigiasutuse platvormile kohane disain.

- [x] **3.2. EKI bränding on olemas** — logo, värvipalett, jaluse info. Platvorm on selgelt EKI toode.

- [ ] **3.3. Screenshot'ide tegemine on keeruline mobiilil** — mobiilil on navigatsioon peidetud (pole hamburger-menüüd). Ajakirjanik, kes teeb screenshot'e telefonis, ei saa täielikku pilti.
  **Mõju:** Madal — desktopi screenshot'id on piisavad artiklile.

### Etapp 4: Võrdlus konkurentidega

- [ ] **4.1. Puudub eristumise narratiiv** — miks kasutada seda, mitte Google Translate'i TTS-i? Platvorm ei selgita oma eelist: Vabamorf'i integreeritud foneetiline analüüs, eesti keele spetsiifiline hääldus, haridusele orienteeritud töövoog.
  **Mõju:** Keskmine — ajakirjanik küsib: "Miks on see parem kui Google?" Vastus peaks olema platvormil nähtav.

- [ ] **4.2. Puudub kasutajate tagasiside** — pole testimoniaal'e, pole kasutajalugusid, pole "200 õpetajat kasutab juba" tüüpi statistikat. Ajakirjanik vajab "inimese lugu" artiklile.
  **Mõju:** Keskmine — ajakirjanik peab ise õpetajaid intervjueerima. Platvormil olev tagasiside lihtsustaks kajastust.

### Etapp 5: Kriitilised küsimused

- [ ] **5.1. Mis juhtub andmetega?** — ajakirjanik küsib: "Kas mu sisestatud tekst salvestatakse? Kes seda näeb?" Privaatsuspoliitika peaks olema selge ja lihtsas keeles.
  **Mõju:** Keskmine — sünteesi tekst logitakse serveris. Privaatsuspoliitika peaks seda selgelt mainima.

- [ ] **5.2. Kas platvorm on ligipääsetav?** — ajakirjanik võib kontrollida ligipääsetavust (WCAG). Audit #7 tuvastas mitu probleemi: PlayButton ARIA inglise keeles, puuduv aria-live jne. Negatiivne uudislugu potentsiaalselt.
  **Mõju:** Keskmine — ligipääsetavuse probleemid on uudisväärtuslikud, eriti riigiasutuse kontekstis.

- [ ] **5.3. Kas platvorm on turvaline lastele?** — ajakirjanik küsib: "Kas laps saab sisestada sobimatut teksti?" Audit #4 tuvastas, et sisu modereerimine puudub. See on potentsiaalne negatiivne uudislugu.
  **Mõju:** Kõrge — "Riigi platvorm loeb lastele ette sobimatuid sõnu" on pealkirjamaterjal.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Esmamulje | 5 | 3 | 2 |
| Funktsionaalsus | 5 | 3 | 2 |
| Visuaalne kvaliteet | 3 | 2 | 1 |
| Võrdlus | 2 | 0 | 2 |
| Kriitilised küsimused | 3 | 0 | 3 |
| **Kokku** | **18** | **8** | **10** |

## Top-5 probleemid (mõju kajastusele)

1. **Sisu modereerimine puudub** (#5.3) — potentsiaalne negatiivne uudislugu lastega
2. **Lubaduste vs tegelikkuse vahe** (#2.5) — puuduvad lubatud funktsioonid
3. **Puudub eristumise narratiiv** (#4.1) — "Miks see, mitte Google?"
4. **Puudub "Teave" leht** (#1.4) — taustinfo nõuab eraldi pöördumist
5. **Ligipääsetavuse probleemid** (#5.2) — riigiasutuse kontekstis uudisväärtuslik

## Mis on hästi tehtud

- Kiire, kontota demo — ajakirjanik saab kohe testida
- Puhas, professionaalne liides reklaamideta
- Wizard annab hea ülevaate
- TTS ja ülesannete süsteem töötab
- EKI bränding on selge
- Jagamislink töötab anonüümselt
