# Estonian Test Phrases

**Purpose:** Curated phrases for testing EKI Hääldusabiline pronunciation synthesis  
**Last Updated:** 2026-01-08

## Quick Reference

### Single Words

| Word | Phonetic Interest | Expected Model |
|------|-------------------|----------------|
| `Tere` | Basic greeting | efm_s |
| `Aitäh` | Contains ä | efm_s |
| `kooli` | Third pitch accent variants | efm_s |
| `peeti` | Third pitch accent + palatalization | efm_s |
| `mees` | Third pitch accent variants | efm_s |
| `kass` | Palatalization options | efm_s |
| `pall` | Short vs long | efm_s |

### Simple Sentences

| Sentence | Words | Expected Model |
|----------|-------|----------------|
| `Tere päevast` | 2 | efm_l |
| `Kuidas läheb` | 2 | efm_l |
| `Aitäh, hästi` | 2 | efm_l |
| `Head aega` | 2 | efm_l |

### Complex Sentences

| Sentence | Notes |
|----------|-------|
| `Noormees läks kooli` | Compound word + variants |
| `Mees peeti kinni` | Palatalization in "kinni" |
| `Viimaks peeti noormees kinni` | Multiple stress patterns |
| `Ta läks kolmapäeval poodi` | Compound word "kolmapäeval" |

---

## Categorized Test Phrases

### 1. Greetings (Tervitused)

```
Tere
Tere hommikust
Tere päevast
Tere õhtust
Head ööd
Head aega
Nägemist
Kohtumiseni
```

### 2. Common Phrases

```
Kuidas läheb
Aitäh, hästi
Palun
Vabandust
Jah
Ei
Ma ei tea
Ma saan aru
```

### 3. Third Pitch Accent (Kolmas Välde)

Words with third pitch accent variants:

| Word | Without | With | Meaning Difference |
|------|---------|------|-------------------|
| kooli | `kooli` | `k<ooli` | school (partitive) vs school (illative) |
| peeti | `peeti` | `p<eeti` | was considered vs was held |
| saada | `saada` | `s<aada` | to get vs send! |
| viia | `viia` | `v<iia` | to take vs fruit jam |

**Test Sentences:**
```
Noormees läks kooli
Mees peeti kinni
Palun saada mulle kiri
```

### 4. Palatalization (Palatalisatsioon)

Words with palatalized consonants (d, l, n, s, t):

| Word | Phonetic | Description |
|------|----------|-------------|
| kinni | `kin]ni` | Soft "n" |
| pall | `pal]l` | Soft "l" |
| kass | `kas]s` | Soft "s" |
| padi | `pad]i` | Soft "d" |

**Test Sentences:**
```
Mees peeti kinni
Laps viskas palli
Kass magab padja peal
```

### 5. Compound Words (Liitsõnad)

| Word | Phonetic | Parts |
|------|----------|-------|
| noormees | `noor_mees` | noor + mees |
| kolmapäev | `kolma_päev` | kolm + päev |
| raamatukogu | `raamatu_kogu` | raamat + kogu |
| autojuht | `auto_juht` | auto + juht |

**Test Sentences:**
```
Noormees läks kolmapäeval kooli
Autojuht sõitis raamatukokku
```

### 6. Irregular Stress (Ebareeglipärane Rõhk)

Words where stress is not on first syllable:

| Word | Phonetic | Stress Position |
|------|----------|-----------------|
| aitäh | `ait?äh` | Second syllable |
| seljanka | `selj?anka` | Second syllable |
| dialektika | `dial?ektika` | Third syllable |

**Test Sentences:**
```
Aitäh väga palju
Mulle meeldib seljanka
```

### 7. Special Characters (Erimärgid)

Estonian specific characters:

```
Üks õun käes
Öö oli külm
Ämblik ehitas võrku
Üle jõe ja läbi metsa
```

### 8. Punctuation Handling

```
Tere! Kuidas läheb?
Kas sa tuled? Jah, tulen.
Oi, kui ilus päev!
Hmm... Ma ei tea.
```

### 9. Numbers

```
Üks
Kaks
Kolm
Kakskümmend üks
Sada kaksteist
```

---

## Edge Case Test Data

### Very Short Input

```
a
ja
ei
```

### Very Long Input

```
See on väga pikk lause, mis sisaldab palju sõnu ja peaks testima, 
kuidas süsteem käitub pikkade tekstide puhul, kus on palju erinevaid 
sõnu ja lauseosasid, mis võivad sisaldada erinevaid hääldusnüansse 
ja rõhumärke, mida süntees peab korrektselt töötlema ja esitama.
```

### Special Characters Only

```
!!!
???
...
```

### Mixed Languages

```
Hello tere world
Good morning, tere hommikust
```

### Non-Estonian / Invalid Words (Toast Notification Testing)

These inputs should trigger the "Variante ei leitud" warning toast notification (panel does NOT open):

| Word | Type | Expected Result |
|------|------|-----------------|
| `hello` | English | Warning toast, no panel |
| `world` | English | Warning toast, no panel |
| `bonjour` | French | Warning toast, no panel |
| `guten` | German | Warning toast, no panel |
| `привет` | Russian (Cyrillic) | Warning toast, no panel |
| `koooli` | Misspelling (extra o) | Warning toast, no panel |
| `noormees` | Misspelling (double e) | Warning toast, no panel |
| `12345` | Numbers only | Warning toast, no panel |
| `@#$%` | Special characters only | Warning toast, no panel |
| `xyz` | Non-word | Warning toast, no panel |

**Test Sentences with Invalid Words:**

```
Hello ja tere
Mees läks xyz poodi
Koooli on kaugel
```

**API Behavior:** When Vabamorf cannot analyze a word (non-Estonian, misspelled, or invalid), the `/api/variants` endpoint returns `{ word, variants: [] }` with HTTP 200. The frontend shows a toast notification instead of opening an empty panel.

**Expected Toast:**
- **Type:** Warning (yellow/orange styling)
- **Title:** "Variante ei leitud"
- **Description:** "Sõna ei leidu eesti keeles või on valesti kirjutatud."
- **Behavior:** Auto-dismisses after ~4 seconds

**Note:** When clicking "Uuri variandid" for these words, the inline spinner shows briefly, then a toast notification appears. The panel does NOT open.

---

## Test Accounts

| Account | Isikukood | Name |
|---------|-----------|------|
| Test User 1 | `39901010011` | Test Kasutaja |
| Test User 2 | `49901010012` | Mari Maasikas |
| Invalid | `12345678901` | (for error testing) |

---

## Phonetic Marker Reference

### UI Markers (Display)

| Marker | Name | Example |
|--------|------|---------|
| `` ` `` | Kolmas välde | `k`ooli` |
| `´` | Rõhuline silp | `dial´ektika` |
| `'` | Palatalisatsioon | `kin'ni` |
| `+` | Liitsõna piir | `noor+mees` |

### Vabamorf Markers (API)

| Marker | Name | Example |
|--------|------|---------|
| `<` | Kolmas välde | `k<ooli` |
| `?` | Rõhuline silp | `dial?ektika` |
| `]` | Palatalisatsioon | `kin]ni` |
| `_` | Liitsõna piir | `noor_mees` |

### Transformation

| UI → Vabamorf | Vabamorf → UI |
|---------------|---------------|
| `` ` `` → `<` | `<` → `` ` `` |
| `´` → `?` | `?` → `´` |
| `'` → `]` | `]` → `'` |
| `+` → `_` | `_` → `+` |

---

## Recommended Test Sequence

### Smoke Test (5 minutes)

1. `Tere` - Single word
2. `Tere päevast` - Simple sentence
3. Click on word for variants
4. Play All with 2+ sentences

### Full Test (30 minutes)

1. All single words
2. All simple sentences
3. Third pitch accent examples
4. Palatalization examples
5. Compound words
6. Edge cases

---

## Notes

- Voice model selection: 1 word = `efm_s`, 2+ words = `efm_l`
- All phonetic markers are optional (plain text synthesizes with defaults)
- Estonian special characters (õ, ä, ö, ü, š, ž) must be supported
- Punctuation should influence pausing in synthesis
