# TC-16: Autentimise voog

**Kasutajalugu:** US-22, US-23, US-24  
**Funktsioon:** F07 Autentimine  
**Prioriteet:** Kriitiline  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli sisselogimise, profiili kuvamise ja väljalogimise funktsionaalsust.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Pole sisse logitud (tühjenda localStorage vajadusel)

## Testiandmed

| Väli | Kehtiv | Kehtetu |
|------|--------|---------|
| Isikukood | `39901010011` | `12345678901` |

## Testisammud

### Sisselogimise voog

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Kontrolli päist | "Logi sisse" nupp nähtav | ☐ |
| 2 | Klõpsa "Logi sisse" | Sisselogimise modaal avaneb | ☐ |
| 3 | Kontrolli modaali | Vahelehed Smart-ID/Mobiil-ID/ID-kaart | ☐ |
| 4 | Sisesta kehtiv isikukood: `39901010011` | Väärtus sisendis | ☐ |
| 5 | Klõpsa "Sisene" | Modaal sulgub | ☐ |
| 6 | Kontrolli päist | Profiil nimega ilmub | ☐ |
| 7 | Kontrolli "Logi sisse" nuppu | Pole enam nähtav | ☐ |

### Vigane isikukood

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Ava sisselogimise modaal | Modaal nähtav | ☐ |
| 2 | Sisesta vigane: `12345678901` | Väärtus sisendis | ☐ |
| 3 | Klõpsa "Sisene" | Veateade ilmub | ☐ |
| 4 | Kontrolli viga | "Vale isikukoodi formaat" või sarnane | ☐ |
| 5 | Modaal jääb avatuks | Saab uuesti proovida | ☐ |

### Seansi püsivus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Logi edukalt sisse | Profiil nähtav | ☐ |
| 2 | Värskenda lehte (F5) | Leht laeb uuesti | ☐ |
| 3 | Kontrolli profiili | Endiselt sisse logitud | ☐ |
| 4 | Kontrolli localStorage | Kasutaja andmed olemas | ☐ |

### Profiili vaatamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisse logituna klõpsa profiili alal | Rippmenüü avaneb | ☐ |
| 2 | Kontrolli sisu | Nimi ja maskeeritud isikukood | ☐ |
| 3 | Kontrolli väljalogimise valikut | "Logi välja" nähtav | ☐ |

### Väljalogimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa profiili rippmenüüd | Rippmenüü avaneb | ☐ |
| 2 | Klõpsa "Logi välja" | Rippmenüü sulgub | ☐ |
| 3 | Kontrolli päist | "Logi sisse" nupp naaseb | ☐ |
| 4 | Kontrolli localStorage | Kasutaja andmed eemaldatud | ☐ |

### Väljalogimine ülesannete vaates olles

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Logi sisse ja navigeeri ülesannetesse | Ülesannete vaade nähtav | ☐ |
| 2 | Logi välja | Välja logitud | ☐ |
| 3 | Kontrolli navigeerimist | Suunatud sünteesi vaatesse | ☐ |

### Kaitstud marsruudi juurdepääs

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Logi välja | Pole autentitud | ☐ |
| 2 | Klõpsa "Ülesanded" navigatsioonis | Sisselogimise modaal ilmub | ☐ |
| 3 | Logi edukalt sisse | Suunab ülesannete vaatesse | ☐ |

## Märkused

- Praegune teostus kasutab näidis-kasutajaandmebaasi
- Päris eID integratsioon ootab tootmisversiooni
- Kõik kolm autentimise vahelehte (Smart-ID/Mobiil-ID/ID-kaart) kasutavad sama voogu
