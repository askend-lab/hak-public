# TC-09: Häälduskuju paneeli toimingud

**Kasutajalugu:** US-09, US-10  
**Funktsioon:** F03 Lause häälduskuju  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli terve lause häälduskuju vaatamist ja redigeerimist.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Tekst sünteesitud: "Noormees läks kooli"
- [ ] Sildid nähtavad vahemällu salvestatud häälduskujudega

## Testisammud

### Häälduskuju paneeli avamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa ⋯ menüül lausel | Menüü avaneb | ☐ |
| 2 | Vali "Uuri häälduskuju" | Menüü sulgub | ☐ |
| 3 | Jälgi paneeli | Paneel libiseb paremalt sisse | ☐ |
| 4 | Kontrolli päist | Pealkiri "Muuda häälduskuju" | ☐ |
| 5 | Kontrolli originaalteksti | "Noormees läks kooli" kuvatud | ☐ |
| 6 | Kontrolli häälduskuju | Häälduskuju redigeeritavas sisendis | ☐ |

### Häälduskuju sisu vaatamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Uuri häälduskuju | UI märgised nähtavad (`` ` `` jne) | ☐ |
| 2 | Kontrolli sõnade eraldamist | Sõnad eraldatud tühikutega | ☐ |
| 3 | Kontrolli märgise tööriistariba | Neli märgise nuppu olemas | ☐ |

### Häälduskuju redigeerimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa häälduskuju sisendil | Kursor ilmub | ☐ |
| 2 | Navigeeri sõnale "kooli" | Kursor positsioneeritud | ☐ |
| 3 | Lisa `` ` `` enne "o"-d | Tekst uuendatud: `k`ooli` | ☐ |
| 4 | Kontrolli muudatusi | Muudetud tekst nähtav | ☐ |

### Märgise tööriistariba kasutamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Aseta kursor teksti | Kursor nähtav | ☐ |
| 2 | Klõpsa `` ` `` nuppu | Märgis sisestatakse kursori kohale | ☐ |
| 3 | Klõpsa `'` nuppu | Peenenduse märgis sisestatakse | ☐ |

### Muudatuste eelvaade

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Redigeeri häälduskuju | Muudatused tehtud | ☐ |
| 2 | Klõpsa esitusnuppu | Laadimise olek | ☐ |
| 3 | Kuula | Muudetud hääldus mängib | ☐ |

### Muudatuste rakendamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tee häälduskuju muudatusi | Tekst muudetud | ☐ |
| 2 | Klõpsa "Rakenda" nuppu | Paneel sulgub | ☐ |
| 3 | Kontrolli teavitust | "Lause uus häälduskuju rakendatud" | ☐ |
| 4 | Sünteesi lause | Kasutab uut häälduskuju | ☐ |

### Sulgemine salvestamata

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tee muudatusi paneelis | Redigeerimised tehtud | ☐ |
| 2 | Klõpsa X nuppu | Paneel sulgub | ☐ |
| 3 | Sünteesi lause | Kasutab algset häälduskuju (muutmata) | ☐ |

## Piirjuhud

- [ ] Tühi häälduskuju: Ei tohiks lubada rakendamist
- [ ] Ainult märgised: Võib toota tühja audio

## Märkused

- Muudatused säilivad ainult pärast "Rakenda" klõpsamist
- Algne kuvatav tekst võib muutuda redigeeritud häälduskuju järgi
- Audio vahemälu tühistatakse pärast rakendamist
