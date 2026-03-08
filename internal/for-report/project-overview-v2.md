## Projektist

HAK on veebiplatvorm, kus õpetajad loovad kõnesünteesiga tunde ja õpilased täidavad neid. Projekt on loodud Eesti avaliku sektori jaoks.

Projekt sisaldab morfoloogilise analüüsi moodulit, mis kasutab teie teeki **vmetajson**, ning TTS-mootorit **Merlin**.

## Tehnoloogiline stack

Projekt on kirjutatud peamiselt **TypeScriptis** (frontend ja backend) ühe Python-komponendiga (TTS-worker). Lühike ülevaade:

- **Monorepo** pnpm workspaces'il — 11 paketti kataloogis `packages/`
- **Frontend** — React + Vite + SCSS (kataloogis `packages/frontend/`)
- **Backend** — AWS Lambda funktsioonid TypeScriptis (kataloogides `packages/store/`, `packages/auth/`, `packages/tts-api/`)
- **TTS-worker** — Python, Merlin TTS mootor (kataloogis `packages/tts-worker/`)
- **Morfoloogia API** — vmetajson'i wrapper (kataloogis `packages/morphology-api/`)
- **Infrastruktuur** — Terraform (kataloogis `infra/`)

## Kood Vabamorfi ja Merlinist

Projektis on kood teie projektidest võetud **sellisena nagu on** (vendored):

- **`packages/morphology-api/`** — sisaldab binaarfaili `vmetajson` ja sõnaraamatut `et.dct` Vabamorf repositooriumist. Need on mähitud TypeScript-kihiga (parser, valideerimine, Lambda-käsitleja), kuid tuum on teie kood.
- **`packages/tts-worker/merlin/`** — sisaldab Merlin TTS mootori Python-koodi (frontend/, io_funcs/, layers/, models/) — kopeeritud muutusteta. Meie kood on wrapper `worker.py`, mis integreerib Merlini AWS SQS/S3-ga.

Mõlemal juhul on meie kood ainult õhuke wrapper-kiht, mis integreerib need komponendid pilveinfrastruktuuriga — vendored koodi ennast me ei muuda ega laienda.

## Arendusmetoodika ja kvaliteedisüsteem

Askend on Eesti tarkvaraarenduse esirinnas kaasaegsete AI-toega arendusmeetodite kasutuselevõtul, panustades eelkõige tõhususse ja kvaliteeti. HAK-i projektis oleme rakendanud metoodikat, kus AI-tööriistad toetavad arendusprotsessi igal sammul — alates koodi kvaliteedikontrollist kuni automaatsete testide ja dokumentatsiooni haldamiseni.

See tähendab, et projekt on ehitatud **tulevikukindlana**: koodi struktuur, dokumentatsioon ja testimise süsteem on üles ehitatud nii, et tulevikus saavad AI-põhised tööriistad koodi efektiivselt hooldada, laiendada ja üle vaadata. Praktikas avaldub see järgmistes omadustes:

1. **Selgesõnalisus ja loetavus.** Kood on kirjutatud rõhutatult selgesõnaliselt — tüübid on alati välja kirjutatud, muutujad kirjeldavalt nimetatud, kommentaarid selgitavad äriloogikat. See tagab koodi hõlpsa hooldatavuse nii inimestele kui ka tuleviku arendustööriistadele.

2. **Ühtne ja järjepidev struktuur.** Kõik failid järgivad samu konventsioone (SPDX-päised, `as const` konstandid, `readonly` liidesed). Iga pakett järgib sama mustrit (types → core logic → handler → tests). Selline ühtlus vähendab vigade riski ja muudab koodibaasi navigeerimise lihtsaks.

3. **Kõrge defensive programming tase.** Kood sisaldab põhjalikke valideerimis- ja tüübikontrolle, mis tagavad süsteemi stabiilsuse ka ootamatute sisendite korral. See on teadlik kvaliteedivalik, mis tagab töökindluse pikemas perspektiivis.

4. **Arenenud automaatne kvaliteedisüsteem.** ESLint 15+ pluginaga, range TypeScript, pre-commit hook'id, 214 testifaili 95% reakattega, 97 Gherkin-spetsifikatsiooni, CI/CD 14 GitHub Actionsiga. Iga koodimuudatus läbib automaatselt mitmekihilise kvaliteedikontrolli enne tootmiskeskkonda jõudmist.

5. **Põhjalik testimine.** 214 testifaili ~213 lähtekoodi faili kohta — praktiliselt iga koodi osa on kaetud testidega. See annab kindluse, et muudatused süsteemis ei riku olemasolevat funktsionaalsust, mis on eriti oluline pikaajalise hoolduse ja edasiarenduse jaoks.

6. **Ranged keerukuse piirid.** ESLinti konfiguratsioon seab automaatsed läved: tsüklomaatiline keerukus **8**, kognitiivne keerukus **8**, max-statements **10**, max-lines-per-function **30**. Need piirangud tagavad, et kood püsib lihtne, loetav ja hooldatav — iga liiga keeruline funktsioon tuvastatakse ja jagatakse väiksemateks osadeks automaatselt.

7. **Põhjalik dokumentatsioon.** ARCHITECTURE.md, ADR (Architecture Decision Records), OpenAPI-spetsifikatsioonid, disainisüsteemi dokumentatsioon — kõik arhitektuurilised otsused on dokumenteeritud ja jälgitavad. See vähendab sõltuvust üksikutest arendajatest ja tagab teadmuse säilimise.

## Ülevaade TypeScript/JavaScript ökosüsteemist

Kuna projekti tehnoloogiline stack põhineb TypeScriptil ja JavaScriptil, on kasulik lühidalt tutvustada mõningaid selle ökosüsteemi eripärasid, mis erinevad teistest programmeerimiskeeltest:

1. **Sõltuvuste maht.** Fail `pnpm-lock.yaml` on suur ja `node_modules/` veel suurem. See on JS/TS-projektide jaoks normaalne — ökosüsteem on üles ehitatud paljudele väikestele pakettidele. Põhisõltuvused on loetletud juur-`package.json`-is ja iga paketi `package.json`-is.

2. **Konfiguratsioonifailid.** Projekti juurkataloogis on palju konfiguratsioonifaile (`eslint.config.mjs`, `tsconfig.json`, `jest.config.js` jne) — need on linterid, TypeScripti kompilaator, testimisraamistikud. Need tagavad koodi ühetaolisuse ja automaatsed kontrollid.

3. **Async/await kõikjal.** TypeScript-kood kasutab aktiivselt asünkroonset programmeerimist. Praktiliselt kõik sisend-/väljundoperatsioonid on async-funktsioonid koos `await`-iga.

4. **Serverless-arhitektuur.** Backend ei ole üks server, vaid eraldi Lambda-funktsioonide kogum, igaühel oma handler. Need käivitatakse päringu peale ega hoia olekut kutse-kutsete vahel.

5. **Gherkin-spetsifikatsioonid.** Kataloogis `packages/specifications/` asuvad `.feature`-failid — need on süsteemi käitumise kirjeldused pooleloomulikul keelel (Gherkin/BDD). Need toimivad üheaegselt nii dokumentatsioonina kui ka automaattestide alusena.

## Projekti struktuur

Projekti üldine arhitektuur ja andmevood on kirjeldatud failis `ARCHITECTURE.md`.

Põhilised komponendid:

1. **`packages/shared/src/`** — ühised tüübid ja utiliidid, mida kõik paketid kasutavad
2. **`packages/store/src/`** — backend'i tuum (CRUD operatsioonid). Iga moodul järgib sama mustrit: `core/` — äriloogika, `lambda/` — HTTP-wrapper, `adapters/` — andmebaasikiht
3. **`packages/morphology-api/src/`** — wrapper vmetajson'i ümber (parser, valideerimine, API)
4. **`packages/tts-worker/worker.py`** — wrapper Merlini ümber (SQS/S3 integratsioon)
5. **`packages/auth/src/`** — autentimine TARA (eID) ja Cognito kaudu
6. **`packages/frontend/src/`** — kasutajaliides (React + Vite + SCSS)
7. **`infra/`** — infrastruktuur (Terraform)

## Automaatselt genereeritud ja vendored failid

Järgmised failid ja kataloogid on kas automaatselt genereeritud või kopeeritud välisest allikast ning ei kuulu projekti äriloogika hulka:

- `pnpm-lock.yaml` — automaatselt genereeritud sõltuvuste lukustusfail
- `node_modules/` — välised sõltuvused (ei kuulu repositooriumisse)
- `*.generated.ts` — automaatselt genereeritud TypeScript-kood
- `packages/tts-worker/merlin/` — Merlin TTS mootori kood, kopeeritud muutmata kujul
- `packages/morphology-api/et.dct` — Vabamorfi sõnaraamat, kopeeritud muutmata kujul
- `internal/` — sisemine projektidokumentatsioon

