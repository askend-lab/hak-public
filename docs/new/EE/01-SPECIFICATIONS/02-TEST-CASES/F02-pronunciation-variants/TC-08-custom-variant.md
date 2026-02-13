# TC-08: Kohandatud häälduskuju loomine

**Kasutajalugu:** US-08  
**Funktsioon:** F02 Hääldusvariantid  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli, et kasutajad saavad luua ja kasutada kohandatud häälduskujusid.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Variantide paneel avatud mis tahes sõnale
- [ ] Tavalised variandid nähtavad

## Testisammud

### Kohandatud vormi avamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Keri variantide lõppu | "Loo oma variant" link nähtav | ☐ |
| 2 | Klõpsa "Loo oma variant" | Vorm laieneb alla | ☐ |
| 3 | Kontrolli vormi pealkirja | "Loo oma variant" nähtav | ☐ |
| 4 | Kontrolli vormi kirjeldust | "Sisesta oma tekst hääldusmärkidega ja kuula tulemust." | ☐ |
| 5 | Kontrolli vormi elemente | Sisendväli, hääldusmärkide kast, esitus- ja "Helinda" nupud | ☐ |

### Hääldusmärkide kasti kasutamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kontrolli hääldusmärkide kasti pealkirja | "Hääldusmärgid" nähtav | ☐ |
| 2 | Kontrolli kasti kirjeldust | "Kasuta märke häälduse täpsustamiseks..." | ☐ |
| 3 | Kontrolli märgise nuppe | Neli nuppu nähtavad: ` ´ ' + | ☐ |
| 4 | Hõlju märgise kohal | Tooltip näitab märgise nime ja juhist | ☐ |
| 5 | Klõpsa info ikoonil | Täielik hääldusmärkide juhend avaneb | ☐ |

### Märgise sisestamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa sisendväljal | Kursor ilmub | ☐ |
| 2 | Sisesta "koo" | Tekst ilmub sisendisse | ☐ |
| 3 | Klõpsa `` ` `` nuppu | `` ` `` sisestatakse kursori kohale | ☐ |
| 4 | Sisesta "li" | Tulemus: `koo`li` | ☐ |
| 5 | Klõpsa `'` nuppu | Peenenduse märgis sisestatakse | ☐ |

### Kohandatud häälduskuju eelvaade

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta kohandatud häälduskuju: `k`ool'i` | Tekst sisendis | ☐ |
| 2 | Klõpsa esitusnuppu (ring) | Laadimise spinner | ☐ |
| 3 | Kuula | Kohandatud hääldus mängib | ☐ |
| 4 | Audio lõpeb | Nupp naaseb esitusikooni juurde | ☐ |

### Kohandatud häälduskuju rakendamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kohandatud häälduskujuga sisendis | Valmis rakendamiseks | ☐ |
| 2 | Klõpsa "Helinda" | Kohandatud häälduskuju rakendatud | ☐ |
| 3 | Paneel sulgub | Naaseb põhivaatesse | ☐ |
| 4 | Sünteesi lause | Kasutab kohandatud hääldust | ☐ |

### Hääldusmärkide juhendi kasutamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa info ikoonil hääldusmärkide kastis | Vaade muutub juhendiks | ☐ |
| 2 | Kontrolli juhendi sisu | Märgiste selgitused näidetega | ☐ |
| 3 | Klõpsa tagasi nuppu | Naaseb variantide nimekirja juurde | ☐ |

### Kohandatud vormi sulgemine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Eemalda loodud variant" | Vorm tõmbub kokku | ☐ |
| 2 | Sisend tühjendatakse | Tühi sisend | ☐ |
| 3 | Lingi tekst taastub | Näitab "Loo oma variant" | ☐ |

### Sisendi tühjendamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta tekst sisendisse | Tekst nähtav | ☐ |
| 2 | Klõpsa X nuppu sisendi sees | Sisend tühjendatakse | ☐ |

## Hääldusmärgid

| Nupp | Märgis | Nimi | Reegel |
|------|--------|------|--------|
| ` | `` ` `` | kolmas välde | Paikneb kolmandavältelise silbi esimese täishääliku ees |
| ´ | `´` | ebareeglipärase rõhu märk | Kasutatakse ainult kui rõhk ei ole esimesel silbil |
| ' | `'` | peenendus | Võib paikneda konsonantide d, l, n, s ja t järel |
| + | `+` | liitsõnapiir | Märgib liitsõna osade vahelist piiri |

## Märkused

- Kohandatud häälduskuju teisendatakse Vabamorf formaati rakendamisel
- UI märgised (`` ` ´ ' +``) teisendatakse Vabamorf formaati (`< ? ] _`)
- "Helinda" nupp rakendab kohandatud häälduskuju (erineb tavaliste variantide "Kasuta" nupust)
- Sisendvälja kohatäide: "Kirjuta oma hääldusmärkidega variant"
