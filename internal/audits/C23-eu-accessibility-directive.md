# Checklist: EL-i ligipääsetavuse direktiiv (EU Accessibility Directive)

**Tüüp:** Õigusliku vastavuse kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — WCAG 2.1 AA, EL-i veebilehe ligipääsetavuse direktiiv (2016/2102), Eesti seadusandlus.
**Standard:** WCAG 2.1 tase AA + EL-i avaliku sektori veebilehtede ja mobiilirakenduste ligipääsetavuse direktiiv.

---

## WCAG 2.1 AA — Tajutav (Perceivable)

- [x] **1.1. Alt-tekst piltidele (1.1.1)** — logo: `alt="EKI Logo"`. Muid pilte pole.
- [ ] **1.2. Ajas muutuv meedia (1.2)** — TTS audio pole subtiitritega. Kuulmispuudega kasutaja ei kuule sünteesitud kõnet. Kuid tekst on juba ekraanil — alternatiiv on olemas.
  **Mõju:** Madal — tekst on visuaalselt olemas.
- [x] **1.3. Kohandatav (1.3.1)** — semantiline HTML: `<nav>`, `<main>`, `<footer>`, `<h1>`–`<h4>`, `<button>`.
- [ ] **1.4. Sisu järjekord (1.3.2)** — DOM-i järjekord peaks vastama visuaalsele järjekorrale. Drag-and-drop element ei ole klaviatuuriga ligipääsetav — järjekorra muutmine pole võimalik.
  **Soovitus:** Lisa klaviatuuripõhine ümberjärjestamine (ArrowUp/ArrowDown).
- [ ] **1.5. Kontrast (1.4.3)** — kontrasti suhe pole automatiseeritult kontrollitud. WCAG nõuab min 4.5:1 tavalisele tekstile ja 3:1 suurele tekstile.
  **Soovitus:** Käivita axe-core audit kontrastsuse kontrolliks.
- [x] **1.6. Teksti suuruse muutmine (1.4.4)** — SPA React rakendus, tekst suureneb brauseri suurendamisel.
- [ ] **1.7. Tekst piltidel puudub (1.4.5)** — pole pilte tekstiga. Hea. Aga CSS `content` omadust pole kontrollitud.
  **Mõju:** Madal.
- [x] **1.8. Reflow (1.4.10)** — responsive design, mobile-first lähenemine.

## WCAG 2.1 AA — Toimiv (Operable)

- [x] **2.1. Klaviatuur (2.1.1)** — põhifunktsioonid on klaviatuuriga ligipääsetavad: sisestamine, Enter sünteesimiseks, Tab navigatsiooniks.
- [ ] **2.2. Klaviatuurilõks puudub (2.1.2)** — `BaseModal` haldab fookuse lõksu korrektselt. Aga: drag-and-drop pole klaviatuuriga ligipääsetav, tag-menüü pole täielikult klaviatuuriga navigeeritav.
  **Soovitus:** Lisa ArrowUp/ArrowDown navigatsioon tag-menüüsse.
- [x] **2.3. Fookuse haldamine (2.4.3)** — `BaseModal` taastab fookuse sulgemisel. Skip link on olemas.
- [x] **2.4. Skip link (2.4.1)** — "Liigu põhisisu juurde" link on olemas.
- [x] **2.5. Lehekülje pealkirjad (2.4.2)** — `useDocumentTitle` seab igale lehele unikaalse title'i.
- [ ] **2.6. Fookuse stiilid (2.4.7)** — kas fookuse indikaator on selgelt nähtav? Mõned brauserid eemaldavad vaikimisi fookuse stiili `outline: none`'iga. Pole kontrollitud.
  **Soovitus:** Kontrolli ja taga nähtav fookuse stiil kõigil interaktiivseil elementidel.
- [ ] **2.7. Sihtala suurus (2.5.5)** — puuteekraanil peab nupp olema min 44×44px. Mõned nupud (RowMenu ⋮, tag) võivad olla liiga väikesed.
  **Soovitus:** Kontrolli ja taga min 44×44px kõigile interaktiivseil elementidele.

## WCAG 2.1 AA — Mõistetav (Understandable)

- [x] **3.1. Keele määramine (3.1.1)** — `<html lang="et">`.
- [ ] **3.2. Keele muutumine (3.1.2)** — kui leht sisaldab ingliskeelseid tekste (nt PlayButton ARIA: "Loading", "Playing"), peaks need olema märgitud `lang="en"` atribuudiga.
  **Soovitus:** Lisa `lang` atribuut võõrkeelsetele tekstidele. Või tõlgi kõik eesti keelde.
- [ ] **3.3. Vigade tuvastamine (3.3.1)** — veateated ei ole alati selgelt kuvatud. Sünteesi ebaõnnestumine võib olla vaikne.
  **Soovitus:** Lisa `role="alert"` veateadetele.
- [ ] **3.4. Vigade soovitused (3.3.3)** — veateated ei paku parandusettepanekuid: "Tekst on tühi" → "Sisesta eestikeelne sõna või lause".
  **Soovitus:** Lisa konkreetsed parandusettepanekud igale veateatele.

## WCAG 2.1 AA — Robustne (Robust)

- [x] **4.1. Parsimine (4.1.1)** — React genereerib validset HTML-i.
- [x] **4.2. ARIA rollid (4.1.2)** — `role="dialog"`, `role="menu"`, `role="menuitem"`, `aria-modal`, `aria-haspopup`, `aria-expanded` on korrektselt kasutatud.
- [ ] **4.3. Olekuteated (4.1.3)** — puudub `aria-live` piirkond sünteesi olekuteavitusteks: "Sünteesimine...", "Valmis", "Ebaõnnestus".
  **Soovitus:** Lisa `aria-live="polite"` piirkond sünteesi olekuteadete jaoks.

## EL-i direktiivi nõuded (lisaks WCAG-ile)

- [x] **5.1. Ligipääsetavuse teatis on olemas** — `/accessibility` leht.
- [ ] **5.2. Teatise formaat** — EL-i mudeliteatis nõuab: vastavuse staatus (täielik/osaline/mittevastavus), teadaolevad piirangud, tagasiside mehhanism, jõustamisprotseduur, koostamise kuupäev.
  **Soovitus:** Kontrolli teatise sisu vastavust EL-i mudelile. Lisa puuduvad lõigud.
- [ ] **5.3. Tagasiside mehhanism** — kasutajal peab olema viis teatada ligipääsetavuse probleemidest. Ainult eki@eki.ee ei ole piisav — peaks olema spetsiaalne ligipääsetavuse tagasiside vorm.
  **Soovitus:** Lisa ligipääsetavuse tagasiside vorm või eraldi e-posti aadress.
- [ ] **5.4. Jõustamisprotseduur** — kui kasutaja pole rahul tagasiside käsitlemisega, peaks olema viidatud AKI-le (Andmekaitse Inspektsioon) ja/või Tarbijakaitse ja Tehnilise Järelevalve Ametile (TTJA).
  **Soovitus:** Lisa jõustamisprotseduur ligipääsetavuse teatisesse.
- [ ] **5.5. Regulaarne ülevaatus** — EL-i direktiiv nõuab ligipääsetavuse regulaarset ülevaatust (vähemalt igal aastal). Pole dokumenteeritud ülevaatuse ajakava.
  **Soovitus:** Lisa ligipääsetavuse ülevaatuse ajakava.

## Automaattestimine

- [x] **6.1. jest-axe on konfigureeritud** — `a11y-helpers.ts` defineerib `runA11yAudit` funktsiooni WCAG 2.1 AA konfiguratsiooniga.
- [ ] **6.2. Automaattestid pole kõigile komponentidele** — `runA11yAudit` on olemas, aga kas kõik olulised komponendid on testitud?
  **Soovitus:** Lisa axe audit testid kõigile põhikomponentidele: SynthesisView, TaskDetailView, AppHeader, BaseModal.
- [ ] **6.3. Puudub Lighthouse CI** — pole automaatset Lighthouse ligipääsetavuse skoori kontrolli CI-s.
  **Soovitus:** Lisa Lighthouse CI ligipääsetavuse skoori kontrolliks (min skoor: 90).

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Täidetud | ⚠️ Puudub |
|------------|---------|------------|-----------|
| Tajutav (Perceivable) | 8 | 4 | 4 |
| Toimiv (Operable) | 7 | 4 | 3 |
| Mõistetav (Understandable) | 4 | 1 | 3 |
| Robustne (Robust) | 3 | 2 | 1 |
| EL-i direktiiv | 5 | 1 | 4 |
| Automaattestimine | 3 | 1 | 2 |
| **Kokku** | **30** | **13** | **17** |

## Prioriteedid

1. **P0:** `aria-live` piirkond sünteesi olekutele (#4.3)
2. **P0:** Klaviatuuriga drag-and-drop (#1.4, #2.2)
3. **P1:** Fookuse stiilide kontroll (#2.6)
4. **P1:** Ligipääsetavuse teatise uuendamine EL-i mudelile (#5.2)
5. **P1:** Tagasiside mehhanism (#5.3)
6. **P2:** Lighthouse CI (#6.3)
