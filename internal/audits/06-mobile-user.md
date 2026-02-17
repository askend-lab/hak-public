# Audit: Mobiilne kasutaja (Nutitelefoni kasutaja)

**Vaatenurk:** Kasutaja, kes kasutab platvormi ainult nutitelefoniga. Responsive disain, puuteekraan, aeglane ühendus, väike ekraan.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — HTML/CSS struktuur, breakpoints, puuteinteraktsioonid, jõudlus.

---

## Kasutajaprofiil

Anna, 28-aastane, Ukrainast pärit, töötab Tallinnas klienditeenindajana. Kasutab iPhone SE (väike ekraan, 375px). Arvutit ei oma. Harjutab eesti keelt bussisõidu ajal. 4G ühendus, mõnikord aeglane. Tahab kiiresti lauset sisestada ja hääldust kuulata.

---

## Mobiilse kasutaja teekond

### Etapp 1: Responsive disain ja breakpoints

- [x] **1.1. Mobile-first lähenemine CSS-is** — `_breakpoints.scss` defineerib breakpoint'id alates 375px (iPhone SE). Mixinid kasutavad `min-width` (mobile-first). See on õige lähenemine.

- [x] **1.2. Navigatsioon peidetud mobiilis** — `_header.scss`: `.header-nav { display: none; }` vaikimisi, nähtav alates `@include tablet` (768px). Mobiilil on rohkem ruumi sisule.

- [ ] **1.3. Puudub mobiilne hamburger-menüü** — navigatsioon on mobiilil peidetud, aga puudub hamburger-menüü selle asendamiseks. CSS-is on `.header-nav--mobile` stiil ettevalmistatud, kuid komponendis `AppHeader.tsx` pole mobiilset menüünuppu ega menüüd.
  **Mõju:** Kõrge — mobiilne kasutaja ei pääse "Ülesanded" lehele ega näe navigatsiooni. Ainus viis pääseda ülesannete juurde on otse URL-i sisestada või klikida "Lisa ülesandesse" → login → redirect.

- [x] **1.4. Kaheveeru paigutus muutub üheveeruliseks** — `_page-layout-base.scss`: `.page-content--two-column` muutub `grid-template-columns: 1fr` alla `$breakpoint-lg` (1024px). Mobiilil on kogu sisu ühes veerus.

- [ ] **1.5. Header kõrgus on mobiilil 52px** — `_page-layout-base.scss` seab mobiilil 52px kõrguse, tahvelarvutil 60px. 52px on piisav, aga logo + funktsiooninupud peavad mahtuma 375px laiusele ekraanile miinus padding (16px × 2 = 32px → 343px kasutatavat ruumi).
  **Mõju:** Madal — kitsas, aga tõenäoliselt toimib. Vajaks visuaalset testimist.

### Etapp 2: Puuteinteraktsioonid

- [ ] **2.1. Drag-and-drop ei tööta puuteekraanil** — `SentenceSynthesisItem` kasutab HTML5 `draggable` atribuuti ja `onDragStart/onDragEnd/onDragOver/onDrop` sündmusi. HTML5 drag-and-drop API ei tööta mobiilsetes brauserites natiivilt. Puudub `touchstart/touchmove/touchend` käsitlus.
  **Mõju:** Kõrge — lausete ümberjärjestamine on mobiilil võimatu. Polyfill (nt `mobile-drag-drop`) ega alternatiivne lahendus (üles/alla nupud) puudub.

- [ ] **2.2. Puuduvad swipe-žestid** — pole swipe-to-delete, swipe-to-share ega muid mobiilseid žeste. Kõik toimingud nõuavad klõpsamist menüüdes.
  **Mõju:** Madal — standardsed veebilehe interaktsioonid, aga native-like kogemus oleks parem.

- [x] **2.3. Nupud on piisavalt suured puuteekraanile** — `PlayButton` ja muud nupud kasutavad `width/height: 36px+`. Miinimum puuteala suurus (44×44px WCAG soovitus) on enamasti täidetud.

- [ ] **2.4. Menüü dropdown'id võivad mobiilil ekraanilt välja minna** — `useDropdownPosition` hook arvutab menüü positsiooni, kuid `SentenceMenu` ja `TaskManager` dropdown'id on absoluutselt positsioneeritud. Väikesel ekraanil võivad need ekraani servast välja minna.
  **Mõju:** Keskmine — `useDropdownPosition` peaks seda käsitlema, aga pole kindel ilma visuaalse testimiseta.

- [ ] **2.5. Tag-menüü on puuteekraanil raskesti kasutatav** — sõnamärgendi klõpsamine avab menüü/variantide paneeli. Väikesel ekraanil on sõnad üksteise lähedal ja vale sõna valimine on tõenäoline. Puudub suurendatud puutealad märgendite jaoks.
  **Mõju:** Keskmine — fondisuurus ja märgendi polsterdus (padding) on CSS-ist sõltuvad.

### Etapp 3: Sisestamine väikesel ekraanil

- [ ] **3.1. Virtuaalne klaviatuur katab sisestusvälja** — mobiilil avab tekstivälja klõpsamine virtuaalse klaviatuuri, mis katab ekraani alumise poole. Kui sisestusväli on lehe allosas, võib see kaduda klaviatuuri alla. Pole `scrollIntoView` või `visualViewport` API käsitlust.
  **Mõju:** Keskmine — standardne mobiilne probleem, mida brauserid üldiselt käsitlevad, aga SPA-des võib tekkida probleeme.

- [x] **3.2. Sisestusväli on kogu laiuses** — `SentenceSynthesisItem` sisestusväli võtab saadaoleva laiuse. Mobiilil on kogu ekraani laius kasutuses. Hea.

- [ ] **3.3. Automaatne suurtähemärkide käitumine** — mobiilsed klaviatuurid alustavad suurtähega. `TagsInput` sisestusväljal puudub `autoCapitalize="none"` atribuut. See võib segada eestikeelset sisestust (nt "Noormees" peaks olema "noormees" lause keskel).
  **Mõju:** Madal — eesti keeles ei ole oluline erinevus, aga foneetiline analüüs võib erineda.

- [ ] **3.4. Puudub `inputMode` atribuut** — sisestusväljal pole `inputMode="text"` ega muid mobiilspetsiifilisi atribuute. Pole kriitiline, aga `enterkeyhint="go"` (Enter-klahvi märgis) oleks kasulik mobiilsel klaviatuuril.
  **Mõju:** Madal — mugavusfunktsioon.

### Etapp 4: Jõudlus ja laadimisaeg

- [ ] **4.1. Bundle suurus pole analüüsitud** — selles auditis ei ole bundle suurust mõõdetud. Kuid importide analüüs näitab: React, React Router, JSZip (ZIP ekspordi jaoks), Sentry — need suurendavad bundle'it. Aeglasel 3G-l (750 kbps) võib esmane laadimine olla aeglane.
  **Mõju:** Keskmine — lazy loading on kasutusel (`SpecsPage`, `Dashboard` on lazy), aga põhikomponendid (Synthesis, Tasks) laetakse kohe.

- [ ] **4.2. Helifailide laadimine aeglasel ühendusel** — `synthesizeAuto` saadab API päringu ja ootab WAV-faili. 3G ühendusel võib WAV-fail (~100KB lause kohta) laadida mitu sekundit. Pole progressi indikaatorit (ainult spinner).
  **Mõju:** Keskmine — spinner on olemas, aga pole "Laadimine 45%..." tüüpi teadet.

- [ ] **4.3. Puudub Service Worker / PWA** — pole `serviceWorker.ts`, pole `manifest.json` (PWA jaoks), pole offline-vahemälu. Rakendus ei tööta offline. Pole "Lisa avakuvale" (Add to Home Screen) funktsionaalsust.
  **Mõju:** Kõrge — mobiilne kasutaja, kes harjutab bussisõidu ajal, kaotab ühenduse tunnelites. PWA võimaldaks eelnevalt sünteesitud heli vahemälust esitada.

- [x] **4.4. Audio caching on olemas** — `useSynthesisOrchestrator` salvestab `audioUrl` ja `phoneticText` lause olekusse. Kordussüntees kasutab vahemälu. See vähendab võrgupäringuid.

- [x] **4.5. Lazy loading kasutuses** — `SpecsRoute`, `Dashboard` ja mõned muud komponendid on `React.lazy()` abil laetud. Vähendab esmast bundle'i suurust.

### Etapp 5: Mobiilspetsiifiline UX

- [ ] **5.1. Puudub "Tõmba alla värskendamiseks" (Pull to refresh)** — tavaline mobiilne muster puudub. Kui olek rikkub, peab kasutaja lehte käsitsi uuesti laadima.
  **Mõju:** Madal — pole kriitiline SPA jaoks.

- [ ] **5.2. Footer on mobiilil pikk** — `Footer` komponent sisaldab palju sisu: kontaktandmed, lingid, tagasiside. Mobiilil tuleb palju kerida (scroll). Footer võtab märkimisväärse ekraaniruumi.
  **Mõju:** Madal — standardne, aga mobiilil võiks footer olla kokku pandav (collapsible).

- [ ] **5.3. Variantide paneel mobiilil** — `PronunciationVariants` avaneb paneelina. Mobiilil peaks see olema täisekraani modaal (bottom sheet), mitte kõrvalpaneel.
  **Mõju:** Keskmine — kaheveerulises paigutuses on paneel kõrval; üheveerulises (mobiil) on ta lause all. Kuid bottom sheet muster oleks mobiilile loomulikum.

- [ ] **5.4. Share modal mobiilil** — `ShareTaskModal` sisaldab pikka URL-i sisestusvälja. Mobiilil on URL-i vaatamine ja kopeerimine kitsas. Pole `navigator.share()` Web Share API kasutust, mis võimaldaks natiivset jagamist (WhatsApp, SMS jne).
  **Mõju:** Keskmine — `navigator.share()` on toetatud enamikes mobiilsetes brauserites ja oleks palju mugavam kui clipboard.

- [ ] **5.5. Puudub vibratsioon/haptiline tagasiside** — mobiilsetel seadmetel pole Vibration API kasutust. Heli esitamise, eduka kopeerimise jm korral oleks kerge vibratsioon kasulik tagasiside.
  **Mõju:** Madal — mugavusfunktsioon, mitte hädavajalik.

### Etapp 6: Mobiilne audio

- [ ] **6.1. Autoplay piirangud** — iOS Safari ja mõned Android brauserid blokeerivad automaatse heli esituse ilma kasutaja interaktsioonita. `useAudioPlayer` loob `new Audio()` ja kutsub `.play()`. Esimene mängimine peaks töötama (kasutaja klõpsas nuppu), kuid Play All järjestikune esitamine võib blokeeruda.
  **Mõju:** Kõrge — Play All funktsioon võib iOS-il ebaõnnestuda pärast esimest lauset. `AudioContext` unlock muster puudub.

- [ ] **6.2. Lukustusekraani juhtseadised puuduvad** — pole Media Session API kasutust. Kui kasutaja lukustab ekraani Play All ajal, pole lukustusekraanil kontrollinuppe (paus, järgmine). Heli mängimine võib katkeda.
  **Mõju:** Keskmine — Media Session API oleks kasulik pikema kuulamiskogemuse jaoks.

- [x] **6.3. WAV-failid töötavad mobiilsel** — WAV on universaalselt toetatud formaat. Pole codec'i ühilduvusprobleeme.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Responsive disain | 5 | 3 | 2 |
| Puuteinteraktsioonid | 5 | 1 | 4 |
| Sisestamine | 4 | 1 | 3 |
| Jõudlus | 5 | 2 | 3 |
| Mobiilne UX | 5 | 0 | 5 |
| Mobiilne audio | 3 | 1 | 2 |
| **Kokku** | **27** | **8** | **19** |

## Top-5 probleemid (mõju mobiilsele kasutajale)

1. **Puudub mobiilne hamburger-menüü** (#1.3) — navigatsioon pole mobiilil saadaval
2. **Drag-and-drop ei tööta puuteekraanil** (#2.1) — lausete ümberjärjestamine võimatu
3. **Puudub PWA / Service Worker** (#4.3) — offline kasutamine pole võimalik
4. **iOS autoplay piirangud** (#6.1) — Play All võib iOS-il ebaõnnestuda
5. **Puudub Web Share API** (#5.4) — natiivne jagamine pole saadaval

## Mis on hästi tehtud

- Mobile-first CSS lähenemine õigete breakpoint'idega
- Navigatsioon peidetud mobiilil (rohkem ruumi sisule)
- Kaheveeru → üheveeru responsive paigutus
- Audio caching vähendab võrgupäringuid
- Lazy loading komponentidele
- Piisavalt suured nupud puuteekraanile
- WAV formaadi universaalne tugi
