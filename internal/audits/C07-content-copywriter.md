# Checklist: Sisustrateeg / Copywriter

**Tüüp:** Sisu ja mikrotekstide kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — UI tekstid, veateated, onboarding, tühjad olekud, abitekstid, toon.

---

## Toon ja stiil

- [x] **1.1. Eestikeelne, neutraalne toon** — kõik UI tekstid on eesti keeles, formaalne-neutraalse tooniga. Kohane riigiasutuse platvormile.
- [x] **1.2. Teie-vorm** — kasutajale suunatud tekstid kasutavad viisakusvormi. "Kirjuta sõna või lause", "Sisesta lause" — sina-vormi kasutamine on eesti keeles levinud ja kohane.
- [ ] **1.3. Teksti ühtlus pole tagatud** — pole stiilijuhendit (style guide). Mõned tekstid on pikemad ja kirjeldavamad (onboarding wizard), mõned on lühikesed ja tehnilised (veateated). Pole selge, kas toon peaks olema soe/julgustav (keeleõpe) või neutraalne/tehniline (tööriist).
  **Soovitus:** Loo stiilijuhend: toon, stiil, sõnavalik, keelereeeglid.

## Veateated

- [ ] **2.1. Veateated on üldised** — "Analüüsimine ebaõnnestus" — mida kasutaja peaks tegema? Pole konkreetset juhist. Hea veateade: "Häälduse analüüs ebaõnnestus. Proovige uuesti. Kui probleem jätkub, kirjutage eki@eki.ee."
  **Soovitus:** Iga veateade peaks sisaldama: (1) mis juhtus, (2) mida teha, (3) kuhu pöörduda.
- [ ] **2.2. Mõned veateated on inglise keeles** — backend tagastab "Missing or invalid text field", "Synthesize error". Frontend peaks need tõlkima kasutajasõbralikuks eestikeelseks teateks.
  **Soovitus:** Frontend: kaardista API vead → eestikeelsed kasutajateated.
- [ ] **2.3. Puudub "Sõna ei leitud" selgitus** — kui Vabamorf ei tunne sõna, pole kasutajale selge, miks. Võib olla kirjaviga, võõrsõna, nimi. Abistav teade: "Sõna ei leidu sõnastikust. Kas kirjaviis on õige?"
  **Soovitus:** Lisa kontekstuaalsed veateated sõnastiku vigade jaoks.
- [x] **2.4. Toast-teated on informatiivsed** — "Ülesanne loodud" + "Vaata ülesannet" link. Hea muster: kinnitus + järgmine samm.

## Onboarding tekstid

- [x] **3.1. Wizard tekstid on sammhaaval** — iga samm selgitab üht funktsiooni. Kasutaja ei ole ülekoormatud. Hea pedagoogiline lähenemine.
- [x] **3.2. Rollide kirjeldused on selged** — "Õppija", "Õpetaja", "Uurija" — iga roll on kirjeldatud lühidalt ja selgelt.
- [ ] **3.3. Wizard tekstid on pikad** — mõned tooltip-teksiid on üle 3 lause. Mobiilil on pikk tooltip raskesti loetav. Peaks olema lühemad, konkreetsemad.
  **Soovitus:** Iga wizard samm: max 2 lauset. Pikemad selgitused eraldi abipaneelile.
- [ ] **3.4. Puudub "Alustamiseks..." empty state** — kui kasutaja jätab wizardi vahele ja avab sünteesi lehe, näeb ta tühja välja ilma kontekstita. Pole illustreeritud tühja oleku teksti.
  **Soovitus:** Lisa empty state: pilt + tekst "Alustamiseks kirjuta eestikeelne sõna või lause ja vajuta Enter."

## Abitekstid ja juhised

- [x] **4.1. Placeholder tekst on olemas** — "Kirjuta sõna või lause ja vajuta Enter" — selge ja konkreetne juhis.
- [ ] **4.2. Puudub kontekstuaalne abi** — pole "?" ikoone ega tooltip'e keerukate funktsioonide juures (foneetiline märgistus, hääldusvariantide paneel). Kasutaja peab ise avastama.
  **Soovitus:** Lisa "?" ikoonid koos lühikeste selgitustega foneetiliste funktsioonide juurde.
- [ ] **4.3. Puudub FAQ / KKK leht** — pole korduma kippuvate küsimuste lehte: "Mis on välde?", "Kuidas häälduskuju muuta?", "Kas minu tekst salvestatakse?"
  **Soovitus:** Loo FAQ leht levinumate küsimustega.
- [ ] **4.4. Abileht on sisu mõttes tühjavõitu** — "Abi" nupp on päises, aga sisu pole siin auditis kontrollitud. Peaks olema põhjalik ja kasutajasõbralik.
  **Soovitus:** Kontrolli abilehe sisu ja täienda vajadusel.

## Nuppude ja toimingute tekst

- [x] **5.1. Selged toimingutekstid** — "Salvesta", "Kustuta", "Jaga", "Lisa ülesandesse" — selged ja ühemõttelised verbid.
- [x] **5.2. Kinnitusdialoogide tekst** — "Kas oled kindel, et soovid kustutada?" — turvaline kinnitus enne pöördumatut toimingut.
- [ ] **5.3. Mõned nupud on ikooni-põhised ilma tekstita** — Play ▶, menüü ⋮, lohistamine ≡ — ikoonid on universaalsed, aga `aria-label` peaks olema eesti keeles (praegu mõned on inglise keeles).
  **Soovitus:** Kõik `aria-label` väärtused eesti keelde.

## Privaatsuspoliitika ja õiguslikud tekstid

- [x] **6.1. Privaatsuspoliitika on professionaalne** — selge struktuur, eestikeelne, kõik nõutud lõigud olemas.
- [x] **6.2. Ligipääsetavuse teatis on olemas** — `/accessibility` leht.
- [ ] **6.3. Puuduvad kasutustingimused (Terms of Service)** — pole eraldi kasutustingimuste lehte: lubatud kasutus, keelatud kasutus, vastutuse piirangud, intellektuaalomand.
  **Soovitus:** Loo Terms of Service leht.
- [ ] **6.4. Puudub küpsiste poliitika eraldi lehena** — küpsiste info on cookie consent banner'is, aga pole detailset küpsiste lehte: millised küpsised, mis eesmärgil, kui kaua.
  **Soovitus:** Lisa detailne küpsiste poliitika leht.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Toon ja stiil | 3 | 2 | 1 |
| Veateated | 4 | 1 | 3 |
| Onboarding | 4 | 2 | 2 |
| Abitekstid | 4 | 1 | 3 |
| Nupud ja toimingud | 3 | 2 | 1 |
| Õiguslikud tekstid | 4 | 2 | 2 |
| **Kokku** | **22** | **10** | **12** |

## Prioriteedid

1. **P0:** Veateated eesti keelde ja kasutajasõbralikuks (#2.1, #2.2)
2. **P0:** ARIA sildid eesti keelde (#5.3)
3. **P1:** Empty state sünteesi lehele (#3.4)
4. **P1:** Kasutustingimuste leht (#6.3)
5. **P2:** FAQ / KKK leht (#4.3)
6. **P2:** Stiilijuhend (#1.3)
