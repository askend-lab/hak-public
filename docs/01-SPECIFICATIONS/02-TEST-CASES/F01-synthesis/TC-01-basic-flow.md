# TC-01: Põhiline sünteesi voog

**Eeltingimused:** Rakendus laetud, brauseri heli lubatud, taustateenused töötavad

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Navigeeri rakenduse juurkausta | Sünteesi leht laeb tühja sisendväljaga | ☐ |
| 2 | Klõpsa tekstisisendi väljal | Kursor ilmub, väli on aktiivne | ☐ |
| 3 | Sisesta "Tere" | Tekst "Tere" on sisendis nähtav | ☐ |
| 4 | Vajuta Enter | Laadimise spinner ilmub esitusnupule | ☐ |
| 5 | Oota audio esitust | Audio mängib, esitusnupp näitab pausi ikooni | ☐ |
| 6 | Oota audio lõppemist | Esitusnupp naaseb esitusikooni juurde | ☐ |
| 7 | Vajuta Enter uuesti | Audio mängib vahemälust (ilma laadimiseta) | ☐ |

## Variatsioon A: Mitme sõnaga lause

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Tühjenda sisend, sisesta "Tere päevast" | Tekst on sisendis nähtav | ☐ |
| 2 | Vajuta tühikut | "Tere" muutub sildiks | ☐ |
| 3 | Vajuta Enter | Mõlemad sõnad sünteesitakse, kasutab efm_l mudelit | ☐ |

## Variatsioon B: Klõpsa esitust Enteri asemel

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta tekst "Aitäh" | Tekst on nähtav | ☐ |
| 2 | Klõpsa esitusnuppu | Sama sünteesi voog nagu Enteriga | ☐ |

## Äärjuhtumid

| Juhtum | Läbitud/Ebaõnn. |
|--------|-----------------|
| Tühi sisend: Sünteesi ei toimu, viga ei teki | ☐ |
| Ainult tühikud: Sünteesi ei toimu, viga ei teki | ☐ |
| Väga pikk tekst (>500 tähemärki): Sünteesimine õnnestub | ☐ |
