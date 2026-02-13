# TC-07: Variandi eelvaade ja valimine

**Kasutajalugu:** US-06, US-07  
**Funktsioon:** F02 Hääldusvariantid  
**Prioriteet:** Kriitiline  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli, et variante saab eelvaadelda ja valida kasutamiseks sünteesis.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Tekst sünteesitud: "Noormees läks kooli"
- [ ] Variantide paneel avatud sõnale "kooli"

## Testisammud

### Variandi eelvaade

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Leia esimene variant (nt "kooli") | Variandi rida nähtav | ☐ |
| 2 | Klõpsa esitusnuppu variandil | Nupp näitab laadimise spinnerit | ☐ |
| 3 | Oota audiod | Spinner muutub pausi ikooniks | ☐ |
| 4 | Kuula | Selle konkreetse variandi audio mängib | ☐ |
| 5 | Audio lõpeb | Nupp naaseb esitusikooni juurde | ☐ |

### Erineva variandi eelvaade

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa esitust teisel variandil | Esimene audio peatub (kui mängib) | ☐ |
| 2 | Teine variant sünteesitakse | Laadimine, seejärel mängimine | ☐ |
| 3 | Kuula | Kuulda erinev hääldus | ☐ |

### Variandi valimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Kasuta" variandil `k`ooli` | Variandi rida näitab valitud olekut | ☐ |
| 2 | Paneel jääb avatuks | Saab jätkata uurimist | ☐ |
| 3 | Sulge paneel | Naaseb põhivaatesse | ☐ |
| 4 | Kontrolli sildi kuva | Silt näitab endiselt "kooli" (muutmata) | ☐ |
| 5 | Vajuta Enter sünteesimiseks | Audio kasutab valitud variandi hääldust | ☐ |

### Häälduse muutuse kontrollimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Märgi algne hääldus | Ilma variandita | ☐ |
| 2 | Rakenda "kolmas välde" variant | Valik tehtud | ☐ |
| 3 | Sünteesi lause | Audios on erinev "kooli" hääldus | ☐ |

## Häälduse selgitus

Iga variant kuvab selgitust all:

| Variant | Selgitus |
|---------|----------|
| `k`ooli` | "O" on pikk |
| `kooli` | Häälda nii, nagu on kirjutatud |

## Märkused

- Variandi eelvaade kasutab `efm_s` (ühe sõna) mudelit
- Valitud variant säilib kuni teksti muutmiseni
- Algne kuvatav sõna ei muutu kunagi (ainult häälduskuju)
