# TC-19: Teavituste kuvamine

**Kasutajalugu:** US-28  
**Funktsioon:** F10 Teavitused  
**Prioriteet:** Keskmine  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli teavitussüsteemi kuvamist ja automaatset kadumist.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Kasutaja sisse logitud (ülesandega seotud teavituste jaoks)

## Testisammud

### Edu teavitus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Loo uus ülesanne | Ülesanne loodud | ☐ |
| 2 | Jälgi teavituse ala (üleval paremal) | Roheline edu teavitus ilmub | ☐ |
| 3 | Kontrolli sisu | Pealkiri "Ülesanne loodud!" nähtav | ☐ |
| 4 | Oota ~5 sekundit | Teavitus kaob automaatselt | ☐ |

### Teavitus tegevusnupuga

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Lisa laused ülesandesse | Kirjed lisatud | ☐ |
| 2 | Jälgi teavitust | Näitab "Vaata ülesannet" nuppu | ☐ |
| 3 | Klõpsa tegevusnuppu | Navigeerib ülesande juurde | ☐ |

### Käsitsi sulgemine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Käivita mis tahes teavitus | Teavitus ilmub | ☐ |
| 2 | Klõpsa X nuppu teavitusel | Teavitus kaob koheselt | ☐ |

### Mitu teavitust

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Soorita kiiresti mitu tegevust | Nt loo ülesanne, lisa kirjeid | ☐ |
| 2 | Jälgi teavituse ala | Mitu teavitust virnastuvad | ☐ |
| 3 | Kontrolli järjekorda | Uusim peal | ☐ |
| 4 | Iga kaob | Automaatne kadumine töötab sõltumatult | ☐ |

### Vea teavitus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Käivita viga (nt peata taustateenused) | Tekib viga | ☐ |
| 2 | Jälgi teavitust | Punane vea teavitus ilmub | ☐ |
| 3 | Kontrolli sisu | Veateade nähtav | ☐ |

### Teavituste tüübid

Testi, et iga tüüp on visuaalselt eristuv:

| Tüüp | Käivitav tegevus | Oodatav värv |
|------|------------------|--------------|
| Edu | Loo ülesanne | Roheline |
| Viga | API tõrge | Punane |
| Info | Kopeeri link | Sinine |
| Hoiatus | (kui rakendatav) | Kollane |

## Teavituste käivitajad

| Tegevus | Oodatav teavitus |
|---------|------------------|
| Ülesanne loodud | Edu: "Ülesanne loodud!" |
| Ülesanne uuendatud | Edu: "Ülesanne [nimi] uuendatud!" |
| Ülesanne kustutatud | Edu: "Ülesanne [nimi] kustutatud!" |
| Kirjed lisatud | Edu: "X lauset lisatud ülesandesse" |
| Link kopeeritud | Info: "Link kopeeritud!" |
| Kirje kustutatud | Edu: "Lause kustutatud" |
| Viga | Viga: Vastav veateade |

## Märkused

- Teavitused ei säili (kaovad värskendamisel)
- Automaatse kadumise ajalõpp on umbes 5 sekundit
