# TC-10: Esitusloendi haldamine

**Kasutajalugu:** US-11, US-12, US-14  
**Funktsioon:** F04 Esitusloendi haldamine  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli mitme lause lisamist, ümberjärjestamist ja haldamist.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Vähemalt üks lause tekstiga

## Testisammud

### Lausete lisamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kontrolli "Lisa lause" nuppu | Nupp nähtav lausete all | ☐ |
| 2 | Klõpsa "Lisa lause" | Uus tühi lauserida ilmub | ☐ |
| 3 | Sisesta tekst uude ritta | Tekst nähtav | ☐ |
| 4 | Klõpsa "Lisa lause" uuesti | Kolmas lauserida lisatud | ☐ |

### Ümberjärjestamine lohistamisega

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Vii kursor lohistamise käepideme kohale (esimese lause vasakul) | Kursor muutub haaramiseks | ☐ |
| 2 | Klõpsa ja hoia | Kursor muutub haaravaks | ☐ |
| 3 | Lohista kolmanda lause kohale | Visuaalne indikaator näitab kukutamise sihtkohta | ☐ |
| 4 | Vabasta | Laused järjestatud ümber | ☐ |
| 5 | Kontrolli uut järjekorda | Esimene lause nüüd kolmandal kohal | ☐ |

### Lause sisu tühjendamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta tekst lausesse | Sildid nähtavad | ☐ |
| 2 | Leia tühjendamise nupp (X) | Nupp nähtav sisendialal | ☐ |
| 3 | Klõpsa tühjendamise nuppu | Kõik sildid ja sisend tühjendatud | ☐ |
| 4 | Kontrolli lauserida | Rida jääb alles (tühi), valmis sisendiks | ☐ |

### Lause eemaldamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Olemas mitu lauset | 2+ lauset nähtavad | ☐ |
| 2 | Klõpsa ⋯ menüül lausel | Menüü avaneb | ☐ |
| 3 | Kontrolli menüü valikuid | "Lisa ülesandesse", "Uuri häälduskuju", "Lae alla .wav fail", "Kopeeri tekst", "Eemalda" | ☐ |
| 4 | Vali "Eemalda" | Lauserida eemaldatud | ☐ |
| 5 | Kontrolli lausete nimekirja | Üks lause vähem | ☐ |

### Viimase lause eemaldamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ainult üks lause tekstiga | Üksik lause | ☐ |
| 2 | Klõpsa ⋯ menüül, vali "Eemalda" | Lause tühjendatakse (ei eemaldata) | ☐ |
| 3 | Kontrolli | Tühi lauserida jääb alles | ☐ |

### Seansi püsivus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta tekst lausesse | Tekst/sildid nähtavad | ☐ |
| 2 | Värskenda lehte (F5) | Lause sisu taastatud | ☐ |
| 3 | Sulge brauseri vaheleht | Vaheleht suletud | ☐ |
| 4 | Ava rakendus uuesti | Lause sisu taastatud | ☐ |
| 5 | Kontrolli isPlaying/isLoading olekut | Need lähtestatakse false'ile uuesti laadimisel | ☐ |

## Märkused

- Järjekord ja sisu säilivad localStorage'is lehe värskendamiste ja brauseri seansside vahel
- Tühjendamine on kiire toiming (ilma kinnituseta)
- Eemaldamine on menüüs (veidi peidetud)
