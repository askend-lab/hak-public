# TC-02: Sisestuskäitumised

**Kasutajalugu:** US-01  
**Funktsioon:** F01 Kõnesüntees  
**Prioriteet:** Kriitiline  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli sildipõhise sisestussüsteemi käitumist, sealhulgas tühiku, Backspace'i, kleepimise ja sildi redigeerimise menüü kaudu.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Tühi lauserida nähtav

## Testisammud

### Tühikuklahv loob silte

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Tere" ja vajuta Enter (loob esimese sünteesi) | Tekst sünteesitakse tavapäraselt | ☐ |
| 2 | Sisesta "Kuidas" | Sõna ilmub sisendisse | ☐ |
| 3 | Vajuta tühikut | "Kuidas" muutub sildiks | ☐ |
| 4 | Sisesta "läheb" | Uus sõna sisendis pärast silti | ☐ |
| 5 | Vajuta tühikut | "läheb" muutub teiseks sildiks | ☐ |

### Backspace redigeerib viimast silti

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Siltidega [Kuidas] [läheb] ja tühja sisendiga | Kaks silti on nähtavad | ☐ |
| 2 | Vajuta Backspace | "läheb" liigub tagasi sisendväljale | ☐ |
| 3 | Vajuta Backspace uuesti | "läheb" muutub "läheb"-ks (tähemärk kustutatud) | ☐ |
| 4 | Tühjenda sisend, vajuta Backspace | "Kuidas" liigub sisendisse | ☐ |

### Mitme sõnaga teksti kleepimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Olemasoleva sildiga [Tere] | Üks silt on olemas | ☐ |
| 2 | Kleebi "kuidas sul läheb" | Luuakse kolm uut silti | ☐ |
| 3 | Kontrolli silte | [Tere] [kuidas] [sul] [läheb] nähtavad | ☐ |

### Enter loob sildi ja sünteesib

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Tervitused" (ilma olemasolevate siltideta) | Tekst sisendis | ☐ |
| 2 | Vajuta Enter | Silt luuakse JA süntees algab | ☐ |

### Sildi menüü avaneb klõpsates

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sildiga [koer] nähtav | Silt on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Rippmenüü avaneb | ☐ |
| 3 | Kontrolli menüü valikuid | "Uuri variandid", "Muuda", "Kustuta" nähtavad | ☐ |
| 4 | Klõpsa väljaspool menüüd | Menüü sulgub | ☐ |

### Sildi redigeerimine menüü kaudu (Muuda)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sildiga [koer] nähtav | Silt on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Muuda" | Silt muutub redigeeritavaks sisendiks tekstiga "koer" | ☐ |
| 4 | Kustuta "r", et saada "koe" | Sisend näitab "koe" | ☐ |
| 5 | Vajuta Enter | Silt näitab "koe" JA audio sünteesitakse | ☐ |
| 6 | Kontrolli sildi väärtuse püsimist | Silt kuvab "koe" (ei taastata) | ☐ |

### Sildi redigeerimine - tühistamine Escape-iga

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa sildil ja vali "Muuda" | Silt muutub redigeeritavaks | ☐ |
| 2 | Muuda "koer" sõnaks "kass" | Sisend näitab "kass" | ☐ |
| 3 | Vajuta Escape | Silt taastub väärtusele "koer" | ☐ |

### Sildi kustutamine menüü kaudu (Kustuta)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Siltidega [Tere] [koer] nähtav | Kaks silti on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Kustuta" | [koer] silt eemaldatakse | ☐ |
| 4 | Kontrolli allesjäänud silte | Ainult [Tere] on nähtav | ☐ |

## Piirjuhud

- [ ] Tühik tühjas sisendis (ilma siltideta): Tegevust ei toimu
- [ ] Backspace tühjas sisendis (ilma siltideta): Tegevust ei toimu
- [ ] Mitme tühikuga teksti kleepimine: Luuakse üksikud sildid (tühikud normaliseeritakse)
- [ ] Sildi redigeerimine tühikuklahviga: Kinnitab redigeerimise ilma sünteesita
- [ ] Sildi redigeerimine tühjaks väärtuseks: Silt kustutatakse
- [ ] Sildi redigeerimine mitme sõnaga (tühiku lisamine): Redigeerimisest luuakse mitu silti

## Märkused

- Tühik loob silte ainult siis, kui vähemalt üks silt on juba olemas
- Esimene sõna nõuab Enterit nii sildi loomiseks kui sünteesi käivitamiseks
- Sildid kuvatakse sõnakiipidena, sisend järgneb pärast silte
