# Kirjalik lõpparuanne — EKI Hääldusabiline

## 1. Sissejuhatus

### 1.1 Projekti identifitseerimine

Käesolev lõpparuanne on koostatud hankelepingu nr **1-8/25/114** (riigihanke viitenumber **291322**) raames.


| Andmed                   | Väärtus                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| **Tellija**              | Eesti Keele Instituut (registrikood 70004011), Roosikrantsi 6, 10119 Tallinn |
| **Tellija esindaja**     | Direktor Arvi Tavast                                                         |
| **Täitja**               | Askend Estonia OÜ (registrikood 14133207), Tartu mnt 80f, 10112 Tallinn      |
| **Täitja esindaja**      | Juhatuse liige Vassili Ljahhovets                                            |
| **Lepingu hind**         | 40 000 EUR (+km)                                                             |
| **Tasumise kord**        | 25% I etapi järel, 75% II etapi järel                                        |
| **Lepingu periood**      | ~6 kuud (september 2025 – veebruar 2026)                                 |
| **Kontaktisik (EKI)**    | Kristjan Suluste                                                             |
| **Kontaktisik (Askend)** | Tatjana Mihnovits                                                            |


### 1.2 Rahastamine

Projekti rahastatakse Haridus- ja Teadusministeeriumi ning Euroopa Liidu kaasrahastatud programmist "Eesti keele õpe ja keeleõppe arendamine", meetmest nr 21.4.7.1 „Õpetajate järelkasv ja areng, õpikäsitus ja -keskkonnad" (alategevus 2.4.2 „Keeletehnoloogia arendamine keeleõppeks") ja riigieelarvest.

### 1.3 Aruande eesmärk

Vastavalt hanke tehnilisele kirjeldusele (Lisa 1, Etapp II) on käesoleva aruande eesmärk ammendavalt kirjeldada kogu tööprotsess ning esitada soovitused tarkvara edasiarendamiseks, sh kvaliteedi tõstmiseks ja kasutajakogemuse parandamiseks, lisafunktsionaalsuse lisamiseks (arvestades tulevast keeleõppelist kasutust). Hankelepingu punkt 3.6 täpsustab: "II etapi lõpparuanne peab sisaldama kogu dokumentatsiooni, sh demod."

### 1.4 E-vahendi lühikirjeldus

EKI Hääldusabiline on eesti keele häälduse õppimise ja harjutamise veebirakendus, mille eesmärk on toetada eesti keele kui teise keele (E2) õppijate ja õpetajate hääldusõpet. Rakendus võimaldab kasutajatel kuulata ja visuaalselt eristada eesti keele hääldusele omaseid keerukaid aspekte nagu välteid ja palatalisatsiooni, mis on ortograafiliselt sageli mitteeristatavad, kuid kõnes olulised arusaadavuse seisukohalt.

Vahend on loodud MVP (Minimum Viable Product) põhimõttel ning on vabavaraline (MIT litsents) ja hästi dokumenteeritud, toetades jätkusuutlikku edasiarendust.

### 1.5 Kestvad kohustused

Vastavalt hankelepingu punktidele 9.6 ja 9.7 peab e-vahend olema tagatud vabavaralisena kättesaadavana kuni **31.12.2029** ning e-vahendi ja dokumentatsiooni peab täitja ajakohasena ja toimivana hoidma koodivaramus kuni **31.12.2029**.

---

## 2. Projektimeeskond

### 2.1 Tellija meeskond (EKI)


| Nimi                  | Roll                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| Kristjan Suluste      | Projektijuht (Eestikeelsele õppele ülemineku programm)                   |
| Kadri Tammäe          | ITA arendusjuht, projektijuhi tugiisik                                   |
| Meelis Mihkla         | Vanemteadur — kõnesüntees ja kõne uurimine                               |
| Indrek Hein           | Vabamorfi ja Merlini kõnesünteesi rakendaja, tehniline domeenieksperthis |
| Kaisa Jette Särekanno | Ärianalüütik                                                             |
| Helen Minarik | UI/UX disainer                                                             |

### 2.2 Täitja meeskond (Askend Estonia OÜ)


| Nimi              | Roll                                                         |
| ----------------- | ------------------------------------------------------------ |
| Tatjana Mihnovits | Projektijuht ja analüütik                                    |
| Anton Anikin      | Arhitekt                                                     |
| Liisi Crooks     | UI/UX disainer                                               |
| Arendaja          | Aleksei Bljahhin |


---

## 3. Hanke nõuded ja nende täitmine

Käesolevas peatükis kõrvutatakse hanke tehnilise kirjelduse (Lisa 1) nõuded üleantava e-vahendi tegeliku funktsionaalsusega. Detailne funktsionaalsuse kirjeldus on esitatud eraldi dokumendis "Funktsionaalsuse ülevaade — EKI Hääldusabiline".

### 3.1 Funktsionaalsuse nõuded

Hanke tehniline kirjeldus (Lisa 1, punkt 4.3) määratles kahejärgulise kõnesünteesi protsessi ja sellega seotud funktsionaalsuse. Allpool on toodud nõuete vastavuse kokkuvõte.

#### Kõnesünteesi esimene järk (Lisa 1, p. 4.3.1)


| Lisa 1 nõue                                    | Staatus    | Realiseeritud funktsioon                                         |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| Kasutaja sisestab teksti ortograafilisel kujul | ✅ Täidetud | F01 (US-01): Teksti sisestamine sildipõhise sisendiga            |
| Kasutaja valib sünteesimudeli                  | ✅ Täidetud | F01 (US-02): Mudeli valik (efm_s üksiksõnadele, efm_l lausetele) |
| Tekst sünteesitakse heliliseks väljundiks      | ✅ Täidetud | F01 (US-02): Audio sünteesimine ja esitamine                     |
| Häälduskuju salvestatakse taustal              | ✅ Täidetud | F03 (US-09): Lause häälduskuju vaatamine                         |
| Kasutaja kuulab sünteesitud heli               | ✅ Täidetud | F01 (US-03): Audio taasesituse juhtimine                         |


#### Kõnesünteesi teine järk (Lisa 1, p. 4.3.2)


| Lisa 1 nõue                                          | Staatus    | Realiseeritud funktsioon                                                 |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| Sõna hääldusvariantide avamine                       | ✅ Täidetud | F02 (US-05): Hääldusvariantide vaatamine                                 |
| Iga variandi foneetiline kirjeldus                   | ✅ Täidetud | F02 (US-05): Foneetilise info kuvamine variandi juures                   |
| Variandi sünteesimine ja ettemängimine               | ✅ Täidetud | F02 (US-06): Variandi audio eelvaade                                     |
| Kohandatud hääldusvariandi loomine                   | ✅ Täidetud | F02 (US-08): Kohandatud häälduskuju loomine                              |
| Korduvsisestatud märkide piiramine                   | ✅ Täidetud | Realiseeritud sisendvalideerimises                                       |
| Kohandatud variandi sünteesimine                     | ✅ Täidetud | F02 (US-08): Oma variandi sünteesimine                                   |
| Hääldusvariandi valimine ja rakendamine lausesse     | ✅ Täidetud | F02 (US-07): Variandi valimine ja rakendamine                            |
| Muudetud lause uuesti sünteesimine                   | ✅ Täidetud | F01 (US-02): Lause uuesti sünteesimine                                   |
| Häälduskuju otseredigeerimine                        | ✅ Täidetud | F03 (US-10): Häälduse märgiste redigeerimine                             |
| Varasemate variantide võrdlev kuulamine              | ✅ Täidetud | Realiseeritud esitusloendi kaudu (F04)                                   |
| Mitme lausungi salvestamine ja järjestikku mängimine | ✅ Täidetud | F04 (US-11, US-13): Mitme lause lisamine ja kõigi järjestikune esitamine |
| Sünteesitud heli eksport                             | ✅ Täidetud | F01 (US-04): Audio allalaadimine WAV-failina                             |


#### Kasutaja tagasiside (Lisa 1, p. 4.3.3)


| Lisa 1 nõue                                    | Staatus     | Märkused                                                                                                                                                                              |
| ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anonüümne tagasiside rakenduse toimivuse kohta | ⚠️ Muudetud | I etapi ärianalüüsi ja kasutajatestimise tulemustena otsustati tagasisidevorm esialgsest skoobist eemaldada ning Google OAuth autentimisega (F07) ning Rolli valimise ja juhendava viisardiga (F08) Otsus kooskõlastati tellijaga. |


### 3.2 Hanke nõudeid ületav funktsionaalsus

I etapi ärianalüüsi ja prototüübi kasutajatestimise tulemusena realiseeriti mitmeid funktsioone, mis ei olnud algselt hanke tehnilises kirjelduses ette nähtud, kuid osutusid sihtgruppide vajaduste põhjal vajalikuks:


| Funktsioon                                    | Kirjeldus                                                                                       | Alus                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **F05 Ülesannete haldamine** (8 kasutajalugu) | Ülesannete loomine, vaatamine, redigeerimine, kustutamine, lausete lisamine, sisu allalaadimine | Ärianalüüsi tulemus — õpetaja kasutusjuhu toetamine        |
| **F06 Ülesande jagamine** (2 kasutajalugu)    | Jagamislinkide genereerimine ja jagatud ülesannetele juurdepääs                                 | Ärianalüüsi tulemus — õpetaja-õppija töövoo toetamine      |
| **F07 Autentimine** (3 kasutajalugu)          | Sisselogimine TARA/Google OAuth kaudu, kasutajaprofiil, väljalogimine                           | Vajalik ülesannete ja kasutajaandmete salvestamiseks       |
| **F08 Sisseelamine** (2 kasutajalugu)         | Rolli valimine ja juhendav viisard                                                              | Prototüübi testimise tulemus — kasutajad vajasid konteksti |
| **F10 Teavitused** (1 kasutajalugu)           | Teavituste kuvamine ja haldamine                                                                | Kasutajakogemuse toetamine                                 |


### 3.3 Kasutajarollid

Hanke tehniline kirjeldus (Lisa 1, punkt 5) määratles kaks sihtgruppi: **E2 keeleõppijad** ja **E2 keeleõpetajad**.

Ärianalüüsi ja kasutajatestimise käigus tuvastati neli erinevat kasutajaprofiili: Tavakasutaja, Õppija, Õpetaja ja Kõnesünteesi spetsialist. Kasutajaliideses realiseeriti kolm rolli (Õppija, Õpetaja, Uurija) sisseelamise viisardi kaudu (F08). Rollipõhine lähenemine tagab, et iga kasutaja saab tema vajadustele kohandatud juhendamise ja kasutajakogemuse.

### 3.4 Stiilinõuded


| Nõue                               | Staatus                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Keelesammu stiiliraamatu järgimine | ✅ Täidetud                                                                               |
| WCAG 2.1 AA ligipääsetavus         | ✅ Sisuliselt täidetud (0 kriitilist / kõrget / keskmist leiust; 3 madalat edasi lükatud). Ligipääsetavuse teatis kirjeldab vastavust.  |


### 3.5 Koodi ja dokumentatsiooni nõuded


| Nõue (Lisa 1, punkt 8)                  | Staatus                                 |
| --------------------------------------- | --------------------------------------- |
| Avatud lähtekood (MIT litsents)         | ✅ Täidetud                              |
| Jooksev ülevaade GitHubis               | ✅ Täidetud                              |
| Dokumentatsioon eesti ja inglise keeles | ✅ Täidetud                              |
| Rakendusliidese (API) kaudu kasutatav   | ✅ Täidetud (OpenAPI spetsifikatsioonid) |
| Digiriigi ristfunktsionaalsed nõuded    | ✅ Täidetud (vt Ristfunktsionaalsuse nõuete täitmine)     |
| ESF teavitusreeglid                     | ✅ Täidetud                              |
| Kättesaadav riikliku teabevärava kaudu  | ✅ Täidetud                              |


### 3.6 Intellektuaalomand ja litsentsimine

Vastavalt hankelepingu peatükile 6 lähevad kõik e-vahendi loomise käigus tekkinud autori varalised õigused tellijale (EKI). E-vahend on avaldatud MIT litsentsiga, mis võimaldab piiranguteta kasutamist, muutmist ja levitamist. Lähtekood on avalikult kättesaadav GitHubi koodivaramus.

---

## 4. Tööprotsessi kirjeldus

### 4.1 Tööviis ja põhimõtted

#### Funktsionaalse prototüübi prioritiseerimine

Projekti algusest peale oli teadlik valik ehitada toimiv funktsionaalne prototüüp, mitte piirduda staatiliste disainikavanditega. Töötav prototüüp oli kogu projekti vältel keskseks kommunikatsioonivahendiks Askendi arendusmeeskonna ja EKI vahel: see andis aruteludele konkreetse ja käegakatsutava aluse, kõrvaldas ebamäärasust ootuste osas ning tagas, et mõlemad osapooled jagasid igal etapil ühist arusaama tootest. Samuti võimaldas see lähenemisviis kvaliteetsemat kasutajatestimist — päris kasutajad said suhelda reaalse töötava tarkvaraga, mitte klikitavate raamjoonistega, mis andis usaldusväärsema ja rakendatavama tagasiside.

#### Regulaarsed kohtumised

Kogu projekti vältel toimusid regulaarsed kohtumised EKI-ga kahenädalase intervalliga. Kohtumistel arutati jooksvaid küsimusi, vaadati üle arenduse seisu, kooskõlastati edasisi tegevusi ning anti ja saadi tagasisidet. Mitmed kohtumised on salvestatud. Täielik koosolekute loetelu koos salvestuste linkidega on esitatud eraldi dokumendis "Koosolekute salvestused".

#### Arendusmetoodika

- **Agile/MVP** — iteratiivne arendus lühikeste tsüklitega, regulaarne tagasiside tellijalt
- **Test-Driven Development (TDD)** — testid kirjutatakse enne koodi (vt ADR-003)
- **Behaviour-Driven Development (BDD)** — funktsionaalsuse spetsifitseerimine Gherkin formaadis (vt ADR-004)

### 4.2 Etapp I: Analüüs ja kavandamine (6 nädalat: sept – nov 2025)

Esimese etapi peamine eesmärk oli alustehnoloogiaga tutvumine, nõuete analüüs, arhitektuuri kavandamine ja projektiplaani kooskõlastamine.

**Tegevused:**

1. **Alustehnoloogiaga tutvumine** — Vabamorfi morfoloogilise analüsaatori ja Merlini DNN kõnesünteesi mudeli põhjalik uurimine, sh API-liideste testimine, hääldusmärkide süsteemi mõistmine ja tehniliste piirangute kaardistamine.
2. **Nõuete analüüs** — koostati põhjalik analüüsidokument "Hääldusabilise kasutajaliides — Analüüsidokument", mis sisaldab kasutajarollide ja nende vajaduste detailset kirjeldust, kasutusstsenaariumeid, kasutajavoo diagramme, funktsionaalsuse loetelu, ligipääsu loogikat ja foneetiliste kategooriate analüüsi.
3. **Arhitektuuri kavandamine** — otsustati kasutada React raamistikku (Angular asemel) ja serverless AWS arhitektuuri. React valiti kui sobivam intensiivse kasutajasuhtlusega kasutajaliidese jaoks tänu virtuaalsele DOM-ile ja tõhusale renderdamise juhtimisele. Arhitektuur kavandati modulaarsena, et tulevikus oleks võimalik aluskomponente (Vabamorf, Merlin) vahetada ilma kogu süsteemi ümber ehitamata — see oli üks tellija põhinõudeid, mida arutati juba kick-off kohtumisel.
4. **Projektiplaani kooskõlastamine** — kooskõlastatud projektiplaan esitati tellijale etapi lõpus.
5. **Prototüübi alustamine** — juba selle etapi jooksul alustati funktsionaalse prototüübi ehitamist, et valideerida tehnilist teostatavust ja luua ühine tugipunkt edasiseks arendustööks.

**Tulemid:** Projektiplaan (sh arhitektuuriskeem, kasutajateekond, aja- ja tegevuskava), ärianalüüsi dokument, esialgne töötav prototüüp.

### 4.3 Etapp II: Arendus (15 nädalat: nov 2025 – veebr 2026)

Teise etapi jooksul viidi läbi e-vahendi arendus vastavalt kooskõlastatud aja- ja tegevuskavale.

**Peamised tegevused:**

1. **Arhitektuurilised otsused** — projekti käigus langetati ja dokumenteeriti 8 arhitektuuriotsust (ADR-id), sh pnpm monorepo, serverless AWS, TDD DevBox hooks, Gherkin BDD spetsifikatsioonid, küpsistepõhine token-edastus, avaliku API disain, kahe-repo sünkroonimismudel ja DevBox kvaliteedisüsteem.
2. **Iteratiivne arendus** — funktsionaalsust arendati ja tehti tellijale kättesaadavaks vastavalt valmimisele. Iga funktsioon kinnitati mitmeastmeliselt: esmalt ärianalüüsi tasandil, seejärel funktsionaalse prototüübi kaudu, mis oli tellijale pidevalt kättesaadav, ning lõpuks arenduskeskkonnas, kuhu funktsioonid juurutati valmimise järjekorras. Askend arendas, testis ja juurutas iga funktsiooni eraldi. Tellijal oli pidev juurdepääs valminud funktsioonidele ning ta viis läbi jooksvat ad hoc kasutajatestimist funktsionaalsuse valmimise käigus. Põhjalik vastuvõtutestimine (UAT) viidi läbi projekti lõpus vastavalt kooskõlastatud testplaanile.
3. **Prototüübi testimine päris kasutajatega** — viidi läbi kasutajatestimised funktsionaalse prototüübiga (mitte staatiliste kavandite, vaid töötava tarkvaraga), kaasates **8 kasutajat kahest sihtgrupist**:
  - 3 Pae Gümnaasiumi eesti keele kui teise keele õpetajat
  - 5 ISE kasutajat (1 õpetaja ja 2 õppijat)
   Testimise eesmärk oli UX ehk kasutatavuse hindamine. Detailsed tulemused on esitatud eraldi dokumendis "Prototüübi testimine — Kokkuvõte ja soovitused".
   **Peamised leiud:**
  - Õpetajad hakkasid kiiresti uurima sõnu, hääldusi ja variante ning pakkusid ise välja konkreetseid kasutusstsenaariume
  - Õppijad ei saanud ilma juhendamiseta selgelt aru, mida tööriistaga teha — vajasid konteksti ja rolli
  - Suurim segadus tekkis konteksti puudumisest — kasutaja ei teadnud, mida ja miks peaks tegema
  - Häälduserinevuste tajumine sõnavariantide vahel oli raske kõigile gruppidele
4. **Parandused testimise tulemuste põhjal** — testimise tulemuste alusel rakendati iteratiivselt mitmeid parandusi:
  - Lisatud sisseelamise viisard (wizard) uutele kasutajatele
  - Lisatud rollipõhine lähenemine (Õppija, Õpetaja, Uurija)
  - Lihtsustatud hääldusjuhendi lisamine tavakasutajale
  - Duplitseeritud variantide eemaldamine
  - Mitmeid UX parandusi (fondi suurused, modaalide disain, teavituste linkimine)

**Tulemid:** valmis e-vahend koos dokumentatsiooni ja demonstratsiooniga.

---

## 5. Loodud e-vahendi kirjeldus

### 5.1 Funktsionaalsus

E-vahendi funktsionaalsus koosneb **10 funktsioonigrupist** ja **31 kasutajaloost**, mis katavad 4 kasutajateekonda. Detailne kirjeldus on esitatud eraldi dokumendis "Funktsionaalsuse ülevaade — EKI Hääldusabiline".


| Funktsioon                 | Kirjeldus                                                                | Kasutajalugude arv | Prioriteet |
| -------------------------- | ------------------------------------------------------------------------ | ------------------ | ---------- |
| F01 Kõnesüntees            | Teksti sisestamine, kõnesüntees, audio taasesitus ja allalaadimine       | 4                  | Kriitiline |
| F02 Hääldusvariantid       | Sõnade alternatiivsete hääldusvormide vaatamine, eelvaade ja rakendamine | 4                  | Kriitiline |
| F03 Lause häälduskuju      | Kogu lause häälduskuju vaatamine ja redigeerimine                        | 2                  | Kõrge      |
| F04 Esitusloendi haldamine | Mitme lause haldamine, ümberjärjestamine, järjestikune esitamine         | 5                  | Kõrge      |
| F05 Ülesannete haldamine   | Ülesannete CRUD, lausete lisamine, sisu allalaadimine                    | 8                  | Kriitiline |
| F06 Ülesande jagamine      | Jagamislinkide genereerimine ja jagatud ülesannetele juurdepääs          | 2                  | Kõrge      |
| F07 Autentimine            | Sisselogimine TARA kaudu, kasutajaprofiil, väljalogimine                 | 3                  | Kriitiline |
| F08 Sisseelamine           | Rolli valimine ja juhendav viisard                                       | 2                  | Keskmine   |
| F10 Teavitused             | Teavituste kuvamine ja haldamine                                         | 1                  | Keskmine   |
| **Kokku**                  |                                                                          | **31**             |            |


**Kasutajateekonnad:**


| Teekond | Persoona        | Kirjeldus                                                                       |
| ------- | --------------- | ------------------------------------------------------------------------------- |
| UJ-01   | Õpetaja (Mari)  | Loob hääldusharjutuse, lisab sünteesitud laused ülesandesse ja jagab õpilastega |
| UJ-02a  | Õppija (Andrei) | Avastab rakendust iseseisvalt, sisestab teksti, kuulab sünteesi, uurib variante |
| UJ-02b  | Õppija (Andrei) | Avab õpetaja jagatud harjutuse, kuulab lauseid, harjutab iseseisvalt            |
| UJ-03   | Uurija (Katrin) | Analüüsib hääldust, uurib foneetilisi variante, redigeerib häälduskuju          |


### 5.2 Tehniline arhitektuur

E-vahendi arhitektuur on struktureeritud kolme kihi kaupa. Detailne kirjeldus koos komponentdiagrammi ja andmevoo diagrammidega on esitatud eraldi dokumentides "Arhitektuuri kirjeldus" ja ARHITEKTUUR.md koodivaramus.

**Kasutajaliidese kiht:** React 19 põhine SPA (Vite, TypeScript, SCSS/BEM), mis järgib EKI stiiliraamatut ja tagab WCAG 2.1 AA ligipääsetavuse.

**Rakenduse kiht:** REST API Clean Architecture põhimõtetele tugineva kihistusega (core/adapters/lambda). Node.js ja TypeScript, AWS Lambda funktsioonidena:

- `vabamorf-api` — morfoloogiline analüüs ja hääldusvariantide genereerimine (Docker konteiner)
- `merlin-api` — kõnesünteesi gateway (SQS sõnumi loomine, S3 vahemälu kontroll)
- `simplestore` — kasutajaandmete CRUD (DynamoDB)
- `tara-auth` — TARA OAuth2 callback, Cognito kasutaja loomine

**Keeletehnoloogiline kiht:** Vabamorf (morfoloogiline analüüs, reeglipõhine) ja Merlin DNN (kõnesüntees, Docker konteineris ECS Fargate Spot instantsidel).

**Infrastruktuur:** kogu infrastruktuur on hallatud Terraformiga, kahe keskkonnaga (dev ja prod). Turvalisuse tagavad AWS WAF v2, CloudFront (CDN + reverse proxy), Cognito (autentimine) ja CloudTrail/GuardDuty (audit ja ohutuvastus).

### 5.3 Kasutusjuhend

Lõppkasutajale on koostatud detailne kasutusjuhend eesti ja inglise keeles, mis katab kõiki rakenduse funktsioone: teksti sisestamine, taasesitus, hääldusvariantide paneel, lause häälduskuju, mitme lause haldamine, sisselogimine, ülesannete haldamine, jagamine ja allalaadimine. Kasutusjuhend on esitatud eraldi dokumendis "Kasutusjuhend — EKI Hääldusabiline".

---

## 6. Kvaliteedi tagamine

### 6.1 Testimise strateegia

Projekti kvaliteet on tagatud mitmekihilise testimise strateegiaga:


| Testimise tüüp        | Tööriist           | Katvus                                          |
| --------------------- | ------------------ | ----------------------------------------------- |
| Ühiktestid (frontend) | Vitest             | Komponentide ja äriloogika testimine            |
| Ühiktestid (backend)  | Jest               | API loogika ja teenuste testimine               |
| E2E testid            | Playwright         | Kasutajavoode otsast-lõpuni testimine           |
| BDD testid            | Cucumber (Gherkin) | Funktsionaalsuse vastavus spetsifikatsioonidele |
| Mutatsioonitestid     | Stryker            | Testide kvaliteedi kontrollimine 7 paketis      |
| Python testid         | pytest             | TTS töötaja testimine                           |


**Testide maht:** ~400 testifaili kogu projektis.

### 6.2 Katvuse lävendid


| Mõõdik                        | Lävend  |
| ----------------------------- | ------- |
| Üldine katvus                 | min 93% |
| Autentimise harude katvus     | min 90% |
| Frontendi harude katvus       | min 85% |
| Mutatsioonitesti kõrge lävend | 80%     |
| Mutatsioonitesti madal lävend | 60%     |
| Mutatsioonitesti murdepunkt   | 50%     |


### 6.3 Turvalisus

Turvalisuse tagamiseks viidi läbi **3 turvaauditeerimise vooru**, mille käigus tuvastatud leiud on kõik lahendatud.

**Rakendatud turvameetmed:**

- AWS WAF v2 (IP-põhine rate limiting, SQL injection / XSS kaitse)
- PKCE autentimisvoog
- HTTP-only küpsised tokenite edastamiseks
- CSRF kaitse
- Zod sisendvalideerimine
- CodeQL staatiline turvaanalüüs CI/CD-s
- Trivy Docker konteinerite skannimine
- `pnpm audit` sõltuvuste kontrollimine

### 6.4 Ligipääsetavus

E-vahend vastab **WCAG 2.1 AA** nõuetele sisuliselt (substantially compliant):

- **0** kriitilist leiust
- **0** kõrget leiust
- **0** keskmist leiust
- **3** madalat leiust (edasi lükatud)

Edasi lükatud leiud: klaviatuuri drag-and-drop alternatiiv, puutetundlike sihtmärkide suurus (44×44px) ja kõrge kontrastsuse režiim.

**Ligipääsetavuse testimine:** axe-core (arenduses), jest-axe (ühiktestides), Playwright + axe (E2E-s), 18 jsx-a11y ESLint reeglit.

### 6.5 CI/CD

Pidev integratsioon ja juurutamine on tagatud **12+ GitHub Actions töövooga**, sh:

- **build.yml** — lint, tüübikontroll, pakettide testid, ehitamine, S3 üleslaadimine, automaatne dev-keskkonda juurutamine
- **deploy.yml** — nutikas diff-põhine juurutamine (ainult muutunud moodulid)
- **e2e.yml** — Playwright E2E testid
- **codeql.yml** — CodeQL turvaanalüüs
- **terraform.yml** — Terraform plan (PR) / apply (main)
- **build-merlin-worker.yml** — Python testid, Docker ehitamine, ECR üleslaadimine

### 6.6 Koodiauditid

Projekti käigus viidi läbi **24+ persoona-põhist auditit** (õppija, jõukasutaja, eakas kasutaja, ligipääsetavuse ekspert, QA, turvatestija jm), mille käigus tuvastati kokku **99 leiust**, mis koondati 5 töövoolu ja lahendati.

---

## 7. Soovitused edasiarendamiseks

Käesolev peatükk sisaldab soovitusi e-vahendi edasiarendamiseks, arvestades projekti käigus saadud kogemusi, kasutajatestimise tulemusi ja keeleõppelist konteksti. Detailne edasiarenduse tegevuskava on esitatud eraldi dokumendis "HAK-i arenduse tegevuskava".

### 7.1 Kvaliteedi tõstmine

#### Uue põlvkonna kõnesüntees

Praegune Merlini DNN mudel (Theano, 2016) on funktsionaalne, kuid tekitab kuuldavaid artefakte. Suurim hüpe kvaliteedis oleks üleminek neuraalse TTS-mudeli peale. See nõuab koostööd EKI ja/või TartuNLP-ga uue mudeli väljatöötamiseks — Askend ehitab platvormi, mitte mudelit.

Oluline kontekst: praegune Merlini mudel toetab juba GPU-d — piirang on infrastruktuuris (Fargate'il pole GPU-d), mitte mudelis. GPU-le üleminek on infrastruktuuri muudatus.

#### Reaalajas voogedastus

Praegune arhitektuur kasutab järjekorra-päringu mustrit (brauser → API → SQS → CPU → S3 → päring → fail). Asendamine WebSocket-voogedastusega kõrvaldaks ~1–2 sek üldkulu ning heli oleks kuuldav juba selle genereerimise ajal.

#### Tihendatud helivormingud

WAV (suur, tihendamata) asendamine Opus- või MP3-vorminguga annaks **5–10× väiksemad failid**, kiiremad allalaadimised ja väiksema hoiustamiskulu. Eriti oluline mobiilsete kasutajate jaoks.

#### Infrastruktuur

- GPU-võimeline arvutusinfrastruktuur (Inferentia kulude optimeerimiseks või g5.xlarge paindlikkuse tagamiseks)
- Testimiskeskkond (dev → staging → prod toru)
- CDN vahemälu sünteesitud heli jaoks
- Privaatne võrgustik arvutuse jaoks

### 7.2 Kasutajakogemuse parandamine

#### Testimisel tuvastatud vajadused

Prototüübi testimisel ilmnesid selged suunad:

- **Häälduserinevuste tajumine** oli raske kõigi kasutajagruppide seas — kaaluda visuaalseid abistavaid vahendeid (helilainekuju võrdlus)
- **Kontekstist sõltuv kasutajaliides** — erinevad rollid vajavad erinevat juhendamist (osaliselt lahendatud viisardiga, kuid edasiarendatav)
- **Vanuse- ja tasemepõhine kohandamine** — õpetajad tõid välja, et tööriist sobib vaid konkreetsele vanusele ja keeletasemele; kaaluda laste jaoks mängulist ja täiskasvanud algajatele lihtsat kasutajaliidest

#### Mitmekeelne kasutajaliides

Sihtrühm — eesti keelt õppivad inimesed — ei valda definitsiooni järgi eesti keelt täielikult. Kasutajaliides nende emakeeles kõrvaldaks suurima takistuse kasutuselevõtul. Raamistik (react-i18next) on juba paigaldatud ja toetab piiramatut arvu keeli.

#### Mobiilirakenduse kogemus

Veebirakenduse kohandamine nii, et kasutaja saab selle paigaldada oma telefoni avakuvale tavalise rakenduse ikoonina, ilma et oleks vaja eraldi mobiilirakendust. Lisaks saab varem sünteesitud heli salvestada seadme vahemällu, mis võimaldab harjutuste kordamist ka ilma internetiühenduseta. See on eriti oluline keeleõppijatele, kes harjutavad hääldust mobiilseadmes.

#### Õigekirjakontroll

Keeleõppijad teevad sisestamisel sageli süstemaatilisi õigekirjavigu — seda täheldati ka prototüübi testimise käigus. Kuna e-vahend kasutab juba taustal Vabamorfi morfoloogilist analüüsi, on võimalik tuvastada, kui sisestatud sõna ei vasta ühelegi tuntud sõnavormile, ning pakkuda kasutajale soovitusi ("Kas mõtlesite...?"). See aitab õppijal mitte ainult kuulda õiget hääldust, vaid ka kirjutada sõna õigesti — luues seose kirjapildi ja häälduse vahel, mis on keeleõppe seisukohalt oluline.

### 7.3 Lisafunktsionaalsus keeleõppeliseks kasutuseks

#### Aktiivõpe


| Funktsioon                      | Kirjeldus                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Häälsalvestus ja võrdlus**    | Mikrofoni nupp iga lause kõrval — salvesta oma hääldus, kuula kõrvuti TTS-i etalonhääldusega. Kõige soovitum funktsioon kõigi kasutajatüüpide seas.                |
| **Visuaalne lainekuju võrdlus** | Helilainete kuvamine üksteise peal — visuaalne tagasiside ajastuse ja rütmi kohta                                                                                  |
| **Minimaalpaari treener**       | Kureeritud minimaalpaari komplektid ("kool" vs "kuul") — treenib foneemilist teadlikkust. Emakeelespetsiifilised komplektid (vene, ukraina, inglise kõnelejatele). |
| **Edenemise jälgimine**         | Harjutuste ajalugu, edenemise trendid, igapäevased eesmärgid                                                                                                       |


#### Pedagoogiline töövoog


| Funktsioon                       | Kirjeldus                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Õpetaja töölaud**              | Klassi haldamine, ülesannete staatus, tagasiside mehhanism                                  |
| **Eksamiks valmistumise režiim** | B1/B2 sõnavaranimekirjad, situatsioonidialoogid, ajastatud harjutused                       |
| **LTI integratsioon**            | Moodle, Canvas, Google Classroom — õpilased pääsevad HAK-ile juurde otse oma õpikeskkonnast |


#### Laiendatud levik


| Funktsioon                  | Kirjeldus                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **Telegram / WhatsApp bot** | Saada eestikeelne tekst → saa heli kohe tagasi. Pole vaja veebisaiti ega registreerimist. |
| **Chrome'i laiendus**       | Tõsta esile eestikeelne tekst mis tahes veebisaidil → kuule seda hääldatuna               |
| **Manustatav vidin**        | Iga eesti veebisait lisab oma sisule häälduse                                             |
| **Avalik API**              | API-võtmete haldamine, Python SDK (TypeScript klient on juba olemas)                      |


#### Rahvuslik keelelabor


| Funktsioon                      | Kirjeldus                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------- |
| **Piirkondlike murrete uurija** | Interaktiivne Eesti kaart — kuula piirkondlikke hääldusi, võrdle standardkeelega |
| **Morfoloogilise analüüsi UI**  | Vabamorf pakub juba analüüsi tagataustal — tee see kasutajatele nähtavaks        |
| **IPA väljund**                 | Rahvusvaheline foneetiline tähestik eesti notatsiooni kõrval                     |
| **Teadusportaal**               | Anonüümitud koondandmed HAK-i kasutusest keeleteaduse uuringute jaoks            |


---

## 8. Üleantavad materjalid

Üleantavate materjalide täielik loetelu koos asukohtadega on esitatud eraldi dokumendis "Tööde üleandmine — Kokkuvõte".



