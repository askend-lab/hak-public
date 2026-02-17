# Agregeeritud leiud: i18n / Lokaliseerimine

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. UI on ainult eesti keeles — keelevahetaja puudub

**Viited: 12 kirjet** — #1, #3, #5, #6, #14, #17, #18, #22, #23, C07, C21, C22

Kogu liides on ainult eesti keeles. Sihtrühm (eesti keele õppijad) definitsiooni järgi ei valda eesti keelt täielikult. Pole keelevahetajat (EN/RU/UK).

- [ ] Keelevahetaja päisesse
- [ ] Minimaalselt: onboarding + veateated + abi vene/inglise keeles

**Hinnang:** 5–10 päeva (täielik i18n) | **Prioriteet:** P1

---

## 2. Kõik UI stringid on hardcoded

**Viited: 8 kirjet** — #22, C07, C12, C17, C21, C22, C23, C25

~200+ stringi on otse komponentides (JSX). Pole `react-i18next`, pole `t()` funktsiooni, pole tõlkefaile.

- [ ] Lisa `react-i18next` raamistik
- [ ] Loo `locales/et.json` tõlkefail
- [ ] Migreeeri kõik hardcoded stringid `t()` kutseteks

**Hinnang:** 5–8 päeva | **Prioriteet:** P2

---

## 3. ARIA sildid on hardcoded eesti keeles

**Viited: 5 kirjet** — #7, #22, C07, C23, C22

ARIA sildid ("Sulge", "Eelmine samm", "Järgmine samm") on otse koodis. Keele muutmisel jäävad need eesti keelde.

- [ ] ARIA sildid i18n süsteemi kaudu

**Hinnang:** Sisaldub i18n migratsioonis | **Prioriteet:** P2

---

## 4. Mõned stringid on inglise keeles

**Viited: 7 kirjet** — #1, #5, #7, #15, #22, C07, C23

PlayButton: "Loading", "Playing", "Play". Mõned veateated inglise keeles. Keelte segu ekraanilugejas.

- [ ] Kõik stringid eesti keelde (vt ka A01 #4)
- [ ] `lang` atribuut võõrkeelsetele tekstidele

**Hinnang:** 30 minutit (PlayButton) + 2h (ülejäänud) | **Prioriteet:** P0

---

## 5. Kuupäeva-, numbri- ja valuutaformaadid pole lokaliseeritud

**Viited: 3 kirjet** — #22, C07, C21

Kuupäevade kuvamine pole standardiseeritud. Pole `Intl.DateTimeFormat` ega `Intl.NumberFormat` kasutust.

- [ ] Kuupäevad eesti formaadis (pp.kk.aaaa)
- [ ] Numbrid eesti formaadis (1 000,50)

**Hinnang:** 1 päev | **Prioriteet:** P2

---

## 6. Pluralisatsioon pole käsitletud

**Viited: 3 kirjet** — #22, C07, C12

"1 lause" vs "5 lauset" — pole `i18next` pluralisatsiooni reegleid.

- [ ] Pluralisatsiooni reeglid eesti keelele (ainsus/mitmus)

**Hinnang:** Sisaldub i18n migratsioonis | **Prioriteet:** P2

---

## 7. RTL (paremalt vasakule) tugi puudub

**Viited: 2 kirjet** — #22, C07

Araabia keele ja teiste RTL keelte tugi puudub. Praegu pole kriitiline (ainult eesti keel), kuid kui i18n lisatakse, tuleb RTL-i kaaluda.

- [ ] CSS logical properties kasutamine tulevikus

**Hinnang:** 2–3 päeva (kui vajalik) | **Prioriteet:** P3

---

## 8. Onboarding wizard ei lokaliseerita

**Viited: 4 kirjet** — #1, #18, #22, C07

Onboarding wizard on eesti keeles. Algaja, kes ei valda eesti keelt, ei saa wizardist aru.

- [ ] Onboarding wizard mitmekeelseks (prioriteet: EN, RU)

**Hinnang:** Sisaldub i18n migratsioonis | **Prioriteet:** P1

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | UI ainult eesti keeles | 12 | P1 |
| 2 | Stringid hardcoded | 8 | P2 |
| 3 | ARIA sildid hardcoded | 5 | P2 |
| 4 | Mõned stringid inglise keeles | 7 | P0 |
| 5 | Kuupäeva/numbri formaadid | 3 | P2 |
| 6 | Pluralisatsioon | 3 | P2 |
| 7 | RTL tugi | 2 | P3 |
| 8 | Onboarding wizard lokaliseerimine | 4 | P1 |
| **Kokku** | **8 unikaalset leidu** | **44 originaalkirjet** | |
