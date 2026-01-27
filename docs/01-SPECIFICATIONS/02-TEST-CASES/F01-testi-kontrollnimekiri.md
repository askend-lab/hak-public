# F01 - Kõnesüntees Testjuhtumid

## Kokkuvõte

| TC ID | Testjuhtum | Tüüp | Prioriteet | Läbitud/Ebaõnnestunud |
|-------|------------|------|------------|----------------------|
| TC-01 | Põhiline sünteesi voog | Õnnelik tee | Kriitiline | ☐ |
| TC-02 | Sisestuskäitumised | Funktsionaalne | Kriitiline | ☐ |
| TC-03 | Audio taasesituse olekud | Funktsionaalne | Kriitiline | ☐ |
| TC-04 | Audio vahemälu | Funktsionaalne | Kõrge | ☐ |
| TC-05 | Äärjuhtumid | Äärjuhtum | Kõrge | ☐ |

---

## TC-01: Põhiline sünteesi voog

**Eeltingimused:** Rakendus laetud, brauseri heli lubatud, taustateenused töötavad

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Navigeeri rakenduse juurkausta | Sünteesi leht laeb tühja sisendväljaga | ☐ |
| 2 | Klõpsa tekstisisendi väljal | Kursor ilmub, väli on aktiivne | ☐ |
| 3 | Sisesta "Tere" | Tekst "Tere" on sisendis nähtav | ☐ |
| 4 | Vajuta Enter | Laadimise spinner ilmub esitusnupule | ☐ |
| 5 | Oota audio esitust | Audio mängib, esitusnupp näitab pausi ikooni | ☐ |
| 6 | Oota audio lõppemist | Esitusnupp naaseb esitusikooni juurde | ☐ |
| 7 | Vajuta Enter uuesti | Audio mängib vahemälust (ilma laadimiseta) | ☐ |

### Variatsioon A: Mitme sõnaga lause

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Tühjenda sisend, sisesta "Tere päevast" | Tekst on sisendis nähtav | ☐ |
| 2 | Vajuta tühikut | "Tere" muutub sildiks | ☐ |
| 3 | Vajuta Enter | Mõlemad sõnad sünteesitakse, kasutab efm_l mudelit | ☐ |

### Variatsioon B: Klõpsa esitust Enteri asemel

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta tekst "Aitäh" | Tekst on nähtav | ☐ |
| 2 | Klõpsa esitusnuppu | Sama sünteesi voog nagu Enteriga | ☐ |

### Äärjuhtumid

| Juhtum | Läbitud/Ebaõnn. |
|--------|-----------------|
| Tühi sisend: Sünteesi ei toimu, viga ei teki | ☐ |
| Ainult tühikud: Sünteesi ei toimu, viga ei teki | ☐ |
| Väga pikk tekst (>500 tähemärki): Sünteesimine õnnestub | ☐ |

---

## TC-02: Sisestuskäitumised

**Eeltingimused:** Rakendus laetud, tühi lauserida nähtav

### Tühiku vajutamine loob silte

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Tere" ja vajuta Enter (loob esimese sünteesi) | Tekst sünteesitakse normaalselt | ☐ |
| 2 | Sisesta "Kuidas" | Sõna ilmub sisendisse | ☐ |
| 3 | Vajuta tühikut | "Kuidas" muutub sildi kiibiks | ☐ |
| 4 | Sisesta "läheb" | Uus sõna ilmub sildi järele | ☐ |
| 5 | Vajuta tühikut | "läheb" muutub teiseks sildiks | ☐ |

### Tagasilükkeklahv muudab viimast silti

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Siltidega [Kuidas] [läheb] ja tühi sisend | Kaks silti on nähtavad | ☐ |
| 2 | Vajuta Backspace | "läheb" liigub tagasi sisendväljale | ☐ |
| 3 | Vajuta Backspace uuesti | Tähemärk kustutatakse "läheb" sõnast | ☐ |
| 4 | Tühjenda sisend, vajuta Backspace | "Kuidas" liigub sisendisse | ☐ |

### Mitme sõnaga teksti kleepimine

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Olemasoleva sildiga [Tere] | Üks silt on olemas | ☐ |
| 2 | Kleebi "kuidas sul läheb" | Kolm uut silti luuakse | ☐ |
| 3 | Kontrolli silte | [Tere] [kuidas] [sul] [läheb] on nähtavad | ☐ |

### Enter loob sildi ja sünteesib

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Tervitused" (ilma olemasolevate siltideta) | Tekst on sisendis | ☐ |
| 2 | Vajuta Enter | Silt luuakse JA süntees algab | ☐ |

### Sildi menüü avaneb klõpsamisel

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sildiga [koer] nähtav | Silt on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Rippmenüü avaneb | ☐ |
| 3 | Kontrolli menüü valikuid | "Uuri variante", "Muuda", "Kustuta" on nähtavad | ☐ |
| 4 | Klõpsa menüüst välja | Menüü sulgub | ☐ |

### Sildi muutmine menüü kaudu (Muuda)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sildiga [koer] nähtav | Silt on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Muuda" | Silt muutub muudetavaks sisendiks tekstiga "koer" | ☐ |
| 4 | Kustuta "r" et saada "koe" | Sisend näitab "koe" | ☐ |
| 5 | Vajuta Enter | Silt näitab "koe" JA audio sünteesitakse | ☐ |
| 6 | Kontrolli sildi väärtuse säilimist | Silt kuvab "koe" (ei taastata) | ☐ |

### Sildi muutmine - tühistamine Escape-iga

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Klõpsa sildil ja vali "Muuda" | Silt muutub muudetavaks | ☐ |
| 2 | Muuda "koer" sõnaks "kass" | Sisend näitab "kass" | ☐ |
| 3 | Vajuta Escape | Silt taastub väärtusele "koer" | ☐ |

### Sildi kustutamine menüü kaudu (Kustuta)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Siltidega [Tere] [koer] nähtav | Kaks silti on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Kustuta" | [koer] silt eemaldatakse | ☐ |
| 4 | Kontrolli allesjäänud silte | Ainult [Tere] on nähtav | ☐ |

### Äärjuhtumid

| Juhtum | Läbitud/Ebaõnn. |
|--------|-----------------|
| Tühik tühjas sisendis (ilma siltideta): Tegevust ei toimu | ☐ |
| Backspace tühjas sisendis (ilma siltideta): Tegevust ei toimu | ☐ |
| Mitme tühikuga teksti kleepimine: Üksikud sildid luuakse (tühikud normaliseeritakse) | ☐ |
| Sildi muutmine tühikuklahviga: Kinnitab muudatuse ilma sünteesita | ☐ |
| Sildi muutmine tühjaks väärtuseks: Silt kustutatakse | ☐ |
| Sildi muutmine mitme sõnaga (tühiku lisamine): Muudatusest luuakse mitu silti | ☐ |

---

## TC-03: Audio taasesituse olekud

**Eeltingimused:** Rakendus laetud, tekst "Tere päevast" sisestatud

### Olek: Ootel → Laadimine → Mängimine → Ootel

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Jälgi esitusnuppu | Näitab esitusikooni (▶) | ☐ |
| 2 | Klõpsa esitusnuppu | Nupp näitab laadimise spinnerit | ☐ |
| 3 | Oota sünteesi valmimist | Spinner muutub pausi ikooniks (❚❚) | ☐ |
| 4 | Jälgi taasesituse ajal | Pausi ikoon jääb nähtavaks | ☐ |
| 5 | Oota audio lõppemist | Nupp naaseb esitusikooni juurde (▶) | ☐ |

### Taasesituse katkestamine

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Alusta taasesitust (audio mängib) | Pausi ikoon on nähtav | ☐ |
| 2 | Klõpsa esitusnuppu taasesituse ajal | Praegune audio peatub | ☐ |
| 3 | Jälgi | Uus süntees algab (laadimise olek) | ☐ |

### Vahemälust taasesitus

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Mängi teksti esimest korda | Laadimine → Mängimine → Ootel | ☐ |
| 2 | Mängi sama teksti uuesti (muutmata) | Kohe näitab pausi ikooni (ilma laadimiseta) | ☐ |
| 3 | Audio mängib | Vahemälust | ☐ |

### Mitu lauset

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Lisa teine lause tekstiga | Kaks lauserida on nähtavad | ☐ |
| 2 | Mängi esimest lauset | Esimene rida näitab pausi, teine esitust | ☐ |
| 3 | Klõpsa esitust teisel lausel | Esimene peatub, teine alustab laadimist | ☐ |

---

## TC-04: Audio vahemälu

**Eeltingimused:** Rakendus laetud, võrgu vaheleht avatud brauseri arendaja tööriistades

### Vahemälu tabamus (sama tekst)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Tere" ja vajuta Enter | Võrk näitab /api/analyze ja /api/synthesize kutseid | ☐ |
| 2 | Oota audio lõppemist | Audio lõpeb | ☐ |
| 3 | Vajuta Enter uuesti | MITTE ÜHTEGI uut võrgukutset (vahemälust) | ☐ |
| 4 | Jälgi taasesitust | Audio mängib koheselt (ilma laadimiseta) | ☐ |

### Vahemälu tühistamine (tekst muudetud)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | "Tere" on vahemälus, lisa " päevast" | Tekst on nüüd "Tere päevast" | ☐ |
| 2 | Vajuta Enter | Tehakse uued võrgukutsed (vahemälu tühistatud) | ☐ |
| 3 | Audio mängib | Uus süntees terve lausega | ☐ |

### Vahemälu tühistamine (variant valitud)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "kooli" ja sünteesi | Audio on vahemälus | ☐ |
| 2 | Klõpsa "kooli" sildil | Variantide paneel avaneb | ☐ |
| 3 | Vali erinev variant | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees variandi hääldusega | ☐ |

### Vahemälu tühistamine (foneetika muutmine)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sünteesi mis tahes tekst | Audio on vahemälus | ☐ |
| 2 | Ava "Uuri foneetilist kuju" | Foneetikapaneel avaneb | ☐ |
| 3 | Muuda foneetilist teksti ja rakenda | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees muudetud foneetikaga | ☐ |

---

## TC-05: Äärjuhtumid

**Eeltingimused:** Rakendus laetud, taustateenused töötavad

### Tühi sisend

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Tühja sisendiga, vajuta Enter | Midagi ei juhtu (sünteesi ei toimu) | ☐ |
| 2 | Tühja sisendiga, klõpsa esitust | Midagi ei juhtu (sünteesi ei toimu) | ☐ |

### Ainult tühikud

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta ainult tühikud "   " | Tühikud on sisendis nähtavad | ☐ |
| 2 | Vajuta Enter | Midagi ei juhtu (tühikud ignoreeritakse) | ☐ |

### Ainult erimärgid

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "!!!" | Tekst on sisendis | ☐ |
| 2 | Vajuta Enter | Silt luuakse, sünteesi üritatakse | ☐ |
| 3 | Jälgi tulemust | Võib toota tühja audio või vea | ☐ |

### Väga pikk tekst

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Kleebi 500+ tähemärgiga eestikeelne tekst | Tekst kuvatakse siltidena | ☐ |
| 2 | Vajuta Enter | Süntees algab (võib kauem aega võtta) | ☐ |
| 3 | Oota lõpetamist | Audio mängib edukalt | ☐ |

### Segakeelne tekst

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Hello tere world" | Kolm silti luuakse | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Eesti hääldust üritatakse kõigi sõnade jaoks | ☐ |

### Numbrid

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "123" | Silt luuakse | ☐ |
| 2 | Vajuta Enter | Sünteesi üritatakse | ☐ |
| 3 | Jälgi | Võib hääldada eesti numbritena | ☐ |

### Eesti täpitähed

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Üks õun käes" | Kuvatakse õigesti tähtedega õ, ä, ü | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Õige eesti hääldus | ☐ |

### Kirjavahemärgid

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Tere! Kuidas läheb?" | Sildid sisaldavad kirjavahemärke | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Sobiv pauseerimine kirjavahemärkide juures | ☐ |

### Võrgu viga

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Peata taustateenused | Teenused pole kättesaadavad | ☐ |
| 2 | Proovi sünteesida | Laadimise olek ilmub | ☐ |
| 3 | Oota | Veateade või laadimine peatub | ☐ |
| 4 | Taaskäivita teenused ja proovi uuesti | Süntees töötab | ☐ |

---

**F01 testisammude koguarv:** 77 üksikut testisammu 5 testjuhtumi lõikes
