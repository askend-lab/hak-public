# Prototüübi testimine \- Kokkuvõtte ja soovitused

## Askend

### Taust ja metoodika

Kokkuvõte põhineb Askendi prototüübi kasutatavuse testimisel **8 kasutajaga kahest erinevast sihtgrupist**:

* 3 Pae Gümnaasiumi eesti keele õpetajat (Eesti keel kui võõrkeelteine keel). Kokkuvõtte leiab [siin](https://wisercatestoniaou.sharepoint.com/:w:/s/EKI-hldusabilise-kasutajaliides/IQAVMA9Ct28kQI4IG95sNBIbAezkt5GoWvbTQWBQJyhLvaw?e=rTv0Fu).  
* 5 ISE kasutajat (1 õpetaja ja 2 õppijat). Kokkuvõtte leiab [siin](https://wisercatestoniaou.sharepoint.com/:w:/s/EKI-hldusabilise-kasutajaliides/IQBtpRvilN96QY4TNHmi2bPeAQ5drokcHt9h8evel9Hpbu0?e=MLbIcT).

## Eesmärk ja fookus

Testimise eesmärk oli **UX ehk kasutatavuse hindamine**, mitte esmase vajaduse valideerimine.  
Samas tõi testimisprotsess selgelt esile, et enne edasist tootearendust on vaja:

* paremini **defineerida sihtgrupid**,  
* mõista nende **konkreetseid vajadusi ja kasutuskontekste**,  
* ning planeerida edasiarendusi selgete **rollide ja kasutusstsenaariumide** alusel.

## Üldised tähelepanekud

Testitud sihtgruppide vahel ilmnesid **märkimisväärsed erinevused** tööriista mõistmises ja kasutamises:

* **Õpetajad** hakkasid kiiresti uurima sõnu, hääldusi ja variante ning pakkusid ise välja konkreetseid kasutusstsenaariume.  
* **Õppijad** ei saanud selgelt aru, mida tööriistaga teha – nad katsetasid hääldust ja sisestasid juhuslikke sõnu või lauseid, kuid ei kasutanud vahendit sihipäraselt.

See kinnitab, et:

Kui kasutajal on selge **kontekst**, **roll** ja talle on tööriista funktsioonid vastavalt sellele tutvustatud, on ka tööriista väärtus ja kasutusloogika oluliselt paremini mõistetav.

## Peamised leiud ja soovitused

Testide tulemusel saab esile tuua **kolm põhivaldkonda**, kus ilmnesid nii probleemid kui ka arenguvõimalused:

1. Vastavus vajadustele  
2. Kasutatavus  
3. Kõnesünteesi spetsiifika

## 1\. E-vahendi vastavus vajadustele

**Põhiküsimus:** Kas antud etapi jaoks olid kasutajarollid ja nende vajadused korralikult defineeritud ja mõistetud. Näiteks, kas õppekavas ja tegelikus õppepraktikas on olemas selge vajadus sellise tööriista järele (nt väldete ja rõhu eristamine)? 

### Probleemid

Tööriist püüab olla *kõigile kõike*, mistõttu erinevate kasutajate vajadused on kokku segatud ja konkreetseid ja realistlikke kasutusstsenaariume on raske ette kujutada. 

### Täheldatud kasutajarollid

Testide põhjal saab eristada vähemalt **4 erinevat kasutajagruppi**, kellel on erinevad eesmärgid ja motivatsioon:

* Tavakasutaja  
* Keeleõppija  
* Keeleõpetaja  
* Kõnesünteesi spetsialist

### Soovitus

Enne järgmiste etappide, defineerida selgelt, millistele rollidele tööriist on suunatud ja milliseid probleeme iga rolli jaoks lahendatakse, ning kasutades juba loodut tööriista MVP versiooni, viia läbi kogumise ja vajaduste valideerimise intervjuud ja testid.

## 2\. Kasutatavus

### Positiivne

* Kasutajaliidese funktsioonid olid **üldiselt arusaadavad**, kui neid oli vähemalt korra selgitatud või näidatud.

### Probleemid

* Suurim segadus tekkis:  
  * **konteksti puudumisest** – kasutaja ei teadnud, *mida* ja *miks* ta peaks tegema  
  * rollist sõltuvalt oli arusaam tööriistast väga erinev

### Tehtud ja planeeritud lahendused

* Väiksemad kasutajaliidese probleemid on juba **uues versioonis parandatud**  
* Rollipõhine lähenemine:  
  * kasutaja rolli valik  
  * esmase juhendamise (wizard) lisamine

## 3\. Kõnesünteesi spetsiifika

Kõnesüntees on **väga spetsiifiline keeleõppe osa**, mis ei ole kõigi õppijate jaoks võrdselt oluline.

### Õppijate tagasiside

* Enamik ei tundnud suurt vajadust:  
  * häälduse peente erinevuste (nt väldete) eristamiseks  
* Üldine arvamus:  
  * eesti keel on suhteliselt lihtne hääldada, kuna „hääldatakse nii nagu kirjutatakse“  
* Rohkem huvi pakkus:  
  * terviklausete või pikemate tekstide kuulamine ja harjutamine

### Õpetajate tagasiside

* Antud tüüpi harjutused on:  
  * väga spetsiifilised  
  * sobivad vaid **konkreetsele vanusele ja keeletasemele**  
* Vajalik on täpsustada:  
  * millistele vanusegruppidele ja tasemetele see lähenemine sobib  
  * konkreetsed õpekava osad kus antud harjutused on vajalikud  
* Olenevalt vanusest ja tasemest, võimalik et kasutajaliidest vaja kohandada, kui on selleks EKI’l huvi ja see on suund kuhu vahend edasi arendada, ehk pakkuda keeleõpe platvormi. Näiteks :  
  * lapsed → mänguline kasutajaliides  
  * täiskasvanud algajad → lihtne ja selge kasutajaliides

### Kõnesünteesi spetsialistid

* Seda sihtgruppi **ei ole veel intervjueeritud ega testimisse kaasatud**, kuigi mitmed funktsioonid näivad sobivat just neile.

### Ühine probleem kõigi gruppide seas

* Raske oli tajuda häälduserinevusi sõnavariantide vahel (nt *palk*, *kooli*)  
* Mõnikord ei vastanud pakutud variandid kasutaja ootustele (nt *koer*)  
* Hääldusreeglite (kolmas välde, palatalisatsioon) kuvamise vajadus või nende tähendus ei olnud arusaadavad isegi õpetajatele.

Need teemad on pigem **eksperttaseme** (kõnesünteesi spetsialistide) jaoks. Tavakasutajale oleme proovinud seda leevendada **lihtsustatud hääldusjuhendiga kasutajaliideses**.

# UX tähelepanekud ja lahendused / soovitused

| Leiud | Lahendused/ettepanekud | Kas parandatud antud etapis? |
| :---- | :---- | :---- |
| Funktsioonid olid selged kui üks kord näidatud | Lisame wizardi esimese korra kasutajate jaoks | Jah |
| Sisselogimist ei tahtnud teha, see ehmatas kasutajaid | Ei tee midagi, enamus kasutajatest kellele on sisselogimine vaja on õpetajad, ja me oletame et nemad kasutavad sihipäraselt vastavalt vajadustele ja sisselogimine nende jaoks on loomaulik | Ei |
| **KÕNESÜNTEES** |  |  |
| Kasutaja ei mõelnud välja, et saab sõna peale klikkida. | Lisatud wizard esimese korra kasutajate jaoks, ning nooleke lisafunktsioonidega | Jah |
| Ootus on, et sõna saab lauses muuta, minnes selle peale, klikkides vahele, eriti kui on vigadega sisestatud. | Lisatud iga sõna jaoks lisa funktsioonid |  |
| Kasutajad sisestasid sõnad vigadega | Antud vajadust tuleb analüüsida järgmises etapides, testides MVP prototüübi. Ei ole arusaadav kas see on tegelikult probleem mis vajab parandamist, sest antud vahend ei ole kirjavigade parandaja, ning kasutajad tulevad siia kuulata kuidas sõna õieti hääldada mitte kuidas seda õieti kirjutada.  | Ei |
| Rohkem klikkitakse mängi kui mängi kõik | Tee mängi kõik mitteaktiivseks enne kui on rohkem kui üks lause ekraanil | Jah |
| Soov oli aegalasemini mängida laused | Antud funktsionaalsus ei ole ettenähtud antud etapis. Kui meil jätkub aega siis vaatame kas saab lisada | ?? |
| Viimane sõna ei muutu pilliks ilma Enter või tühikuta | Muudetud interaktsioon esimese lause sisestamise jaoks – kui lause sisestamise kast on tühi, siis kasutaja saab lause lõpuni sisestada, ja ainult vajutades Enter või Play, kui sõnad muutuvad pillideks | Jah |
| **VARIANTIDE PANEEL** |  |  |
| Kasutaja ei saanud aru miks on mitu sõna variandi, eriti kui nad on ühesugused.  | Eemaldame duplitseeritud sõnad, näitame ainult sõnad millele on erinev hääldus. | Jah |
| Tavakasutajale ei ole  ka selge et mis näiteks palatalisatsioon on ja kuidas see sõna hääldust mõjutab | Lisame tavakasutaja hääldamise abitekst. | Jah |
| Kui sõna on vahetatud lauses, siis ei ole selge et midagi juhtus ja paneel lihtsalt läks kinni | Ei pane paneel kinni sõna vahetamise peale. Fookus liigub valitud sõna peale ja see näitab et valik on tehtud | Jah |
| Lisa oma variant – antud funktsionaalsus pöörab kõige rohkem tähelepanu endale paneelis, kuigi see on edasijõudnutele kasutajatele suunatud ja ei ole tihti kasutatud | Peidame antud komponent nuppu alla “loo oma variant” | Jah |
| Reeglite pillide font liiga väike | Suurendame fondi | Jah |
| **ÜLESANNETE HALDAMINE** |  |  |
| Loo/lisa ülesanne funktsionaalsus oli enamuselt üsna selge. | Ei ole vaja antud etapis viia sisse muudatusi |  |
| Kirjeldus ei ole näha, väike font. | Suurendame fondi  | Jah  |
| Üks kasutaja arvas, et “lae alla” on salvesta ülesandesse | Muudame texti “lae alla .wav fail” | Jah |
| Ei olnud selge kuhu salvestatud ülesanne läheb. Oli soov uurida, vajutada ülesande salvestuse teade peale | Lisame link “Ava ülesanne” kinnitussõnumile | Jah |
| Ülesanne lisamisel modaalis on list lausetest, mis üks kasutaja uuris nagu tahtis peale vajutada. | Muudame modaali disaini kus eemaldame antud listi et kasutajat mitte segada | Jah |
| Ühe kasutaja kommentaar “Sõnadel, millel on välde peal võiks olla märge juures”, ehk kui vaatad lausetele otse, siis kohe ei ole arusaadav mis on lausetel erinev.  | Hetkel muudatusi ei tee. Kasutaja saab vaadata terve lause foneetilist kuju lisa funktsioonide all.  | Jah |
| Mitu kasutajat ei mõelnud kohe välja või ei saanud aru, mis ülesande nimetuseks panna, aga sai ilusti aru mis kirjeldusse läheb. | Paneme sisestuskasti kirjelduse tekst näiteks “Anna oma ülesandele nimetus” | Jah |
| Jaga funktsioon  Ei olnud kohe leitud mitme kasutaja poolt. Kui ette näidata siis oli kohe väga loogiline. | Hetkel muudatusi ei tee. Funktsioon on mõeldud õpetajatele ja nemad kasutavad tööriista sihipäraselt ja saavad tuttavaks jaga funktsiooniga | Jah |
| Jaga funktsioon oli hästi vastuvõetud õpetajate poolt ja taibatud kuidas seda võib kasutada õppeprotsessis. | Ei ole vaja muudatusi |  |
| Üks õpetaja väljendas muret, et nad ise peaksid ülesanded looma, mis on õpetajalt lisa aeg. | Sellega tuleb arvestada järgmises etapides, kui ülesannete koostamine on prioriteed ja antud tööriista arenduse suund on õppevahend või õppeplatvorm. | Ei |

# Kasutajad 

Kasutatavuse testide tulemusena olid 4 kasutajarolli identifitseerimine. Algses hanke dokumentatsioonis me eristasime ainult 2: Õppija ja Õpetaja. Antud kirjeldus on EKI’le sisendiks järgmistele etappidele. Antud etapis, oleme seda kasutanud ka wizardi loomiseks, aga eristades ainult 3 rolli et lihtsustada funktsionaalsus

* Tavakasutaja  
* Õppija  
* Õpetaja  
* Kõnesüntees spetsialist

## Tavakasutaja 

Eesti keel on võõrkeel. Peamine stsenaarium on üksik sõna või lause häälduse kuulamine. Motivatsioon kasutada tööriista tuleb iseendalt ja ei ole seotud otseselt mingi õppeprotsessi ülesandega, lihtsalt on üksik ad hoc vajadus või uudishimu. 

**Peamine vajadus** – kuulata korrektset eesti keele LAUSETE hääldust ja saada aru miks nii hääldatakse

**Peamised funktsioonid**

* Ma saan vabalt valitud lause sisestada  
  * Üldiselt sisestaks ühe lause, kas trükides või kopeerides ainult selleks et hääldust kuulata  
  * Suure tõenäosusega ei ei tea kuidas sõnad kirjutatakse, teeb kirjavead.    
* Ma saan lause kuulata  
  * Tavaliselt kuulab ainult ühte lause ja see on peamine funktsionaalsus mis ta antud tööriistal kasutab  
* Ma saan uurida kuidas sõna hääldada ja miks seda nii hääldatakse  
  * Võib uurida üksikud sõnad, aga see on vähem tõenäone kui lihtsalt kuulamine  
  * Uurib selleks et üksik sõna kuulata ja aru saada miks nii hääldatakse

## Õppija

Eesti keel on võõrkeel. Peamine stsenaarium on õppeprotsessis etteantud lausete kuulamine. Motivatsioon tuleb vajadusest ja õppeprotsessist ja õpetaja poolt etteantud juhistest. 

**Peamine vajadus** – Teha ülesanded etteantud õpetaja poolt

**Funktsioonid**

* Ma saan (etteantud) lause sisestada  
  * Üldiselt ise ei sisesta lause  
  * Kopeerib kusagilt lause mis talle ette anti või tahab kuulata / uurida  
  * Tavaliselt sisestaks ainult ühte lauset, kui ei ole just ette antud konkreetsed juhised et sisesta mitut ja siis mängi järjest. Pigem kopeeriks kui trükkiks.  
  * Eesti keel on võõrkeel  
  * Suure tõenäosusega ei ei tea kuidas sõnad kirjutatakse, aga erinevalt tavakasutajast, talle on sõna või laused etteantud ja ta need kopeerib, ehk siis vähem tõenäosus et on kirjavead  
* Ma saan lause kuulata  
  * Üldiselt kuulab ühte lauset  
  * Kui on etteantud mitut lauset siis sisestab ühe esialgu, kustutab ja sisestab teise. Kuulab igat lauset eraldi.  
* Ma saan uurida kuidas sõna hääldada ja miks seda nii hääldatakse  
  * Üldiselt kuulab ainult sõna mis talle õpetaja ülesandes   
* Ma saan etteantud ülesannet vaadata ja selles laused kuulata  
* Ma saan laused etteantud harjutuses uurida  
  * Saab kopeerida laused kõnesünteesi ja seal nendega teha tööd, kuulata, uurida variandid jne  
* Ma saan oma harjutatud laused salvestada hilisemaks (ülesandesse)  
  * See on sama funktsionaalsus mis õpetaja kasutaks et ülesanded jagamiseks luua, aga siin õppija salvestaks neid enda jaoks, et neid hiljem saaks uuesti avada ja harjutada.

## Õpetaja

Eesti keele kui võõrkeele õpetaja, võib olla riiklikust haridusasutusest kus on etteantud õpekava ja kasutatakse juba olemasolevad õpevahendid, ehk antud uus tööriist on lisaks sellele, või on erisektori asutusest ja saab ise valida vahendid, koostada oma õppekava ja lähenemine eesti keele õppele.

**Peamine vajadus** – Koostada ja jagada hääldusülesanded õpilastele

**Funktsioonid**

* Ma saan lause või mitut lauset sisestada  
  * Võib lause sisse trükkida, aga ilmselt tihemini kopeerid lause tervikuna, sest lisab mitut ühesugust või sarnast lauset, et tekitada harjutused  
  * Kasutab mitu lausete sisestamist tihti, tihemini kui teised kasutajad  
* Ma saan lause sõnade hääldus variandid uurida, kuulata  
* Ma saan lauses asendada sõna teise häälduskujuga (Kasuta)  
  * Lisaks sellele funktsioonile, tahab kasutada mitme lausete sisestamist ning lausete kopeerimist, nii saab tekitada ülesanded kus on erinevad häälduskujud samast sõnast, mida õppija saab kuulata ja leida vahet või õiget variandi  
* Ma saan lause mängida  
* Ma saan mitut lauset ülesandesse lisada

## Kõnesünteesi spetsialist

Kõnesünteesi spetsialist on tavaliselt keeletehnoloogia või lingvistika taustaga ekspert, kelle töö on tagada, et sünteesitud kõne oleks loomulik ja arusaadav ning vastaks häälduse, rõhu, intonatsiooni, keelenormide ja kasutuskonteksti nõuetele.

**Peamine vajadus** – Töötada kõnesünteesiga

**Funktsioonid**

* Ma saan lause sisestada  
* Ma saan lause kuulata  
* Ma saan lause sõnade hääldus variandid uurida, kuulata  
* Ma saan lauses asendada sõne teise häälduskujuga (Kasuta)  
* Ma saan luua oma sõna hääldusvariandi  
* Ma saan uurida lause foneetilist kuju

## Kasutaja ja funktsioonide maatriks

Antud maatriks näitab mis rollid kasutavad mis funktsioonid peamiselt, mis aitab meil organiseerida kasutajaliides ja luua esmase kasutamise juhendi kogemuse vastavalt sellele, mis on antud rollile vajalik

|  | Tavakasutaja | Õppija | Õpetaja  | Kõnesünteesi spetsialist |
| :---- | :---- | :---- | :---- | :---- |
| Ma saan lause sisestada  | x | x | x | x |
| Ma saan lause kuulata | x | x | x | x |
| Ma saan lause sõnade hääldus variandid uurida, kuulata | x | x | x | x |
| Ma saan mitut lauset sisestada ja järjest kuulata |  | x | x |  |
| Ma saan lauses asendada sõna teise häälduskujuga (Kasuta) |  |  | x | x |
| Ma saan oma harjutatud laused salvestada hilisemaks (ülesandesse) |  | x |  |  |
| Ma saan luua ülesanne õppijatele jagamiseks |  |  | x |  |
| Ma saan luua oma sõna hääldusvariandi |  |  |  | x |
| Ma saan uurida lause foneetilist kuju |  |  |  | x |

