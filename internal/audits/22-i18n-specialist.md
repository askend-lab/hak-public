# Audit: i18n / Lokaliseerimise spetsialist

**Vaatenurk:** Lokaliseerimise insener, kes hindab rakenduse valmisolekut mitmekeelsuse jaoks: stringide haldamine, keelevahetuse mehhanism, RTL tugi, kuupäevade/numbrite formaat.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — hardcoded stringid, i18n raamistik, lokaadi käsitlus, keelevahetuse võimalused.

---

## Kasutajaprofiil

Jevgeni, 33-aastane, lokaliseerimise insener, kes peab lisama platvormi vene ja inglise keele toe. Hindab, kui palju tööd on vaja ja millised on arhitektuurilised takistused.

---

## i18n analüüs

### Etapp 1: Stringide haldamine

- [ ] **1.1. Kõik UI stringid on hardcoded** — komponentides on stringid otse koodis: "Kirjuta sõna või lause ja vajuta Enter", "Sisesta lause", "Rohkem valikuid", "Sulge", "Salvestan...", "Logi sisse" jne. Pole i18n raamistikku (react-intl, react-i18next, FormatJS).
  **Mõju:** Kõrge — iga stringi tõlkimine nõuab koodi muutmist. Pole tsentraliseeritud tõlkefaile. ~200+ hardcoded stringi frontendis.

- [ ] **1.2. ARIA sildid on hardcoded** — `aria-label="Sisesta lause"`, `aria-label="Rohkem valikuid"`, `aria-label="Sulge"`. Need peavad olema samuti tõlgitavad, aga on otse koodis.
  **Mõju:** Keskmine — ligipääsetavuse stringid on eriti olulised — ekraanilugeja kasutaja vajab oma emakeeles silte.

- [ ] **1.3. Mõned stringid on inglise keeles** — `PlayButton` ARIA: "Loading", "Playing", "Play". `VARIANTS_STRINGS` on eesti keeles, aga mõned konstandid on segatud. Keelte segu koodis.
  **Mõju:** Keskmine — enne i18n implementeerimist tuleb kõik stringid ühtlustada.

- [x] **1.4. Onboarding stringid on tsentraliseeritud** — `onboardingConfig.ts` sisaldab wizardi tekste ühes kohas. See on hea lähtekoht: need stringid on lihtne i18n raamistikku üle viia.

- [ ] **1.5. Veateated on hajutatud** — veateated on laiali erinevates failides: `VARIANTS_STRINGS` objektis, komponentide sees, API teenustes. Pole ühte kohta, kust kõik teated leida.
  **Mõju:** Keskmine — enne i18n-i tuleb kõik stringid kaardistada ja tsentraliseerida.

### Etapp 2: Keelevahetuse mehhanism

- [ ] **2.1. Puudub keelevahetuse UI** — pole keelevalikut päises, jaluses ega seadetes. Kasutaja ei saa keelt vahetada.
  **Mõju:** Kõrge — keelevalik on i18n esimene nõue. Ilma selleta pole mitmekeelsus kasutajale saadaval.

- [ ] **2.2. Puudub brauseri keele tuvastamine** — pole `navigator.language` kontrolli, mis seaks vaikekeele vastavalt brauseri seadistusele. Alati eesti keel.
  **Mõju:** Keskmine — automaatne keeletuvastus on hea UX: vene brauseriga kasutaja näeb kohe venekeelset liidest.

- [ ] **2.3. Puudub URL-põhine keelevalik** — pole `/et/synthesis`, `/ru/synthesis`, `/en/synthesis` mustrit. Keelt ei saa URL-iga määrata ega jagada.
  **Mõju:** Madal — URL-põhine keelevalik on hea tava, aga alternatiivid (localStorage, küpsis) töötavad samuti.

### Etapp 3: Vormindamine (Formatting)

- [x] **3.1. Kuupäevad** — `TaskRow` näitab "Loodud {date}". Kuupäeva vorming sõltub `toLocaleDateString()` või sarnasest funktsioonist. Peaks töötama erinevate lokaalidega.

- [ ] **3.2. Mitmuse käänamine (pluralization)** — eesti keeles: "1 lause" vs "2 lauset". Vene keeles: "1 предложение" vs "2 предложения" vs "5 предложений" (3 vormi!). Inglise keeles: "1 sentence" vs "2 sentences". Praegune `{count === 1 ? "lauset" : "lauset"}` viga (audit #2 leid #3.9) näitab, et ka eesti keele mitmuse käsitlus on vigane.
  **Mõju:** Kõrge — iga keel käsitleb mitmust erinevalt. i18n raamistik (ICU MessageFormat) on hädavajalik.

- [ ] **3.3. Puudub numbrite lokaliseerimine** — "500 lauset" vs "500 sentences". Numbrite eraldaja erineb: 1,000 (inglise) vs 1 000 (eesti) vs 1.000 (saksa). Pole `Intl.NumberFormat` kasutust.
  **Mõju:** Madal — väikeste numbrite korral pole probleem, aga peaks olema käsitletud.

### Etapp 4: Sisu tõlkimise keerukus

- [ ] **4.1. Eesti keele spetsiifilised terminid** — "välde" (quantity degree), "häälduskuju" (phonetic form), "palatalisatsioon" — need on keeleteaduse terminid, mis vajavad professionaalset tõlget.
  **Mõju:** Keskmine — tavaline UI tõlge on lihtne, aga foneetilised terminid vajavad eriteadmisi.

- [ ] **4.2. Wizard sammude tekst on mahukas** — onboarding wizardi tekst on pikk ja detailne. Tõlkimine nõuab konteksti mõistmist, mitte ainult sõnade asendamist.
  **Mõju:** Madal — standardne lokaliseerimise väljakutse.

- [x] **4.3. Ikoonikeelne navigatsioon** — Play ▶, paus ⏸, menüü ⋮, lohistamine ≡ — need on universaalsed ikoonid, mis ei vaja tõlkimist. Hea.

### Etapp 5: RTL (Right-to-Left) tugi

- [ ] **5.1. CSS pole RTL-valmis** — puuduvad CSS loogilised omadused (`margin-inline-start` vs `margin-left`). Grid ja Flexbox suunad on LTR-spetsiifilised.
  **Mõju:** Madal — araabia ja heebrea kasutajaid on Eestis vähe. Aga i18n parimate tavade järgi peaks CSS olema RTL-valmis.

- [ ] **5.2. `dir` atribuut puudub** — `<html>` elemendil pole dünaamilist `dir="ltr"` / `dir="rtl"` atribuuti. Brauser kasutab vaikimisi LTR-i.
  **Mõju:** Madal — ainult asjakohane, kui lisatakse RTL keeli.

### Etapp 6: i18n implementeerimise hinnang

- [ ] **6.1. Hinnanguline töömaht** — ~200+ hardcoded stringi frontendis. i18n raamistiku (react-i18next) integreerimine: ~2–3 päeva. Stringide kaardistamine ja tsentraliseerimine: ~1–2 päeva. Vene keele tõlge: ~1 päev. Inglise keele tõlge: ~0.5 päeva. **Kokku: ~5–7 tööpäeva.**
  **Mõju:** Info — pole probleem, vaid hinnang.

- [ ] **6.2. Backend stringid** — API veateated (nt "Missing or invalid text field") on inglise keeles. Backend peaks tagastama vea koode, mitte tekste. Frontend peaks veakoodi põhjal näitama lokaliseeritud teadet.
  **Mõju:** Keskmine — backend veateadete lokaliseerimine nõuab arhitektuurilist muudatust.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Stringide haldamine | 5 | 1 | 4 |
| Keelevahetuse mehhanism | 3 | 0 | 3 |
| Vormindamine | 3 | 1 | 2 |
| Sisu tõlkimine | 3 | 1 | 2 |
| RTL tugi | 2 | 0 | 2 |
| Implementeerimise hinnang | 2 | 0 | 2 |
| **Kokku** | **18** | **3** | **15** |

## Top-5 probleemid (mõju lokaliseerimisele)

1. **Kõik stringid on hardcoded** (#1.1) — ~200+ stringi koodis, pole i18n raamistikku
2. **Puudub keelevahetuse UI** (#2.1) — kasutaja ei saa keelt vahetada
3. **Mitmuse käänamine on vigane** (#3.2) — eri keeltel on erinev mitmuse loogika
4. **ARIA sildid on hardcoded** (#1.2) — ligipääsetavuse stringid vajavad samuti tõlkimist
5. **Backend veateated on inglise keeles** (#6.2) — nõuab arhitektuurilist muudatust

## Mis on hästi tehtud

- Onboarding stringid on tsentraliseeritud — lihtne üle viia i18n-i
- Ikoonid on universaalsed — ei vaja tõlkimist
- Kuupäevad kasutavad tõenäoliselt lokaadipõhist vormindamist
