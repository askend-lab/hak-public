# TC-04: Audio vahemälu

**Eeltingimused:** Rakendus laetud, võrgu vaheleht avatud brauseri arendaja tööriistades

## Vahemälu tabamus (sama tekst)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "Tere" ja vajuta Enter | Võrk näitab /api/analyze ja /api/synthesize kutseid | ☐ |
| 2 | Oota audio lõppemist | Audio lõpeb | ☐ |
| 3 | Vajuta Enter uuesti | MITTE ÜHTEGI uut võrgukutset (vahemälust) | ☐ |
| 4 | Jälgi taasesitust | Audio mängib koheselt (ilma laadimiseta) | ☐ |

## Vahemälu tühistamine (tekst muudetud)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | "Tere" on vahemälus, lisa " päevast" | Tekst on nüüd "Tere päevast" | ☐ |
| 2 | Vajuta Enter | Tehakse uued võrgukutsed (vahemälu tühistatud) | ☐ |
| 3 | Audio mängib | Uus süntees terve lausega | ☐ |

## Vahemälu tühistamine (variant valitud)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "kooli" ja sünteesi | Audio on vahemälus | ☐ |
| 2 | Klõpsa "kooli" sildil | Variantide paneel avaneb | ☐ |
| 3 | Vali erinev variant | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees variandi hääldusega | ☐ |

## Vahemälu tühistamine (foneetika muutmine)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sünteesi mis tahes tekst | Audio on vahemälus | ☐ |
| 2 | Ava "Uuri foneetilist kuju" | Foneetikapaneel avaneb | ☐ |
| 3 | Muuda foneetilist teksti ja rakenda | Vahemälu peaks tühistuma | ☐ |
| 4 | Vajuta Enter | Uus süntees muudetud foneetikaga | ☐ |
