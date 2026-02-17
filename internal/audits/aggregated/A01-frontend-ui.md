# Agregeeritud leiud: Frontend / Kasutajaliides

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. Hääle ja kiiruse valik (puudub UI)

**Viited: 14 kirjet** — #1, #2, #3, #5, #8, #13, #14, #18, #21, #23, #25, C07, C21, C22

Backend toetab `voice`, `speed`, `pitch` parameetreid (`applySynthesizeDefaults`), kuid frontendis puuduvad:
- [ ] Hääle valiku dropdown (mees/naine/neutraalne)
- [ ] Kiiruse liugur (0.5x – 2.0x) — keeleõppija vajab aeglasemat kõnet
- [ ] Kõrguse/tooni reguleerija

**Hinnang:** 2–3 päeva | **Prioriteet:** P0

---

## 2. Mobiilne navigatsioon (hamburger-menüü puudub)

**Viited: 8 kirjet** — #4, #6, #15, #18, C02, C07, C22, C23

CSS klass `.header-nav--mobile` on ettevalmistatud, komponent puudub. Mobiilis navigatsioon peidetud.

- [ ] Hamburger-menüü komponent
- [ ] Puuteekraani optimeeritud nupud (min 44×44px)

**Hinnang:** 1 päev | **Prioriteet:** P0

---

## 3. Veateated / vaikne ebaõnnestumine

**Viited: 16 kirjet** — #1, #2, #3, #4, #5, #6, #7, #13, #15, #16, #18, C07, C14, C17, C22, C23

Sünteesi ebaõnnestumisel kasutaja ei saa tagasisidet — spinner kaob vaikselt. Pole toast-teateid, pole `aria-live` piirkonda, veateated on osaliselt inglise keeles.

- [ ] Toast-teadete süsteem eesti keeles
- [ ] `aria-live="polite"` piirkond olekuteavitusteks
- [ ] Standardiseeritud vigade formaat (kood + teade)
- [ ] "Proovi uuesti" nupp vea korral

**Hinnang:** 1–2 päeva | **Prioriteet:** P0

---

## 4. PlayButton ARIA sildid inglise keeles

**Viited: 7 kirjet** — #1, #5, #7, #15, C07, C22, C23

`getAriaLabel()` tagastab "Loading", "Playing", "Play" — inglise keeles. Kogu ülejäänud liides on eesti keeles.

- [ ] "Loading" → "Laadimine", "Playing" → "Esitamine", "Play" → "Esita"

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 5. Drag-and-drop pole klaviatuuriga ligipääsetav

**Viited: 10 kirjet** — #1, #3, #5, #6, #7, #15, #16, C22, C23, C24

`SentenceSynthesisItem` atribuudiga `draggable` pole klaviatuuriga järjestatav. Puuteekraanil ei tööta ilma polyfill'ita.

- [ ] ArrowUp/ArrowDown klaviatuuriga ümberjärjestamine
- [ ] Puuteekraani polyfill (touch-dnd)

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 6. Tume teema puudub

**Viited: 6 kirjet** — #1, #3, #5, #6, #15, #23

Ainult hele teema. Pikad sessioonid on silmadele koormavad. Kaasaegne ootus.

- [ ] Dark mode CSS muutujad + toggle

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 7. Placeholder tekst ja näidislaused puuduvad

**Viited: 8 kirjet** — #1, #2, #5, #13, #14, #18, C07, C21

Sisestusväli on tühi ilma vihjeta. Algaja ei pruugi aru saada, mida sisestada. Puuduvad kiirfraasid.

- [ ] Placeholder: "Nt: Tere, kuidas läheb?"
- [ ] "Proovi näidislauset" nupp algajatele

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 8. Fondi suuruse ja kontrastsuse reguleerija puudub

**Viited: 6 kirjet** — #4, #5, #7, C23, C22, #15

Pole A+/A- fondi suuruse valikut ega kõrge kontrastsuse režiimi. Eakad ja halvema nägemisega kasutajad.

- [ ] Fondi suuruse valik (A+/A-)
- [ ] Kõrge kontrastsuse režiim

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 9. Undo/Redo puudub

**Viited: 5 kirjet** — #3, #5, #15, #16, C22

`useSentenceState` ei toeta undo/redo. Kustutatud lauset ei saa taastada.

- [ ] Undo/redo funktsioon (Ctrl+Z)
- [ ] Kustutamise kinnitusdialoog

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 10. Visuaalne tagasiside õnnestumise korral puudub

**Viited: 4 kirjet** — #4, #15, C07, C21

Kui süntees õnnestub, pole visuaalset kinnitust peale Play-nupu oleku muutumise. Lapsele oleks motiveeriv animatsioon.

- [ ] Visuaalne kinnitus (roheline linnuke, animatsioon)

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 11. Sisestuspiirangu puudumine (tähemärgiloendur)

**Viited: 5 kirjet** — #1, #3, #16, C14, C18

Backend piirab teksti 1000 tähemärgiga, aga frontend ei näita tähemärgiloendust ega hoiatust.

- [ ] Tähemärgiloendur sisestusvälja juures
- [ ] Hoiatus limiidile lähenemisel

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 12. CSV/TSV/teksti import/eksport puudub

**Viited: 6 kirjet** — #2, #3, #21, #25, C07, C22

Pole failide importi (.txt, .csv) ega eksporti. Kõik ainult käsitsi sisestus.

- [ ] Bulk lausete sisestamine (kleebi mitu lauset)
- [ ] CSV/TSV eksport
- [ ] .txt import

**Hinnang:** 2–3 päeva | **Prioriteet:** P1

---

## 13. Offline-režiim ja PWA puudub

**Viited: 5 kirjet** — #3, #6, #18, C02, C22

Internetiühenduse katkemisel sünteesi päringud ebaõnnestuvad vaikselt. Pole Service Worker'it.

- [ ] Offline tuvastamine + kasutajale teade
- [ ] PWA manifest + Service Worker (tulevikus)

**Hinnang:** 3–5 päeva | **Prioriteet:** P2

---

## 14. "Lisa ülesandesse" ei selgita autentimise vajadust

**Viited: 4 kirjet** — #1, #5, #14, C07

Enne klõpsu pole märget, et funktsioon nõuab sisselogimist. Kasutaja sisestab laused, klõpsab salvesta, ja siis näeb LoginModal'i.

- [ ] Tooltip "Nõuab sisselogimist" salvestamisnupu juures
- [ ] Parema väärtuspakkumisega LoginModal tekst

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 15. Jagatud ülesande vea olek on tupik

**Viited: 3 kirjet** — #1, #16, C07

Vigase jagamistõendi korral kuvatakse "Ülesannet ei leitud", kuid puudub navigatsioon (tagasi nupp, päis).

- [ ] Navigatsiooni lisamine jagatud ülesande vea olekusse

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | Hääle/kiiruse valik | 14 | P0 |
| 2 | Mobiilne navigatsioon | 8 | P0 |
| 3 | Veateated / vaikne ebaõnnestumine | 16 | P0 |
| 4 | PlayButton ARIA eesti keelde | 7 | P0 |
| 5 | Drag-and-drop klaviatuurialternatiiv | 10 | P1 |
| 6 | Tume teema | 6 | P2 |
| 7 | Placeholder + näidislaused | 8 | P1 |
| 8 | Fondi suurus / kontrastsus | 6 | P2 |
| 9 | Undo/Redo | 5 | P2 |
| 10 | Visuaalne õnnestumise tagasiside | 4 | P2 |
| 11 | Tähemärgiloendur | 5 | P1 |
| 12 | Import/Eksport | 6 | P1 |
| 13 | Offline/PWA | 5 | P2 |
| 14 | Auth selgitused | 4 | P2 |
| 15 | Jagatud ülesande tupik | 3 | P2 |
| **Kokku** | **15 unikaalset leidu** | **107 originaalkirjet** | |
