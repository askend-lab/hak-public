# Audit: Pahatahtlik kasutaja (Adversarial / Abuse)

**Vaatenurk:** Kasutaja, kes proovib platvormi kuritarvitada: XSS, injection, DoS, andmeleke, sisu manipuleerimine, rate-limit'ide testimine.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — sisendivalideerimine, autentimine, API turvalisus, XSS kaitse, rate-limiting, andmete isoleerimine.

---

## Ründaja profiil

Pahatahtlik kasutaja, kes teab veebirakenduste haavatavusi. Proovib: sisestada skripte tekstiväljadesse, manipuleerida API päringuid, pääseda ligi teiste kasutajate andmetele, tekitada teenuse katkestust, kuritarvitada TTS-i sobimatute tekstidega.

---

## Ründevektorite analüüs

### 1. XSS (Cross-Site Scripting)

- [x] **1.1. React escapeerib väljundi vaikimisi** — React DOM escapeerib kõik stringid enne renderdamist. `{sentence.text}` ja `{tag}` ei ole haavatavad reflekteeritud XSS-ile. Pole `dangerouslySetInnerHTML` kasutust sünteesi komponentides.

- [x] **1.2. CSP meta tag on lisatud** — `index.html` sisaldab Content Security Policy meta-tag'i, mis piirab skriptide ja stiilide allikaid. Kaitseb mõne XSS vektori eest.

- [ ] **1.3. CSP pole CloudFront'i päisena seadistatud** — CSP meta-tag on osaline kaitse. Täielik CSP peaks olema HTTP response header'ina CloudFront'i kaudu. Meta-tag ei kaitse frame-ancestors ega muid direktiive.
  **Mõju:** Keskmine — meta-tag on parem kui mitte midagi, aga HTTP header on tugevam.

- [ ] **1.4. Share token URL-is võimaldab potentsiaalset lekkimist** — `/shared/task/:token` sisaldab tokenni URL-is. URL-id logitakse brauseri ajalukku, serveri logidesse, referer päisesse. Kui kasutaja jagab URL-i kogemata (nt screenshot), lekib token.
  **Mõju:** Madal — token on ainult lugemiseks ja aegub 90 päeva pärast. Aga sensitiivsema sisu korral oleks fragment-based token (`#token`) turvalisem.

### 2. Injection ja sisendivalideerimine

- [x] **2.1. Sünteesi tekst on piiratud** — backend piirab teksti 1000 tähemärgiga (`MAX_TEXT_LENGTH`). Kaitseb ülipikaade sisendite eest.

- [ ] **2.2. Frontend ei valideeri teksti pikkust** — `handleTextChange` võtab vastu suvalise pikkusega teksti ilma kontrollita. Backend keeldub, aga kasutaja ei saa veateadet (vaikne ebaõnnestumine). Pahatahtlik kasutaja saab saata 100KB teksti API-le.
  **Mõju:** Keskmine — backend kaitseb, aga frontendi valideerimise puudumine raiskab ribalaiust ja tekitab halva UX-i.

- [ ] **2.3. Ülesande nimi/kirjeldus pole pikkusega piiratud** — `TaskEditModal` ei sea sisestusväljadele `maxLength` atribuuti. `CreateTaskRequest` tüüp ei defineeri pikkuspiirangut. Kasutaja võib luua ülesande 100KB nimega.
  **Mõju:** Keskmine — backend peaks piirama, aga frontendi piiramine on esimene kaitsekiht.

- [ ] **2.4. Cognito email filter injection** — `findUserByEmail` funktsioonis (`cognito-client.ts`) kasutatakse e-posti otse filter-stringis: `Filter: \`email = "${email}"\``. Kui e-post sisaldab jutumärke, võib filter-string rikkuda. Cognito ListUsersCommand filter ei ole SQL, aga erimärkide käsitlus puudub.
  **Mõju:** Keskmine — Cognito filter ei ole SQL, seega tüüpiline SQL injection ei toimi. Aga jutumärkide escapeerimine puudub, mis võib tekitada ootamatut käitumist.

### 3. Autentimise ja autoriseerimise haavatavused

- [x] **3.1. TARA ja Google OAuth on turvalised** — autentimine toimub väliste pakkujate kaudu (TARA, Google). Paroole ei salvestata. OAuth2 flow on standardne.

- [x] **3.2. Ülesanded on kasutajapõhised** — `Task.userId` tagab, et kasutaja näeb ainult oma ülesandeid. API peaks kontrollima `userId` igal päringul.

- [ ] **3.3. Frontend ei kontrolli API vastuste omanikku** — `dataService.getUserTasks()` saab API-lt ülesannete nimekirja. Frontend usaldab, et API tagastab ainult kasutaja ülesanded. Kui API-l on viga ja tagastab teise kasutaja andmed, frontend kuvab need ilma kontrollita.
  **Mõju:** Madal — defense-in-depth: frontend peaks ka kontrollima, aga primaarne kaitse on API tasemel.

- [ ] **3.4. Sessioonihalduse puudujäägid** — Cognito token'id salvestatakse... (koodist selgub, et Cognito Amplify käsitleb seda). Pole selge, kas refresh token on korrektselt kaitstud ja kas sessioon aegub korrektselt.
  **Mõju:** Keskmine — Cognito käsitleb token'eid standardselt, aga frontend peaks kontrollima token'i aegumist ja teavitama kasutajat.

### 4. DoS ja rate-limiting

- [ ] **4.1. Puudub frontendi rate-limiting** — kasutaja saab vajutada Play-nuppu kiiresti korduvalt, genereerides mitu samaaegset sünteesi päringut. `useSynthesisOrchestrator` ei dedupleeri ega piira päringuid.
  **Mõju:** Keskmine — backend peaks rate-limiting'ut tegema (API Gateway), aga frontendi debounce oleks esimene kaitsekiht.

- [ ] **4.2. Play All kõigi lausetega samaaegselt** — kui kasutajal on 50 lauset ja vajutab "Esita kõik", sünteesitakse kõik järjest. Kuid pahatahtlik kasutaja võib luua 500 lauset localStorage's (manipuleerides) ja kutsuda Play All. `useSentenceState` ei piira lausete arvu.
  **Mõju:** Madal — `MAX_ENTRIES_PER_TASK = 500` piirab ülesande kirjete arvu, aga sünteesi view'l pole piiri.

- [x] **4.3. Eksponentsiaalne backoff päringutel** — `pollForAudio` kasutab eksponentsiaalset backoff'i. Vähendab serveri koormust ebaõnnestunud päringute korral.

- [ ] **4.4. ZIP-pommi risk** — `downloadTaskAsZip` loob ZIP-faili ja sellel on suuruspiirang. Aga pahatahtlik kasutaja võib luua palju ülesandeid ja laadida neid kõiki korraga alla, tekitades suurt serverikoormust (sünteesipäringud iga kirje jaoks).
  **Mõju:** Madal — ZIP-allalaadimine käivitab sünteesi ainult puuduvatele audiofailidele. Backend rate-limiting peaks kaitsema.

### 5. Andmete manipuleerimine

- [x] **5.1. localStorage andmete valideerimine** — `SimpleStoreAdapter.ts` valideerib localStorage'st laetud andmeid: kontrollib nõutavaid välju ja seab vaikeväärtused. Kaitseb rikutud localStorage andmete eest.

- [ ] **5.2. localStorage manipuleerimine võimaldab suvalise oleku** — pahatahtlik kasutaja saab brauseri arendusriistadega muuta localStorage andmeid: lisada 10000 lauset, muuta olemasolevaid ülesandeid, sisestada XSS payload'e (mis on React'i poolt escapeeritud, aga siiski).
  **Mõju:** Madal — localStorage on kasutaja kontrollitav, see on teadaolev piirang. Kriitilised andmed (ülesanded) on serveris.

- [ ] **5.3. Share token on arvamatu, aga pole piiratud** — share token on juhuslik string. Kuid pole brute-force kaitset: pahatahtlik skript võib proovida tuhandeid token'eid. API peaks piirama ebaõnnestunud share token päringuid.
  **Mõju:** Keskmine — token'i entroopia peaks olema piisav (UUID v4 = 122 bitti), aga rate-limiting oleks lisakaitse.

### 6. TTS kuritarvitamine

- [ ] **6.1. Puudub sisu modereerimine** — kasutaja saab sisestada mis tahes teksti ja kuulda seda sünteesitud kõnes. Pole roppuste filtrit, pole sisu kontrolli. TTS loeb ette solvavat, ähvardavat, sobimatut sisu.
  **Mõju:** Kõrge — avaliku sektori platvormil on sisu modereerimine oluline. Eriti kui platvormi kasutavad lapsed koolis.

- [ ] **6.2. Puudub TTS kuritarvitamise jälgimine** — pole logimist, mis tuvastaks ebatavalisi mustreid: sama kasutaja teeb 1000 päringut minutis, keegi sünteesib sobimatut sisu massiliselt, bot kasutab API-t scraping'uks.
  **Mõju:** Keskmine — CloudWatch logid on tõenäoliselt olemas, aga automaatne tuvastamine puudub.

- [ ] **6.3. Puudub CAPTCHA või bot-kaitse** — pole reCAPTCHA-d, hCaptcha-t ega muud bot-tuvastust. Automaatne skript saab kasutada API-t ilma piiranguta (kui rate-limiting puudub).
  **Mõju:** Keskmine — avaliku API jaoks peaks olema vähemalt rate-limiting ja/või API-võtmed.

### 7. Privaatsus ja andmeleke

- [x] **7.1. Tundlikud konfiguratsioonid on keskkonnamuutujates** — Cognito config, API URL-id jms tulevad keskkonnamuutujatest. Pole hardcode'itud salajasi koodi.

- [ ] **7.2. Cognito konfiguratsioon on kliendis nähtav** — `config.ts` sisaldab Cognito User Pool ID ja Client ID. Need on disaini järgi avalikud (frontend vajab neid), aga koos teadaoleva Cognito endpointiga saab pahatahtlik kasutaja proovida liikudes olekuid (nt password reset flow, kui see on lubatud).
  **Mõju:** Madal — Cognito Client ID on avalik disaini järgi. Aga peaks kontrollima, et Cognito pool'il on korrektsed turvaseadistused.

- [x] **7.3. Sentry DSN on kliendis** — `main.tsx` laadib Sentry vigade jälgimiseks. Sentry DSN on disaini järgi avalik. Pole turvarisk.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| XSS | 4 | 2 | 2 |
| Injection / valideerimine | 4 | 1 | 3 |
| Autentimine / autoriseerimine | 4 | 2 | 2 |
| DoS / rate-limiting | 4 | 1 | 3 |
| Andmete manipuleerimine | 3 | 1 | 2 |
| TTS kuritarvitamine | 3 | 0 | 3 |
| Privaatsus / andmeleke | 3 | 2 | 1 |
| **Kokku** | **25** | **9** | **16** |

## Top-5 probleemid (turvariskid)

1. **Puudub sisu modereerimine** (#6.1) — avaliku sektori platvormil on see nõutav, eriti koolide kontekstis
2. **Frontend ei valideeri sisendi pikkust** (#2.2, #2.3) — ülesande nimi, kirjeldus ja sünteesi tekst pole frontendis piiratud
3. **Cognito filter injection** (#2.4) — e-posti erimärgid ei ole escapeeritud
4. **Puudub frontendi rate-limiting** (#4.1) — kiire nupuvajutamine genereerib massiliselt päringuid
5. **CSP ainult meta-tag'ina** (#1.3) — HTTP header oleks tugevam kaitse

## Mis on hästi tehtud

- React escapeerib väljundi vaikimisi — XSS-i põhikaitse on paigas
- CSP meta-tag on lisatud — osaline kaitse
- TARA/Google OAuth — turvaline autentimine
- Kasutajapõhised ülesanded — andmete isoleerimine
- Eksponentsiaalne backoff — serveri koormuse kaitse
- localStorage andmete valideerimine
- Tundlikud konfiguratsioonid keskkonnamuutujates
