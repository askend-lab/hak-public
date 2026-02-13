# TC-06: Variantide paneeli vaatamine

**Kasutajalugu:** US-05  
**Funktsioon:** F02 Hääldusvariantid  
**Prioriteet:** Kriitiline  
**Tüüp:** Põhistsenaarium

## Kirjeldus

Kontrolli, et "Uuri variandid" klõpsamine sildi menüüst näitab inline laadimise spinnerit, avab paneeli variantidega edukal vastamisel või näitab toast-teavitust ebaõnnestumisel.

## Eeltingimused

- [ ] Rakendus laetud aadressil `/`
- [ ] Tekst sisestatud ja sünteesitud: "Noormees läks kooli"
- [ ] Sildid nähtavad: [Noormees] [läks] [kooli]

## Testisammud

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 1 | Klõpsa "kooli" sildil | Rippmenüü avaneb valikutega | ☐ |
| 2 | Klõpsa "Uuri variandid" | Menüü sulgub, nool asendatakse spinneriga | ☐ |
| 3 | Jälgi laadimist | Väike spinner nähtav sildis (asendab noolt) | ☐ |
| 4 | Oota vastust | Spinner peatub, paneel libiseb paremalt sisse | ☐ |
| 5 | Kontrolli päist | Näitab sõna "kooli" | ☐ |
| 6 | Kontrolli variantide nimekirja | Kuvatakse mitu hääldusvarianti | ☐ |
| 7 | Kontrolli variandi formaati | Igaühel näidatakse häälduskuju UI märgistusega | ☐ |
| 8 | Kontrolli silte | Kuvatakse kirjeldavad sildid (nt "kolmas välde") | ☐ |
| 9 | Kontrolli nuppe | Igal variandil on esituse ja "Kasuta" nupud | ☐ |
| 10 | Klõpsa X nuppu | Paneel sulgub | ☐ |

## Variantide kuvamise kontrollimine

Sõna "kooli" puhul oota variante nagu:
- `kooli` sildiga "rõhk esimesel silbil"
- `k`ooli` sildiga "kolmas välde"

## Kuvatavad UI märgised

| Vabamorf | UI | Tähendus |
|----------|-----|----------|
| `<` | `` ` `` | Kolmas välde |
| `?` | `´` | Ebaregulaarne rõhk |
| `]` | `'` | Peenendus |
| `_` | `+` | Liitsõnapiir |

## Piirjuhud

### Inline laadimise spinneri kontrollimine

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 11 | Klõpsa mis tahes sõna sildil, seejärel "Uuri variandid" | Sildi rippmenüü sulgub | ☐ |
| 12 | Jälgi silti koheselt | Nool asendatakse väikese pöörleva spinneriga | ☐ |
| 13 | Oota vastust | Spinner peatub, nool taastub | ☐ |
| 14 | Kontrolli spinneri suurust | Spinner on umbes sama suur kui nool (12x12px) | ☐ |

### Variante ei leitud (Toast-teavitus)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 15 | Sisesta mitte-eestikeelne sõna (nt "hello") tekstisisendisse | Sõna ilmub sildina | ☐ |
| 16 | Klõpsa "hello" sildil, seejärel "Uuri variandid" | Spinner nähtav sildis | ☐ |
| 17 | Oota vastust | Spinner peatub, paneel EI avane | ☐ |
| 18 | Jälgi toast-teavitust | Hoiatuse toast ilmub ülemisse paremasse nurka | ☐ |
| 19 | Kontrolli toasti värvi | Toast on oranži/hoiatuse stiiliga (mitte punane/viga) | ☐ |
| 20 | Kontrolli toasti pealkirja | Näitab "Variante ei leitud" | ☐ |
| 21 | Kontrolli toasti kirjeldust | Näitab "Sõna ei leidu eesti keeles või on valesti kirjutatud." | ☐ |
| 22 | Kontrolli toasti automaatset kadumist | Toast kaob umbes 4 sekundi pärast | ☐ |
| 23 | Korda valesti kirjutatud sõnaga (nt "koooli") | Sama toast-teavituse käitumine | ☐ |

### Ajalõpu käitumine (10 sekundit)

| # | Tegevus | Oodatav tulemus | Läbitud |
|---|---------|-----------------|---------|
| 24 | Simuleeri aeglast võrku või blokeeri API | Päring võtab >10 sekundit | ☐ |
| 25 | Jälgi käitumist 10s juures | Spinner peatub, päring katkestatakse | ☐ |
| 26 | Kontrolli vea toasti | Näitab "Päring aegus" punase/vea stiiliga | ☐ |

### Muud piirjuhud

- [ ] Sõna ühe variandiga: Paneel avaneb ühe variandiga
- [ ] Sõna paljude variantidega: Kõik kuvatakse paneelis (keritav vajadusel)
- [ ] Mitte-eestikeelne tekst (prantsuse, saksa jne): Toast-teavitus, paneel ei avane

## Märkused

- Variandid tulevad `/api/variants` lõpp-punktist
- Duplikaatsed häälduskujud filtreeritakse välja
- Kohandatud häälduskuju kuvatakse, kui varem rakendatud

## Tehniline teostus

### Laadimise voog

1. Kasutaja klõpsab "Uuri variandid" sildi rippmenüüst
2. `loadingVariantsTag` olek seatud → spinner nähtav sildis
3. Fetch-päring saadetakse `/api/variants`-ile 10s AbortController ajalõpuga
4. Vastuse käsitlemine:
   - **Variandid leitud**: Ava paneel, peata spinner
   - **Tühjad variandid**: Näita hoiatuse toasti, peata spinner, MITTE paneeli
   - **Ajalõpp**: Katkesta päring, näita vea toasti, peata spinner
   - **Võrgu viga**: Näita vea toasti, peata spinner

### API vastuse vastendamine

| Stsenaarium | Vabamorf vastus | API vastus | UI tulemus |
|-------------|-----------------|------------|------------|
| Eesti sõna (nt "kooli") | 200 variantidega | `{ word, variants: [...] }` | Paneel avaneb variantidega |
| Mitte-eesti sõna (nt "hello") | Mitte-200 (sõna ei leitud) | `{ word, variants: [] }` | Hoiatuse toast-teavitus |
| Valesti kirjutatud sõna (nt "koooli") | Mitte-200 (sõna ei leitud) | `{ word, variants: [] }` | Hoiatuse toast-teavitus |
| Ajalõpp (>10s) | N/A | AbortError | Vea toast-teavitus |
| Võrgu/teenuse viga | Ühenduse tõrge | 500 viga | Vea toast-teavitus |
