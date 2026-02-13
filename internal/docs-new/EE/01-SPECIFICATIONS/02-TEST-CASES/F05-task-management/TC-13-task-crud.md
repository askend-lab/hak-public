# TC-13: Ülesande CRUD toimingud

**Kasutajalugu:** US-16, US-17, US-18  
**Funktsioon:** F05 Ülesannete haldamine  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli ülesannete nimekirja vaatamist, redigeerimist ja kustutamise toiminguid.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Kasutaja sisse logitud
- [ ] Vähemalt üks ülesanne olemas

## Testisammud

### Ülesannete nimekirja vaatamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Ülesanded" päises | Ülesannete vaade laeb | ☐ |
| 2 | Kontrolli ülesannete nimekirja | Kõik kasutaja ülesanded kuvatud | ☐ |
| 3 | Kontrolli ülesande kirjet | Näitab nime ja kirjete arvu | ☐ |
| 4 | Klõpsa ülesande nimel/real | Ülesande detailvaade avaneb | ☐ |

### Ülesande detailide vaatamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ava ülesanne kirjetega | Ülesande detailvaade laeb | ☐ |
| 2 | Kontrolli päist | Ülesande nimi nähtav (kirjeldus kui olemas) | ☐ |
| 3 | Kontrolli kirjeid | Kõik kirjed kuvatud lauseridadena | ☐ |
| 4 | Klõpsa esitust kirjel | Audio sünteesitakse ja mängib | ☐ |
| 5 | Klõpsa "Ülesanded" päises | Naaseb ülesannete nimekirja juurde | ☐ |

### Kirje rea menüü

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa ⋯ menüül kirjel | Menüü avaneb | ☐ |
| 2 | Kontrolli menüü valikuid | "Uuri häälduskuju", "Kopeeri tekst", "Kustuta" | ☐ |
| 3 | Vali "Kopeeri tekst" | Tekst kopeeritud lõikepuhvrisse | ☐ |
| 4 | Kontrolli teavitust | "Tekst kopeeritud!" näidatud | ☐ |

### Ülesande redigeerimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa ⋯ menüül ülesandel | Menüü avaneb | ☐ |
| 2 | Vali "Muuda" | Redigeerimise modaal avaneb | ☐ |
| 3 | Kontrolli eeltäidetud väärtusi | Praegune nimi ja kirjeldus nähtav | ☐ |
| 4 | Muuda nimi "Uuendatud nimi"-ks | Nimi uuendatud sisendis | ☐ |
| 5 | Klõpsa "Salvesta" | Modaal sulgub | ☐ |
| 6 | Kontrolli teavitust | "Ülesanne [nimi] uuendatud!" näidatud | ☐ |
| 7 | Kontrolli ülesannete nimekirja | Uus nimi kajastatud | ☐ |

### Ülesande kustutamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa ⋯ menüül ülesandel | Menüü avaneb | ☐ |
| 2 | Vali "Kustuta" | Kinnituse modaal avaneb | ☐ |
| 3 | Kontrolli teadet | Näitab ülesande nime kinnituses | ☐ |
| 4 | Klõpsa "Tühista" | Modaal sulgub, ülesanne jääb alles | ☐ |
| 5 | Korda ja klõpsa "Kustuta" | Ülesanne kustutatud | ☐ |
| 6 | Kontrolli teavitust | "Ülesanne [nimi] kustutatud!" näidatud | ☐ |
| 7 | Kontrolli ülesannete nimekirja | Ülesanne pole enam nähtav | ☐ |

### Kustutamine vaatamise ajal

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ava ülesande detailvaade | Vaatad ülesannet | ☐ |
| 2 | Klõpsa ⋯ menüül päises | Menüü avaneb | ☐ |
| 3 | Vali "Kustuta" ja kinnita | Ülesanne kustutatud | ☐ |
| 4 | Kontrolli navigeerimist | Naaseb ülesannete nimekirja juurde | ☐ |

## Tühi olek

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kustuta kõik ülesanded | Ühtegi ülesannet pole | ☐ |
| 2 | Kontrolli tühja olekut | Tühja oleku illustratsioon ja teade | ☐ |
| 3 | Kontrolli CTA-d | "Loo esimene ülesanne" nupp olemas | ☐ |

## Märkused

- Kustutamine on lõplik (tagasivõtmise võimalus puudub)
- Kirjed kustutatakse koos ülesandega
- Jagamislingid muutuvad kehtetuks pärast kustutamist
