# TC-05: Piirjuhud

**Kasutajalugu:** US-01, US-02  
**Funktsioon:** F01 Kõnesüntees  
**Prioriteet:** Kõrge  
**Tüüp:** Piirjuht

## Kirjeldus

Kontrolli ebatavaliste sisendite ja piiritingimuste käsitlemist.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Taustateenused töötavad

## Testjuhtumid

### Tühi sisend

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tühja sisendiga vajuta Enter | Midagi ei juhtu (sünteesi ei toimu) | ☐ |
| 2 | Tühja sisendiga klõpsa esitust | Midagi ei juhtu (sünteesi ei toimu) | ☐ |

### Ainult tühikud

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta ainult tühikud "   " | Tühikud on sisendis nähtavad | ☐ |
| 2 | Vajuta Enter | Midagi ei juhtu (tühikud ignoreeritakse) | ☐ |

### Ainult erimärgid

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "!!!" | Tekst on sisendis | ☐ |
| 2 | Vajuta Enter | Silt luuakse, sünteesi üritatakse | ☐ |
| 3 | Jälgi tulemust | Võib toota tühja audio või vea | ☐ |

### Väga pikk tekst

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kleebi 500+ tähemärgiga eestikeelne tekst | Tekst kuvatakse siltidena | ☐ |
| 2 | Vajuta Enter | Süntees algab (võib kauem aega võtta) | ☐ |
| 3 | Oota lõpetamist | Audio mängib edukalt | ☐ |

### Segakeelne tekst

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Hello tere world" | Kolm silti luuakse | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Eesti hääldust üritatakse kõigi sõnade jaoks | ☐ |

### Numbrid

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "123" | Silt luuakse | ☐ |
| 2 | Vajuta Enter | Sünteesi üritatakse | ☐ |
| 3 | Jälgi | Võib hääldada eesti numbritena | ☐ |

### Eesti täpitähed

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Üks õun käes" | Kuvatakse õigesti tähtedega õ, ä, ü | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Õige eesti hääldus | ☐ |

### Kirjavahemärgid

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Tere! Kuidas läheb?" | Sildid sisaldavad kirjavahemärke | ☐ |
| 2 | Vajuta Enter | Süntees valmib | ☐ |
| 3 | Kuula | Sobiv pauseerimine kirjavahemärkide juures | ☐ |

### Võrgu viga

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Peata taustateenused | Teenused pole kättesaadavad | ☐ |
| 2 | Proovi sünteesida | Laadimise olek ilmub | ☐ |
| 3 | Oota | Veateade või laadimine peatub | ☐ |
| 4 | Taaskäivita teenused ja proovi uuesti | Süntees töötab | ☐ |

## Märkused

- Piirjuhud peaksid ebaõnnestuma graatsiliselt (ilma krahhideta)
- Veateated peaksid olema kasutajasõbralikud (eesti keeles)
- Väga pikk tekst võib mõjutada jõudlust
