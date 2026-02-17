# Audit: Eesti keele õpetaja (Õpetaja)

**Vaatenurk:** Õpetaja, kes kasutab platvormi materjalide ettevalmistamiseks ja õpilastega töötamiseks.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — kogu õpetaja töövoog ülesande loomisest kuni õpilastega jagamiseni.

---

## Kasutajaprofiil

Kaire, 42-aastane, eesti keele kui teise keele õpetaja Narva venekeelses koolis. 25 õpilast klassis, tasemed A1–B1. Tahab anda häälduse kodutöid ja kontrollida, et õpilased kuulevad õiget varianti. Kasutab kooli sülearvutit ja isiklikku telefoni. Keskmine digitaalne kirjaoskus.

---

## Õpetaja teekond (Teacher Journey)

### Etapp 1: Õpetaja onboarding

- [x] **1.1. Roll "Õpetaja" on esimesel külastusel saadaval** — `RoleSelectionPage` näitab kaarti kirjeldusega "Loo ja jaga õppijatega ülesandeid eesti keele häälduse harjutamiseks." Kirjeldab täpselt õpetaja kasutusjuhtu.

- [x] **1.2. Wizard on õpetaja jaoks kohandatud** — 5 sammu: teksti sisestus → kuulamine → lausete lisamine → variandid → ülesande loomine. Viimane samm "Loo ülesanne" kirjeldusega "Lisa laused ülesandesse, et jagada neid õppijatega" — õige fookus.

- [ ] **1.3. Onboarding ei selgita jagamise töövoogu** — wizard lõpeb "Loo ülesanne" juures, kuid ei näita, kuidas ülesannet õpilastega jagada. Õpetaja ei saa nupust "Jaga" teada enne, kui on ülesande loonud ja selle avanud.
  **Mõju:** Keskmine — õpetaja jaoks võtmefunktsioon (jagamine) pole onboarding'uga kaetud.

- [ ] **1.4. Puudub viide TARA/Google sisselogimisele** — wizard ei maini, et ülesannete loomiseks on vaja autentimist. Õpetaja läbib wizardi, proovib ülesannet luua → LoginModal. Üllatusmoment.
  **Mõju:** Madal — aga parem oleks wizardis hoiatada: "Ülesannete loomiseks logi sisse."

### Etapp 2: Materjalide loomine (Süntees)

- [x] **2.1. Mitmekordne lausete sisestamine** — nupp "Lisa lause" lisab uusi ridu. Õpetaja saab sisestada 10–15 lauset ühe ülesande jaoks. `handleAddSentence` töötab ilma frontendi poolse piiranguta.

- [x] **2.2. Esita kõik töötab** — `usePlaylistControl` võimaldab kõiki lauseid järjest kuulata. Õpetajale, kes kontrollib materjali enne saatmist — hädavajalik.

- [ ] **2.3. Puudub hulgi-kleepimine (mitu lauset korraga)** — õpetaja kopeerib sageli teksti Wordist/Docsist. Kui kleepida 5 lausega lõik ühte välja, läheb kõik ühte lausesse. Puudub automaatne jagamine `.`, `!`, `?` järgi.
  **Mõju:** Kõrge — tüüpiline õpetaja töövoog: kopeerida lausete nimekiri õpikust. Käsitsi sisestamine ühe lause kaupa on 15+ lause korral tüütu.

- [ ] **2.4. Puudub failist importimine** — õpetaja ei saa laadida `.txt` või `.docx` faili lausetega. Kõik ainult käsitsi sisestus.
  **Mõju:** Keskmine — MVP jaoks normaalne, kuid regulaarseks õpetaja kasutamiseks tõsine piirang.

- [x] **2.5. Lohistamine ümberjärjestamiseks** — õpetaja saab lauseid soovitud järjekorda lohistada. Kasulik harjutuste ettevalmistamisel.

- [ ] **2.6. Puudub lausete nummerdamine** — sünteesi vaates pole laused nummerdatud. 10+ lausega õpetaja kaotab orientatsiooni. Ülesande vaates `texts.txt` on nummerdamine olemas (`001. ...`), kuid kasutajaliideses mitte.
  **Mõju:** Madal — kosmeetiline, kuid kasulik viitamiseks: "Avage lause number 5."

### Etapp 3: Ülesannete loomine (Tasks)

- [x] **3.1. Ülesande loomine töötab** — `handleAddTask` loob ülesande nime, kirjelduse ja lausetega. Teade nupuga "Vaata ülesannet" — hea tagasiside.

- [x] **3.2. Kaks viisi ülesandesse lisamiseks** — päise nupu "Lisa ülesandesse (N)" kaudu ja konkreetse lause menüüst. Mõlemad teed töötavad.

- [x] **3.3. Lisa juurde / Asenda lisamisel** — `ConfirmPanel` failis `AddToTaskDropdown` pakub "Lisa juurde" või "Asenda olemasolevad". Õpetajale, kes uuendab ülesannet — vajalik funktsioon.

- [ ] **3.4. Puudub ülesande kopeerimine (dubleerimine)** — õpetaja tahab luua ülesande variante erinevatele gruppidele (A1 ja A2 klass). Puudub nupp "Kopeeri ülesanne". Tuleb iga kord nullist luua.
  **Mõju:** Keskmine — tavaline õpetaja töövoog: kohandada ülesannet erinevatele tasemetele.

- [ ] **3.5. Puuduvad grupiülesanded (kaustad/kategooriad)** — kõik ülesanded on ühes lamedas nimekirjas. 20+ ülesandega õpetaja (erinevad klassid, teemad) ei saa neid organiseerida. Puuduvad kaustad, sildid, kategooriad.
  **Mõju:** Kõrge — regulaarsel kasutamisel muutub nimekiri haldamatuks. Otsing puudub `TasksView` vaates (on ainult dropdownis).

- [ ] **3.6. Ülesannete nimekirjas puudub otsing** — `TasksView` näitab kõiki ülesandeid ilma filtrita. `TaskManager` renderdab ülesanded saabumise järjekorras. 30+ ülesandega õpetaja ei leia kiiresti õiget.
  **Mõju:** Kõrge — otsing on olemas `AddToTaskDropdown` komponendis (lausete lisamisel), kuid mitte põhilises ülesannete vaates.

- [ ] **3.7. Ülesannete nimekiri ei näita viimase muutmise kuupäeva** — `TaskRow` näitab "Loodud {kuupäev}", kuid mitte "Muudetud {kuupäev}". Õpetaja ei näe, millist ülesannet ta hiljuti uuendas.
  **Mõju:** Madal — `updatedAt` on olemas `TaskSummary` tüübis, kuid ei kuvata.

- [x] **3.8. Kustutamise kinnitus** — `ConfirmationModal` tekstiga "Kas oled kindel, et soovid ülesande kustutada?" Kaitse juhusliku kustutamise eest.

- [ ] **3.9. Mitmuse viga lausete arvestuses** — `TaskRow` näitab `[N] lauset` kõigi N jaoks, kuid eesti keeles on "1 lause" vs "2 lauset". Kood: `{task.entryCount === 1 ? "lauset" : "lauset"}` — mõlemad harud on identsed!
  **Mõju:** Madal — viga: 1 puhul peaks olema "lause", mitte "lauset". Tõsi, tulemus on siiski loetav.

### Etapp 4: Ülesande detailvaade (Task Detail)

- [x] **4.1. Ülesande detailvaade näitab kõiki kirjeid** — `TaskDetailView` renderdab laused Play-nuppudega. Õpetaja saab igaüht kuulata.

- [x] **4.2. Esita kõik ülesande jaoks** — `useAudioPlayback` võimaldab järjest kogu ülesannet kuulata. Lõplikuks kontrolliks enne õpilastele saatmist.

- [x] **4.3. ZIP eksport** — `downloadTaskAsZip` loob ZIP-faili koos `manifest.json`, `texts.txt` ja WAV failidega. Õpetaja saab alla laadida ja kasutada offline (tunnis ilma internetita, näiteks).

- [ ] **4.4. ZIP ekspordil puudub edenemisriba** — `downloadTaskAsZip` võtab vastu `onProgress` callback'i, kuid `TaskDetailView.handleDownloadZip` ei kasuta seda. 50+ lause korral võib allalaadimine kesta minuti, aga õpetaja näeb ainult `isDownloading` boolean'i (nupp "Laadin...").
  **Mõju:** Keskmine — suurte ülesannete puhul on UX halb: arusaamatu, kui kaua veel oodata.

- [x] **4.5. Kirje kustutamine tagasipööramisega vea korral** — `handleDeleteEntry` uuendab UI-d optimistlikult ja API vea korral pöörab tagasi. Hea UX muster.

- [x] **4.6. "Muuda ülesande lauseid" kopeerib sünteesi** — `handleCopyToSynthesis` viib `CopiedEntriesContext` kaudu laused redigeerimiseks üle. Õpetaja saab muuta ja tagasi salvestada.

- [ ] **4.7. Puudub võimalus lisada lauset otse ülesande detailvaates** — 1 lause lisamiseks tuleb: minna sünteesi → sisestada tekst → "Lisa ülesandesse" → leida ülesanne. Puudub nupp "Lisa lause" otse ülesande detailvaates.
  **Mõju:** Keskmine — väikeste täienduste jaoks on töövoog liiga pikk.

- [ ] **4.8. Puudub lausete redigeerimine kohapeal ülesandes** — õpetaja märkas trükiviga ülesande kirjes → tuleb: "Muuda ülesande lauseid" → süntees → leida lause → parandada → salvestada tagasi (asenda). Puudub võimalus klõpsata ja parandada otse ülesande detailvaates.
  **Mõju:** Keskmine — `updateTaskEntry` meetod on olemas `DataService` klassis, kuid UI ei kasuta seda teksti kohapeal redigeerimiseks.

### Etapp 5: Jagamine õpilastega

- [x] **5.1. Jagamise modaal on selge** — "Kopeeri ja jaga seda linki, et teised saaksid ülesannet vaadata. Sisselogimine pole vajalik." Õige kirjeldus.

- [x] **5.2. Jagamislink ei nõua õpilastelt autentimist** — `/shared/task/:token` töötab anonüümselt. Kriitilise tähtsusega koolikontekstis — õpilastel ei pruugi olla Google/TARA kontosid.

- [x] **5.3. Jagamise tühistamine** — `handleRevokeShare` võimaldab jagamist tühistada. Õpetaja saab ligipääsu tagasi võtta.

- [ ] **5.4. Puudub jagatud ülesande vaatamiste jälgimine** — õpetaja ei tea, kas õpilane avas lingi, kas kuulas heli. Puudub analüütika: "15 õpilast 25-st avasid ülesande".
  **Mõju:** Kõrge — hariduskontekstis on kodutöö sooritamise jälgimise puudumine suur lünk.

- [ ] **5.5. Üks jagamislink ülesande kohta** — puudub võimalus luua erinevaid linke erinevatele õpilastele/klassidele jälgimisega. Jagamistõend on üks ülesande kohta.
  **Mõju:** Keskmine — edasijõudnud kasutuse jaoks, kuid MVP-le piisav.

- [ ] **5.6. Jagamislingi kehtivus (90 päeva) võib olla ebapiisav** — õppeaasta on ~9 kuud. Septembris loodud ülesanne aegub detsembris. Õpetaja peab linke uuesti looma.
  **Mõju:** Keskmine — kas pikendada TTL-i hariduse kasutusjuhu jaoks või lisada pikendamise võimalus.

- [ ] **5.7. Puudub jagamine ilma ülesannet loomata** — õpetaja tahab kiiresti saata 1 lauset õpilasele. Tuleb: luua ülesanne → lisada lause → jagada. Puudub "kiire jagamine" sünteesi vaates.
  **Mõju:** Madal — ülesanded organisatsioonilise üksusena on mõistlik abstraktsioon, kuid kiire jagamine oleks kasulik.

### Etapp 6: Klassile orienteeritud funktsioonid

- [ ] **6.1. Puudub "klassi" või "grupi" mõiste** — õpetaja ei saa luua klassi, lisada õpilasi, määrata ülesandeid grupile. Kõik käsitsi jagamislinkide kaudu.
  **Mõju:** Kõrge — süstemaatiliseks kasutamiseks koolis on vaja minimaalset LMS-funktsionaalsust. MVP jaoks vastuvõetav, tootmis-haridusvahendi jaoks blokeerija.

- [ ] **6.2. Puudub õpetaja töölaud** — `/dashboard` marsruut on olemas, kuid `Dashboard` komponent (lazy loaded) ei sisalda õpetajaspetsiifilist teavet. Puudub ülevaade: mitu ülesannet, mitu õpilast kasutab, millised ülesanded on aktiivsed.
  **Mõju:** Keskmine — dashboard marsruut on olemas, kuid pole õpetajale asjakohase sisuga täidetud.

- [ ] **6.3. Puudub eksport aruandluseks** — õpetaja ei saa eksportida ülesannete nimekirja, kasutusstatistikat, aruannet direktorile. Ainult üksiku ülesande ZIP.
  **Mõju:** Keskmine — kooliaruandlus nõuab sageli haridustehnoloogia kasutamise tõendeid.

### Etapp 7: Kvaliteet ja täpsus

- [x] **7.1. Hääldusvariantide kontroll** — õpetaja saab sõnal klõpsata ja näha häälduse variante. Kasulik ettevalmistuseks: kontrollida, milline variant on konkreetses kontekstis õige.

- [ ] **7.2. Puudub "õige variandi" märgistus** — variantide paneel näitab kõiki variante ilma prioriteetideta. Õpetaja peab ise teadma, milline variant on standardne. Puudub märgistus "soovituslik" / "kõnekeelne".
  **Mõju:** Keskmine — hea eesti keele tundmisega õpetajale pole probleem. Noorele õpetajale või mitte-emakeelekõnelejale on keeruline.

- [ ] **7.3. Puuduvad õpetaja märkmed / kommentaarid kirjetel** — õpetaja ei saa lisada märget: "Pöörake tähelepanu rõhule 3. silbis" lause kõrvale ülesandes. Kirjel on ainult `text` ja `stressedText`.
  **Mõju:** Keskmine — annotatsioonid oleksid pedagoogilises kontekstis kasulikud.

### Etapp 8: Turvalisus ja privaatsus

- [x] **8.1. Ülesanded on seotud userId-ga** — `Task.userId` tagab, et õpetaja näeb ainult oma ülesandeid.

- [ ] **8.2. Kas jagatud ülesanne näitab õpetaja nime?** — `SharedTaskPage` ei näita ülesande autorit. See on nii hea (privaatsus) kui halb (õpilane ei tea, kellelt ülesanne tuli). Puudub omistamine.
  **Mõju:** Madal — disainiotsus. Kuid hariduskontekstis: "Ülesande koostaja: Kaire Tamm" oleks kasulik.

- [x] **8.3. TARA auth Eesti õpetajatele** — TARA (ID-kaart / Mobiil-ID) esmase sisselogimisviisina — õige valik riigikoolide õpetajatele.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Õpetaja onboarding | 4 | 2 | 2 |
| Materjalide loomine | 6 | 2 | 4 |
| Ülesannete haldamine | 9 | 4 | 5 |
| Ülesande detailvaade | 8 | 5 | 3 |
| Jagamine | 7 | 3 | 4 |
| Klassifunktsioonid | 3 | 0 | 3 |
| Kvaliteet ja täpsus | 3 | 1 | 2 |
| Turvalisus | 3 | 2 | 1 |
| **Kokku** | **43** | **19** | **24** |

## Top-5 probleemid (mõju õpetajale)

1. **Puudub hulgi-kleepimine / import** (#2.3, #2.4) — õpetaja ei saa kiiresti materjale õpikust laadida
2. **Puudub otsing/organiseerimine** (#3.5, #3.6) — lame nimekiri ilma kaustade, siltide, otsinguta
3. **Puudub kasutuse jälgimine** (#5.4) — õpetaja ei tea, kas õpilane täitis ülesande
4. **Puudub klassi/grupi haldamine** (#6.1) — kõik käsitsi jagamislinkide kaudu
5. **Puudub kohapeal redigeerimine ülesande detailvaates** (#4.7, #4.8) — trükivea parandamine nõuab mitmeetapilist töövoogu

## Mis on hästi tehtud

- Rollispetsiifiline onboarding wizard õige fookusega ülesannete loomisele
- Jagamine ilma autentimiseta õpilastele — kooli jaoks kriitilise tähtsusega
- ZIP eksport helifailidega — offline kasutamiseks tunnis
- Lisa juurde / Asenda ülesandesse lisamisel
- Optimistlikud UI uuendused tagasipööramisega vigade korral
- TARA auth esmasena — õige riigisektori jaoks

## Viga

- **Mitmuse käänamine:** `TaskManager.tsx` rida 89: `{task.entryCount === 1 ? "lauset" : "lauset"}` — mõlemad harud on identsed. Peaks olema `"lause" : "lauset"`.
