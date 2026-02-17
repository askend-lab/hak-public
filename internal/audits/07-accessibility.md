# Audit: Puudega kasutaja (Ligipääsetavus / WCAG)

**Vaatenurk:** Kasutaja, kes sõltub abitehnoloogiast: ekraanilugeja (NVDA/VoiceOver), ainult klaviatuur, halva nägemisega, värvipimedusega.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — ARIA atribuudid, fookuse haldamine, klaviatuurinavigatsioon, semantiline HTML, WCAG 2.1 AA vastavus.

---

## Kasutajaprofiil

Peeter, 55-aastane, nägemispuudega (jääknägemine ~10%), kasutab NVDA ekraanilugejat Firefoxis. Õpib eesti keele hääldust ümberõppe raames. Navigeerib ainult klaviatuuriga (Tab, Enter, nooleklahvid). Ootab, et rakendus teatab muutustest ja vigadest selgelt.

---

## WCAG 2.1 AA vastavuse analüüs

### 1. Tajutavus (Perceivable) — WCAG 1.x

- [x] **1.1. Skip link on olemas** — `App.tsx`: `<a href="#main-content" className="skip-link">Liigu põhisisu juurde</a>`. WCAG 2.4.1 (Bypass Blocks) täidetud.

- [x] **1.2. Keele atribuut on olemas** — `TagsInput` kasutab `lang="et"` sisestusväljal. Aitab ekraanilugejal valida õiget hääldust.

- [ ] **1.3. Logo puudub alt-tekst** — `AppHeader.tsx`: `<img src="/icons/logo.png" alt="EKI Logo" />`. "EKI Logo" on informatiivne, kuid kui logo on ka link avalehele, peaks alt olema selgem: "EKI Hääldusabiline — avalehele". WCAG 1.1.1 (Non-text Content).
  **Mõju:** Madal — alt-tekst on olemas, aga võiks olla informatiivsem.

- [ ] **1.4. PlayButton ARIA sildid inglise keeles** — `PlayButton` komponent kasutab `getAriaLabel()`, mis tagastab "Loading", "Playing", "Play" inglise keeles, kuigi kogu ülejäänud liides on eesti keeles. WCAG 3.1.2 (Language of Parts).
  **Mõju:** Kõrge — ekraanilugeja kasutaja kuuleb ingliskeelseid sõnu eestikeelse liidese keskel. Peaks olema "Laadimine", "Esitamine", "Esita".

- [ ] **1.5. aria-live piirkondade vähesus** — `PlayButton` kasutab `aria-live="polite"` laadimise olekule. Kuid muid `aria-live` piirkondi pole: ülesande loomine, kustutamine, jagamine, veateated — need kõik muudavad olekut ilma ekraanilugejat teavitamata.
  **Mõju:** Kõrge — WCAG 4.1.3 (Status Messages). Olekuteated peavad olema programmiliselt määratletud. `Notification` komponent peaks kasutama `role="status"` või `aria-live="polite"`.

- [ ] **1.6. Fondi suuruse muutmine pole liideses võimalik** — puudub A+/A- nupp. Kasutaja sõltub brauseri zoom'ist. WCAG 1.4.4 (Resize Text) nõuab, et tekst oleks suurendatav 200%-ni ilma sisu kaotamata.
  **Mõju:** Keskmine — brauser-zoom töötab tõenäoliselt, aga pole testitud. Riigiasutuste veebilehtede standardpraktika on fondi suuruse valik.

- [ ] **1.7. Kontrastsuse nõuded pole koodist kontrollitavad** — CSS-i pole siin auditis analüüsitud. WCAG 1.4.3 (Contrast Minimum) nõuab 4.5:1 suhet tavalisele tekstile. Vajab visuaalset testimist.
  **Mõju:** Teadmata — vajab eraldi kontrastsuse auditi tööriista (nt axe DevTools).

### 2. Opereeritavus (Operable) — WCAG 2.x

- [x] **2.1. Modaalide fookuse lõks (focus trap)** — `BaseModal.tsx` implementeerib korraliku fookuse lõksu: Tab liigub ringi, Shift+Tab liigub tagasi, Escape sulgeb modaali. Eelmine fookus taastatakse sulgemise järel. WCAG 2.4.3 (Focus Order) ja 2.1.2 (No Keyboard Trap) täidetud.

- [x] **2.2. Modaalide Escape-klahv** — `BaseModal` kuulab Escape-klahvi ja sulgeb modaali. Kõik modaalid (TaskEditModal, ShareTaskModal, AddEntryModal) kasutavad `BaseModal`-i. Hea.

- [x] **2.3. Menüüde klaviatuurikäsitlus** — `SentenceMenu` kuulab Escape-klahvi. `TagsInput` tag-menüü kuulab ArrowDown/ArrowUp nooleklahve menüüelementide vahel navigeerimiseks ja Escape sulgemiseks. WCAG 2.1.1 (Keyboard) täidetud menüüdes.

- [x] **2.4. Tag'id on klaviatuuriga ligipääsetavad** — `TagsInput` sõnamärgenditel on `role="button"`, `tabIndex={0}`, `aria-haspopup="menu"`, `aria-expanded`. Enter ja tühik avavad menüü. WCAG 2.1.1 (Keyboard) täidetud.

- [ ] **2.5. Drag-and-drop puudub klaviatuurialternatiiv** — `SentenceSynthesisItem` lohistamiskäepide (`drag-handle`) omab `role="button"` ja `tabIndex={0}`, kuid puudub `onKeyDown` käsitlus. Ekraanilugeja kasutaja saab fookuse lohistamiskäepidemele, aga ei saa sellega midagi teha.
  **Mõju:** Kõrge — WCAG 2.1.1 (Keyboard). Lohistamine peab olema klaviatuuriga asendatav (nt ArrowUp/ArrowDown ümberjärjestamiseks).

- [ ] **2.6. Puudub "Skip to synthesis" pärast navigatsiooni** — skip-link viib `#main-content` juurde. Kuid mobiilil (kus navigatsioon on peidetud) pole skip-link eriti kasulik. Tahvelarvutil/desktopil on navigatsiooniribal ainult 2 linki, seega skip-link on vähem vajalik.
  **Mõju:** Madal — skip-link on olemas ja toimib, aga keerulisematel lehtedel (ülesannete detailvaade) oleks kasulik skip-link otse sisuni.

- [x] **2.7. Fookuse haldamine marsruudi muutmisel** — `App.tsx`: `mainRef.current?.focus({ preventScroll: true })` marsruudi muutmisel. Ekraanilugeja saab teada, et leht muutus. WCAG 2.4.3 (Focus Order) täidetud.

- [ ] **2.8. Puudub fookuse indikaator osa nuppudel** — koodist ei ole võimalik kontrollida, kas CSS-is on `:focus-visible` stiilid kõigil interaktiivsetel elementidel. WCAG 2.4.7 (Focus Visible) nõuab nähtavat fookuse indikaatorit.
  **Mõju:** Teadmata — vajab visuaalset testimist. `BaseModal` fokusseerib esimese elemendi, aga nähtav fookusring sõltub CSS-ist.

- [ ] **2.9. Puudub ajalõpp hoiatus** — kui sessioon aegub (Cognito token), logitakse kasutaja välja ilma hoiatuseta. WCAG 2.2.1 (Timing Adjustable) nõuab hoiatust enne ajalõppu.
  **Mõju:** Keskmine — autentimine ei ole süntesi jaoks vajalik, aga ülesannete halduse ajal võib sessioon aeguda.

### 3. Mõistetavus (Understandable) — WCAG 3.x

- [x] **3.1. Vormide sildid on olemas** — `TaskEditModal`: `aria-label="Ülesande nimi (Kohustuslik)"`, `aria-required="true"`. `TagsInput`: `aria-label="Sisesta lause"`. `SentenceMenu` otsing: `<label htmlFor="menu-search" className="visually-hidden">Otsi ülesandeid</label>`. Hea.

- [x] **3.2. Veateated vormides kasutavad `role="alert"`** — `TaskEditModal` viga: `<div role="alert">`. Ekraanilugeja teatab veast automaatselt. WCAG 3.3.1 (Error Identification) täidetud vormides.

- [ ] **3.3. Sünteesi vead ei kasuta aria-live** — kui süntees ebaõnnestub, pole `aria-live` piirkonda ega `role="alert"` elementi, mis teataks veast. Ekraanilugeja kasutaja ei saa teada, et süntees ebaõnnestus. WCAG 3.3.1 (Error Identification) pole täidetud sünteesivigade jaoks.
  **Mõju:** Kõrge — ekraanilugeja kasutaja ei saa ühtegi tagasisidet sünteesi ebaõnnestumise kohta.

- [ ] **3.4. Notification komponent puudub aria-live** — `Notification` komponent (toast-teated) peaks kasutama `role="status"` või `aria-live="polite"`. Koodist selgub, et `showNotification` kutsutakse ülesande loomisel, kustutamisel jne. Kui notification ei ole `aria-live` piirkonnas, ekraanilugeja kasutaja ei saa teada.
  **Mõju:** Kõrge — WCAG 4.1.3 (Status Messages). Kõik olekuteated peavad olema ekraanilugejaga tajutavad.

- [ ] **3.5. Variantide paneel ei teata muutusest** — kui kasutaja klõpsab sõnal ja variantide paneel avaneb, pole `aria-live` piirkonda, mis teataks uuest sisust. Ekraanilugeja kasutaja ei tea, et paneel avanes.
  **Mõju:** Keskmine — paneel võib olla fookuse abil ligipääsetav, aga automaatne teatamine puudub.

### 4. Robustsus (Robust) — WCAG 4.x

- [x] **4.1. ARIA rollid on korrektsed** — `role="menu"`, `role="menuitem"`, `role="dialog"`, `role="button"`, `role="alert"`, `role="separator"`, `role="group"`, `role="presentation"`. Kasutus on semantiliselt korrektne.

- [x] **4.2. aria-haspopup ja aria-expanded on paigas** — `RowMenu.tsx`: `aria-haspopup="menu"`, `aria-expanded={isOpen}`. `TagsInput` sõnamärgendid: `aria-haspopup="menu"`, `aria-expanded={isMenuOpen}`. Ekraanilugeja teab, et nupp avab menüü.

- [x] **4.3. aria-hidden peidab dekoratiivsed elemendid** — ikoonid kasutavad `aria-hidden="true"` (chevron, add icon, backdrop). Ekraanilugeja ignoreerib dekoratiivseid ikoone. Hea.

- [x] **4.4. aria-label on kõigil interaktiivsetel elementidel** — nupud: "Sulge", "Tagasi", "Rohkem valikuid", "Lohista järjestamiseks", "Tühjenda kõik", "Muuda silti", "Laen variante". Hea katvus.

- [ ] **4.5. aria-describedby puudub vormidel** — `TaskEditModal` sisestusväljad kasutavad `aria-label`, kuid puudub `aria-describedby` veateadete jaoks. Kui viga tekib, pole viga programmiliselt seotud sisestusväljaga.
  **Mõju:** Keskmine — WCAG 3.3.1 soovitab veateadet siduda sisestusväljaga `aria-describedby` kaudu.

### 5. A11y testimise infrastruktuur

- [x] **5.1. jest-axe on konfigureeritud** — `a11y-helpers.ts` defineerib `wcagAAConfig` koos WCAG 2.1 AA reeglitega (color-contrast, valid-lang, html-has-lang, button-name, image-alt, label, aria-roles jne). Testimise infrastruktuur on olemas.

- [x] **5.2. runA11yAudit ja expectNoA11yViolations abifunktsioonid** — testides saab kasutada `await expectNoA11yViolations(container)` automaatseks ligipääsetavuse kontrolliks.

- [ ] **5.3. A11y testid pole süstemaatiliselt jooksutatud** — kuigi infrastruktuur on olemas, pole koodis leitud süstemaatilisi `runA11yAudit` kutseid komponentide testides. Testid on olemas (`TagsInput.test.tsx`), aga need keskenduvad funktsionaalsusele, mitte ligipääsetavusele.
  **Mõju:** Keskmine — testimise raamistik on olemas, aga pole aktiivses kasutuses. Tuleks lisada a11y testid vähemalt põhikomponentidele.

### 6. Ligipääsetavuse teatis

- [x] **6.1. Ligipääsetavuse leht on olemas** — `AccessibilityPage.tsx` on olemas aadressil `/accessibility`. Riigiasutuse standardile vastav teatis.

- [ ] **6.2. Ligipääsetavuse lehe sisu pole siin auditis analüüsitud** — lehe sisu (tekst, seaduslikud nõuded, teadaolevad piirangud) vajab eraldi kontrolli.
  **Mõju:** Teadmata — lehe olemasolu on hea, aga sisu täpsus vajab kontrolli.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem | ❓ Teadmata |
|------------|-------|--------|-------------|-------------|
| Tajutavus (WCAG 1.x) | 7 | 2 | 3 | 2 |
| Opereeritavus (WCAG 2.x) | 9 | 5 | 2 | 2 |
| Mõistetavus (WCAG 3.x) | 5 | 2 | 3 | 0 |
| Robustsus (WCAG 4.x) | 5 | 4 | 1 | 0 |
| Testimise infrastruktuur | 3 | 2 | 1 | 0 |
| Ligipääsetavuse teatis | 2 | 1 | 0 | 1 |
| **Kokku** | **31** | **16** | **10** | **5** |

## Top-5 probleemid (mõju puudega kasutajale)

1. **PlayButton ARIA sildid inglise keeles** (#1.4) — ekraanilugeja kuuleb keelte segu
2. **Puudub aria-live olekuteadetele** (#1.5, #3.3, #3.4) — sünteesi vead, notification'id, variantide paneel ei teata muutustest
3. **Drag-and-drop puudub klaviatuurialternatiiv** (#2.5) — WCAG 2.1.1 rikkumine
4. **Sünteesi vead pole ekraanilugejaga tajutavad** (#3.3) — vaikne ebaõnnestumine ka ekraanilugeja kasutajale
5. **aria-describedby puudub vormidel** (#4.5) — veateated pole programmiliselt seotud sisestusväljadega

## Mis on hästi tehtud

- **Modaalide fookuse lõks** — professionaalne implementatsioon: Tab ring, Escape sulgemine, fookuse taastamine
- **Menüüde klaviatuurikäsitlus** — ArrowUp/ArrowDown navigatsioon, Escape sulgemine, fookuse tagastamine
- **ARIA rollid semantiliselt korrektsed** — role="menu", role="dialog", aria-haspopup, aria-expanded
- **jest-axe testimise infrastruktuur** — olemas ja konfigureeritud WCAG 2.1 AA jaoks
- **Skip link** — standardne ligipääsetavuse praktika
- **Fookuse haldamine marsruudi muutmisel** — main element saab fookuse
- **Dekoratiivsed elemendid peidetud** — aria-hidden="true" ikoonidel ja tagaplaanidel
- **Vormide sildid eesti keeles** — aria-label ja visually-hidden label'id olemas
