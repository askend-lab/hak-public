# Audit: Eakas kasutaja (Pensionär)

**Vaatenurk:** Pensionär, kes kolis Eestisse ja õpib eesti keelt. Vajab suurt fonti, lihtsat navigatsiooni, selgeid juhiseid ja veataluvust.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — ligipääsetavus, fondi suurus, kontrastsus, lihtne navigatsioon, vigade käsitlus.

---

## Kasutajaprofiil

Viktor, 68-aastane, pensionär Venemaalt, elab Tartus 3 aastat. Eesti keel A1–A2 tasemel. Kasutab vana sülearvutit Windows 10-ga, brauser Chrome. Kannab prille, sõrmed ei ole nii täpsed. Tütar aitas platvormi avada ja näitas, kuidas kasutada. Vajab suuri nuppe, selget teksti ja andestust vigade korral.

---

## Eaka kasutaja teekond

### Etapp 1: Esmane kasutamine

- [x] **1.1. Platvorm ei nõua kontot** — Viktor saab kohe alustada. Pole vaja registreeruda, meelt pidada parooli ega sisestada e-posti. Suurepärane eakale kasutajale.

- [ ] **1.2. Rolli valik võib segadust tekitada** — `RoleSelectionPage` pakub 3 rolli: Õppija, Õpetaja, Uurija. Eakale võib "Uurija" olla arusaamatu. Pole selge, miks peab rolli valima — "Ma tahan lihtsalt eesti keelt harjutada."
  **Mõju:** Keskmine — rolli valik on lisa-samm, mis ei aita eakat kasutajat. Parem oleks vaikerolli automaatne määramine võimalusega muuta.

- [ ] **1.3. Wizard tooltip'id on väikesed** — `WizardTooltip` kasutab `wizard__content` klassi. Tooltip'i tekst on tavaline fondisuurus. Eakale, kes kannab prille ja istub ekraanist kaugemal, võib tekst olla raskesti loetav.
  **Mõju:** Keskmine — tooltip'id on ainus juhend. Kui tekst on liiga väike, jääb juhend kasutamata.

- [ ] **1.4. Wizard sammu indikaator on pisike** — `wizard__dots` näitab väikesi punkte praeguse sammu kohta. Eakale on need raskesti eristatavad.
  **Mõju:** Madal — kosmeetiline, aga "Samm 2/5" tekst oleks selgem.

### Etapp 2: Teksti sisestamine

- [x] **2.1. Sisestusväli on piisavalt suur** — `sentence-synthesis-item__input` on tavaline tekstiväli. Fondisuurus sõltub CSS-ist, mida siin ei analüüsita, kuid HTML struktuur on standardne.

- [ ] **2.2. Placeholder tekst puudub vaikimisi** — tühi väli ilma vihjeta. Eakas ei pruugi aru saada, mida teha. `TagsInput` default placeholder on "Kirjuta sõna või lause ja vajuta Enter", mis on hea, AGA ainult kui `tags.length === 0` — see on õige käitumine.
  **Mõju:** Madal — placeholder on tegelikult olemas, kui pole märgendeid. Koodist: `placeholder || "Kirjuta sõna või lause ja vajuta Enter"`.

- [ ] **2.3. Enter-klahvi nõue pole ilmne** — eakas kasutaja võib otsida "Esita" nuppu pärast teksti sisestamist. Play-nupp on olemas, aga Enter-klahvi kasutamine pole visuaalselt vihjetud. Pole "Vajuta Enter kuulamiseks" teksti.
  **Mõju:** Keskmine — Play-nupp on alternatiiv, aga eakas ootab selget visuaalset juhist.

- [ ] **2.4. Trükivigade käsitlus puudub** — eakas teeb sageli trükivigu. Pole spell-check'i (spellCheck={false} on seatud), pole "Kas mõtlesid?" soovitust. Kui Viktor kirjutab "kooli" asemel "kooli " (üleliigne tühik), töötab normaalselt, aga "kooöli" ei anna veateadet.
  **Mõju:** Keskmine — `spellCheck={false}` on teadlik otsus (foneetilise sisestuse tõttu), aga eaka kasutaja jaoks oleks spell-check kasulik.

### Etapp 3: Heli esitamine

- [x] **3.1. Play-nupp on visuaalselt selge** — `PlayButton` on piisavalt suur ikooniga. Spinner näitab laadimist. Eakas saab aru.

- [ ] **3.2. Heli võib olla liiga vaikne** — puudub helitugevuse reguleerija rakenduses. Eakas peab kasutama süsteemset helitugevuse kontrolli. Pole selget vihjet "Keerake heli suuremaks".
  **Mõju:** Madal — standardne brauseri/OS käitumine, aga vanematele kasutajatele oleks liideses olevast helitugevuse liugurist kasu.

- [ ] **3.3. Vaikne ebaõnnestumine** — kui süntees ebaõnnestub, pole veateadet (kordab auditi #1 leidu #2.6). Eaka kasutaja jaoks eriti segadusetekitav: "Ma vajutasin nuppu ja midagi ei juhtunud. Kas mu arvuti on katki?"
  **Mõju:** Kõrge — eakas kasutaja ei oska eristada tehnilist viga oma veast. Toast-teade on hädavajalik.

- [ ] **3.4. Puudub heli kiiruse reguleerija** — eakas tahaks aeglasemat esitust, et paremini kuulda ja järele korrata. Backend toetab `speed` parameetrit, aga UI-s puudub liugur.
  **Mõju:** Kõrge — aeglane esitus on eakatele ja algajatele hädavajalik. Backend toetab, frontend mitte.

### Etapp 4: Navigatsioon ja struktuur

- [x] **4.1. Skip link on olemas** — "Liigu põhisisu juurde" failis `App.tsx`. Ligipääsetavuse hea tava.

- [x] **4.2. Lihtne üheleheline struktuur** — põhilehel on kõik vajalik: sisestusväli, Play-nupp, Lisa lause. Pole vaja mitme lehe vahel navigeerida.

- [ ] **4.3. Päise navigatsioon pole eakale optimeeritud** — `AppHeader` sisaldab linke "Süntees", "Ülesanded", "Spetsifikatsioonid". Eakale on "Spetsifikatsioonid" arusaamatu. "Ülesanded" pole ilmne — miks peaks ta sinna minema?
  **Mõju:** Madal — eakas kasutab peamiselt sünteesi lehte ja ignoreerib navigatsiooni.

- [ ] **4.4. Jalus on ülekoormatud** — `Footer` sisaldab palju linke ja teavet. Eakale on raske leida tagasiside linki. Tekst on väike.
  **Mõju:** Madal — standardne riigiasutuse jalus.

- [ ] **4.5. 404 leht on lihtne, aga puudub automaatne suunamine** — `NotFoundPage` näitab "404" ja "Lehekülge ei leitud" koos nupuga "Tagasi avalehele". Eakas võib sattuda 404-le kogemata (vale URL). Automaatne suunamine 5 sekundi pärast oleks kasulik.
  **Mõju:** Madal — nupp on olemas, aga automaatne suunamine oleks eakasõbralikum.

### Etapp 5: Ligipääsetavus

- [ ] **5.1. Fondi suurust ei saa liideses muuta** — puudub A+/A- fondi suuruse valik. Brauser zoom töötab, aga eakas ei tea sellest ega oska seda kasutada.
  **Mõju:** Kõrge — eesti riigiasutuste veebilehtedel on fondi suuruse valik tavaline. Selle puudumine on compliance probleem.

- [ ] **5.2. Kontrastsuse valik puudub** — pole kõrge kontrastsuse režiimi. Eakas halva nägemisega vajab tugevamaid kontrastsusi.
  **Mõju:** Keskmine — WCAG AA kontrastsuse nõuded võivad olla täidetud (CSS-i pole analüüsitud), aga kasutajapoolne kontrastsuse valik oleks parem.

- [ ] **5.3. PlayButton ARIA sildid inglise keeles** — kordab auditi #1 leidu #7.3. Ekraanilugeja ütleb "Loading" eestikeelse liidese keskel.
  **Mõju:** Keskmine — eakas ekraanilugeja kasutaja on eriti segaduses keelte seguga.

- [x] **5.4. Fookuse haldamine töötab** — nupud ja sisestusväljad on Tab-navigatsiooniga ligipääsetavad. `role="button"` ja `tabIndex` on seatud.

- [ ] **5.5. Drag-and-drop puudub klaviatuurialternatiiv** — kordab auditi #1 leidu #7.4. Eakas kasutaja, kes kasutab ainult klaviatuuri, ei saa lauseid ümber järjestada.
  **Mõju:** Keskmine — eakad kasutavad sageli ainult klaviatuuri.

### Etapp 6: Vigade käsitlus ja veatalumus

- [ ] **6.1. Puudub "Tagasivõtmine" (Undo)** — kordab auditi #3 leidu #4.3. Eakas kustutab kogemata lause → pole tagasivõtmist. "Ma kustutasin vale lause, kuidas saan tagasi?"
  **Mõju:** Kõrge — eakad teevad sagedamini vigu ja vajavad Undo funktsiooni rohkem kui noored.

- [ ] **6.2. Veateated ei ole piisavalt selged** — `VARIANTS_STRINGS.NOT_FOUND_DESC`: "Sõna ei leidu eesti keeles või on valesti kirjutatud." Eakale, kes ei tea, mis on "variandid", on see segadusetekitav. Teade peab olema lihtsam: "Sõna ei leitud. Kontrolli kirjaviisi."
  **Mõju:** Keskmine — veateated on keerulised keelelised terminid.

- [ ] **6.3. Puudub "Kas vajad abi?" link veateadete juures** — veateadete juures pole linki abikeskusesse, KKK-sse ega kontaktile. Eakas on jänni jäänud.
  **Mõju:** Keskmine — minimaalselt peaks olema link eki@eki.ee.

- [x] **6.4. Cookie consent'il on "Keeldun" nupp** — eakas kasutaja saab keelduda ilma tagajärgedeta. Hea.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Esmane kasutamine | 4 | 1 | 3 |
| Teksti sisestamine | 4 | 1 | 3 |
| Heli esitamine | 4 | 1 | 3 |
| Navigatsioon | 5 | 2 | 3 |
| Ligipääsetavus | 5 | 1 | 4 |
| Vigade käsitlus | 4 | 1 | 3 |
| **Kokku** | **26** | **7** | **19** |

## Top-5 probleemid (mõju eakale kasutajale)

1. **Puudub fondi suuruse valik** (#5.1) — eesti riigiasutuste standard, compliance probleem
2. **Puudub heli kiiruse reguleerija** (#3.4) — aeglane esitus on hädavajalik, backend toetab
3. **Vaikne ebaõnnestumine** (#3.3) — eakas ei erista tehnilist viga oma veast
4. **Puudub Undo** (#6.1) — kogemata kustutamine on parandamatu
5. **Fondi suurus ja kontrastsus pole reguleeritavad** (#5.1, #5.2) — nägemisprobleemid

## Mis on hästi tehtud

- Kontota kasutamine — null barjäär
- Lihtne üheleheline struktuur
- Skip link olemas
- Selge Play-nupp spinneriga
- Cookie consent keeldumise võimalusega
- Tab-navigatsioon ja fookuse haldamine
- Placeholder tekst sisestusväljal (kui märgendeid pole)
