# HAK-i arenduse tegevuskava

**Kuupäev:** 2026-02-26
**Koostaja:** Askend Lab
**Adressaat:** EKI (Eesti Keele Instituut)

---

## Mis on HAK täna

HAK (Hääldusabiline) on eesti keele häälduse õppimise platvorm unikaalse võimekusega: **Vabamorfi-põhine foneetiliste variantide valik** — midagi, mida ükski konkurent ei paku. Kasutajad sisestavad eestikeelse teksti, kuulevad seda kõnelduna ja uurivad iga sõna hääldusvalikuid.

Platvorm töötab AWS serverless-infrastruktuuril, sisaldab üle 3100 automatiseeritud testi ning teenindab kolme kasutajarolli: õppija, õpetaja ja teadlane.

---

## Faas 1: Uue põlvkonna kõnesüntees

*Suurim hüpe kasutajakogemuses ja platvormi võimekuses.*

### Uue põlvkonna neuraalne TTS

| Aspekt | Täna (Merlin) | Pärast uuendust |
|--------|---------------|-----------------|
| **Tehnoloogia** | Statistiline parameetriline (Theano, 2016) | Neuraalne (mudel TBD — sõltub EKI/TartuNLP koostööst) |
| **Hääle kvaliteet** | Funktsionaalne, artefaktidega | Sõltub valitud mudelist |
| **Sünteesi kiirus** | ~4 sek sõna kohta (CPU) | Sõltub valitud mudelist ja infrastruktuurist |
| **Kasutaja tajutav viivitus** | 5–7 sek (järjekord + süntees + päring) | Vähendatud voogedastuse abil (täpne võit sõltub mudelist) |
| **Häälvalikud** | 2 mudelit | Sõltub valitud mudelist |
| **Infrastruktuur** | Ainult CPU (ECS Fargate) — NB: Theano toetab juba GPU-d | GPU infrastruktuur (Inferentia / g5.xlarge / SageMaker) |

**Oluline kontekst:** Praegune Merlini mudel (Theano) toetab juba GPU-d — piirang on infrastruktuuris (Fargate'il pole GPU-d), mitte mudelis. GPU-le üleminek on infrastruktuuri muudatus, mitte mudeli muudatus. Uus mudel on eraldi otsus, mis sõltub EKI koostööst.

**Migratsiooni plaan:**
1. Uurida koostöövõimalust TartuNLP / EKI-ga uue põlvkonna eesti TTS-mudeli loomiseks (meie ehitame platvormi, mitte mudelit)
2. Paigaldada GPU-võimeline arvutusinfrastruktuur (AWS Inferentia kulude optimeerimiseks või g5.xlarge paindlikkuse tagamiseks)
3. Asendada järjekorra-päringu arhitektuur reaalajas WebSocket-voogedastusega
4. Hoida praegune Merlin varuvariantina ülemineku ajal

### Reaalajas voogedastuse arhitektuur

```
Täna:    Brauser → API → SQS → CPU Worker → S3 → päring → WAV allalaadimine
Pärast:  Brauser → WebSocket → GPU → helifragmentide voog → kohene taasesitus
```

- **Viivitus**: Voogedastus kõrvaldab ~1–2 sek järjekorra/päringu üldkulu; kogu viivituse paranemine sõltub valitud mudelist
- **Kuluefektiivsus**: Sõltub mudelist, GPU tüübist ja liiklusmahust — vajab võrdlusuuringut
- **Kasutajakogemus**: heli on kuuldav juba selle genereerimise ajal, mitte pärast täielikku sünteesi

### Tihendatud helivormingud

WAV (suur, tihendamata) asendamine Opus- või MP3-vorminguga — **5–10× väiksemad failid**, kiiremad allalaadimised, väiksem hoiustamiskulu. Eriti oluline mobiilsete kasutajate jaoks aeglastel ühendustel.

---

## Faas 2: Aktiivõpe

*Muudab HAK-i passiivsest kuulamisvahendist interaktiivseks häälduse treeninguks.*

### Häälsalvestus ja võrdlus

| Funktsioon | Kirjeldus |
|------------|-----------|
| **Salvesta oma hääldus** | Mikrofoni nupp iga lause kõrval — salvesta, kuula tagasi |
| **Kõrvuti taasesitus** | Kuula TTS-i etalonhääldust, seejärel oma salvestust — tuvasta erinevused |
| **Visuaalne lainekuju võrdlus** | Vaata helilaineid üksteise peal — visuaalne tagasiside ajastuse ja rütmi kohta |
| **Häälduse hindamine** (tulevikus) | Automaatne sarnasuse mõõdik (DTW/MCD) — kvantifitseeri edenemine |

See on kõige soovitum funktsioon kõigi kasutajatüüpide lõikes (õppija, õpetaja, logopeed, lapsevanem). See muudab HAK-i harjutusvahendiks, mitte ainult teatmikuks.

### Minimaalpaari treener

| Funktsioon | Kirjeldus |
|------------|-----------|
| **Kureeritud minimaalpaari komplektid** | „kool" vs „kuul", „saal" vs „seal" — kõige levinumad häälduse vead |
| **Kuula ja vali** | Kuula sõna, vali, milline see oli — treenib foneemilist teadlikkust |
| **Raskusastme progressioon** | Alusta ilmsete paaridega, liigu peente eristuste juurde |
| **Emakeelespetsiifilised komplektid** | Erinevad paarid vene, ukraina, inglise kõnelejatele — igal keelel on erinevad pimedad kohad |

Minimaalpaari treening on foneetika õpetuse kuldstandard. Ükski eesti keele rakendus ei paku seda.

### Õpilase edenemise jälgimine

| Funktsioon | Kirjeldus |
|------------|-----------|
| **Harjutuste ajalugu** | Harjutatud sõnad ja laused, kulutatud aeg, sagedus |
| **Edenemise trendid** | Visualiseeri edenemine päevade/nädalate lõikes |
| **Igapäevased eesmärgid** | Valikuline seerialoendur ja harjutamise sihtmärgid |
| **Õpilasevaade õpetajale** | Millised õpilased harjutasid, kui palju, milliste sõnadega |

Ilma edenemise jälgimiseta pole õppijatel võimalust mõõta paranemist — see on nr 1 tegur püsiva motivatsiooni hoidmisel.

### Õpetaja töölaud

Praeguse ülesannete jagamise laiendamine täielikuks pedagoogiliseks töövooks:

| Funktsioon | Kirjeldus |
|------------|-----------|
| **Klassi haldamine** | Loo klasse, lisa õpilasi, määra ülesandeid gruppidele |
| **Ülesannete staatus** | Vaata, millised õpilased on ülesanded lõpetanud, kes vajab abi |
| **Tagasiside mehhanism** | Hinda õpilase hääldust, lisa kommentaare |
| **Lõpetamise kinnitus** | Õpilane märgib „Tehtud" → õpetaja näeb staatust reaalajas |

### Eksamiks valmistumise režiim

| Funktsioon | Kirjeldus |
|------------|-----------|
| **B1/B2 sõnavaranimekirjad** | Sõnad ja fraasid ametlikest eesti keele eksamiprogrammidest |
| **Situatsioonidialoogid** | „Poes", „Arsti juures", „Tööintervjuu" — reaalse elu vestluste harjutamine |
| **Ajastatud harjutused** | Simuleeri eksamitingimusi ajapiiranguga |
| **Valmisoleku hindamine** | Jälgi, millised eksamiteemad on omandatud ja millised vajavad lisaharjutamist |

Eesti nõuab eesti keele oskust kodakondsuse ja paljude töökohtade jaoks. HAK-ist saab riiklik eksamiks valmistumise vahend.

Koolid on peamine levitamiskanal riiklikule keeleinstituudile. Õpetaja töövood juhivad õpilaste kaasatust.

---

## Faas 3: HAK kõikjal

*Paku eesti häälduse abi seal, kus inimesed seda vajavad — mitte ainult aadressil hak.askend-lab.com.*

### Telegram / WhatsApp bot

Saada mis tahes eestikeelne tekst → saa heli kohe tagasi. Pole vaja veebisaiti, registreerimist ega rakenduse allalaadimist.

- Eesti immigrandid elavad sõnumirakendusites. Mine nende juurde.
- Jaga hääldust grupivestlustes — sotsiaalne õppimine.
- Tehniline teostus: AWS Lambda + Telegram Bot API + olemasolev sünteesitoru.

### Chrome'i laiendus

Tõsta esile mis tahes eestikeelne tekst mis tahes veebisaidil → kuule seda hääldatuna. Paremklõpsu kontekstimenüü: „Häälda HAK-iga".

- Eesti uudiste, blogide, riiklike veebisaitide lugemine — häälduse abi on ühe klõpsu kaugusel.
- Viraalne kasv: iga kasutaja saab levitamiskanaliks.
- Põhineb olemasoleval avalikul API infrastruktuuril.

### Manustatav vidin

```html
<script src="https://hak.askend-lab.com/widget.js"></script>
```

Iga eesti veebisait lisab oma sisule häälduse. Ajalehed, haridusportaalid, riiklikud saidid, blogid — HAK-ist saab Eesti interneti häälduskiht.

### Avalik API

**Juba teostatud:**
| Funktsioon | Staatus |
|------------|---------|
| **OpenAPI spetsifikatsioon** | ✅ Tehtud — `merlin-api.openapi.yaml`, `vabamorf-api.openapi.yaml`, genereeritud Zod skeemidest |
| **TypeScript klient** | ✅ Tehtud — `packages/api-client` automaatselt genereeritud tüüpidega OpenAPI-st |
| **Päringupiirang (WAF)** | ✅ Tehtud — IP-põhine ja tee-põhine päringupiirang failis `infra/waf.tf` |

**Uus vajalik töö:**
| Funktsioon | Kirjeldus |
|------------|-----------|
| **API võtmete haldamine** | Iseteenindusvõtmed arendaja töölaua kaudu (praegu: Cognito JWT või anonüümne) |
| **Võtmepõhised kvoodid ja kasutustasandid** | Kasutusanalüütika, astmeline juurdepääs lisaks praegustele WAF päringupiirangutele |
| **Python SDK** | Klientteek Pythonile (TypeScript on juba olemas) |

API avamine kolmandatele osapooltele loob ökosüsteemi: muud keelerakendused, logopeediatarkvara, hariduskirjastajad, teadusasutused — kõik ehitavad HAK-i unikaalse eesti TTS-i + foneetilise analüüsi peale.

### LTI integratsioon (haridus)

| Funktsioon | Kirjeldus |
|------------|-----------|
| **LTI 1.3 pakkuja** | Integreeri Moodle'i, Canvas'i, Google Classroom'iga |
| **Hinnetöötlus** | Saada häälduse hindeid tagasi LMS-i hinnetabelisse |
| **Süvalinkimine** | Õpetaja manustab konkreetsed häälduse ülesanded otse kursuse materjalidesse |

Eesti koolid kasutavad Moodle'it laialdaselt. LTI integratsioon tähendab, et õpilased pääsevad HAK-ile juurde otse oma õpikeskkonnast — null hõõrdumist, eraldi kontosid pole vaja.

### Mitmekeelne kasutajaliides

Sihtrühm — eesti keelt õppivad inimesed — ei valda definitsiooni järgi eesti keelt täielikult. Kasutajaliides nende emakeeles kõrvaldab suurima üksiku takistuse immigrantide kasutuselevõtul.

Prioriteetsed keeled määratakse immigratsioonistatistika ja EKI sisendi põhjal. Raamistik (react-i18next) toetab piiramatut arvu keeli — kogukond saab panustada tõlkeid standardsete JSON-failide kaudu.

---

## Faas 4: Rahvuslik keelelabor

*Positsioneerida HAK Eesti riiklikuks häälduse infrastruktuuriks — platvorm, mida ainult EKI saab ehitada.*

### Piirkondlike murrete uurija

Eestis on selgelt eristuvad murdepiirkonnad (Saare, Võru, Mulgi, Seto) ainulaadsete hääldusmustritega. HAK-ist võib saada elav arhiiv:

| Funktsioon | Kirjeldus |
|------------|-----------|
| **Murdekaart** | Interaktiivne Eesti kaart — klõpsa piirkonnale, kuula, kuidas nad ütlevad |
| **Standard vs piirkondlik** | Kõrvuti võrdlus kirjakeele ja piirkondliku häälduse vahel |
| **Ajalooline hääldus** | Kuidas eesti keel kõlas 50, 100 aastat tagasi (EKI arhiividest) |

See positsioneerib HAK-i kultuuripärandi vahendina, mitte ainult õppevahendina. Ainulaadne EKI-le — ühelgi ärilisel pakkujal pole juurdepääsu nendele andmetele.

### Morfoloogilise analüüsi kasutajaliides

Vabamorf pakub juba morfoloogilist analüüsi tagataustal. Tee see kasutajatele kättesaadavaks:
- **Sõnaliik** (nimisõna, tegusõna, omadussõna)
- **Käändevormid** (kõik 14 eesti käänded)
- **Lemma** (algvorm)
- **Liitsõnade struktuur** (kuidas eesti liitsõnad jaotuvad)

See teenindab teadlasi, tõlkijaid ja edasijõudnud õppijaid — sihtrühmi, mis praegu kasutavad eraldi tööriistu.

### Intelligentne hääldusjuhis

| Funktsioon | Kirjeldus |
|------------|-----------|
| **„Normatiivse häälduse" silt** | Märgi EKI soovitatud variant selgelt |
| **Homonüümide eristamine** | Kontekstiteadlik häälduse valik (nt „linn" = linn vs „lina" omastav) |
| **Võõrsõnade käsitlemine** | Graatsiline taandumisvariant laensõnadele, nimedele, lühenditele |
| **IPA väljund** | Rahvusvaheline foneetiline tähestik eesti notatsiooni kõrval — akadeemikutele |

### Õigekirjakontroll ja soovitused

Vabamorfi-põhine „Kas mõtlesite...?" kirjavigade jaoks — eriti väärtuslik õppijatele, kes teevad süstemaatilisi õigekirjavigu. Morfoloogiamootor teab juba kehtivaid eesti sõnavorme; paranduste soovitamine on loomulik laiendus.

### Teadusportaal

Anonüümitud, koondatud andmed HAK-i kasutusest — kullaauk keeleteaduse uuringute jaoks:

| Teadmine | Väärtus |
|----------|---------|
| **Millised sõnad on raskemad?** | Järjestatud sünteesi sageduse + salvestuse korduskatsete arvu järgi |
| **Veamustrid emakeele järgi** | Vene kõnelejad jäävad hätta X-iga, ukraina Y-iga |
| **Piirkondlikud õppemustrid** | Tallinn vs Tartu vs Narva — erinevad vajadused |
| **Häälduse paranemine aja jooksul** | Pikaajalised andmed õppimise tõhususe kohta |

Ükski teine platvorm ei suuda neid andmeid pakkuda. EKI-st saab autoriteet selles, kuidas inimesed eesti hääldust õpivad.

---

## Mittefunktsionaalne areng

### Jõudlus

| Mõõdik | Täna | Eesmärk |
|--------|------|---------|
| Sünteesi viivitus | 5–7 sek (järjekord + süntees + päring) | Vähendatud voogedastuse abil (täpne eesmärk sõltub mudelist) |
| Helifaili suurus | WAV (~100 KB/lause) | Opus (~10 KB/lause) |
| Mobiilirakenduse kogemus | Ainult veeb | PWA („Lisa avakuvale", vahemällu salvestatud heli) |
| Külmkäivitus | ~3 sek | <1 sek (ettevalmistatud samaaegsus) |

### Infrastruktuur

**Juba teostatud:**
| Funktsioon | Staatus |
|------------|---------|
| **Automaatskaleerimine** | ✅ Tehtud — SQS-põhine 0→N skaleerimine `appautoscaling` sihtjälgimisega failis `infra/merlin/main.tf` |
| **Skaleerimine nullini** | ✅ Tehtud — `desired_count = 0`, automaatskaleerimine haldab töötajate arvu järjekorra sügavuse põhjal |

**Uus vajalik töö:**
| Parandus | Kirjeldus |
|----------|-----------|
| **GPU-võimeline infrastruktuur** | Inferentia või EC2 GPU instantsid neuraalse TTS-i jaoks (nõuab ECS-i EC2-l, mitte Fargate'il) |
| **CDN heli jaoks** | CloudFront vahemälu sünteesitud heli jaoks — väiksem viivitus, vähendatud S3 väljundkulu |
| **Privaatne võrgustik** | Arvutuse viimine privaatsetesse alamvõrkudesse (ilma avalike IP-deta) |
| **Testimiskeskkond** | Dev → Staging → Production toru |

### Kuluprofiil

| Komponent | Täna | Pärast GPU migratsiooni |
|-----------|------|-------------------------|
| Sünteesi kulu | ~$0.04/tund CPU Fargate töötaja kohta | GPU instantsi kulu varieerub ($0.84/tund g5.xlarge jaoks) — vajab võrdlusuuringut |
| Efektiivne kulu sünteesi kohta | Sõltub liiklusmahust | Sõltub mudelist, partii võimekusest ja liiklusest — vajab võrdlusuuringut |
| Jõudeoleku kulu | ✅ Juba skaleerimine nullini (automaatskaleerimine) | Sama põhimõte kehtib GPU instantsidele |
| Hoiustamine | WAV failid, elutsüklita | Tihendatud + elutsükli poliitika |

---

## Investeeringu kokkuvõte

| Faas | Peamised tulemid |
|------|------------------|
| **1: Neuraalne TTS** | GPU infrastruktuur, voogedastuse arhitektuur, tihendatud heli (mudel sõltub EKI koostööst) |
| **2: Aktiivõpe** | Häälsalvestus, minimaalpaari treening, edenemise jälgimine, õpetaja töölaud, eksamiks valmistumine |
| **3: HAK kõikjal** | Telegrami bot, Chrome'i laiendus, manustatav vidin, API võtmed, LTI, mitmekeelne kasutajaliides |
| **4: Rahvuslik keelelabor** | Piirkondlikud murded, morfoloogia kasutajaliides, õigekirjakontroll, IPA, teadusportaal |

Faasid kattuvad — faasi 2 kasutajaliidese tööd algavad samal ajal, kui faasi 1 GPU infrastruktuuri paigaldatakse.

---

## Konkurentsi positsioon pärast tegevuskava

| Võimekus | HAK | Google TTS | Amazon Polly | Konkureerivad rakendused |
|----------|-----|-----------|--------------|--------------------------|
| Eesti foneetiliste variantide valik | ✅ Ainulaadne | ❌ | ❌ | ❌ |
| Morfoloogiline analüüs (Vabamorf) | ✅ Ainulaadne | ❌ | ❌ | ❌ |
| Piirkondlike murrete uurija | ✅ Ainulaadne (pärast faasi 4) | ❌ | ❌ | ❌ |
| Minimaalpaari treener | ✅ (pärast faasi 2) | ❌ | ❌ | ❌ |
| Neuraalse TTS kvaliteet | ✅ (pärast faasi 1) | ✅ | ✅ | Erinev |
| Häälsalvestus ja võrdlus | ✅ (pärast faasi 2) | ❌ | ❌ | Mõned |
| Eksamiks valmistumine (B1/B2) | ✅ (pärast faasi 2) | ❌ | ❌ | ❌ |
| Õpetaja-õpilase töövoog | ✅ (pärast faasi 2) | ❌ | ❌ | ❌ |
| Telegram/WhatsApp bot | ✅ (pärast faasi 3) | ❌ | ❌ | ❌ |
| Chrome'i laiendus | ✅ (pärast faasi 3) | ❌ | ❌ | ❌ |
| Manustatav vidin | ✅ (pärast faasi 3) | ❌ | ❌ | ❌ |
| LTI / Moodle'i integratsioon | ✅ (pärast faasi 3) | ❌ | ❌ | ❌ |
| Teadusportaal | ✅ (pärast faasi 4) | ❌ | ❌ | ❌ |
| Avalik API eesti TTS-i jaoks | ✅ Osaliselt (OpenAPI, TS klient, WAF päringupiirang tehtud; API võtmed, Python SDK pooleli) | ✅ (piiratud eesti) | ✅ (piiratud eesti) | ❌ |
| Avatud lähtekood (MIT) | ✅ | ❌ | ❌ | ❌ |
| TARA eID autentimine | ✅ | ❌ | ❌ | ❌ |
| Nullbarjääriga sisenemine (registreerimiseta) | ✅ | ❌ | ❌ | ❌ |

**HAK-i ainulaadne kaitsevall:** Vabamorfi foneetilise analüüsi + EKI keelelise autoriteedi + avatud lähtekoodi + Eesti eID autentimise kombinatsioon loob positsiooni, mida ükski äriline TTS-i pakkuja ei suuda kopeerida.

---

## EKI-lt vajalikud otsused

| # | Otsus | Mõju |
|---|-------|------|
| 1 | **Millist neuraalset TTS-mudelit arendada?** Koostöö TartuNLP-ga, EKI uurimus või tellida uus? (Meie ehitame platvormi, mitte mudelit) | Faasi 1 ajakava |
| 2 | **Avaliku API ulatus** — tasuta teadusuuringuteks? Tasulised astmed ärikasutuseks? | Faasi 3 ärimudel |
| 3 | **Sisu modereerimise poliitika** — vajalik koolikonteksti vs logopeedia jaoks („perse" on kehtiv eesti sõna) | Kasutajate usaldus |
| 4 | **Sünteesi autentimine** — hoida anonüümne juurdepääs? Nõuda sisselogimist pärast N kasutust? | Väärkasutuse ennetamine vs kasutuselevõtt |
| 5 | **i18n prioriteet** — millised keeled esimesena? Kogukonna tõlked? | Faasi 3 järjekord |
| 6 | **Murdeandmete juurdepääs** — kas EKI saab pakkuda piirkondlikke häälduslindistusi/andmeid? | Faasi 4 ulatus |
| 7 | **Teadusportaali eetika** — kasutusandmete anonümiseerimise standardid? IRB heakskiit vajalik? | Faasi 4 käivitamine |
