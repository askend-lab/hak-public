Lugupeetud kolleegid,

Kutsume teid läbi viima koodiülevaadet projekti **HAK** kohta — eesti keele õppimise platvormi. Oleme tänulikud teie professionaalse pilgu ja tagasiside eest.

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

Nende vendored osade ülevaatamine **ei ole vajalik** — te tunnete neid meist paremini. Huvipakkuvad on meie wrapperid nende ümber: kuidas me vmetajson'i kutsume, kuidas selle väljundit parsime, kuidas Merlini pilveinfrastruktuuriga integreerime.

## Teadaolev turvaprobleem

Projektis on lahendamata turvaküsimus, millest soovime ette teavitada: **kõnesünteesi ja morfoloogilise analüüsi avalikud API-lõpp-punktid töötavad ilma autentimiseta**. Lõpp-punktid `/synthesize`, `/status/{cacheKey}`, `/analyze` ja `/variants` on kõigile avatud.

Samal ajal on kogu autentimise infrastruktuur (AWS Cognito, TARA eID, JWT-tokenid) **juba realiseeritud** ja töötab teiste lõpp-punktide jaoks. Oleme koostanud ettepaneku nende lõpp-punktide autentimisega sulgemiseks — see on minimaalne töömaht, kuna kõik komponendid on juba olemas. Küsimus selle kohta, kas need lõpp-punktid peaksid jääma avalikuks, on tellija äriline otsus, mis on arutelu staadiumis. Praegu on lõpp-punktid kaitstud WAF-reeglitega (rate limiting, geo-blocking), kuid see on vaid kiiruse piiramine, mitte juurdepääsu kontroll.

## Projekt on kirjutatud tehisintellekti poolt

See on ülevaate jaoks oluline kontekst. Kogu projekti kood on kirjutatud AI-assistentide (LLM-põhiste) poolt inimesest arhitekti juhendamisel. See tähendab mitmeid eripärasid, mis võivad tunduda ebatavalised:

1. **Liigne selgesõnalisus.** AI-kood on sageli rohkem verbose, kui kogenud arendaja kirjutaks. Tüübid on kirjas seal, kus inimene loodaks tüübituletusele. Kommentaarid selgitavad asju, mis on kogenud arendajale ilmselged. See on teadlik valik — AI-arenduses on selgesõnalisus olulisem kui lühidus, kuna järgmisel AI-agendil, kes selle koodiga töötab, puudub inimese intuitsioon.

2. **Ühetaolisus pedantsuseni.** Kõik failid algavad SPDX-päisega. Konstandid on eraldatud `as const`-iga. Liidesed kasutavad `readonly`-d. See ei ole inimese perfektsionism — see on rangete reeglite tulemus, mida AI järgib sõna-sõnalt ja järjepidevalt.

3. **Liigne defensive programming.** Null/undefined kontrolle võib esineda seal, kus TypeScript strict mode juba garanteerib tüübi. AI kaldub end kindlustama, kuna tal puudub kontekst "seda ei saa juhtuda" nii nagu inimesel.

4. **Koodi organiseerimise šabloonlikkus.** Pakettide struktuur on väga regulaarne: iga pakett järgib sama mustrit (types → core logic → handler → tests). Inimese kood on tavaliselt mitmekesisem. AI püüdleb korratavate mustrite poole.

5. **Arenenud kvaliteedisüsteem.** ESLint 15+ pluginaga, range TypeScript, pre-commit hook'id, 214 testifaili 95% reakattega, 97 Gherkin-spetsifikatsiooni, CI/CD 14 GitHub Actionsiga — kõik see kompenseerib AI-l puuduva kogenud arendaja intuitsiooni. Seal kus inimene tugineb vaistule ja kogemusele, tugineb AI-arendus automatiseeritud kontrollidele.

6. **Testimise intensiivsus.** 214 testifaili ~213 lähtekoodi faili kohta — suhe, mis on inimeste projektide jaoks ebatüüpiline. AI-arendus nõuab sellist katvust, kuna AI-agent ei suuda sessioonide vahel muudatuste konteksti "mäletada". Testid on ainus garantii, et uus muudatus ei rikkunud olemasolevat funktsionaalsust.

7. **Ranged keerukuse piirid.** ESLinti põhikonfiguratsioon seab väga ranged läved: cyclomatic complexity **8**, cognitive complexity (SonarJS) **8**, max-statements **10**, max-lines-per-function **30**, max-nested-callbacks **2**, max-depth **3**, max-params **3**. TypeScript-failide jaoks on osa lävedest tõstetud (complexity 15/.ts ja 30/.tsx, cognitive 20, max-statements 20, max-lines-per-function 150), kuid põhiväärtused jäävad suuniseks. Inimeste projektide jaoks on sellised ranged piirangud haruldased — arendajad tuginevad tavaliselt oma tundele "see funktsioon on liiga keeruline". AI-l seda tunnet pole, seega on piirid seatud selgesõnaliselt ja kontrollitakse automaatselt iga commit'i ajal.

8. **Põhjalik dokumentatsioon.** ARCHITECTURE.md, ADR (Architecture Decision Records), OpenAPI-spetsifikatsioonid, disainisüsteemi dokumentatsioon — AI genereerib dokumentatsiooni meelsamini kui enamik arendajaid.

## Mis võib olla ebatavaline (C/C++ arendajatele)

Kui teie põhikogemus on C/C++, siis mõned asjad, mis võivad tunduda ebatavalised, kuid on kaasaegses TypeScript/JavaScript-ökosüsteemis standardne praktika:

1. **Sõltuvuste maht.** Fail `pnpm-lock.yaml` on suur ja `node_modules/` veel suurem. See on JS/TS-projektide jaoks normaalne — ökosüsteem on üles ehitatud paljudele väikestele pakettidele. Põhisõltuvused on loetletud juur-`package.json`-is ja iga paketi `package.json`-is.

2. **Konfiguratsioonifailid.** Projekti juurkataloogis on palju konfiguratsioonifaile (`eslint.config.mjs`, `tsconfig.json`, `jest.config.js` jne) — need on linterid, TypeScripti kompilaator, testimisraamistikud. Need tagavad koodi ühetaolisuse ja automaatsed kontrollid.

3. **Async/await kõikjal.** TypeScript-kood kasutab aktiivselt asünkroonset programmeerimist. Praktiliselt kõik sisend-/väljundoperatsioonid on async-funktsioonid koos `await`-iga.

4. **Serverless-arhitektuur.** Backend ei ole üks server, vaid eraldi Lambda-funktsioonide kogum, igaühel oma handler. Need käivitatakse päringu peale ega hoia olekut kutse-kutsete vahel.

5. **Gherkin-spetsifikatsioonid.** Kataloogis `packages/specifications/` asuvad `.feature`-failid — need on süsteemi käitumise kirjeldused pooleloomulikul keelel (Gherkin/BDD). Need toimivad üheaegselt nii dokumentatsioonina kui ka automaattestide alusena.

## Kust alustada

Soovitatav tutvumise järjekord:

1. **`ARCHITECTURE.md`** — üldine arhitektuur ja andmevood (5 min)
2. **`packages/shared/src/`** — ühised tüübid ja utiliidid, mida kõik paketid kasutavad
3. **`packages/store/src/`** — backend'i tuum (CRUD operatsioonid). Hea näide meie stiilist: `core/store.ts` — äriloogika, `lambda/handler.ts` — HTTP-wrapper, `adapters/` — töö andmebaasiga
4. **`packages/morphology-api/src/`** — meie wrapper vmetajson'i ümber (parser, valideerimine, API)
5. **`packages/tts-worker/worker.py`** — meie wrapper Merlini ümber (SQS/S3 integratsioon)
6. **`packages/auth/src/`** — autentimine TARA (eID) ja Cognito kaudu
7. **`packages/frontend/src/`** — kasutajaliides
8. **`infra/`** — infrastruktuur (Terraform)

## Millele tähelepanu pöörata

Oleme huvitatud tagasisidest kõigis aspektides, kuid eriti:

- Üldine struktuur ja koodi korraldus
- Vigade käsitlemine ja edge case'id
- Potentsiaalsed turvaprobleemid
- Koodi loetavus ja hooldatavus
- Integreerimise korrektsus vmetajson'i ja Merliniga
- Kõik, mis tekitab küsimusi või tundub vale

## Mida ei pea üle vaatama

- `pnpm-lock.yaml` — automaatselt genereeritud sõltuvuste fail
- `node_modules/` — välised sõltuvused (ei kuulu repositooriumisse)
- `*.generated.ts` — automaatselt genereeritud kood
- `packages/tts-worker/merlin/` — teie Merlini kood, kopeeritud sellisena nagu on
- `packages/morphology-api/et.dct` — teie sõnaraamat, kopeeritud sellisena nagu on
- `internal/` — sisemine dokumentatsioon ja auditid

---
Oleme valmis arutama kõiki küsimusi. Täname teie aja eest!
