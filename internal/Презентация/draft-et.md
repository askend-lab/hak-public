# HAK — Projekti retrospektiiv

## Projekt, mis on täielikult loodud tehisintellekti poolt

**Esitluse kuupäev:** 12. märts 2026
**Periood:** 9. detsember 2025 — 10. märts 2026 (3 kuud)

---

## 1. Mis on HAK?

Eesti kõneteenus — kõnesüntees ja eesti keele morfoloogiline analüüs.

- **11 paketti** monorepositooriumis (TypeScript + Python)
- **Frontend** — React 19 SPA
- **Backend** — 4 Lambda-funktsiooni (auth, store, tts-api, morphology-api)
- **ML-töötaja** — Python/ECS (kõnesüntees Merlin-närvivõrguga)
- **Infrastruktuur** — AWS (Lambda, ECS, DynamoDB, S3, SQS, CloudFront, WAF, Cognito)
- **CI/CD** — GitHub Actions (14 töövoo-faili)

---

## 2. Projekti unikaalsus

**See on esimene projekt, mis on täielikult välja töötatud AI-agentide poolt.**

Inimene (Alex) tegutses arhitekti, juhi ja ülevaatajana. Kogu koodi kirjutasid AI-agendid:

| Agent | Commitid | Roll |
|-------|----------|------|
| Alex (inimene) | 1 211 | Arhitektuur, seadistamine, ülevaatus, juhtimine |
| Eve | 383 | Põhiarendaja (frontend, backend, infra) |
| Kate | 400 | Kvaliteet, turvalisus, auditid, dokumentatsioon |
| Luna | 183 | Refaktoreerimine, optimeerimine (neto -43 645 rida — puhastamine) |
| Sam | 67 | Üksikud ülesanded |
| Tanya | 17 | Üksikud ülesanded |
| **Kokku** | **2 320** | |

### AI-agentidega töötamise iseärasused

**Mis töötab hästi:**
- Kiirus: 2 320 commitit 3 kuuga (≈26 commitit/päevas)
- 763 pull request'i 3 kuuga (≈8,5 PR-i/päevas)
- Paralleelne töö: mitu agenti samaaegselt erinevatel ülesannetel
- Süstemaatiline töö: auditid, kontrollnimekirjad, verifitseerimine — agendid ei väsi
- Dokumentatsioon: 31 sisedokumenti (analüüsid, auditid, ettepanekud)
- Testid: 407 testifaili — agendid kirjutavad teste ilma vastuseisuta

**Mis ei tööta hästi:**
- Kontekst: agendid "unustavad" varasemad otsused sessioonide vahel
- Iseseisvus: ilma selgete juhisteta võib agent eksida
- Koordineerimine: kaks agenti võivad konflikti sattuda samal failil
- Haprus: üks viga promptis võib palju koodi rikkuda
- Maksumus: iga push → CI/CD → raha; vajalik kontroll
- Koodi kvaliteet: ilma koodiülevaatuseta kvaliteet langeb kiiresti

---

## 3. Projekti statistika

### Aktiivsus nädalate kaupa

| Nädal | Commitid | PR (merged) | Märkus |
|-------|----------|-------------|--------|
| W50 (9-15 dets) | 24 | 16 | Projekti algus |
| W51 (16-22 dets) | 220 | 105 | Põhiraamistik |
| W52 (23-29 dets) | 29 | 22 | Pühad |
| W01 (30 dets - 5 jaan) | 5 | 5 | Pühad |
| W02 (6-12 jaan) | 151 | 45 | Frontend + backend |
| W03 (13-19 jaan) | 156 | 38 | Frontend + backend |
| W04 (20-26 jaan) | 56 | 16 | Stabiliseerimine |
| W05 (27 jaan - 2 veebr) | 59 | 24 | Stabiliseerimine |
| W06 (3-9 veebr) | 178 | 17 | Infrastruktuur |
| W07 (10-16 veebr) | **908** | **290** | Tipp: kvaliteet + auditid |
| W08 (17-23 veebr) | 251 | 44 | Koodiülevaatus, parandused |
| W09 (24 veebr - 2 märts) | 225 | 63 | Turvalisus, SLA |
| W10-11 (3-10 märts) | 59 | 16 | Lõplik verifitseerimine |

**Tipunädal W07** — 908 commitit ja 290 PR-i nädalas. See oli massiliste kvaliteediauditite periood (ESLint, Ruff, testide katvus, turvalisus).

### Koodi maht

| Mõõdik | Väärtus |
|--------|---------|
| Commiteid kokku | 2 320 |
| Pull request'id (merged) | 701 |
| Lisatud ridu (kogu aja jooksul) | 816 657 |
| Kustutatud ridu (kogu aja jooksul) | 344 866 |
| Praegune suurus (TypeScript) | ~40 000 rida |
| Praegune suurus (Python/ML) | ~12 300 rida (sh ML-mudel Merlin 11K) |
| Infrastruktuur (Terraform) | 3 100 rida (sh ~1 700 monitooring/turvalisus) |
| Testifaile | 407 |
| CI/CD töövood | 14 |
| Sisedokumente | 31 |
| Pakette monorepositooriumis | 11 |

---

## 4. Koodiülevaatus

### Välised ülevaatajad

Kaks välist ülevaatajat kontrollisid AI kirjutatud koodi:

**Mikk Merimaa** — üksikasjalik aruanne 14 kategoorias:
1. Dokumentatsioon (14 punkti)
2. Tehniline virn (3)
3. Projekti struktuur (1)
4. Koodistiil (18)
5. Lihtsus ja mustrid (4)
6. Hooldatavus (1)
7. Vigade käsitlemine (2)
8. Testimine (3)
9. CI/CD (3)
10. Konfiguratsioon (2)
11. Sõltuvused (1)
12. Turvalisus (7)
13. Jõudlus (2)
14. Domeeniloogika (1)

**Kokku: 62 punkti.** Neist 47 aktsepteeritud, 15 tagasi lükatud (ekslikud või mittekohaldatavad).

**Lauri** — 12 punkti, neist:
- Arhitektuuriprobleemid (3 High)
- Turvalisus (2 High)
- Testimine (3 Medium)
- Muu (4 Medium/Low)

### Koodiülevaatuse tulemused

| Mõõdik | Väärtus |
|--------|---------|
| Ülevaatuse punkte kokku | 74 (Mikk 62 + Lauri 12) |
| Aktsepteeritud | 59 |
| Tagasi lükatud (ekslikud) | 15 |
| Suletud (koodiga kinnitatud) | **~100** |
| Jäänud avatuks | **20** |

20-st avatud punktist:
- 2 — aktsepteeritud risk (väline teek)
- 5 — ootavad pen-teste
- 4 — edasilükatud funktsioonid
- 6 — pen-testid läbi viimata
- 3 — eraldi repositoorium / reverted by design

### Mida ülevaatajad leidsid

**Hea (mida AI tegi õigesti):**
- Puhas arhitektuur: monorepositoorium, pakettideks jagamine
- Tüüpimine: TypeScript strict mode
- CI/CD: täielik deploy automatiseerimine
- Infrastruktuur: Terraform, serverless

**Halb (mida AI tegi valesti):**
- Koodi dubleerimine pakettide vahel (S3 utiliidid, HTTP_STATUS, LambdaResponse)
- Nõrgad testid: `expect(true).toBe(true)`, `typeof === "function"` (60 tükki)
- Puuduv süstemaatiline logimine (0 logi tts-api-s alguses)
- Puuduv vigade käsitlemine (tühi `catch {}`, vaikne vigade neelamine)
- Turvalisus: lõpp-punktid ilma autoriseerimiseta (enne PR #759)
- shell=True, pickle.load ilma kontrollsummata (ML-komponendis)

### Kuidas me seda parandasime

Loodi **DevBox kvaliteedisüsteem** — automaatsed konksud igal commitil:

| Tööriist | Mida kontrollib |
|----------|-----------------|
| ESLint (30+ reeglit) | Koodistiil, turvalisus, lubadused, keerukus |
| Ruff (Python) | Turvalisus, stiil, surnud kood |
| Stylelint | CSS/SCSS |
| mypy | Pythoni tüüpimine |
| knip | Surnud koodi tuvastamine |
| Testide katvus | Künnised: 80-95% pakettide kaupa |
| Turvalisuse audit | npm audit, IAC security |

**14 Mikku 47 aktsepteeritud punktist** on nüüd jõustatud DevBox konksudega — need ei saa korduda.

---

## 5. Turvalisus

Pärast välist ülevaatust viidi läbi turvalisuse auditite seeria:

| Audit | Kuupäev | Tulemus |
|-------|---------|---------|
| Turvalisuse audit | 03.10 | 15 sektsiooni, 13 SEC-punkti |
| WAF-reeglid | 02.2026 | 7 reeglit (rate limiting, geo-blocking, per-user limits) |
| Cognito autoriseerimine | 03.2026 | Kõik API lõpp-punktid JWT all |
| SLA dokument | 03.2026 | Rate limits, availability targets |

---

## 6. Mis on hea ja mis halb

### Mis on hea

1. **Arenduskiirus** — 3 kuud nullist production-ready'ni
2. **Töö maht** — 2 320 commitit, 701 PR-i, 40K+ rida TypeScript
3. **Dokumentatsioon** — 31 sisedokumenti, OpenAPI spetsifikatsioonid
4. **Testimine** — 407 testifaili, katvus 80-95%
5. **Infrastruktuur** — täielik Terraform, 14 CI/CD töövoogu
6. **Kvaliteedisüsteem** — DevBox 30+ ESLint-reegliga, automaatsed kontrollid
7. **Turvalisus** — WAF, Cognito JWT, rate limits, geo-blocking
8. **Koodiülevaatus** — 74 punkti 2 ülevaatajalt, 100+ suletud

### Mis on halb

1. **Esimeste iteratsioonide kvaliteet** — ilma ülevaatuseta kirjutab AI "töötava, aga hapra" koodi
2. **Nõrgad testid** — AI kipub kirjutama tühje teste (`expect(true).toBe(true)`)
3. **Dubleerimine** — ilma arhitektuurilise järelevalveta AI kopeerib selle asemel, et taaskasutada
4. **Vaikimisi turvalisus** — AI ei lisa autoriseerimist, kui seda ei paluta
5. **Logimine** — AI ei lisa logisid, kui seda selgesõnaliselt ei paluta
6. **Kontekst** — agendid kaotavad konteksti sessioonide vahel
7. **CI/CD maksumus** — iga push maksab raha; agendid kipuvad sageli pushima

### Peamine tulemus: uus arendusprotsess

Projekti kõige väärtuslikum tulemus pole kood, vaid **protsess**. Meil on reprodutseeritav arendusprotsess AI-agentidega ja selles on tohutult palju eeliseid:

**Protsessi eelised:**
- **Süstemaatiline kvaliteet.** Paranoiliselt süstemaatiline lähenemine: agendid kontrollivad 30+ reeglit igal commitil. Väljaspool tööaega (mis on nüüd samuti tööaeg).
- **Hüperkiire arendus.** Iteratiivne lähenemine: prototüüp poole tunniga → näidata kliendile → öösel testidega sisse viia.
- **Kiirendamine iga iteratsiooniga.** Pilootprojekt on lähtepunkt. Me teritasime tööriistu, proovisime ja eksisime. Aga:

| KPP (tarne) | Aeg | Märkus |
|-------------|-----|--------|
| 1. | 8 päeva | Ekvivalent ~5 inimest × 10 päeva |
| 2. | 2,5 päeva | |
| 3. | ~4 tundi | |

Iga iteratsiooniga — kiiremini ja kvaliteetsemalt. Sellist koodi on raske saada nii lühikese ajaga teiste meetoditega.

### Avatud küsimus: hooldatavus

**Kui see kood langeks tavaliste arendajate meeskonnale — mida nad ütleksid?**

Ühe programmeerija aus vastus: «Visata minema ja kirjutada uuesti». Mitte sellepärast, et kood on halb, vaid sest see on kirjutatud teisiti, kui inimesed on harjunud.

Aga: **kas see on üldse eesmärk?** Kui projekt genereeritakse ja hooldatakse AI-agentide poolt, kas on vaja, et inimesed saaksid selles mugavalt töötada? Sõltub kontekstist:

- **Kommertsiaal toode (AI tugi)** — ei pruugi. Agendid hooldavad oma koodi.
- **Riigihange** — võimalik, et vajalik üleandmine inimestele. Siis arhitektuur ja dokumentatsioon kriitilised.
- **Hübriid** — AI kirjutab, inimesed vaatavad üle ja suunavad. HAK-i praegune mudel.

---

## 7. Numbrid ühel slaidil

```
Projekt:    HAK — eesti kõneteenus
Periood:    3 kuud (dets 2025 — märts 2026)
Meeskond:   1 inimene + 5 AI-agenti

Commitid:   2 320
PR merged:  701
Ridu:       40K TypeScript + 12K Python/ML
Teste:      407 faili
Katvus:     80-95%
Pakette:    11
Terraform:  3 100 rida
CI/CD:      14 töövoogu

Ülevaatus:  74 punkti (2 ülevaatajat)
Suletud:    ~100 punkti
Avatud:     20 (pen-testid + edasilükatud)
```

---

## 8. Projekti tegelikud numbrid

### Eelarve ja fakt

| Mõõdik | Väärtus |
|--------|---------|
| Esialgne eelarve | 800 inimtundi |
| Tegelikult kulutatud | **500 tundi** (325 t Alex + 175 t analüütik/kliendiga suhtlemine) |
| Pluss | AI-agendid (2 320 commitit, 701 PR-i) |

### Eksperdi hinnang: kui inimesed oleksid teinud

Komponentide põhine hinnang koodi mahu ja keerukuse alusel:

| Komponent | Maht | Tunnid |
|-----------|------|--------|
| Frontend (React 19, 6 funktsiooni, 65 TSX, 13K SCSS) | ~24 000 rida | 530-720 |
| Auth (Cognito + TARA + JWT) | 942 rida + integratsioon | 160-240 |
| Store (DynamoDB, atomic upsert, Zod) | 1 385 rida | 130-160 |
| TTS API + Morphology API | 1 454 rida | 145-205 |
| Shared lib + API Client | 1 207 rida | 60-90 |
| TTS Worker (Python + ML integratsioon) | 319 rida + Docker | 110-150 |
| Infrastruktuur (Terraform, 24 faili) | 3 104 rida | 220-330 |
| CI/CD (GitHub Actions, 14 töövoogu) | 1 785 rida | 60-80 |
| Spetsifikatsioonid + Dokumentatsioon | 97 Gherkin + 31 dok | 95-135 |
| Juhtimine ja koordineerimine | — | 100-140 |
| **KOKKU (hinnang inimeste jaoks)** | | **1 610 — 2 250** |

**Märkus:** vahe eelarve (800 t) ja hinnangu (~2 000 t) vahel selgitub sellega, et inimesed oleksid kirjutanud vähem teste, vähem dokumentatsiooni ja vähendanud skoopi. AI-agendid genereerisid oluliselt rohkem artefakte, kui tavaliselt teeb inimmeeskond.

### Võrdlus: AI vs inimmeeskond

| Mõõdik | AI (fakt) | Inimesed (hinnang) |
|--------|-----------|-------------------|
| Kalendriaeg | 3 kuud | 4-6 kuud (3 in.) |
| Inimtunnid | 500 t (inimene) + agendid | ~800-2 000 t (meeskond) |
| Commitid | 2 320 | ~500-800 (tüüpiline) |
| Testide katvus | 80-95% | 60-80% (tüüpiline) |
| Dokumentatsioon | 31 sisedokumenti | 5-10 (tüüpiline) |

---

## 9. Meeskonna peamised järeldused

### Mis leidis kinnitust

1. **Sellised projektid on reaalsus.** Täisväärtuslik production-teenus, mille tegi 1 inimene + AI-agendid 3 kuuga.
2. **Meil on tõestatud mehhanismide ja praktikate kogum** — need töötavad ja on reprodutseeritavad.
3. **Testid on peamine kindlustus.** 407 testifaili = saab teha mis tahes refaktoreerimist. Muutsime rakenduse arhitektuuri mitu korda, mitte kordagi ei lagunenud süsteem. Saab saata agendid öösel 250 faili muutma — hommikul kõik töötab.
4. **Piiramatud tehnoloogilised teadmised.** Saame kasutada mis tahes turult leitud tehnoloogiat, isegi kui pole varem sellega töötanud. Näide: TARA-sisselogimise integratsioon — väga kartsime, aga kulus vaid 1,5 tundi.
5. **Prototüübid on meie supervõime.** 2-3 päevaga saame kliendile näidata, kuidas see välja näeb. Säästab tohutult aega ümbertegemisel.

### Vead ja õppetunnid

1. **Ei tohi ehitada "ametlikku versiooni" prototüübi kõrvale.** Alustasime prototüübiga, siis ehitasime paralleelselt "õiget" versiooni. See ei suutnud prototüüpi järele jõuda. Õige tee — viia prototüüp vajaliku kvaliteedini.

2. **Projekt = prototüüpide seeria.** Tööprotsess:
   - Võtad stabiilse, refaktoreeritud versiooni
   - Teed haru, eemaldad kõik kontrollid
   - Vibe-coding: prototüübid uut funktsionaalsust
   - Mängid prototüübiga, kuni näeb välja nii nagu vaja
   - Merge'id tagasi → merge'imisel kasvavad testid, linterid, compliance
   - Prototüüp poole tunniga → näitasid kliendile pärast koosolekut → öösel viisid main'i kõigi kontrollidega sisse

3. **Avatud küsimus: kas nii ranged kvaliteedinõuded on vajalikud?**
   - Complexity 8 (ESLint max-statements) — standard
   - 95% testide katvus — väga kõrge latt
   - Mõnikord kulutab agent 30 minutit ainult complexity 8 või 95% coverage saavutamiseks
   - Praegu on kruvid kinni keeratud — aga küsimus: kas lõdvendada kiiruse nimel?

---

## 10. Kvaliteedinõuete analüüs: mis on mõistlik ja mis üleliigne

### Praegused ESLint-reeglid

| Reegel | Väärtus | Tööstus | Hinnang |
|--------|---------|---------|---------|
| complexity (tsüklomaatiline) | **8** | 10-15 | Range, aga AI-koodi jaoks põhjendatud |
| cognitive-complexity | **8** | 10-15 | Range, aga põhjendatud |
| max-statements (.ts) | **10** | 15-25 | Liiga range — tekitab eslint-disable |
| max-statements (.tsx) | **15** | 15-25 | Normaalne |
| max-lines-per-function (.ts) | **30** | 50-75 | Kõige rangem, mida olen näinud |
| max-lines-per-function (.tsx) | **60** | 50-100 | Normaalne |
| max-lines (fail) | **200** | 200-300 | Normaalne |
| max-depth | **3** | 3-4 | Hea, takistab pesastamist |
| max-params | **3** | 3-5 | Range, aga sunnib head disaini |
| max-nested-callbacks | **2** | 3-4 | Range |

### Testide katvus

| Moodul | Praegune künnis | Tööstus | Hinnang |
|--------|-----------------|---------|---------|
| Globaalne min_total | **93%** | 70-80% | Väga kõrge — agendid raiskavad aega |
| shared | 80% | 70-80% | Mõistlik |
| store | 80% read, 75% funktsioonid | 70-80% | Mõistlik |
| auth | 90% harud | 70-80% | Kõrge, aga auth on kriitiline moodul |
| frontend | pole künnist | 60-70% | Õige — UI katvust on kallis mõõta |

### Soovitus

**Jätta rangeks (kaitsevad AI-vigade eest):**
- complexity: 8 — AI genereerib spagetikoodi ilma selle piiranguita
- max-depth: 3 — AI armastab pesastatud if/else
- max-params: 3 — sunnib parameetreid grupeerima
- max-lines: 200 — takistab jumala-faile
- Katvus 80% backend-moodulitel — mõistlik kindlustus

**Lõdvendatud (otsus tehtud, muudatused sisse viidud):**
- max-statements: 10 → **12** — eemaldab enamiku eslint-disable
- max-lines-per-function: 30 → **40** — 30 on liiga vähe reaalsete funktsioonide jaoks
- Globaalne min_total: 93% → **90%** — vähendab survet mõttetutele testidele
- max-nested-callbacks: 2 → **3** — 2 on liiga vähe Promise-ahelate jaoks

**Lõppjäreldus:** reeglid on vaimult õigesti kirjutatud — need ei lase AI-l koodi degradeerida. 4 väärtust on 10-25% lõdvendatud, mis säästab agentide aega ilma märgatava kvaliteedi languseta. Ülejäänud ranged reeglid (complexity 8, max-depth 3, max-params 3) on jäetud — need on kriitilised AI-koodi kontrollimiseks.

---

## 11. Ränitiim vs inimtiim: põhimõttelised erinevused

Juhtimisstruktuur on sama (ülesanded, ülevaatus, deploy), aga hõõrdumine sees on radikaalselt väiksem.

### 6 võtmeerinevust

1. **Kohene kloonimine.** Inimest ei saa kopeerida. Põleb production ja samaaegselt on funktsiooni tähtaeg — inimmeeskonnas on see ressursikonflikt. Ränimeeskonnas — lihtsalt tõstad veel ühe konteineri. Kaotab täielikult mõiste "pudelikael" inimeste järgi.

2. **Pole konteksti sessioonide vahel.** Inimene tuli hommikul ja mäletab eilset päeva. Agent sünnib iga kord uuesti — taastab konteksti koodist, tikitest, kommentaaridest. Seepärast on dokumentatsiooni ja tikite kvaliteet mitte "hea praktika", vaid sõna otseses mõttes **meeskonna operatiivmälu**. Ilma selleta on agent pime.

3. **Pole egot ega poliitikat.** Inimene solvub koodiülevaatuse peale, vaidleb arhitektuuri üle põhimõttest, kaitseb "oma" koodi. Agendile on ükskõik. Öine refaktoreerija kirjutab tema mooduli ümber — ja midagi ei juhtu. Lihtsustab kolossaalselt juhtimist: pool juhtimisest inimmeeskondades on emotsioonide juhtimine.

4. **Ühesugune mõtlemine.** Kui üks mudeli eksemplar sai ülesandest aru — saab ka teine. Inimmeeskonnas mõtlevad senior ja junior erinevalt. Siin on kõik agendid ühtviisi tugevad. Pole "nõrga lüli" probleemi.

5. **Seisuaja maksumus = null.** Inimene, kes ootab ülevaatust või on blokeeritud — saab ikkagi palka ja on frustreeritud. Agent lihtsalt ei käivitu ja see ei maksa midagi. Saab protsessi ehitada nii, et agendid töötavad ainult siis, kui on tööd.

6. **Pole initsiatiivi.** Inimene võib tulla ja öelda: «me läheme arhitektuuriliselt tupikusse» või «proovime hoopis teist lähenemist». Agent teeb seda, mida talle öeldi. Strateegiline mõtlemine, tootevisoon, loominguline pööre — see jääb inimese kanda. Inimene selles süsteemis pole lihtsalt juht, vaid **ainus suuna allikas**.

### Järeldus

Ränitiim on ideaalne täitmismasin nulliste inimkuludega, aga ilma oma tahteta. Juhtimisstruktuur on sama, sest ülesanded on samad. Aga hõõrdumine struktuuri sees on radikaalselt väiksem.

---

## 12. Aruteluküsimused

1. Kuidas skaleerida AI-agentide lähenemist teistele projektidele?
2. Millal lõdvendada quality gate'e ja millal hoida rangelt?
3. Kuidas korraldada tsükkel «prototüüp → vibe-coding → merge kvaliteediga»?
4. Millised ülesanded jätta inimesele ja millised delegeerida AI-le?
5. Kuidas vähendada CI/CD maksumust AI-agentidega töötamisel?
