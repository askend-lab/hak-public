# TC-11: Järjestikune taasesitus

**Kasutajalugu:** US-13  
**Funktsioon:** F04 Esitusloendi haldamine  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli "Mängi kõik" järjestikust taasesitust mitme lausega.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Mitu lauset tekstiga (3+ soovitatav)
- [ ] Audio lubatud

## Testiandmed

Laused:
1. "Tere päevast"
2. "Kuidas läheb"
3. "Aitäh, hästi"

## Testisammud

### Nupu nähtavus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ainult 1 lause | "Mängi kõik" nupp EI OLE nähtav | ☐ |
| 2 | Lisa teine lause tekstiga | "Mängi kõik (2)" ilmub | ☐ |
| 3 | Lisa kolmas lause | Nupp näitab "(3)" | ☐ |
| 4 | Tühjenda üks lause | Loendur uueneb | ☐ |

### Järjestikune taasesitus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Mängi kõik" nuppu | Nupp näitab laadimise spinnerit | ☐ |
| 2 | Oota esimest audiod | Esimene lause mängib, selle rida näitab pausi ikooni | ☐ |
| 3 | Nupp muutub | Näitab "Peata" pausi ikooniga | ☐ |
| 4 | Esimene audio lõpeb | Teine lause algab | ☐ |
| 5 | Jälgi rea indikaatoreid | Teine rida näitab pausi, esimene esitust | ☐ |
| 6 | Kõik laused mängivad | Järjestus valmib | ☐ |
| 7 | Pärast viimast lauset | Nupp naaseb "Mängi kõik" juurde | ☐ |

### Taasesituse peatamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Alusta "Mängi kõik" | Järjestus algab | ☐ |
| 2 | Teise lause ajal klõpsa "Peata" | Audio peatub koheselt | ☐ |
| 3 | Jälgi | Kolmas lause EI mängi | ☐ |
| 4 | Nupp naaseb | Näitab "Mängi kõik" uuesti | ☐ |

### Tühjad laused jäetakse vahele

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Olemas: "Tere", tühi, "Aitäh" | Kolm rida, üks tühi | ☐ |
| 2 | Klõpsa "Mängi kõik (2)" | Alustab mängimist | ☐ |
| 3 | Jälgi | "Tere" mängib, tühi jäetakse vahele, "Aitäh" mängib | ☐ |

### Laadimise olek enne esimest audiod

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Mängi kõik" | Laadimise spinner ilmub | ☐ |
| 2 | Jälgi nuppu | Näitab "Laadimine" teksti | ☐ |
| 3 | Esimene audio algab | Üleminek "Peata" juurde | ☐ |

## Märkused

- Tühjad laused ei lähe arvesse kogusummas
- Taasesituse saab igal ajal peatada
- Kasutaja saab suhelda kasutajaliidesega taasesituse ajal
