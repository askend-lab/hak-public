# TC-12: Ülesande loomine

**Kasutajalugu:** US-15  
**Funktsioon:** F05 Ülesannete haldamine  
**Prioriteet:** Kriitiline  
**Tüüp:** Põhistsenaarium

## Kirjeldus

Kontrolli, et autenditud kasutaja saab luua uue ülesande.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Kasutaja sisse logitud 
- [ ] Ülesannete vaates ("Ülesanded" vaheleht)

## Testiandmed

| Väli | Väärtus |
|------|---------|
| Nimi | `Hääldusharjutus 1` |
| Kirjeldus | `Tervituste harjutamine` |

## Testisammud

### Tühja ülesande loomine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Lisa" nuppu päises | Modaal avaneb | ☐ |
| 2 | Kontrolli modaali pealkirja | "Loo uus ülesanne" või sarnane | ☐ |
| 3 | Sisesta nimi: "Hääldusharjutus 1" | Nime väli täidetud | ☐ |
| 4 | Sisesta kirjeldus: "Tervituste harjutamine" | Kirjelduse väli täidetud | ☐ |
| 5 | Klõpsa "Loo ülesanne" nuppu | Modaal sulgub | ☐ |
| 6 | Kontrolli teavitust | Edu teavitus ilmub | ☐ |
| 7 | Kontrolli ülesannete nimekirja | Uus ülesanne ilmub nimekirja | ☐ |

### Ülesande loomine koos kirjetega

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Navigeeri sünteesi vaatesse | Sünteesi leht laeb | ☐ |
| 2 | Sisesta ja sünteesi: "Tere päevast" | Audio mängib | ☐ |
| 3 | Lisa lause: "Kuidas läheb" | Teine lause lisatud | ☐ |
| 4 | Klõpsa "Lisa ülesandesse" rippmenüüd | Ülesannete nimekirja rippmenüü avaneb | ☐ |
| 5 | Klõpsa "Loo uus ülesanne" | Ülesande loomise modaal avaneb | ☐ |
| 6 | Sisesta nimi ja loo | Ülesanne loodud 2 kirjega | ☐ |
| 7 | Navigeeri ülesannetesse, ava uus ülesanne | Kirjed nähtavad ülesandes | ☐ |

### Valideerimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ava loomise modaal | Modaal avatud | ☐ |
| 2 | Jäta nimi tühjaks | "Loo ülesanne" nupp keelatud | ☐ |
| 3 | Sisesta ainult tühikud | Nupp jääb keelatuks | ☐ |
| 4 | Sisesta kehtiv nimi | Nupp muutub lubatud | ☐ |

## Piirjuhud

- [ ] Väga pikk nimi: Aktsepteeritakse, võib kuvas kärpida
- [ ] Erimärgid nimes: Aktsepteeritakse
- [ ] Tühi kirjeldus: Lubatud (valikuline väli)

## Märkused

- Ülesanne luuakse jagamistokeniga hilisemaks jagamiseks
- Tühje ülesandeid saab luua (kirjed lisatakse hiljem)
- Ülesanded säilivad tagasüsteemis (backend API) kasutaja kohta
