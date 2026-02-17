# Audit: Algaja õppija (Õppija)

**Vaatenurk:** Inimene, kes valdab eesti keelt halvasti ja tuli õppima hääldust.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — kogu kasutajateekond esimesest külastusest regulaarse kasutamiseni.

---

## Kasutajaprofiil

Maria, 35-aastane, kolis Eestisse Ukrainast. Valdab eesti keele aluseid (A2), kuid hääldus on nõrk — kolleegid ei saa alati aru. Tahab harjutada hääldust kodus. Pole eriti enesekindel arvutikasutaja, telefoni kasutab aktiivselt.

---

## Kasutajateekond (User Journey)

### Etapp 1: Esimene külastus

- [x] **1.1. Rakendus laadib ilma autentimiseta** — süntees on kohe saadaval, sisselogimist pole vaja. See on õige: vähendab sisenemisbarjääri. Õppija saab kohe proovida.

- [x] **1.2. Rolli valik esimesel külastusel** — `RoleSelectionPage` näitab 3 kaarti: Õppija, Õpetaja, Uurija. Algajale on selge, et valida tuleb "Õppija". Kirjelduse tekst on arusaadav: "Sisesta lause ja kuula, kuidas see kõlab."

- [x] **1.3. Onboarding wizard käivitub pärast rolli valikut** — 5 sammu õppijale: teksti sisestus → kuulamine → hääldusvariantide uurimine → lausete lisamine → ülesandesse salvestamine. Hea järjestus.

- [ ] **1.4. Onboarding wizard ei selgita, mis on "hääldusvariant"** — samm 3 ütleb "Kliki sõnal, et näha erinevaid häälduse variante", kuid algajale on arusaamatu, milleks on vaja hääldusvariante ja mida nendega teha. Puudub kontekst: "Eesti keeles on sõnadel mitu hääldusviisi. Siin saad valida sobiva."
  **Mõju:** Keskmine — õppija võib olulise funktsiooni vahele jätta või segadusse sattuda.

- [ ] **1.5. Wizardi saab juhuslikult klõpsuga vahele jätta** — klõps overlay'l (`wizard__overlay onClick={onSkip}`) sulgeb kogu wizardi. Ebakindla kasutaja jaoks, kes klõpsas kogemata tooltip'ist mööda, kaob wizard jäädavalt. `saveToStorage(true, ...)` kirjutab completed=true.
  **Mõju:** Kõrge — õppija kaotab onboarding'u. Päises olev "Abi ja juhend" nupp võimaldab rolli valikule tagasi minna, kuid see pole ilmne.

- [ ] **1.6. Wizardi ei saa lähtestamata uuesti läbida** — `resetOnboarding` on koodis olemas, kuid pole kasutajaliideses saadaval. Päises olev "?" nupp (`onHelpClick`) suunab `/role-selection` lehele, mis käivitab wizardi uuesti, kuid õppija ei tea sellest.
  **Mõju:** Keskmine — puudub selge nupp "Läbi juhend uuesti".

### Etapp 2: Põhiline suhtlus (Süntees)

- [x] **2.1. Lehe pealkiri on selge** — "Muuda tekst kõneks" alapealkirjaga "Sisesta lause või sõna, et kuulata selle hääldust ja uurida variante". A2 õppija jaoks piisavalt loetav.

- [x] **2.2. Tekstiväli on sisestuseks valmis** — `SentenceSynthesisItem` režiimis `input` näitab sisestusvälja koos Play-nupuga. Intuitiivselt arusaadav.

- [ ] **2.3. Sisestusväljal puudub placeholder-tekst** — `placeholder` prop edastatakse, kuid `SynthesisView` ei sea vaikeväärtust. Sisestusväli on tühi ilma vihjeta. Algaja ei pruugi aru saada, mida sisestada — sõna? lause? lõik?
  **Mõju:** Keskmine — placeholder nagu "Nt: Tere, kuidas läheb?" aitaks orienteeruda.

- [ ] **2.4. Puuduvad näited või kiirfraasid algajatele** — pärast wizardi näeb õppija tühja välja. Pole nuppu "Proovi näidislauset" ega soovitatud fraase harjutamiseks. Kogenud kasutaja kirjutab ise, kuid algaja võib takerduda.
  **Mõju:** Kõrge — tühja ekraani esmamulje võib olla eemaletõukav. Demo laused seatakse ainult wizardi ajal (`setDemoSentences`), kuid pärast wizardi lõpetamist neid ei salvestata.

- [x] **2.5. Play-nupul on laadimise olek** — `PlayButton` näitab laadimisel spinner'it ja `aria-live="polite"` tekstiga "Laadimine..." / "Esitamine". Hea UX ja ligipääsetavuse jaoks.

- [ ] **2.6. Sünteesi vea korral puudub visuaalne tagasiside** — `useSynthesisOrchestrator` teeb vea korral `updateSentence(id, { isLoading: false, isPlaying: false })` ja `logger.error`. Kasutaja näeb, et spinner kadus, kuid ei saa ühtegi teadet — nupp lihtsalt pöördub algolekusse tagasi. Arusaamatu: kas ei tööta? sõna on vale? server kukkus?
  **Mõju:** Kõrge — vaiksed vead on algajate jaoks üks halvimaid UX-mustreid. Vaja on toast-teadet: "Häälduse loomine ebaõnnestus. Proovi uuesti."

- [ ] **2.7. Puudub sisestuspiirang ja viimase pikkuse vihje** — backend piirab teksti 1000 tähemärgiga (`MAX_TEXT_LENGTH`), kuid frontend ei näita tähemärgiloendust ega hoiatust limiidile lähenemisel. Õppija võib sisestada pika teksti, vajutada Play ja saada vaikse vea.
  **Mõju:** Keskmine — lisada tähemärgiloendur ja/või hoiatus.

### Etapp 3: Häälduse uurimine (Variandid)

- [ ] **3.1. Lause menüü on algajale ülekoormatud** — `SentenceMenu` näitab 5 punkti: "Lisa ülesandesse", "Uuri häälduskuju", "Lae alla .wav fail", "Kopeeri tekst", "Eemalda". Algajale on "Uuri häälduskuju" ja ".wav fail" arusaamatud terminid. Puuduvad ikoonid visuaalseks navigatsiooniks (peale chevron ja add icon).
  **Mõju:** Keskmine — menüü on funktsionaalne, kuid visuaalsed vihjed (ikoonid) aitaksid navigeerida.

- [ ] **3.2. Veateade "Variante ei leitud" on algajale mitteinformatiivne** — `VARIANTS_STRINGS.NOT_FOUND_DESC`: "Sõna ei leidu eesti keeles või on valesti kirjutatud." Õppijale, kes sisestas sõna veaga, see ei aita — puudub vihje, kuidas parandada. Pole soovitust "Kas mõtlesid: [õige sõna]?"
  **Mõju:** Keskmine — õppeplatvormil on õigekirjakontrolli soovituste puudumine kasutamata jäetud võimalus.

- [x] **3.3. Sõnal klõpsamine avab variandid** — klõps sõnal lauses avab variantide paneeli. Hea muster — õppija saab iga sõna uurida.

- [ ] **3.4. Puudub selgitus, mida hääldusvariantid tähendavad** — kui õppija näeb variantide nimekirja (VariantsList), pole selgitust, mille poolest need erinevad. Foneetiline märgistus on lingvistilise hariduseta inimesele arusaamatu.
  **Mõju:** Keskmine — "Vali sobiv hääldusvariant" eeldab, et õppija teab, milline variant on "sobiv". Vaja oleks vähemalt Play-ikooni iga variandi juures kuulamiseks.

### Etapp 4: Salvestamine ja organiseerimine

- [x] **4.1. Nupp "Lisa ülesandesse" on arusaadav** — SynthesisPageHeader'is näitab lausete arvu. Õppijale on "ülesanne" tuttav sõna.

- [ ] **4.2. Salvestamine nõuab autentimist, kuid seda pole eelnevalt selgitatud** — "Lisa ülesandesse" klõpsamisel ilma autentimiseta avaneb `LoginModal`. Enne klõpsu pole märget, et funktsioon nõuab sisselogimist. Õppija võib sisestada 10 lauset, vajutada "salvesta" ja saada teada, et on vaja kontot. Laused ei kao (salvestatud state'is), aga hetk on ebameeldiv.
  **Mõju:** Keskmine — lisada tooltip või märge "Nõuab sisselogimist" salvestamisnupu juurde.

- [ ] **4.3. Login modal ei selgita autentimise eeliseid** — tekst "Sisene oma Google kontoga, et luua ja hallata ülesandeid" on minimaalne. Õppijale pole ilmne: miks mul on ülesandeid vaja? mida konto annab? Puuduvad punktid: "✓ Salvesta harjutused ✓ Jaga õpetajaga ✓ Jätka hiljem".
  **Mõju:** Madal — funktsionaalselt töötab, kuid conversion rate oleks kõrgem parema väärtuspakkumisega.

- [x] **4.4. Kaks autentimisviisi** — TARA (ID-kaart/Mobiil-ID) ja Google. Eesti elanikule on mõlemad tuttavad. TARA — esmane, Google — teisene. Õige prioriteet.

- [ ] **4.5. Pärast sisselogimist pole automaatset tagasipöördumist toiminguni** — kui õppija vajutas "Lisa ülesandesse" → avanes LoginModal → logis sisse → suunati "/" → õppija on sünteesi lehel, kuid kontekstimenüü (lisa ülesandesse) on juba suletud. Tuleb uuesti nuppu vajutada.
  **Mõju:** Madal — laused säilivad state'is, kuid UX katkeb. `pendingTasksViewAccess` käsitleb suunamist `/tasks` lehele, kuid mitte "lisa ülesandesse" konteksti.

### Etapp 5: Ülesande saamine õpetajalt (Jagatud ülesanne)

- [x] **5.1. Jagatud ülesanne on saadaval ilma autentimiseta** — `SharedTaskPage` ei nõua sisselogimist. Õppija saab lingist õpetajalt ja näeb kohe ülesannet.

- [x] **5.2. Banner selgitab konteksti** — "Jagatud ülesanne" kirjeldusega "Kopeeri laused, et neid muuta ja uusi versioone luua. Jagamislink kehtib 90 päeva." Arusaadav ja kasulik.

- [x] **5.3. Nupp "Kopeeri" kopeerib laused sünteesi** — pärast klõpsu suunatakse `/synthesis` lehele eeltäidetud lausetega. Hea töövoog õppija jaoks.

- [ ] **5.4. Vigase jagamistõendi viga on arusaamatu** — "Ülesannet ei leitud" selgitusega "Jagamislink võib olla aegunud, tühistatud või vigane." Hea kirjeldus, kuid puudub nupp "Tagasi avalehele" või muu toiming — õppija satub tupikusse.
  **Mõju:** Keskmine — puudub navigatsioon jagatud ülesande vea olekust. Pole päist navigatsiooniga ega tagasinuppu.

### Etapp 6: Korduv kasutamine

- [x] **6.1. Olek salvestatakse localStorage'sse** — `useSentenceState` salvestab laused sessioonide vahel. Õppija sulges vahekaardi — avas uuesti — laused on paigas.

- [ ] **6.2. Puudub ajalugu või progress** — pärast harjutamist pole ühtegi jälgimist: mitu sõna kuulati, kui palju aega kulus, millised sõnad olid rasked. Õppeplatvormil on see põhiline motivatsioonifunktsioon.
  **Mõju:** Kõrge — ilma progressita on õppijal raske hinnata oma pingutusi ja end motiveerida jätkama.

- [ ] **6.3. Puuduvad meeldetuletused või soovitused** — platvorm on passiivne: õppija peab ise otsustama, mida harjutada. Pole "Sõnad, mida peaksid harjutama", pole päevaeesmärke, pole järjepidavusloendust.
  **Mõju:** Keskmine — MVP jaoks on see normaalne, kuid õppeplatvormil jääb retention madalaks.

### Etapp 7: Ligipääsetavus ja mugavus

- [x] **7.1. Skip link on olemas** — "Liigu põhisisu juurde" failis `App.tsx`. Standardne ligipääsetavuse praktika.

- [x] **7.2. ARIA sildid eesti keeles** — "Sulge juhend", "Eelmine samm", "Järgmine samm", "Lohista järjestamiseks", "Rohkem valikuid". Õige keel sihtrühma jaoks.

- [ ] **7.3. PlayButton aria-sildid inglise keeles** — `getAriaLabel()` tagastab "Loading", "Playing", "Play" — inglise keeles. Kõik teised sildid on eesti keeles. Ekraanilugeja kasutaja kuuleb keelte segu.
  **Mõju:** Keskmine — peaks olema "Laadimine", "Esitamine", "Esita".

- [ ] **7.4. Drag-and-drop ilma klaviatuurialternatiivita** — `SentenceSynthesisItem` atribuudiga `draggable` pole klaviatuuriga ligipääsetavat viisi lausete järjekorra muutmiseks. Piiratud motoorikaga õppija jaoks pole ümberjärjestamine võimalik.
  **Mõju:** Keskmine — dokumenteeritud AccessibilityPage'is teadaoleva puudujäägina. Kuid avaliku sektori õppeplatvormi jaoks on see vastavusprobleem.

### Etapp 8: Üldmulje kasutajaliidesest

- [x] **8.1. Cookie consent nupuga "Keeldun"** — GDPR-ga vastavuses koos keeldumise võimalusega.

- [x] **8.2. Privaatsuspoliitika ja ligipääsetavuse teatis on olemas** — `/privacy` ja `/accessibility` on jaluses saadaval. Professionaalselt vormistatud eesti keeles.

- [ ] **8.3. Jalus sisaldab palju õppijale mitteasjakohast teavet** — EKI aadress, registrikood, keelenõu number. Välismaalasest õppijale A2 tasemel on see infomüra. Tagasiside link (eki@eki.ee) on kontaktide hulgas peidetud.
  **Mõju:** Madal — standardne riigiasutuse jalus, kuid tagasiside link võiks olla silmapaistvam.

- [ ] **8.4. Puudub liidese keel peale eesti keele** — kogu UI on ainult eesti keeles. A2-tasemel õppijale võivad mõned UI elemendid olla arusaamatud: "Uuri häälduskuju", "Hääldusabiline", "Ligipääsetavuse teatis". Puudub keelevahetaja vene/inglise keelele.
  **Mõju:** Kõrge — sihtrühm (eesti keele õppijad) definitsiooni järgi ei valda eesti keelt täielikult. Liides õpitavas keeles on nii pedagoogiline võte (keelekümblus) kui barjäär. Miinimum: olulised veateated ja onboarding vene/inglise keeles.

- [ ] **8.5. Puudub tume teema** — pikaajaliste harjutussessioonide jaoks (õhtul) pole dark mode'i. Pole kriitiline, aga kaasaegne ootus.
  **Mõju:** Madal.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Esimene külastus / Onboarding | 6 | 3 | 3 |
| Põhiline süntees | 7 | 2 | 5 |
| Hääldusvariantid | 4 | 1 | 3 |
| Salvestamine / Auth | 5 | 2 | 3 |
| Jagatud ülesanded | 4 | 3 | 1 |
| Korduv kasutamine | 3 | 1 | 2 |
| Ligipääsetavus / UI | 5 | 2 | 3 |
| Üldine UI | 5 | 2 | 3 |
| **Kokku** | **39** | **16** | **23** |

## Top-5 probleemid (mõju õppijale)

1. **Sünteesi vea korral puudub tagasiside** (#2.6) — õppija ei saa aru, mis juhtus
2. **Puuduvad näited/kiirfraasid** (#2.4) — tühi ekraan pärast onboarding'ut tõukab eemale
3. **UI ainult eesti keeles** (#8.4) — sihtrühm definitsiooni järgi ei valda keelt
4. **Puudub progress/ajalugu** (#6.2) — motivatsioon jätkata puudub
5. **Wizard sulgub juhusliku klõpsuga** (#1.5) — õppija kaotab onboarding'u

## Mis on hästi tehtud

- Süntees ilma autentimiseta — null sisenemisbarjäär
- Rollipõhine onboarding wizard — õige lähenemine
- Jagatud ülesanded töötavad ilma sisselogimiseta — õpetaja→õppija töövoog sujuv
- Cookie consent keeldumise nupuga
- Head ARIA sildid (välja arvatud PlayButton)
- Olek säilib sessioonide vahel
