# TC-03: Audio taasesituse olekud

**Kasutajalugu:** US-02, US-03  
**Funktsioon:** F01 Kõnesüntees  
**Prioriteet:** Kriitiline  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli esitusnupu õigeid visuaalseid olekuid sünteesi ja taasesituse ajal.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Tekst sisestatud: "Tere päevast"

## Testisammud

### Olek: Ootel → Laadimine → Mängimine → Ootel

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Jälgi esitusnuppu | Näitab esitusikooni (▶) | ☐ |
| 2 | Klõpsa esitusnuppu | Nupp näitab laadimise spinnerit | ☐ |
| 3 | Oota sünteesi valmimist | Spinner muutub pausi ikooniks (❚❚) | ☐ |
| 4 | Jälgi taasesituse ajal | Pausi ikoon jääb nähtavaks | ☐ |
| 5 | Oota audio lõppemist | Nupp naaseb esitusikooni juurde (▶) | ☐ |

### Taasesituse katkestamine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Alusta taasesitust (audio mängib) | Pausi ikoon on nähtav | ☐ |
| 2 | Klõpsa esitusnuppu taasesituse ajal | Praegune audio peatub | ☐ |
| 3 | Jälgi | Uus süntees algab (laadimise olek) | ☐ |

### Vahemälust taasesitus

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Esita teksti esimest korda | Laadimine → Mängimine → Ootel | ☐ |
| 2 | Esita sama teksti uuesti (muutmata) | Kohe näitab pausi ikooni (ilma laadimiseta) | ☐ |
| 3 | Audio mängib | Vahemälust | ☐ |

### Mitu lauset

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Lisa teine lause tekstiga | Kaks lauserida on nähtavad | ☐ |
| 2 | Esita esimest lauset | Esimene rida näitab pausi, teine esitust | ☐ |
| 3 | Klõpsa esitust teisel lausel | Esimene peatub, teine alustab laadimist | ☐ |

## Oodatavad nuppude olekud

| Olek | Ikoon | Kirjeldus |
|------|-------|-----------|
| Ootel | ▶ | Valmis esitamiseks |
| Laadimine | ⟳ (spinner) | Audio sünteesimine |
| Mängimine | ❚❚ | Audio aktiivselt mängib |

## Märkused

- Korraga saab mängida ainult üht lauset
- Teise lause esitamise klõpsamine peatab praeguse
- Vahemälu tabamus jätab laadimise oleku täielikult vahele
