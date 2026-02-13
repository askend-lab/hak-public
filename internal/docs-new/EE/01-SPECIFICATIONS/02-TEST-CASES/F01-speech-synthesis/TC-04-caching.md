# TC-04: Audio vahemälu

**Kasutajalugu:** US-03  
**Funktsioon:** F01 Kõnesüntees  
**Prioriteet:** Kõrge  
**Tüüp:** Funktsionaalne

## Kirjeldus

Kontrolli, et audio salvestatakse vahemällu õigesti ja vahemälu tühistamine toimib.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Võrgu vaheleht avatud brauseri arendaja tööriistades

## Testisammud

### Vahemälu tabamus (sama tekst)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "Tere" ja vajuta Enter | Võrk näitab /api/analyze ja /api/synthesize kutseid | ☐ |
| 2 | Oota audio lõppemist | Audio lõpeb | ☐ |
| 3 | Vajuta Enter uuesti | MITTE ÜHTEGI uut võrgukutset (vahemälust) | ☐ |
| 4 | Jälgi taasesitust | Audio mängib koheselt (ilma laadimiseta) | ☐ |

### Vahemälu tühistamine (tekst muudetud)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | "Tere" on vahemälus, lisa " päevast" | Tekst on nüüd "Tere päevast" | ☐ |
| 2 | Vajuta Enter | Tehakse uued võrgukutsed (vahemälu tühistatud) | ☐ |
| 3 | Audio mängib | Uus süntees terve lausega | ☐ |

### Vahemälu tühistamine (variant valitud)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta "kooli" ja sünteesi | Audio on vahemälus | ☐ |
| 2 | Klõpsa "kooli" sildil | Variantide paneel avaneb | ☐ |
| 3 | Vali erinev variant | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees variandi hääldusega | ☐ |

### Vahemälu tühistamine (foneetika muutmine)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sünteesi mis tahes tekst | Audio on vahemälus | ☐ |
| 2 | Ava "Uuri häälduskuju" | Häälduskuju paneel avaneb | ☐ |
| 3 | Muuda häälduskuju ja rakenda | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees muudetud foneetikaga | ☐ |

## Vahemälu oleku kontrollimine

Kontrolli brauseri konsooli või React DevTools'ist lause olekut:

```javascript
{
  text: "Tere",
  phoneticText: "Tere",      // Vahemällu salvestatud foneetika
  audioUrl: "blob:...",       // Vahemällu salvestatud audio blob URL
}
```

Pärast tühistamist:
```javascript
{
  text: "Tere päevast",
  phoneticText: undefined,   // Tühjendatud
  audioUrl: undefined,        // Tühjendatud
}
```

## Märkused

- Vahemälu sisaldab nii häälduskuju kui audio blob URL-i
- Iga teksti muutmine tühistab mõlemad
- Variandi/foneetika muutused tühistavad ainult audio (foneetika võib säilida)
