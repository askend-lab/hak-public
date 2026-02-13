# TC-14: Kirjete lisamine ülesandesse

**Kasutajalugu:** US-19  
**Funktsioon:** F05 Ülesannete haldamine  
**Prioriteet:** Kriitiline  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli lausete lisamist sünteesi vaatest olemasolevatesse või uutesse ülesannetesse.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Kasutaja sisse logitud
- [ ] Vähemalt üks ülesanne olemas
- [ ] Laused tekstiga sünteesi vaates

## Testiandmed

Lisatavad laused:
1. "Tere päevast"
2. "Kuidas läheb"
3. "Aitäh, hästi"

## Testisammud

### Kõigi lisamine olemasolevasse ülesandesse

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sünteesi vaates 3 lausega | Laused nähtavad | ☐ |
| 2 | Klõpsa "Lisa ülesandesse (3)" | Rippmenüü avaneb | ☐ |
| 3 | Kontrolli ülesannete nimekirja rippmenüüs | Olemasolevad ülesanded nähtavad | ☐ |
| 4 | Sisesta filtrimiseks (valikuline) | Ülesanded filtritakse nime järgi | ☐ |
| 5 | Klõpsa ülesande nimel | Rippmenüü sulgub | ☐ |
| 6 | Kontrolli teavitust | "3 lauset lisatud ülesandesse..." | ☐ |
| 7 | Klõpsa "Vaata ülesannet" teavituses | Ülesande detail avaneb | ☐ |
| 8 | Kontrolli kirjeid | 3 uut kirjet ilmuvad ülesandesse | ☐ |

### Kõigi lisamine uude ülesandesse

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "Lisa ülesandesse" rippmenüüd | Rippmenüü avaneb | ☐ |
| 2 | Klõpsa "Loo uus ülesanne" | Ülesande loomise modaal avaneb | ☐ |
| 3 | Sisesta ülesande nimi | Nimi sisestatud | ☐ |
| 4 | Klõpsa loo | Modaal sulgub | ☐ |
| 5 | Kontrolli teavitust | Ülesanne loodud kirjetega | ☐ |
| 6 | Ava uus ülesanne | Kõik laused kirjetena | ☐ |

### Üksiku lause lisamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa ⋯ menüül ühel lausel | Menüü avaneb | ☐ |
| 2 | Vii kursor/klõpsa "Lisa ülesandesse" | Ülesannete alammenüü ilmub | ☐ |
| 3 | Vali olemasolev ülesanne | Menüü sulgub | ☐ |
| 4 | Kontrolli teavitust | "Lause lisatud ülesandesse..." | ☐ |
| 5 | Kontrolli ülesannet | Ainult see lause lisatud | ☐ |

### Lisamine ilma autentimiseta

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Logi välja | Pole autentitud | ☐ |
| 2 | Sisesta laused | Laused nähtavad | ☐ |
| 3 | Klõpsa "Lisa ülesandesse" | Sisselogimise modaal ilmub | ☐ |
| 4 | Logi sisse | Naaseb sünteesi juurde | ☐ |
| 5 | Proovi uuesti lisada | Töötab tavapäraselt | ☐ |

## Edastatud kirje andmed

| Väli | Allikas | Märkused |
|------|---------|----------|
| text | sentence.text | Kuvatav tekst |
| stressedText | sentence.phoneticText | Häälduskuju kui saadaval |
| audioUrl | null | Ei edastata |
| audioBlob | null | Ei edastata |

## Märkused

- Audio ei edastata (genereeritakse uuesti taasesitusel)
- Häälduskuju säilitatakse variantide jaoks
- Sama lauset saab lisada mitu korda
- Nupp näitab tekstiga lausete arvu
