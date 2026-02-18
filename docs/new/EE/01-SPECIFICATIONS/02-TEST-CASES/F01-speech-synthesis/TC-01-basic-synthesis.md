# TC-01: Põhiline sünteesi voog

**Kasutajalugu:** US-01, US-02  
**Funktsioon:** F01 Kõnesüntees  
**Prioriteet:** Kriitiline  
**Tüüp:** Põhistsenaarium

## Kirjeldus

Kontrolli, et kasutaja saab sisestada eestikeelse teksti ja kuulata sünteesitud audiod.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Brauseri heli lubatud
- [ ] Taustateenused töötavad (Vabamorf, Merlin)

## Testiandmed

| Sisend | Oodatav häälmudel |
|--------|-------------------|
| `Tere` | `efm_s` |
| `Tere päevast` | `efm_l` |
| `Noormees läks kooli` | `efm_l` |

## Testisammud

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Navigeeri rakenduse juurkausta | Sünteesi leht laeb tühja sisendväljaga | ☐ |
| 2 | Klõpsa tekstisisendi väljal | Kursor ilmub, väli on aktiivne | ☐ |
| 3 | Sisesta "Tere" | Tekst "Tere" on sisendis nähtav | ☐ |
| 4 | Vajuta Enter | Laadimise spinner ilmub esitusnupule | ☐ |
| 5 | Oota audio esitust | Audio mängib, esitusnupp näitab pausi ikooni | ☐ |
| 6 | Oota audio lõppemist | Esitusnupp naaseb esitusikooni juurde | ☐ |
| 7 | Vajuta Enter uuesti | Audio mängib vahemälust (ilma laadimiseta) | ☐ |

## Variatsioonid

### Variatsioon A: Mitme sõnaga lause

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Tühjenda sisend, sisesta "Tere päevast" | Tekst on sisendis nähtav | ☐ |
| 2 | Vajuta tühikut | "Tere" muutub sildiks | ☐ |
| 3 | Vajuta Enter | Mõlemad sõnad sünteesitakse, kasutab efm_l mudelit | ☐ |

### Variatsioon B: Klõpsa esitusnuppu Enteri asemel

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Sisesta tekst "Aitäh" | Tekst on nähtav | ☐ |
| 2 | Klõpsa esitusnuppu | Sama sünteesi voog nagu Enteriga | ☐ |

## Piirjuhud

- [ ] Tühi sisend: Sünteesi ei toimu, viga ei teki
- [ ] Ainult tühikud: Sünteesi ei toimu, viga ei teki
- [ ] Väga pikk tekst (>500 tähemärki): Sünteesimine peaks õnnestuma

## Märkused

- Esimene süntees võib olla aeglasem (külmkäivitus)
- Järgnevad esitused kasutavad vahemällu salvestatud audiod
- Häälmudel määratakse sõnade arvu järgi: 1 sõna = efm_s, 2+ sõna = efm_l
