# Audit: Pagulane / Immigrant (Uussisserändaja)

**Vaatenurk:** Pagulane või immigrant, kes ei oska eesti keelt üldse ja kellel on piiratud digitaalsed oskused, piiratud internetiühendus ja potentsiaalselt trauma taust.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — mitmekeelsus, lihtsus, offline-tugi, keelebarjäär, kultuuriline tundlikkus.

---

## Kasutajaprofiil

Ahmad, 35-aastane, Süüriast pärit pagulane, elab Eestis 6 kuud. Eesti keel null-tasemel, inglise keel minimaalne. Kasutab vana Android telefoni. Käib keelekursusel ja tahab kodus harjutada. Tema lapsed (8 ja 12 a) käivad koolis ja vajavad eesti keele abi.

---

## Uussisserändaja teekond

### Etapp 1: Keelebarjäär

- [ ] **1.1. Liides on ainult eesti keeles** — kõik nupud, menüüd, teated on eesti keeles. Kasutaja, kes ei oska eesti keelt, ei saa liidest kasutada. Pole keelevalikut.
  **Mõju:** Kõrge — sihtgrupp on inimesed, kes ÕPIVAD eesti keelt. Nad ei oska seda veel. Liides peaks olema vähemalt inglise, vene ja ukraina keeles.

- [ ] **1.2. Onboarding wizard on eesti keeles** — rolli valik ja juhendamine on arusaamatud kasutajale, kes ei tea, mis on "Õppija" või "Sisesta lause".
  **Mõju:** Kõrge — wizard on mõeldud esmakordsele kasutajale, aga eeldab eesti keele oskust.

- [ ] **1.3. Veateated on eesti keeles** — "Sõna ei leidu eesti keeles" on arusaamatu kasutajale, kes ei oska eesti keelt. Veateade peaks olema mitmes keeles.
  **Mõju:** Keskmine — veaolukorras on keelebarjäär eriti frustreeriv.

- [ ] **1.4. Placeholder tekst eeldab eesti keelt** — "Kirjuta sõna või lause ja vajuta Enter" — kasutaja ei saa aru. Visuaalsed vihjed (ikoonid, animatsioonid) oleksid universaalsemad.
  **Mõju:** Keskmine — placeholder on ainus juhis sisestusväljal.

- [x] **1.5. Play-nupp on universaalne** — ▶ ikoon on keeleüleselt arusaadav. Kasutaja saab vähemalt heli kuulata pärast teksti sisestamist.

### Etapp 2: Kasutamise lihtsus

- [x] **2.1. Kontota kasutamine** — Ahmad ei pea looma kontot. Pole e-posti nõuet. See on kriitiline: pagulastel ei pruugi olla stabiilset e-posti ega ID-dokumente.

- [x] **2.2. Lihtne voog** — sisesta tekst → kuula. Minimaalne interaktsioon. Isegi keelebarjääriga saab kasutaja proovida.

- [ ] **2.3. Puudub tõlke-integratsioon** — kasutaja tahab sisestada sõna oma emakeeles ja kuulda eestikeelset hääldust. Pole integratsiooni Google Translate'iga ega muu tõlketeenusega. Kasutaja peab ise teadma eestikeelset sõna.
  **Mõju:** Kõrge — A0-tasemel kasutaja ei tea eestikeelseid sõnu. Tõlke-integratsioon oleks põhifunktsioon.

- [ ] **2.4. Puudub sõnastik / sõnasoovitused** — sisestamise ajal pole automaatseid soovitusi ega sõnastikku. Kasutaja peab teadma täpset kirjaviisi. "Tere" vs "terre" — pole abi.
  **Mõju:** Keskmine — autocomplete eesti keele sõnadega oleks väärtuslik algajatele.

- [ ] **2.5. Puudub näidislausete kogu** — kasutaja, kes ei oska eesti keelt, ei tea, mida sisestada. Pole "Igapäevased fraasid", "Poes", "Arsti juures" tüüpi valmislausete kogu.
  **Mõju:** Kõrge — valmislaused oleksid null-tasemel kasutajale hädavajalikud. "Tere, minu nimi on..." jne.

### Etapp 3: Kultuuriline tundlikkus

- [x] **3.1. Pole kultuuriliselt solvavat sisu** — platvorm on neutraalne, pole stereotüüpe, pole solvavat sisu. Riigiasutuse platvormile kohane.

- [x] **3.2. Pole religioonispetsiifilisi eeldusi** — platvorm ei eelda konkreetset religiooni, sugu ega kultuurilist tausta.

- [ ] **3.3. Puudub RTL (Right-to-Left) tugi** — araabiakeelsed ja heebrea kasutajad näevad teksti valesti, kui liides peaks olema nende keeles. Praegu on liides ainult eesti keeles, seega RTL pole aktuaalne, aga mitmekeelse liidese puhul oleks vajalik.
  **Mõju:** Madal — praegu pole aktuaalne, aga i18n planeerimisel tuleb arvestada.

### Etapp 4: Tehniline ligipääsetavus

- [x] **4.1. Töötab vanas brauseris** — React SPA peaks töötama enamikes kaasaegsetes brauserites, sh vanematel Android seadmetel.

- [ ] **4.2. Puudub offline-tugi** — pagulane võib elada kohas, kus internet on ebastabiilne (pagulaskeskus, ühiselamu). Pole PWA-d ega Service Worker'it.
  **Mõju:** Keskmine — kordab auditi #6 leidu #4.3, aga selles kontekstis eriti oluline.

- [ ] **4.3. Andmekasutus pole optimeeritud** — WAV-failid on suhteliselt suured (~100KB lause kohta). Piiratud andmepakiga kasutajale oleks MP3/Opus väiksemad failid kasulikumad.
  **Mõju:** Madal — WAV on kvaliteetsem, aga mobiilse andmemahu piiratud kasutajale pole optimaalne.

### Etapp 5: Keelekursuse integratsioon

- [ ] **5.1. Puudub sidumine keeletasemetega** — A1, A2, B1 tasemed on keeleõppe standard. Platvorm ei paku tasemel põhinevat sisu ega harjutusi.
  **Mõju:** Keskmine — keelekursuse õpetaja peab ise valima sobivad sõnad/laused.

- [ ] **5.2. Puudub gamification** — pagulase motivatsiooni hoidmine on keeruline. Pole punkte, saavutusi, päevaseid eesmärke, striike. "Harjuta 5 minutit päevas" tüüpi motivatsioonisüsteem puudub.
  **Mõju:** Keskmine — gamification on keeleõppe rakendustes (Duolingo, Babbel) standardne. Motiveerib regulaarset harjutamist.

- [ ] **5.3. Puudub progressi salvestamine ilma kontota** — kasutaja harjutab, aga progress ei salvestu (localStorage pole piisav: teine seade, brauseri puhastamine kaotab andmed). Pole viisi jätkata sealt, kus pooleli jäi.
  **Mõju:** Keskmine — localStorage on ajutine. Kontopõhine progressi salvestamine nõuab registreerimist, mis on barjäär.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Keelebarjäär | 5 | 1 | 4 |
| Kasutamise lihtsus | 5 | 2 | 3 |
| Kultuuriline tundlikkus | 3 | 2 | 1 |
| Tehniline ligipääsetavus | 3 | 1 | 2 |
| Keelekursuse integratsioon | 3 | 0 | 3 |
| **Kokku** | **19** | **6** | **13** |

## Top-5 probleemid (mõju uussisserändajale)

1. **Liides on ainult eesti keeles** (#1.1) — sihtgrupp ei oska eesti keelt, aga liides eeldab seda
2. **Puudub näidislausete kogu** (#2.5) — null-tasemel kasutaja ei tea, mida sisestada
3. **Puudub tõlke-integratsioon** (#2.3) — kasutaja ei tea eestikeelseid sõnu
4. **Onboarding eeldab eesti keele oskust** (#1.2) — esmakordsele kasutajale arusaamatu
5. **Puudub gamification ja motivatsioonisüsteem** (#5.2) — regulaarse harjutamise hoidmine on keeruline

## Mis on hästi tehtud

- Kontota kasutamine — pole registreerimise barjääri
- Play-nupp on universaalne ikoon
- Lihtne sisestus → kuulamine voog
- Kultuuriliselt neutraalne sisu
- Pole religioonispetsiifilisi eeldusi
- Töötab vanemates brauserites
