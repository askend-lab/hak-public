# Audit: UX-disainer

**Vaatenurk:** UX-disainer, kes hindab kasutajakogemuse kvaliteeti: infohierarhia, kasutajavood, tagasiside mustrid, järjepidevus, mikro-interaktsioonid.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — komponentide struktuur, oleku haldamine, tagasiside mustrid, navigatsiooni flow, visuaalne järjepidevus.

---

## Kasutajaprofiil

Kadri, 30-aastane, UX-disainer, kes hindab Hääldusabilise kasutajakogemust enne avalikku lanseerimist. Analüüsib: kas kasutaja saab aru, mida teha? Kas tagasiside on piisav? Kas vood on loogilised?

---

## UX analüüs

### Etapp 1: Onboarding ja esimene kasutamine

- [x] **1.1. Rolli valik loob konteksti** — `RoleSelectionPage` pakub 3 selget rolli kirjeldustega. Aitab kasutajal identifitseerida end ja saada asjakohast juhendamist.

- [x] **1.2. Wizard on sammhaaval juhendamine** — tooltip-põhine wizard näitab UI elemente kontekstis. Parem kui staatiline abileht.

- [ ] **1.3. Wizard ei luba vahele jätta** — puudub "Jäta vahele" link wizardil. Tagasitulev kasutaja peab uuesti läbima wizardi, kui pole seda lõpetanud. Pole "Ära näita enam" valikut.
  **Mõju:** Keskmine — kogenud kasutaja on frustreeritud sunnitust juhendamisest.

- [ ] **1.4. Onboarding ei kata jagamise voogu** — wizard lõpeb ülesande loomisel. Jagamine (share) on õpetaja jaoks kriitilne, aga pole wizardis kaetud. Kasutaja peab ise avastama.
  **Mõju:** Keskmine — kordab auditi #2 leidu #1.3, aga UX perspektiivist: avastuspõhine õppimine vs juhendatud õppimine.

### Etapp 2: Peamine kasutajavoog (süntees)

- [x] **2.1. Lihtne sisestus-kuulamine voog** — sisesta tekst → vajuta Enter/Play → kuula. Minimaalne kognitiivne koormus. Hea.

- [x] **2.2. Tag-põhine sisestusmudel** — sõnad muutuvad tag'ideks, mida saab eraldi klõpsata variantide jaoks. Innovatiivne ja funktsionaalne.

- [ ] **2.3. Tag'i ja vabateksti segamudel on segane** — sisestusväli töötab kahes režiimis: kui tag'e pole, on see vabatekst; kui tag'id on, muutub tühik tag'i eraldajaks. Kasutaja ei tea, et tühiku käitumine muutub. Pole visuaalset vihjet.
  **Mõju:** Kõrge — režiimi vahetuse puudulik kommunikeerimine tekitab üllatusi. Kasutaja ei tea, miks tühik ei tööta oodatult.

- [ ] **2.4. Puudub "Sisesta lause" oleku selgitus** — tühi väli placeholder'iga "Kirjuta sõna või lause ja vajuta Enter" on hea. Aga pärast esimest sõna pole selge, et Enter sünteesib ja tühik lisab tag'i.
  **Mõju:** Keskmine — interaktsiooni mudel vajab selgemat kommunikeerimist.

- [x] **2.5. Drag-and-drop järjestamiseks** — visuaalne lohistamise käepide on selge. Hea muster mitme lause ümberjärjestamiseks.

- [ ] **2.6. Puudub tühi olek (empty state) sünteesile** — kui kasutaja avab sünteesi lehe esimest korda (ilma wizardita), näeb ta tühja sisestusvälja ilma kontekstita. Pole "Alustamiseks sisesta lause..." tüüpi juhist.
  **Mõju:** Madal — placeholder tekst on olemas, aga illustreeriv empty state oleks parem.

### Etapp 3: Tagasiside ja olekud

- [x] **3.1. Play-nupu olekud** — spinner laadimisel, pausi ikoon mängimisel. Selge visuaalne tagasiside.

- [ ] **3.2. Vaikne ebaõnnestumine** — kui süntees ebaõnnestub, pole kasutajale tagasisidet. Spinner kaob, aga heli ei mängi. Kasutaja: "Kas see töötab?" Pole toast-teadet ega veaolekut.
  **Mõju:** Kõrge — kordab mitme auditi leidu (#1, #5). UX perspektiivist: iga toiming peab andma tagasisidet: edu, ebaõnnestumine või ootamine.

- [x] **3.3. Notification toast-teated** — ülesande loomine, kustutamine, jagamine kasutavad toast-teateid. "Ülesanne loodud" koos "Vaata ülesannet" lingiga. Hea tagasiside muster.

- [ ] **3.4. Optimistlik UI ilma rollback teateta** — `handleDeleteEntry` kasutab optimistlikku UI-d. Vea korral pöörab tagasi, aga kasutajale pole veateadet. Kasutaja: "Ma kustutasin, aga see tuli tagasi?"
  **Mõju:** Keskmine — optimistlik UI on hea muster, aga rollback vajab selgitust.

- [ ] **3.5. Loading olekud pole ühtlased** — mõned toimingud näitavad spinnerit (Play), mõned teksti ("Salvestan..."), mõned mitte midagi (variantide laadimine kasutab väikest spinnerit tag'i sees). Pole ühtlast loading mustrit.
  **Mõju:** Madal — iga komponent haldab oma laadimist. Ühtlane muster oleks parem, aga pole kriitiline.

### Etapp 4: Navigatsioon ja infohierarhia

- [x] **4.1. Lihtne kahetasandiline hierarhia** — Süntees | Ülesanded. Selge ja lihtne. Pole ülekoormatud.

- [ ] **4.2. Mobiilil pole navigatsiooni** — navigatsioon on peidetud `display: none` alla 768px. Pole hamburger-menüüd. Mobiilne kasutaja ei pääse ülesannete juurde.
  **Mõju:** Kõrge — kordab auditi #6 leidu #1.3. UX perspektiivist: peidetud navigatsioon ilma alternatiivita on blocker.

- [ ] **4.3. Breadcrumb puudub ülesande detailvaates** — `TaskDetailView` näitab ülesande sisu, aga puudub "Ülesanded > Harjutus 1" tüüpi teejuht. Kasutaja ei tea, kus ta hierarhias on.
  **Mõju:** Madal — "Tagasi" nupp on tõenäoliselt olemas, aga breadcrumb oleks selgem.

- [ ] **4.4. Footer on informatiivne, aga pikk** — palju linke ja teksti. Mobiilil nõuab palju kerimist. Pole kokku pandav.
  **Mõju:** Madal — standardne riigiasutuse footer.

### Etapp 5: Mikro-interaktsioonid ja detailid

- [x] **5.1. Hover olekud** — nupud ja lingid muudavad opacityt hoveril. Minimaalne, aga olemas.

- [ ] **5.2. Puuduvad animatsioonid** — laused ilmuvad ja kaovad ilma animatsioonita. Tag'id ilmuvad kohe. Menüüd avanevad kohe. Sujuvad üleminekud (fade, slide) parandaksid tajutavat kvaliteeti.
  **Mõju:** Madal — kosmeetiline, aga poleeritud UX nõuab animatsioone.

- [ ] **5.3. Puudub haptiline/visuaalne kinnitus toimingutele** — kopeerimise kinnituseks pole visuaalset efekti (nt "Kopeeritud!" tekst nupu peal). Kustutamise kinnitus on olemas (modaal), aga edukas kustutamine pole visuaalselt rõhutatud.
  **Mõju:** Madal — toast-teated täidavad osaliselt seda rolli.

- [ ] **5.4. Puudub Undo muster** — kustutamine on pöördumatu (pärast kinnitust). Pole "Tühista" toast-teadet, mis võimaldaks 5 sekundi jooksul tagasi võtta. Hea UX muster (Gmail, Slack) on "Kustutatud. Tühista."
  **Mõju:** Keskmine — kordab mitme auditi leidu. UX perspektiivist: Undo toast on standard.

### Etapp 6: Visuaalne järjepidevus

- [x] **6.1. Design token'id** — `_breakpoints.scss`, `_colors.scss`, `_typography.scss`, `_spacing.scss`, `_borders.scss`. Hästi struktureeritud süsteem.

- [x] **6.2. BEM nimetamiskonventsioon CSS-is** — `.sentence-synthesis-item__tag`, `.base-modal__header`, `.header-nav-link`. Järjekindel ja loetav.

- [x] **6.3. Komponentide korduskasutus** — `BaseModal`, `PlayButton`, `ConfirmationModal` on korduskasutatavad. DRY põhimõte on järgitud.

- [ ] **6.4. Nuppude stiilid pole täielikult ühtlased** — `button--primary`, `button--secondary` on olemas, aga mõned nupud kasutavad kohandatud klasse (`header-help-button`, `synthesis__menu-back-button`). Pole täielikku nuppude süsteemi (Button component with variants).
  **Mõju:** Madal — CSS on ühtlane, aga React Button komponent variantidega oleks parem.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Onboarding | 4 | 2 | 2 |
| Peamine voog | 6 | 3 | 3 |
| Tagasiside ja olekud | 5 | 2 | 3 |
| Navigatsioon | 4 | 1 | 3 |
| Mikro-interaktsioonid | 4 | 1 | 3 |
| Visuaalne järjepidevus | 4 | 3 | 1 |
| **Kokku** | **27** | **12** | **15** |

## Top-5 probleemid (mõju kasutajakogemusele)

1. **Vaikne ebaõnnestumine** (#3.2) — iga toiming peab andma tagasisidet
2. **Tag'i/vabateksti segamudel on segane** (#2.3) — režiimi vahetus pole kommunikeeritud
3. **Mobiilil pole navigatsiooni** (#4.2) — blocker mobiilsetele kasutajatele
4. **Puudub Undo muster** (#5.4) — standard UX muster puudub
5. **Optimistlik UI ilma rollback teateta** (#3.4) — kasutaja ei mõista, mis juhtus

## Mis on hästi tehtud

- Lihtne sisestus → kuulamine voog
- Tag-põhine sisestusmudel on innovatiivne
- Play-nupu olekud on selged
- Toast-teated on olemas
- Design token'id ja BEM on hästi struktureeritud
- Korduskasutatavad komponendid (BaseModal, PlayButton)
- Drag-and-drop järjestamiseks
- Rolli valik loob konteksti
