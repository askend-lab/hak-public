# TC-15: Ülesande jagamine ja juurdepääs

**Kasutajalugu:** US-20, US-21  
**Funktsioon:** F06 Ülesande jagamine  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli ülesande jagamist ja sellele juurdepääsu jagatud lingi kaudu.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Kasutaja sisse logitud kirjetega ülesandega
- [ ] Teine brauser/inkognito aken saadaval

## Testisammud

### Jagamislingi genereerimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Navigeeri ülesande detailvaatesse | Kirjetega ülesanne nähtav | ☐ |
| 2 | Klõpsa "Jaga" nuppu | Jagamise modaal avaneb | ☐ |
| 3 | Kontrolli modaali sisu | Ülesande nimi ja jagamise URL kuvatud | ☐ |
| 4 | Kontrolli URL-i formaati | Sisaldab jagamistokenit | ☐ |
| 5 | Klõpsa "Kopeeri" nuppu | URL kopeeritud lõikepuhvrisse | ☐ |
| 6 | Kontrolli teavitust | "Link kopeeritud!" näidatud | ☐ |
| 7 | Sulge modaal | Naaseb ülesande detaili juurde | ☐ |

### Jagamislingi püsivus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Märgi jagamise URL | URL salvestatud | ☐ |
| 2 | Sulge jagamise modaal | Modaal suletud | ☐ |
| 3 | Ava jagamise modaal uuesti | Sama URL kuvatud | ☐ |

### Jagatud ülesandele juurdepääs (anonüümne)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ava inkognito/privaatne brauser | Puhas brauseri olek | ☐ |
| 2 | Navigeeri jagatud URL-ile | Leht laeb | ☐ |
| 3 | Kontrolli ülesande nime | Õige ülesande nimi nähtav | ☐ |
| 4 | Kontrolli kirjeid | Kõik kirjed nähtavad | ☐ |
| 5 | Klõpsa esitust kirjel | Audio sünteesitakse ja mängib | ☐ |

### Ainult lugemise piirangud

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Jagatud ülesande vaates | Vaatad anonüümsena | ☐ |
| 2 | Otsi redigeerimise nuppu | Pole olemas | ☐ |
| 3 | Otsi kustutamise nuppu | Pole olemas | ☐ |
| 4 | Proovi lohistamist | Ei toimi või pole saadaval | ☐ |

### Kopeeri esitusloendisse

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Jagatud ülesande vaates | Kirjed nähtavad | ☐ |
| 2 | Klõpsa "Kopeeri" nuppu infobänneris | Toiming käivitub | ☐ |
| 3 | Jälgi navigeerimist | Suunab sünteesi vaatesse | ☐ |
| 4 | Kontrolli esitusloendit | Kõik kirjed ilmuvad lausetena | ☐ |
| 5 | Esita kopeeritud lauset | Audio töötab | ☐ |

### Vigane jagamistoken

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Navigeeri vigasele jagamise URL-ile | Leht laeb | ☐ |
| 2 | Kontrolli vea olekut | "Ülesannet ei leitud" teade | ☐ |
| 3 | Kontrolli CTA-d | Link avalehele naasmiseks | ☐ |

## Märkused

- Jagamistoken genereeritakse ülesande loomisel
- Sama token säilib ülesande eluea jooksul
- Kustutatud ülesanne: jagamislink muutub kehtetuks
- Jagatud ülesande vaatamiseks pole autentimist vaja
