# TC-17: Rollipõhine viisard

**Kasutajalugu:** US-25, US-26  
**Funktsioon:** F08 Sisseelamine  
**Prioriteet:** Keskmine  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli rolli valimist ja sisseelamise viisardit uutele kasutajatele.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/` või `/synthesis`
- [ ] Tühjenda localStorage uue kasutaja simuleerimiseks
- [ ] Või klõpsa abi nuppu navigeerimiseks aadressile `/role-selection`
- [ ] Rolli valimise leht on saadaval aadressil `/role-selection`

## Testisammud

### Rolli valimise kuva

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tühjenda localStorage ja laadi `/` | Suunatud aadressile `/role-selection` | ☐ |
| 2 | Kontrolli URL-i | URL on `/role-selection` | ☐ |
| 3 | Kontrolli lehe sisu | Kolm rolli valikut kuvatud | ☐ |
| 4 | Kontrolli rolle | Õppija, Õpetaja, Spetsialist | ☐ |
| 5 | Kontrolli kirjeldusi | Igal rollil on kirjeldus | ☐ |

### Rolli valimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Õppija" (Õpilane) | Roll valitud | ☐ |
| 2 | Kontrolli URL-i | Navigeeritud aadressile `/synthesis` | ☐ |
| 3 | Jälgi üleminekut | Viisard algab | ☐ |
| 4 | Kontrolli demo lauseid | Eeltäidetud laused ilmuvad | ☐ |

### Viisardi läbimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kui viisardi tooltip ilmub | Tooltip nähtav UI elemendi kohal | ☐ |
| 2 | Loe tooltipi sisu | Funktsiooni selgitus | ☐ |
| 3 | Klõpsa "Edasi" | Järgmine tooltip ilmub | ☐ |
| 4 | Jätka sammudega | Iga samm tõstab esile eri funktsiooni | ☐ |
| 5 | Läbi viimane samm | Viisard lõpeb | ☐ |
| 6 | Kontrolli põhivaadet | Täielik sünteesi UI kättesaadav | ☐ |

### Viisardi vahelejätmine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Viisardi ajal klõpsa "Jäta vahele" | Viisard lõpeb koheselt | ☐ |
| 2 | Kontrolli põhivaadet | Täielik sünteesi UI kättesaadav | ☐ |
| 3 | Kontrolli sisseelamise märgistust lõpetatuks | Ei näidata uuesti | ☐ |

### Sisseelamise taaskäivitamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Läbi või jäta sisseelamine vahele | Põhivaade nähtav | ☐ |
| 2 | Klõpsa abi nuppu (?) päises | Navigeeritud aadressile `/role-selection` | ☐ |
| 3 | Kontrolli URL-i | URL on `/role-selection` | ☐ |
| 4 | Kontrolli | Rolli valik ilmub | ☐ |
| 5 | Kontrolli localStorage | `completed: true` endiselt localStorage'is (pole tühjendatud) | ☐ |

### Rolli valikust eemale navigeerimine (esmakordne kasutaja)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tühjenda localStorage ja laadi `/` | Suunatud aadressile `/role-selection` | ☐ |
| 2 | Klõpsa "Kõnesüntees" päise navigatsioonis | Navigeeritud aadressile `/synthesis` | ☐ |
| 3 | Kontrolli | Sünteesi leht laeb (MITTE rolli valik) | ☐ |
| 4 | Laadi leht uuesti | Suunatud tagasi aadressile `/role-selection` | ☐ |

### Rolli valikust eemale navigeerimine (naasev kasutaja abi kaudu)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Läbi sisseelamine, seejärel klõpsa abi nuppu | Navigeeritud aadressile `/role-selection` | ☐ |
| 2 | Klõpsa "Ülesanded" päise navigatsioonis | Navigeeritud aadressile `/tasks` | ☐ |
| 3 | Kontrolli | Ülesannete leht laeb | ☐ |
| 4 | Laadi leht uuesti | Sünteesi leht laeb (pole suunamist rolli valikusse) | ☐ |

### Naasev kasutaja

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Läbi sisseelamine | Sisseelamine tehtud | ☐ |
| 2 | Laadi leht uuesti | Leht laeb | ☐ |
| 3 | Kontrolli | Põhivaade laeb otse (pole suunamist rolli valikusse) | ☐ |

## Demo laused

Pärast rolli valimist peaksid need laused olema eeltäidetud:
- "Noormees läks kooli"
- Tühi lause kasutaja sisendiks

## Märkused

- Sisseelamise olek säilib localStorage'is
- Erinevatel rollidel võib olla veidi erinev viisardi sisu
- Abi nupp on alati kättesaadav päises - navigeerib aadressile `/role-selection`
- Abi nupp EI tühjenda localStorage'i
- Esmakordne kasutaja suunatakse rolli valikusse ainult rakenduse esmakordsel laadimisel (mitte rakenduses navigeerides)
- Rolli valik on saadaval marsruudil `/role-selection`
