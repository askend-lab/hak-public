# Estonian Test Phrases - Edge Cases & Reference

**Purpose:** Edge cases, test accounts, and phonetic marker reference  
**Last Updated:** 2026-01-08

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

---

**See also:**
- [Common Phrases](./estonian-phrases-common.md) - Standard test phrases
